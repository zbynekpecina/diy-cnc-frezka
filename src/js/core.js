/* =====================================================================
   Pomocné funkce a stav
   ===================================================================== */
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const kc = n => (n == null || isNaN(n)) ? "—" : Math.round(n).toLocaleString("cs-CZ") + " Kč";
const num = (n, d = 0) => (n == null || isNaN(n) || !isFinite(n)) ? "—" : Number(n).toLocaleString("cs-CZ", {maximumFractionDigits: d, minimumFractionDigits: d});
const cap = s => s ? s.charAt(0).toUpperCase() + s.slice(1) : s;
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const md = s => (window.marked ? marked.parse(s, {mangle: false, headerIds: false}) : "<pre>" + esc(s) + "</pre>");

const STORE = "cncfrezka.state.v1";
const defState = () => ({theme: null, sel: {}, custom: [], budget: 40000, bom: {}, steps: {}, q: {}, notes: "", variant: "nas2", bomMode: "need", navTab: "nas2", bomV: 3, params: {}, designs: [], rates: {eur: 25, usd: 23}, kwh: 6});
let S;
try { S = Object.assign(defState(), JSON.parse(localStorage.getItem(STORE) || "{}")); } catch (e) { S = defState(); }
/* --- synchronizace se serverem (když běží přes tools/server.py) --- */
let API = location.protocol.startsWith("http") ? "/api/state" : null;   // bez serveru (soubor, GitHub Pages) = jen localStorage
let REV = 0, pending = false, syncT = 0, ROLE = null;
function setRole(r) {                                       // viewer = jen prohlížení: změny zůstanou jen v otevřené stránce
  if (!r || r === ROLE) return; ROLE = r;
  $("#viewChip")?.classList.toggle("hidden", r !== "viewer"); $("#logoutBtn")?.classList.remove("hidden");
  document.body.classList.toggle("ro", r === "viewer");
}
/* účet jen pro prohlížení: nic se nedá upravit (kalkulace, produkty, výběr, poznámky, návrhy, parametry, nastavení);
   volné zůstává jen ovládání 3D modelu a animace a kalkulačky ve Výpočtech (nic neukládají) */
