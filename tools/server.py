#!/usr/bin/env python3
"""Malý webserver pro projekt CNC frézka (jen standardní knihovna Pythonu) – s přihlášením heslem.

Web funguje i bez serveru (web/index.html, úpravy se ukládají do prohlížeče). Server přidá
sdílený stav pro víc zařízení a přihlášení. Nejdřív sestav web: python tools/build.py

  /                              -> web/index.html (po přihlášení)
  /login, /logout                -> přihlašovací stránka / odhlášení
  /healthz                       -> "ok" (bez přihlášení, pro healthcheck)
  /thumbs/..., /docs/...         -> statické soubory z web/ (náhledy, obrázky)
  GET  /api/state[?rev=n]        -> {"rev": n, "state": {...}}  sdílené nastavení (při stejném rev jen {"rev": n})
  PUT  /api/state  {"state":..., "base": n}
                                 -> uloží (data/state.json). Když mezitím uložil někdo jiný (base != rev),
                                    udělá 3cestné sloučení. Vrátí {"rev", "merged", "state"?}.

Zabezpečení:
  - dvě hesla, uložená jen jako PBKDF2-SHA256 hash (data/auth.json):
      admin  = smí ukládat          (python tools/server.py --set-password)
      viewer = jen prohlížení       (python tools/server.py --set-password --role viewer)
  - relace = podepsaná cookie (HMAC-SHA256, tajný klíč data/secret.key vzniká na serveru a nikam se nekopíruje),
    HttpOnly, SameSite=Lax, Secure přes HTTPS, platnost 30 dní; změna hesla zneplatní všechna přihlášení
  - ochrana proti hádání hesla: max 5 chybných pokusů / 15 min z jedné IP, max 30 / hod celkem, každý chybný pokus +1 s
  - zápis (PUT/POST) jen se stejným Originem, bezpečnostní hlavičky, nic se neservíruje mimo web/
  - bez data/auth.json server odmítne běžet (kromě --upstream nebo výslovného --no-auth)
  - IP pro omezení pokusů se bere z hlavičky CF-Connecting-IP / X-Forwarded-For jen s --trust-proxy
    (server za Cloudflare tunelem / reverzní proxy); jinak by si ji útočník mohl podvrhnout

Spuštění:
  python tools/server.py --set-password [--role viewer]   # nastavit heslo (uloží jen hash)
  python tools/server.py [--port 8090] [--host 0.0.0.0]   # s přihlášením
  python tools/server.py --no-auth                         # lokální vývoj bez hesla (jen 127.0.0.1)
  python tools/server.py --upstream http://server:8095     # celý web přeposílat na jiný server
                                                           # (jeden stav, jedno heslo)
"""
import argparse
import base64
import getpass
import hashlib
import hmac
import html
import http.client
import json
import mimetypes
import os
import secrets
import sys
import threading
import time
from collections import defaultdict, deque
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import parse_qs, quote, unquote, urlparse

ROOT = Path(__file__).resolve().parent.parent
WEB = ROOT / "web"
DATA = Path(os.environ.get("CNC_DATA") or ROOT / "data")
STATE = DATA / "state.json"
AUTH = DATA / "auth.json"
SECRET = DATA / "secret.key"
MAX_BODY = 4 * 1024 * 1024
LOCK = threading.Lock()
HIST = DATA / "history"
KEEP = 80
UPSTREAM = None
NO_AUTH = False
TRUST_PROXY = False
_MISSING = object()

COOKIE = "cnc_s"
SESSION_DAYS = 30
PBKDF2_ITER = 310_000
IP_MAX, IP_WIN = 5, 15 * 60          # chybné pokusy z jedné IP za okno
GLOBAL_MAX, GLOBAL_WIN = 30, 3600    # chybné pokusy celkem za hodinu
FAILS = defaultdict(deque)           # ip -> časy chybných pokusů
GFAILS = deque()
FLOCK = threading.Lock()


