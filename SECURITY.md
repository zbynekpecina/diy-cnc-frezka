# Bezpečnost

Web je statická aplikace. Volitelný server `tools/server.py` přidává přihlášení a sdílený stav.

## Co server dělá
- hesla ukládá jen jako PBKDF2-SHA256 hash (310 000 iterací), minimální délka 8 znaků
- relace je podepsaná cookie (HMAC-SHA256), HttpOnly, SameSite=Lax, přes HTTPS s prefixem `__Host-`
- omezení: 5 chybných přihlášení za 15 min z jedné IP, 30 za hodinu celkem, 120 zápisů stavu za minutu z jedné IP
- zápisy jen ze stejného původu (Origin / Sec-Fetch-Site)
- hlavičky CSP, HSTS, X-Frame-Options DENY, COOP, CORP, Permissions-Policy, nosniff
- servíruje jen soubory ze složky `web/`, skryté soubory ne
- `--logout-all` vymění klíč relací a odhlásí všechny

## Provoz
- za reverzní proxy spouštějte s `--trust-proxy`, jinak IP pro omezení pokusů bere ze spojení
- Docker obraz běží jako neprivilegovaný uživatel, compose nastavuje read-only souborový systém, `cap_drop: ALL` a `no-new-privileges`
- složka `data/` (hash hesla, klíč relací, stav) do gitu nepatří

## Nahlášení chyby
Bezpečnostní problém prosím nahlaste přes GitHub Security Advisory v tomto repozitáři, ne veřejnou issue.