const RO_FREE = "#vwrap, #v-kalkulacky, .vtool, .mhead";
const RO_CLICK = "#bomEd, #bomRst, #adAdd, #bMake, #dCopy, #dDel, #dRen, #nClear, #nNew, #pReset, #sReset, [data-del], [data-imgdel], [data-k], [data-sel], [data-paste], .thpaste";
function roBlock(e) {
  if (ROLE !== "viewer") return;
  const el = e.target instanceof Element ? e.target : null; if (!el) return;
  const field = el.closest("input, select, textarea, [contenteditable]");
  const blocked = (field && !field.closest(RO_FREE)) || (e.type === "click" && el.closest(RO_CLICK) && !el.closest("#vwrap .vtool"));
  if (!blocked) return;
  e.preventDefault(); e.stopImmediatePropagation();
  if (e.type === "click" || e.type === "focusin") { if (field) field.blur(); toast("👁 Jen prohlížení – úpravy nejsou povolené"); }
}
for (const ev of ["click", "focusin", "input", "change", "keydown", "paste", "drop"]) document.addEventListener(ev, roBlock, true);
const authGate = r => { if (r.status === 401) { location.href = "/login?next=" + encodeURIComponent(location.pathname + location.search); throw 0; } return r; };   // vypršelé přihlášení → přihlašovací stránka
function setSync(s) {
  const el = $("#syncDot"); if (!el) return;
  el.dataset.s = s;
  el.title = {ok: "Uloženo na serveru – sdílené pro všechna zařízení", err: "Server nedostupný – ukládá se jen v tomto prohlížeči", local: "Lokální soubor – ukládá se jen v tomto prohlížeči", wait: "Ukládám…"}[s];
}
function localTheme() { try { return localStorage.getItem(STORE + ".theme") || null; } catch (e) { return null; } }
async function serverLoad() {
  if (!API) { setSync("local"); return; }
  try {
    const r = authGate(await fetch(API, {cache: "no-store"}));
    if (r.status === 404 || r.status === 405 || !(r.headers.get("Content-Type") || "").includes("json")) { API = null; setSync("local"); return; }   // statický hosting
    if (!r.ok) throw 0;
    const j = await r.json();
    if (j && j.state) { const th = localTheme(); S = Object.assign(defState(), j.state); S.theme = th; migrate(); }
    REV = j.rev || 0; setRole(j.role); setSync("ok");
  } catch (e) { setSync("err"); }
}
async function push() {
  pending = false; setSync("wait");
  try {
    const body = Object.assign({}, S); delete body.theme;
    const r = authGate(await fetch(API, {method: "PUT", headers: {"Content-Type": "application/json"}, body: JSON.stringify({state: body, base: REV})}));
    if (!r.ok) throw 0; const j = await r.json(); REV = j.rev; setSync("ok");
    if (j.merged && j.state && !pending) {                     // mezitím uložil někdo jiný → server obě změny sloučil
      const th = S.theme; S = Object.assign(defState(), j.state); S.theme = th; migrate(); updateChip();
      try { localStorage.setItem(STORE, JSON.stringify(S)); } catch (e) {}
      const a = document.activeElement;
      if (!a || !/INPUT|TEXTAREA|SELECT/.test(a.tagName)) { Object.keys(rendered).forEach(k => delete rendered[k]); if ($("#v-varianty").classList.contains("active")) renderVarianty(); else route(); }
    }
  } catch (e) { setSync("err"); }
}
async function poll() {
  if (!API || pending || document.hidden) return;
  try {
    const r = authGate(await fetch(API + "?rev=" + REV, {cache: "no-store"})); if (!r.ok) throw 0;
    const j = await r.json(); setRole(j.role); setSync("ok");
    if (j.rev !== REV && j.state && !pending && ROLE !== "viewer") {
      REV = j.rev; const th = S.theme; S = Object.assign(defState(), j.state); S.theme = th; migrate();
      try { localStorage.setItem(STORE, JSON.stringify(S)); } catch (e) {}
      updateChip();
      const a = document.activeElement;
      if (!a || !/INPUT|TEXTAREA|SELECT/.test(a.tagName)) { Object.keys(rendered).forEach(k => delete rendered[k]); if ($("#v-varianty").classList.contains("active")) renderVarianty(); else route(); toast("Načteny změny z jiného zařízení"); }
    }
  } catch (e) { setSync("err"); }
}
function migrate() {
  if (S.bomV !== 3) { S.bom = {}; S.bomV = 3; }
  if (!S.v5) { S.variant = "nas2"; S.navTab = "nas2"; S.v5 = 1; }      // výchozí návrh je Custom1
  S.params = S.params || {}; S.designs = S.designs || [];
}
migrate();
function save() {
  if (ROLE === "viewer") { updateChip(); return; }          // prohlížení: nic se neukládá (ani do prohlížeče)
  try { localStorage.setItem(STORE, JSON.stringify(S)); localStorage.setItem(STORE + ".theme", S.theme || ""); } catch (e) {}
  updateChip();
  if (API) { pending = true; clearTimeout(syncT); syncT = setTimeout(push, 500); }
}
function toast(t) { const el = $("#toast"); el.textContent = t; el.classList.add("show"); clearTimeout(toast.t); toast.t = setTimeout(() => el.classList.remove("show"), 2200); }

const P = DATA.products;
const PBY = Object.fromEntries(P.map(p => [p.id, p]));
const CATS = DATA.cats;
const pByRef = ref => ref ? P.find(p => (p.url && p.url.includes(ref)) || p.title.startsWith(ref)) : null;
const VERD = {
  top: {l: "Kandidát", c: "b-top", i: "★", o: 0},
  koupeno: {l: "Koupeno", c: "b-koupeno", i: "✔", o: 1},
  maybe: {l: "Možná / záloha", c: "b-maybe", i: "◐", o: 2},
  later: {l: "Později", c: "b-later", i: "⏱", o: 3},
  no: {l: "Nevhodné", c: "b-no", i: "✕", o: 4},
};
const TRUST = {ok: "prodejce důvěryhodný", bad: "AliHelper nedůvěřuje", doubt: "AliHelper má pochybnosti"};
function splitTitle(t) {
  const m = t.match(/^(.*?)\s*\(([^()]*(AliExpress|Allegro|Store|sklad|techfun|ehlinik|HLTNC|Kaiyade)[^()]*)\)\s*$/);
  return m ? {main: m[1], seller: m[2]} : {main: t, seller: ""};
}
const pTotal = p => (p.price || 0) + (p.shipping || 0);