# ---------------------------------------------------------------- heslo a relace
def hash_pw(pw, salt=None, it=PBKDF2_ITER):
    salt = salt or secrets.token_bytes(16)
    d = hashlib.pbkdf2_hmac("sha256", pw.encode("utf-8"), salt, it)
    return f"pbkdf2_sha256${it}${base64.b64encode(salt).decode()}${base64.b64encode(d).decode()}"


def check_pw(pw, stored):
    try:
        alg, it, salt, d = stored.split("$")
        assert alg == "pbkdf2_sha256"
        cand = hashlib.pbkdf2_hmac("sha256", pw.encode("utf-8"), base64.b64decode(salt), int(it))
        return hmac.compare_digest(cand, base64.b64decode(d))
    except Exception:
        return False


def load_auth(role="admin"):
    """Hash hesla pro roli: admin (smí ukládat) / viewer (jen prohlížení)."""
    try:
        return json.loads(AUTH.read_text(encoding="utf-8")).get("password" if role == "admin" else "viewer")
    except Exception:
        return None


_KEY = None


def skey():
    """Tajný klíč pro podpis cookie; svázaný s hashem hesla → změna hesla odhlásí všechny."""
    global _KEY
    if _KEY is None:
        DATA.mkdir(parents=True, exist_ok=True)
        if not SECRET.exists():
            SECRET.write_bytes(secrets.token_bytes(32))
            try:
                os.chmod(SECRET, 0o600)
            except Exception:
                pass
        _KEY = SECRET.read_bytes()
    return hmac.new(_KEY, ((load_auth() or "") + "|" + (load_auth("viewer") or "")).encode(), hashlib.sha256).digest()


def b64u(b):
    return base64.urlsafe_b64encode(b).rstrip(b"=").decode()


def make_session(role):
    exp = int(time.time()) + SESSION_DAYS * 86400
    body = f"{exp}.{role}.{b64u(secrets.token_bytes(12))}"
    return body + "." + b64u(hmac.new(skey(), body.encode(), hashlib.sha256).digest())


def session_role(tok):
    """Vrátí roli z platné podepsané cookie ('admin' / 'viewer'), jinak None."""
    try:
        exp, role, nonce, mac = tok.split(".")
        good = b64u(hmac.new(skey(), f"{exp}.{role}.{nonce}".encode(), hashlib.sha256).digest())
        if hmac.compare_digest(mac, good) and int(exp) > time.time() and role in ("admin", "viewer"):
            return role
    except Exception:
        pass
    return None


def throttled(ip):
    now = time.time()
    with FLOCK:
        q = FAILS[ip]
        while q and now - q[0] > IP_WIN:
            q.popleft()
        while GFAILS and now - GFAILS[0] > GLOBAL_WIN:
            GFAILS.popleft()
        if len(q) >= IP_MAX:
            return int(IP_WIN - (now - q[0])) + 1
        if len(GFAILS) >= GLOBAL_MAX:
            return int(GLOBAL_WIN - (now - GFAILS[0])) + 1
    return 0


def note_fail(ip):
    now = time.time()
    with FLOCK:
        FAILS[ip].append(now)
        GFAILS.append(now)
        if len(FAILS) > 5000:          # ochrana paměti
            for k in list(FAILS)[:1000]:
                FAILS.pop(k, None)


LOGIN_HTML = """<!doctype html><html lang="cs"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="robots" content="noindex,nofollow"><title>CNC</title>
<style>
:root{--bg:#f4f6fa;--card:#fff;--fg:#1b2333;--mut:#667085;--acc:#0f9d8a;--err:#d92d20;--bd:#d0d5dd}
@media (prefers-color-scheme:dark){:root{--bg:#0d1320;--card:#162033;--fg:#e6ebf5;--mut:#98a2b3;--bd:#2b3a55}}
*{box-sizing:border-box}body{margin:0;min-height:100vh;display:grid;place-items:center;background:var(--bg);color:var(--fg);font:16px/1.4 system-ui,-apple-system,Segoe UI,Roboto,sans-serif;padding:16px}
form{background:var(--card);border:1px solid var(--bd);border-radius:16px;padding:28px 24px;width:100%;max-width:340px;box-shadow:0 10px 30px rgba(0,0,0,.08)}
h1{margin:0 0 18px;font-size:26px;text-align:center;letter-spacing:.06em}
input{width:100%;padding:12px 14px;font-size:16px;border:1px solid var(--bd);border-radius:10px;background:transparent;color:var(--fg)}
input:focus{outline:2px solid var(--acc);border-color:transparent}
button{margin-top:14px;width:100%;padding:12px;font-size:16px;font-weight:600;border:0;border-radius:10px;background:var(--acc);color:#fff;cursor:pointer}
.e{color:var(--err);font-size:14px;margin:10px 0 0;text-align:center}
</style></head><body>
<form method="post" action="/login" autocomplete="on">
<h1>CNC</h1>
<input id="pw" name="password" type="password" aria-label="Heslo" autocomplete="current-password" required autofocus>
<input type="hidden" name="next" value="{next}">
<button type="submit">Přihlásit</button>{msg}
</form></body></html>"""


