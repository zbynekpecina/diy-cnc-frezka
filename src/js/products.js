/* =====================================================================
   PRODUKTY
   ===================================================================== */
const F = {q: "", cat: "all", v: "good", sort: "verdict"};
const VF = {good: ["top", "koupeno", "maybe", "later"], all: ["top", "koupeno", "maybe", "later", "no"], top: ["top", "koupeno"], no: ["no"]};
function renderProdukty() {
  const el = $("#v-produkty");
  el.innerHTML = `
  <div class="pagehead"><h2>Produkty</h2><span class="muted">${P.length} nabídek z rešerše dílů</span></div>
  <nav class="subtabs" id="fcatTabs"></nav>
  <div class="toolbar">
    <input type="search" id="fq" placeholder="🔍 Hledat…" value="${esc(F.q)}">
    <select id="fv"><option value="good">Vhodné</option><option value="top">Jen doporučené</option><option value="all">Všechny</option><option value="no">Jen nevhodné</option></select>
    <select id="fsort"><option value="verdict">Řadit: doporučení</option><option value="pa">Cena ↑</option><option value="pd">Cena ↓</option><option value="name">Název</option></select>
  </div>
  <div id="plist"></div>`;
  $("#fv").value = F.v; $("#fsort").value = F.sort;
  $("#fq").oninput = e => { F.q = e.target.value; listProducts(); };
  for (const [id, k] of [["fv", "v"], ["fsort", "sort"]]) $("#" + id).onchange = e => { F[k] = e.target.value; listProducts(); };
  listProducts();
}
function pcardHTML(p) {
  const t = splitTitle(p.title), vd = VERD[p.verdict], on = !!S.sel[p.id];
  return `<article class="pcard v-${p.verdict}" data-pid="${p.id}">
    <div class="thumb">${p.thumbs[0] ? `<img src="${p.thumbs[p.cover || 0]}" loading="lazy" alt="">` : `<div class="noimg">${CATS[p.cat]?.icon || "📦"}</div>`}<span class="badge ${vd.c} tl-badge">${vd.i} ${vd.l}</span></div>
    <div class="body"><h3>${esc(t.main)}</h3></div>
    <div class="foot"><div class="price">${p.price != null ? kc(pTotal(p)) : "cena ?"}<small>${p.shipping ? "vč. dopravy" : p.shipping === 0 ? "doprava zdarma" : ""}</small></div><button class="selbtn ${on ? "on" : ""}" data-sel="${p.id}" title="Do Můj výběr">${on ? "✓" : "＋"}</button></div>
  </article>`;
}
function listProducts() {
  const q = F.q.trim().toLowerCase(), vs = VF[F.v];
  let list = P.filter(p => (F.cat === "all" || p.cat === F.cat) && vs.includes(p.verdict) && (!q || (p.title + " " + p.md).toLowerCase().includes(q)));
  const sorters = {verdict: (a, b) => VERD[a.verdict].o - VERD[b.verdict].o || b.star - a.star || (a.price || 0) - (b.price || 0), pa: (a, b) => (pTotal(a) || 1e9) - (pTotal(b) || 1e9), pd: (a, b) => pTotal(b) - pTotal(a), name: (a, b) => a.title.localeCompare(b.title, "cs")};
  list.sort(sorters[F.sort]);
  const tabs = $("#fcatTabs");
  if (tabs) {
    const base = P.filter(p => vs.includes(p.verdict) && (!q || (p.title + " " + p.md).toLowerCase().includes(q)));
    tabs.innerHTML = [["all", "📦", "Vše", base.length], ...Object.entries(CATS).filter(([k]) => P.some(p => p.cat === k)).map(([k, c]) => [k, c.icon, c.name, base.filter(p => p.cat === k).length])]
      .map(([k, ic, n, cnt]) => `<button class="stab ${F.cat === k ? "on" : ""} ${cnt ? "" : "empty"}" data-cat="${k}"><span>${ic}</span> ${esc(n)} <span class="n">${cnt}</span></button>`).join("");
    $$("[data-cat]", tabs).forEach(b => b.onclick = () => { F.cat = b.dataset.cat; listProducts(); });
  }
  const box = $("#plist");
  if (!list.length) { box.innerHTML = `<div class="panel empty">Nic neodpovídá filtru.</div>`; return; }
  if (F.cat === "all" && F.sort === "verdict") {
    box.innerHTML = Object.entries(CATS).map(([k, c]) => { const l = list.filter(p => p.cat === k); return l.length ? `<div class="catblock"><div class="cathead">${c.icon} ${esc(c.name)} <span class="n">${l.length}</span></div><div class="pgrid">${l.map(pcardHTML).join("")}</div></div>` : ""; }).join("");
  } else box.innerHTML = `<div class="pgrid">${list.map(pcardHTML).join("")}</div>`;
  $$(".pcard", box).forEach(c => c.onclick = e => { if (!e.target.closest("[data-sel]")) go("produkt/" + c.dataset.pid); });
}

