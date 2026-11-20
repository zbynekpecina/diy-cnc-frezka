/* =====================================================================
   Router + taby
   ===================================================================== */
const TABS = ["wiki", "produkty", "varianty", "navrh", "kalkulacky", "zapojeni", "nastaveni"];
const rendered = {};
function go(hash) { if (location.hash !== "#" + hash) location.hash = hash; else route(); }
function route() {
  const h = decodeURIComponent(location.hash.slice(1)) || "varianty";       // úvodní stránka = 3D model
  const [t, a, b] = h.split("/");
  let tab = TABS.includes(t) ? t : (t === "produkt" ? "produkty" : "varianty");
  $$(".tab").forEach(x => x.classList.toggle("active", x.dataset.tab === tab));
  $$(".view").forEach(x => x.classList.toggle("active", x.id === "v-" + tab));
  if (tab === "wiki") renderWiki(a, b);
  else if (tab === "varianty") { if (t === "varianta" && a) S.variant = a; renderVarianty(); }
  else if (!rendered[tab] || tab === "navrh") { ({produkty: renderProdukty, navrh: renderNavrh, kalkulacky: renderKalk, zapojeni: renderZapojeni, nastaveni: renderNastaveni})[tab](); rendered[tab] = 1; }
  if (tab !== "varianty") V3.pause(true); else V3.pause(false);
  if (t === "produkt" && a && PBY[a]) openProduct(a);
  else if (t !== "produkt" && $("#modal").classList.contains("open") && !closingByRoute) closeModal(true);
  if (t !== "wiki") window.scrollTo({top: 0});
}
let closingByRoute = false;
window.addEventListener("hashchange", route);
document.addEventListener("click", e => {
  const g = e.target.closest("[data-go]"); if (g) { go(g.dataset.go); }
  const tb = e.target.closest(".tab"); if (tb) { if (tb.dataset.v3 && !VBY[S.variant]) { S.variant = "nas4"; save(); } go(tb.dataset.v3 ? "varianta/" + S.variant : tb.dataset.tab); }
});

/* =====================================================================
   Motiv
   ===================================================================== */
function applyTheme() { if (S.theme) document.documentElement.dataset.theme = S.theme; else delete document.documentElement.dataset.theme; }
$("#themeBtn").onclick = () => {
  const dark = S.theme ? S.theme === "dark" : matchMedia("(prefers-color-scheme: dark)").matches;
  S.theme = dark ? "light" : "dark"; save(); applyTheme();
};

/* =====================================================================
   Návrh – výpočet
   ===================================================================== */
function cartLines() {
  const lines = [];
  for (const [id, s] of Object.entries(S.sel)) {
    const p = PBY[id]; if (!p) continue;
    lines.push({kind: "p", id, name: splitTitle(p.title).main, cat: CATS[p.cat]?.name || p.cat, q: s.q ?? 1, p: s.p ?? (p.price || 0), ship: s.ship ?? (p.shipping || 0), note: s.note || "", url: p.url, thumb: p.thumbs[0]});
  }
  S.custom.forEach((c, i) => lines.push({kind: "c", idx: i, name: c.name, cat: c.cat || "Vlastní", q: c.q, p: c.p, ship: c.ship || 0, note: c.note || "", url: c.url || ""}));
  return lines;
}
const lineTotal = l => l.q * l.p + (l.q > 0 ? l.ship : 0);
const cartTotal = () => cartLines().reduce((s, l) => s + lineTotal(l), 0);
function updateChip() { $("#cartChip").textContent = kc(cartTotal()); }
function toggleSel(id, force) {
  const on = force ?? !S.sel[id];
  if (on) S.sel[id] = S.sel[id] || {q: 1}; else delete S.sel[id];
  save(); toast(on ? "Přidáno do Můj výběr" : "Odebráno z Můj výběr");
  $$(`[data-sel="${id}"]`).forEach(b => { b.classList.toggle("on", on); b.textContent = b.classList.contains("selbtn") ? (on ? "✓" : "＋") : (on ? "✓ V Můj výběr" : "+ Do Můj výběr"); });
}
document.addEventListener("click", e => {
  const b = e.target.closest("[data-sel]"); if (b) { e.stopPropagation(); toggleSel(b.dataset.sel); }
});

function vcardHTML(v, on) { return `<button class="pill ${on ? "on" : ""}" data-v="${v.id}" style="--c:${v.color}"><i></i>${v.id === "nas2" ? "⭐ " : ""}${esc(v.short)}<small>${kc(bomTotal(v, "ess"))}</small></button>`; }