def safe_next(n):
    n = n or "/"
    return n if n.startswith("/") and not n.startswith("//") and "\\" not in n and "\n" not in n and "\r" not in n else "/"


# ---------------------------------------------------------------- stav
def merge3(base, ours, theirs):
    """3cestné sloučení JSON: slovníky po klíčích, ostatní hodnoty (seznamy, čísla, texty) celé.
    Kde klient (ours) něco změnil oproti base, vyhraje klient; jinak zůstane aktuální stav (theirs)."""
    if isinstance(base, dict) and isinstance(ours, dict) and isinstance(theirs, dict):
        out = {}
        for k in set(base) | set(ours) | set(theirs):
            b, o, t = base.get(k, _MISSING), ours.get(k, _MISSING), theirs.get(k, _MISSING)
            v = t if o == b else o if t == b else merge3(b, o, t) if all(isinstance(x, dict) for x in (b, o, t)) else o
            if v is not _MISSING:
                out[k] = v
        return out
    return theirs if ours == base else ours


def read_hist(rev):
    try:
        return json.loads((HIST / f"{int(rev)}.json").read_text(encoding="utf-8"))
    except Exception:
        return None


def read_state():
    try:
        return json.loads(STATE.read_text(encoding="utf-8"))
    except Exception:
        return {"rev": 0, "state": None}


def write_state(state, base=None):
    with LOCK:
        cur = read_state()
        rev = int(cur.get("rev", 0))
        merged = False
        if base is not None and int(base) != rev and isinstance(cur.get("state"), dict):
            b = read_hist(base)
            state = merge3(b if isinstance(b, dict) else {}, state, cur["state"]) if b is not None else merge3({}, state, cur["state"])
            merged = True
        new = {"rev": rev + 1, "saved": time.strftime("%Y-%m-%d %H:%M:%S"), "state": state}
        DATA.mkdir(parents=True, exist_ok=True)
        tmp = STATE.with_suffix(".tmp")
        tmp.write_text(json.dumps(new, ensure_ascii=False, indent=1), encoding="utf-8")
        os.replace(tmp, STATE)
        bak = DATA / f"state-{time.strftime('%Y-%m-%d')}.json"          # denní záloha
        if not bak.exists():
            bak.write_text(json.dumps(new, ensure_ascii=False), encoding="utf-8")
        HIST.mkdir(exist_ok=True)                                       # historie pro slučování
        (HIST / f"{new['rev']}.json").write_text(json.dumps(state, ensure_ascii=False), encoding="utf-8")
        old = HIST / f"{new['rev'] - KEEP}.json"
        if old.exists():
            old.unlink()
        return new["rev"], merged, state