/* ---------- modal ---------- */
function openModal(html) { $("#mbox").innerHTML = html; $("#modal").classList.add("open"); document.body.style.overflow = "hidden"; $("#modal").scrollTop = 0; }
function closeModal(fromRoute) {
  $("#modal").classList.remove("open"); document.body.style.overflow = "";
  if (!fromRoute && location.hash.startsWith("#produkt/")) history.replaceState(null, "", "#" + (rendered.produkty ? "produkty" : "varianty"));
}
$("#modal").addEventListener("click", e => { if (e.target.id === "modal" || e.target.closest(".mclose")) closeModal(); });
document.addEventListener("keydown", e => {
  if (e.key === "Escape") { if ($("#lightbox").classList.contains("open")) lbClose(); else if ($("#modal").classList.contains("open")) closeModal(); }
  if ($("#lightbox").classList.contains("open")) { if (e.key === "ArrowLeft") lbStep(-1); if (e.key === "ArrowRight") lbStep(1); }
});
function openProduct(id) {
  const p = PBY[id]; if (!p) return;
  const t = splitTitle(p.title), vd = VERD[p.verdict], s = S.sel[id];
  const imgs = p.images;
  openModal(`
  <div class="mhead"><div><div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:8px"><span class="badge ${vd.c}">${vd.i} ${vd.l}</span><span class="badge b-neutral">${CATS[p.cat]?.icon} ${esc(CATS[p.cat]?.name)}</span>${p.trust ? `<span class="trust ${p.trust}">${esc(TRUST[p.trust])}</span>` : ""}${p.star ? `<span class="badge b-maybe">${"★".repeat(p.star)} favorit</span>` : ""}</div>
    <h2>${esc(t.main)}</h2><div class="sub">${esc(t.seller || p.shop)}</div></div>
    <button class="iconbtn mclose" title="Zavřít (Esc)">✕</button></div>
  <div class="mgrid">
    <div>${imgs.length ? `<div class="gal-main" id="galMain"><img src="${imgs[0]}" alt=""><button class="nav l">‹</button><button class="nav r">›</button><span class="ctr">1 / ${imgs.length}</span></div>
      <div class="gal-strip">${p.thumbs.map((th, i) => `<img src="${th}" data-i="${i}" class="${i ? "" : "on"}" loading="lazy" alt="">`).join("")}</div>` : `<div class="gal-main" style="display:grid;place-items:center;font-size:80px;cursor:default">${CATS[p.cat]?.icon || "📦"}<div class="faint" style="font-size:13px;position:absolute;bottom:12px">obrázek nebyl uložen</div></div>`}</div>
    <div>
      <div class="pricebox">
        <div><div class="k">Cena</div><div class="v">${p.price != null ? kc(p.price) : "?"}</div></div>
        <div><div class="k">Doprava</div><div class="v">${p.shipping == null ? "?" : p.shipping ? kc(p.shipping) : "zdarma"}</div></div>
        <div><div class="k">Celkem</div><div class="v big">${p.price != null ? kc(pTotal(p)) : "?"}</div></div>
      </div>
      <div class="verdict v-${p.verdict}"><b>Verdikt</b>${esc(cap(p.verdictText))}</div>
      <div style="display:flex;gap:8px;flex-wrap:wrap">
        ${p.url ? `<a class="btn primary" href="${esc(p.url)}" target="_blank" rel="noopener">🛍️ Otevřít v obchodě (${esc(p.shop)})</a>` : `<span class="btn" disabled>odkaz chybí</span>`}
        <button class="btn ${s ? "" : ""}" data-sel="${p.id}">${s ? "✓ V návrhu" : "+ Do návrhu"}</button>
      </div>
      <p class="faint" style="font-size:12.5px;margin-top:14px">Zdroj: <span class="mono">${esc(p.src)}</span><br>Ceny k 15. 11. 2026, mohou se měnit.</p>
    </div>
  </div>
  <div class="mdetail md">${md(p.md)}</div>`);
  postMd($(".mdetail"));
  if (imgs.length) {
    let cur = 0;
    const show = i => { cur = (i + imgs.length) % imgs.length; $("#galMain img").src = imgs[cur]; $("#galMain .ctr").textContent = `${cur + 1} / ${imgs.length}`; $$(".gal-strip img").forEach((x, j) => x.classList.toggle("on", j === cur)); $$(".gal-strip img")[cur]?.scrollIntoView({block: "nearest", inline: "center", behavior: "smooth"}); };
    $("#galMain .l").onclick = e => { e.stopPropagation(); show(cur - 1); };
    $("#galMain .r").onclick = e => { e.stopPropagation(); show(cur + 1); };
    $("#galMain").onclick = () => lightbox(imgs, cur, imgs.map(() => t.main));
    $$(".gal-strip img").forEach(x => x.onclick = () => show(+x.dataset.i));
    if (imgs.length < 2) $$("#galMain .nav").forEach(b => b.style.display = "none");
  }
}
/* ---------- lightbox ---------- */
let LB = {list: [], i: 0, caps: []};
function lightbox(list, i, caps) { LB = {list, i, caps: caps || []}; lbShow(); $("#lightbox").classList.add("open"); }
function lbShow() { $("#lbImg").src = LB.list[LB.i]; $("#lbCap").textContent = (LB.caps[LB.i] || "") + (LB.list.length > 1 ? `  ·  ${LB.i + 1} / ${LB.list.length}` : ""); $$("#lightbox .l, #lightbox .r").forEach(b => b.style.display = LB.list.length > 1 ? "" : "none"); }
function lbStep(d) { LB.i = (LB.i + d + LB.list.length) % LB.list.length; lbShow(); }
function lbClose() { $("#lightbox").classList.remove("open"); }
$("#lightbox .x").onclick = lbClose; $("#lightbox .l").onclick = () => lbStep(-1); $("#lightbox .r").onclick = () => lbStep(1);
$("#lightbox").onclick = e => { if (e.target.id === "lightbox") lbClose(); };
$("#lbImg").onclick = () => window.open(LB.list[LB.i], "_blank");