# ---------------------------------------------------------------- HTTP
class H(BaseHTTPRequestHandler):
    server_version = "CNCFrezka/2.0"
    sys_version = ""

    def log_message(self, fmt, *args):
        line = "%s %s %s\n" % (time.strftime("%Y-%m-%d %H:%M:%S"), self.client_ip(), fmt % args)
        try:
            if sys.stderr:
                sys.stderr.write(line)
            else:
                DATA.mkdir(parents=True, exist_ok=True)
                with open(DATA / "server.log", "a", encoding="utf-8") as f:
                    f.write(line)
        except Exception:
            pass

    # --- pomocné
    def client_ip(self):
        ip = ""
        if TRUST_PROXY:
            ip = self.headers.get("CF-Connecting-IP") or (self.headers.get("X-Forwarded-For") or "").split(",")[0]
        return (ip.strip() or self.client_address[0] or "?")[:64]

    def body_len(self):
        try:
            return int(self.headers.get("Content-Length") or 0)
        except ValueError:
            return -1

    def https(self):
        return self.headers.get("X-Forwarded-Proto", "").lower() == "https" or '"https"' in self.headers.get("CF-Visitor", "")

    def sec_headers(self):
        self.send_header("X-Content-Type-Options", "nosniff")
        self.send_header("X-Frame-Options", "SAMEORIGIN")
        self.send_header("Referrer-Policy", "same-origin")
        self.send_header("X-Robots-Tag", "noindex, nofollow")
        if self.https():
            self.send_header("Strict-Transport-Security", "max-age=31536000")

    def send_body(self, code, ctype, b, extra=()):
        self.send_response(code)
        self.send_header("Content-Type", ctype)
        self.send_header("Content-Length", str(len(b)))
        for k, v in extra:
            self.send_header(k, v)
        self.sec_headers()
        self.end_headers()
        if self.command != "HEAD":
            self.wfile.write(b)

    def _json(self, code, obj, extra=()):
        self.send_body(code, "application/json; charset=utf-8", json.dumps(obj, ensure_ascii=False).encode("utf-8"),
                       (("Cache-Control", "no-store"),) + tuple(extra))

    def redirect(self, loc, extra=()):
        self.send_response(303)
        self.send_header("Location", loc)
        self.send_header("Content-Length", "0")
        self.send_header("Cache-Control", "no-store")
        for k, v in extra:
            self.send_header(k, v)
        self.sec_headers()
        self.end_headers()

    def cookie(self, name):
        for part in (self.headers.get("Cookie") or "").split(";"):
            k, _, v = part.strip().partition("=")
            if k == name:
                return v
        return None

    def role(self):
        return "admin" if NO_AUTH else session_role(self.cookie(COOKIE) or "")

    def authed(self):
        return self.role() is not None

    def same_origin(self):
        o = self.headers.get("Origin")
        if not o:
            return True                       # stejné-originové fetch/form v některých prohlížečích Origin neposílá; SameSite=Lax chrání cookie
        hosts = {(self.headers.get(h) or "").lower() for h in ("Host", "X-Forwarded-Host")} - {""}
        return urlparse(o).netloc.lower() in hosts

    def login_page(self, code=200, msg="", nxt="/"):
        m = f'<p class="e">{html.escape(msg)}</p>' if msg else ""
        b = LOGIN_HTML.replace("{next}", html.escape(nxt, quote=True)).replace("{msg}", m).encode("utf-8")
        self.send_body(code, "text/html; charset=utf-8", b, (("Cache-Control", "no-store"),
                       ("Content-Security-Policy", "default-src 'none'; style-src 'unsafe-inline'; form-action 'self'; frame-ancestors 'none'; base-uri 'none'")))

    # --- přeposílání na upstream (cluster)
    def proxy(self):
        u = urlparse(UPSTREAM)
        n = self.body_len()
        if n < 0 or n > MAX_BODY:
            return self._json(413, {"error": "bad size"})
        body = self.rfile.read(n) if n else None
        hdr = {k: v for k, v in self.headers.items() if k.lower() in ("cookie", "content-type", "origin", "accept", "if-none-match", "if-modified-since")}
        if hdr.get("Origin"):
            hdr["Origin"] = f"{u.scheme}://{u.netloc}"          # upstream porovná Origin se svým Hostem
        hdr["X-Forwarded-For"] = self.client_address[0]
        try:
            c = (http.client.HTTPSConnection if u.scheme == "https" else http.client.HTTPConnection)(u.netloc, timeout=20)
            c.request(self.command, self.path, body=body, headers=hdr)
            r = c.getresponse()
            data = r.read()
        except Exception as e:
            return self._json(502, {"error": f"upstream: {e}"})
        self.send_response(r.status)
        for k, v in r.getheaders():
            if k.lower() in ("content-type", "cache-control", "location", "etag", "last-modified", "content-security-policy"):
                self.send_header(k, v)
            elif k.lower() == "set-cookie":
                self.send_header(k, v.replace("; Secure", ""))  # lokálně běží přes http
        self.send_header("Content-Length", str(len(data)))
        self.sec_headers()
        self.end_headers()
        if self.command != "HEAD":
            self.wfile.write(data)

    # --- metody
    def do_HEAD(self):
        self.do_GET()

    def do_GET(self):
        if UPSTREAM:
            return self.proxy()
        u = urlparse(self.path)
        path = unquote(u.path)
        if path == "/healthz":
            return self.send_body(200, "text/plain; charset=utf-8", b"ok", (("Cache-Control", "no-store"),))
        if path == "/login":
            if self.authed():
                return self.redirect(safe_next(parse_qs(u.query).get("next", ["/"])[0]))
            return self.login_page(nxt=safe_next(parse_qs(u.query).get("next", ["/"])[0]))
        if path == "/logout":
            return self.redirect("/login", (("Set-Cookie", f"{COOKIE}=; Path=/; Max-Age=0; HttpOnly; SameSite=Lax"),))
        if not self.authed():
            if path.startswith("/api/"):
                return self._json(401, {"error": "login"})
            return self.redirect("/login?next=" + quote(safe_next(self.path), safe=""))
        if path.startswith("/web/"):                     # staré adresy (web/cnc-frezka.html)
            return self.redirect("/")
        if path == "/api/state":
            cur = read_state()
            q = parse_qs(u.query)
            if q.get("rev") and q["rev"][0] == str(cur.get("rev")):
                return self._json(200, {"rev": cur.get("rev"), "role": self.role()})
            return self._json(200, {**cur, "role": self.role()})
        parts = [p for p in path.split("/") if p] or ["index.html"]
        if ".." in parts or any(p.startswith(".") for p in parts):
            return self.send_error(404)
        f = WEB.joinpath(*parts).resolve()
        if WEB.resolve() not in f.parents or not f.is_file():
            return self.send_error(404)
        ctype = mimetypes.guess_type(str(f))[0] or "application/octet-stream"
        if ctype.startswith("text/") or ctype in ("application/javascript", "application/json"):
            ctype += "; charset=utf-8"
        self.send_body(200, ctype, f.read_bytes(), (("Cache-Control", "private, no-cache" if f.suffix == ".html" else "private, max-age=3600"),))

    def do_login(self):
        ip = self.client_ip()
        n = self.body_len()
        if n <= 0 or n > 4096:
            return self.login_page(400, "Neplatný požadavek.")
        form = parse_qs(self.rfile.read(n).decode("utf-8", "replace"))
        nxt = safe_next(form.get("next", ["/"])[0])
        wait = throttled(ip)
        if wait:
            self.log_message("login BLOKOVÁN (%ss)", wait)
            return self.login_page(429, f"Příliš mnoho pokusů. Zkus to znovu za {max(1, wait // 60)} min.", nxt)
        pw = form.get("password", [""])[0]
        role = None
        if self.same_origin():
            for r in ("admin", "viewer"):        # vždy obě kontroly (stejná doba odezvy)
                h = load_auth(r)
                if h and check_pw(pw, h) and not role:
                    role = r
        if role:
            self.log_message("login OK (%s)", role)
            flags = "; Secure" if self.https() else ""
            return self.redirect(nxt, (("Set-Cookie", f"{COOKIE}={make_session(role)}; Path=/; Max-Age={SESSION_DAYS * 86400}; HttpOnly; SameSite=Lax{flags}"),))
        note_fail(ip)
        self.log_message("login CHYBA")
        time.sleep(1)
        return self.login_page(401, "Špatné heslo.", nxt)

    def do_PUT(self):
        if UPSTREAM:
            return self.proxy()
        path = urlparse(self.path).path
        if path == "/login" and self.command == "POST":
            return self.do_login()
        if path != "/api/state":
            return self.send_error(404)
        if not self.authed():
            return self._json(401, {"error": "login"})
        if self.role() != "admin":
            return self._json(403, {"error": "jen prohlížení"})
        if not self.same_origin():
            return self._json(403, {"error": "origin"})
        n = self.body_len()
        if n <= 0 or n > MAX_BODY:
            return self._json(413, {"error": "bad size"})
        raw = self.rfile.read(n)
        try:
            body = json.loads(raw.decode("utf-8"))
            state = body["state"]
            if not isinstance(state, dict):
                raise ValueError("state must be object")
        except Exception as e:
            return self._json(400, {"error": str(e)})
        rev, merged, st = write_state(state, body.get("base"))
        return self._json(200, {"rev": rev, "merged": merged, **({"state": st} if merged else {})})

    do_POST = do_PUT


def save_password(role, pw):
    if len(pw) < 4:
        sys.exit("Heslo musí mít aspoň 4 znaky.")
    DATA.mkdir(parents=True, exist_ok=True)
    try:
        cfg = json.loads(AUTH.read_text(encoding="utf-8"))
    except Exception:
        cfg = {}
    cfg["password" if role == "admin" else "viewer"] = hash_pw(pw)
    cfg["set"] = time.strftime("%Y-%m-%d %H:%M:%S")
    AUTH.write_text(json.dumps(cfg), encoding="utf-8")


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--port", type=int, default=int(os.environ.get("PORT", 8090)))
    ap.add_argument("--host", default=None, help="adresa (výchozí 0.0.0.0, s --no-auth jen 127.0.0.1)")
    ap.add_argument("--upstream", default="", help="přeposílat celý web na jiný server (sdílený stav i přihlášení)")
    ap.add_argument("--set-password", action="store_true", help="nastavit heslo (uloží jen hash do data/auth.json) a skončit")
    ap.add_argument("--role", choices=("admin", "viewer"), default="admin", help="pro --set-password: admin (úpravy) / viewer (jen prohlížení)")
    ap.add_argument("--no-auth", action="store_true", help="bez přihlášení (jen pro lokální vývoj)")
    ap.add_argument("--trust-proxy", action="store_true", help="IP klienta brát z CF-Connecting-IP / X-Forwarded-For (jen za proxy)")
    a = ap.parse_args()
    global UPSTREAM, NO_AUTH, TRUST_PROXY
    if a.set_password:
        pw = os.environ.get("CNC_PASSWORD") or getpass.getpass(f"Nové heslo ({a.role}): ")
        save_password(a.role, pw)
        print(f"Heslo ({a.role}) uloženo (hash) do {AUTH}")
        return
    # Docker: hesla z proměnných prostředí (uloží se jen hash; změna hesla v .env se po restartu projeví)
    for role, env in (("admin", "CNC_PASSWORD"), ("viewer", "CNC_VIEWER_PASSWORD")):
        pw = os.environ.get(env)
        if pw and not check_pw(pw, load_auth(role) or ""):
            save_password(role, pw)
    UPSTREAM = a.upstream.rstrip("/") or None
    NO_AUTH = a.no_auth
    TRUST_PROXY = a.trust_proxy
    host = a.host or ("127.0.0.1" if NO_AUTH else "0.0.0.0")
    if not UPSTREAM and not NO_AUTH and not load_auth():
        sys.exit("Chybí data/auth.json – nastav heslo: python tools/server.py --set-password  (nebo --no-auth pro lokální vývoj)")
    if not UPSTREAM and not (WEB / "index.html").exists():
        sys.exit("Chybí web/index.html – nejdřív sestav web: python tools/build.py")
    srv = ThreadingHTTPServer((host, a.port), H)
    srv.daemon_threads = True
    if sys.stdout:
        mode = f"proxy → {UPSTREAM}" if UPSTREAM else ("BEZ přihlášení" if NO_AUTH else "s přihlášením")
        print(f"CNC frézka web běží na http://{host}:{a.port}/  ({mode}, Ctrl+C = konec)", flush=True)
    srv.serve_forever()


if __name__ == "__main__":
    main()
