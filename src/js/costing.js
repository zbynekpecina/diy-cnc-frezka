/* =====================================================================
   KALKULACE (návrhy)
   ===================================================================== */
const designObj = d => ({id: d.id, get short() { return d.name; }, get name() { return d.name; }, get bom() { return d.bom; }, custom: d, color: "#7a4fd6", tags: ["vlastní návrh"]});
function allDesigns() { return [...VARIANTS, ...(S.designs || []).map(designObj)]; }
function renderNavrh() {
  const el = $("#v-navrh");
  const list = allDesigns(), mode = S.bomMode || "need";
  if (S.navTab !== "moje" && !list.find(d => d.id === S.navTab)) S.navTab = "nas2";
  el.innerHTML = `<div class="pagehead"><h2>Kalkulace</h2><button class="btn primary sm" id="nNew">＋ Vlastní návrh</button></div>
  <div class="navtabs">${list.map(d => `<button class="pill ${S.navTab === d.id ? "on" : ""}" data-nt="${d.id}" style="--c:${d.color}"><i></i>${esc(d.short)}<small>${kc(bomTotal(d, mode))}</small></button>`).join("")}<button class="pill ${S.navTab === "moje" ? "on" : ""}" data-nt="moje">🛒 Můj výběr<small>${kc(cartTotal())}</small></button></div>
  <div id="ncont"></div>`;
  $$("[data-nt]", el).forEach(b => b.onclick = () => { S.navTab = b.dataset.nt; save(); renderNavrh(); });
  $("#nNew").onclick = openBuilder;
  const box = $("#ncont");
  if (S.navTab === "moje") return renderMyCart(box);
  const d = list.find(x => x.id === S.navTab);
  box.innerHTML = `<div class="dhead"><div><b>${esc(d.name)}</b>${d.custom ? "" : `<span class="muted"> · obrobek ${d.area[1]} × ${d.area[0]} mm</span>`}</div><div class="dbtn">
    ${d.custom ? `<button class="btn sm" id="dRen">✎ Přejmenovat</button><button class="btn sm danger" id="dDel">Smazat</button>` : `<button class="btn sm" data-go="varianta/${d.id}">🧊 3D model</button>`}
    <button class="btn sm" id="dCopy">⧉ Kopie jako vlastní</button><button class="btn sm" id="dCsv">⬇ CSV</button></div></div><div id="nbom"></div>`;
  const refresh = () => $$(".navtabs [data-nt]", el).forEach(b => { const dd = allDesigns().find(x => x.id === b.dataset.nt); if (dd) b.querySelector("small").textContent = kc(bomTotal(dd, S.bomMode || "need")); });
  renderBomInto(d, $("#nbom"), refresh);
  $("#dCsv").onclick = () => { const rows = [["Skupina", "Položka", "Množství", "Jednotka", "Cena/j.", "Celkem", "Poznámka"]].concat(bomLines(d).filter(l => !l.off && inMode(l, S.bomMode || "need")).map(l => [l.g, l.n, l.q, l.u, l.p, l.q * l.p, l.note || ""])); download(`cnc-${d.id}.csv`, "﻿" + rows.map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(";")).join("\n"), "text/csv"); };
  $("#dCopy").onclick = () => { const nd = {id: "d" + Date.now(), name: d.short + " – kopie", bom: bomLines(d).map(l => ({k: l.k, n: l.n, q: l.q, p: l.p, u: l.u, ref: l.ref, est: l.est, note: l.note, off: l.off ? 1 : 0}))}; (S.designs = S.designs || []).push(nd); S.navTab = nd.id; save(); renderNavrh(); toast("Vytvořena kopie – můžeš ji upravovat"); };
  if (d.custom) {
    $("#dRen").onclick = () => { const n = prompt("Název návrhu", d.name); if (n) { d.custom.name = n; save(); renderNavrh(); } };
    $("#dDel").onclick = () => { if (!confirmInline("dDel", "Smazat")) return; S.designs = S.designs.filter(x => x.id !== d.id); S.navTab = "nas2"; save(); renderNavrh(); };
  }
}
function renderMyCart(box) {
  const lines = cartLines(), total = cartTotal();
  box.innerHTML = `<div class="dhead"><div><b>Můj výběr</b><span class="muted"> · produkty přidané tlačítkem ＋ v katalogu</span></div><div class="dbtn"><button class="btn sm" id="nCsv">⬇ CSV</button><button class="btn sm danger" id="nClear">Vyprázdnit</button></div></div>
  <div class="sumcards"><div class="sumcard on"><div class="k">Celkem</div><div class="v">${kc(total)}</div><div class="s">${lines.length} položek</div></div></div>
  ${lines.length ? `<div class="tablewrap"><table class="table" id="ntab"><thead><tr><th>Položka</th><th class="num">Ks</th><th class="num">Cena/j.</th><th class="num">Doprava</th><th class="num">Celkem</th><th></th></tr></thead><tbody>
    ${lines.map((l, i) => `<tr data-n="${i}"><td>${l.kind === "p" ? `<a href="#produkt/${l.id}">${esc(l.name)}</a>` : esc(l.name)}<div class="faint" style="font-size:12px">${esc(l.cat)}</div></td>
      <td class="num"><input type="number" min="0" step="any" value="${l.q}" data-k="q"></td><td class="num"><input type="number" min="0" step="10" value="${l.p}" data-k="p"></td>
      <td class="num"><input type="number" min="0" step="10" value="${l.ship}" data-k="ship"></td><td class="num"><b>${kc(lineTotal(l))}</b></td>
      <td><button class="btn sm ghost danger" data-k="del">✕</button></td></tr>`).join("")}</tbody></table></div>` : `<div class="panel empty">Zatím prázdné. V katalogu Produkty přidej díly tlačítkem ＋.</div>`}`;
  $("#nClear").onclick = () => { if (!confirmInline("nClear")) return; S.sel = {}; S.custom = []; save(); renderNavrh(); };
  $("#nCsv").onclick = () => { const rows = [["Položka", "Kategorie", "Ks", "Cena/j.", "Doprava", "Celkem", "Odkaz"]].concat(cartLines().map(l => [l.name, l.cat, l.q, l.p, l.ship, lineTotal(l), l.url || ""])); download("cnc-muj-vyber.csv", "﻿" + rows.map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(";")).join("\n"), "text/csv"); };
  $$("#ntab tr[data-n]").forEach(tr => {
    const l = lines[+tr.dataset.n];
    $$("[data-k]", tr).forEach(inp => {
      const k = inp.dataset.k;
      if (k === "del") inp.onclick = () => { if (l.kind === "p") delete S.sel[l.id]; else S.custom.splice(l.idx, 1); save(); renderNavrh(); };
      else inp.onchange = () => { if (l.kind === "p") S.sel[l.id][k] = +inp.value; else S.custom[l.idx][k] = +inp.value; save(); renderNavrh(); };
    });
  });
}
function confirmInline(id, label = "Vyprázdnit") { const b = $("#" + id); if (b.dataset.c) return true; b.dataset.c = 1; b.textContent = "Potvrdit"; setTimeout(() => { if (b) { delete b.dataset.c; b.textContent = label; } }, 3000); return false; }
function download(name, text, type) { const a = document.createElement("a"); a.href = URL.createObjectURL(new Blob([text], {type})); a.download = name; a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 1000); }

/* ---------- průvodce vlastním návrhem ---------- */
const HAVE_LINES = [{k: "spodni", n: "Spodní konstrukce (máme)", q: 1, p: 0}, {k: "stul", n: "Stůl a deska (máme)", q: 1, p: 0}];
const BUILDER = [
  {key: "horni", t: "Horní konstrukce (portál)", opts: [
    {n: "Svařované jekly – náš návrh", lines: () => bomNas(NAS_DEF).filter(l => l.k === "horni")},
    {n: "Ocelový portál jekl 120×80 + plechy", lines: () => BOMS.v1.filter(l => l.k === "horni")},
    {n: "Šroubovaný jekl 100×75 + Al desky", lines: () => BOMS.v2.filter(l => l.k === "horni")},
    {n: "Hliníkový profil 90×90", lines: () => BOMS.v3.filter(l => l.k === "horni")},
  ]},
  {key: "vy", t: "Vedení Y (dlouhá osa)", opts: [
    {n: "VEVOR SBR20 2× 1800 + 4 vozíky", lines: [{k: "vedeni", n: "VEVOR SBR20 2× 1800 mm + 4 vozíky (osa Y)", q: 1, p: 1514, ref: "16415484100", note: "Allegro"}]},
    {n: "SucceBuy SBR20 2× 2200 (sklad CZ)", lines: [{k: "vedeni", n: "SucceBuy SBR20 2× 2200 mm + 4 vozíky (osa Y)", q: 1, p: 2300, est: 1, ref: "1005009878367051", note: "cenu 2200 ověřit (1800 mm = 2 076 Kč)"}]},
    {n: "HGR20 skládané ~2200", lines: [{k: "vedeni", n: "HGR20 2× 1500 + 2× 700 mm + 4 vozíky (osa Y)", q: 1, p: 3700, est: 1, ref: "1005004693727609"}]},
  ]},
  {key: "vx", t: "Vedení X (příčná osa)", opts: [
    {n: "SucceBuy SBR20 2× 1000 + 4 vozíky", lines: [{k: "vedeni", n: "SucceBuy SBR20 2× 1000 mm + 4 vozíky SBR20UU (osa X)", q: 1, p: 893, ref: "17708036612", note: "Allegro, doprava zdarma"}]},
    {n: "VEVOR SBR16 2× 1000 + 4 vozíky", lines: [{k: "vedeni", n: "VEVOR SBR16 2× 1000 mm + 4 vozíky (osa X)", q: 1, p: 799, ref: "5e356ef4", note: "Allegro"}]},
    {n: "CNCWZCS HGR20 2× 1000 + 4 vozíky", lines: [{k: "vedeni", n: "CNCWZCS HGR20 2× 1000 mm + 4× HGH20CA (osa X)", q: 1, p: 1984, ref: "1005004693727609", note: "1 855 + doprava 129"}]},
    {n: "HLTNC HGR20 2× 1000 (PL)", lines: [{k: "vedeni", n: "HLTNC HGR20 2× 1000 mm (osa X) – ověřit vozíky", q: 1, p: 1692, ref: "1005013327547631"}]},
  ]},
  {key: "desk", t: "Deska vozíku X", opts: [
    {n: "Plexisklo 10 mm 300×200", lines: [{k: "osaZ", n: "Plexisklo 10 mm 300×200", q: 1, p: 370, ref: "d8e551a8", note: "315 + doprava 55"}]},
    {n: "Hliník 10 mm 300×200", lines: [{k: "osaZ", n: "Hliníková deska 10 mm 300×200", q: 1, p: 450, est: 1}]},
    {n: "Ocel 8 mm 300×200", lines: [{k: "osaZ", n: "Ocelová deska 8 mm 300×200 (laser)", q: 1, p: 350, est: 1}]},
  ]},
  {key: "z", t: "Osa Z", opts: [
    {n: "Modul 200 mm z Allegra – 2 tyče + šroub Ø16 (1 597 Kč)", lines: [{k: "osaZ", n: "Modul osy Z 200 mm – 2 tyče + kuličkový šroub Ø16, ruční kolo", q: 1, p: 1712, ref: "18760345169", note: "1 597 + doprava 115"}, {k: "osaZ", n: "Příruba NEMA23 + spojka (místo ručního kola)", q: 1, p: 350, est: 1}]},
    {n: "Modul GGP5080 – tyče Ø12 + SFU1605", lines: [{k: "osaZ", n: "Modul osy Z GGP5080 SFU1605, zdvih 200", q: 1, p: 2910, ref: "1005011619914764", note: "2 111 + doprava 799"}]},
    {n: "Modul DXG6042 – SFU1605 + MGW12", lines: [{k: "osaZ", n: "Modul osy Z YUN DUAN DXG6042 SFU1605, zdvih 200", q: 1, p: 2057, ref: "1005005310449620", note: "doprava zdarma"}]},
    {n: "Vlastní z dílů – 2× HGR20 + SFU1605", lines: () => ZAXIS.filter(l => !/Ruční kolo/.test(l.n))},
  ]},
  {key: "vr", t: "Vřeteno", opts: [
    {n: "HLTNC EU 2,2 kW + EV210 RS485 (DE, 4 053 Kč)", lines: [{k: "vreteno", n: "HLTNC 2,2 kW GDZ80x73 ER20 + měnič EV210 (RS485)", q: 1, p: 4053, ref: "1005011656854811", note: "sklad DE, doprava zdarma"}, {k: "vreteno", n: "Kvalitní kleština ER20 8 mm + klíče ER20A a 21 mm", q: 1, p: 450, est: 1}, {k: "vreteno", n: "Stíněný kabel vřetena 5 m", q: 1, p: 350, est: 1}]},
    {n: "EUCNC 2,2 kW ER20 + měnič (PL)", lines: [{k: "vreteno", n: "EUCNC 2,2 kW ER20 + měnič HS320 + kleštiny", q: 1, p: 3814, ref: "1005013148503286"}, {k: "vreteno", n: "Stíněný kabel vřetena 5 m", q: 1, p: 350, est: 1}]},
    {n: "HLTNC 2,2 kW + EV210 (RS485)", lines: [{k: "vreteno", n: "HLTNC 2,2 kW ER20 + měnič EV210", q: 1, p: 4620, ref: "1005009648374545", note: "3 020 + doprava 1 600"}, {k: "vreteno", n: "Kleština ER20 8 mm", q: 1, p: 150, est: 1}, {k: "vreteno", n: "Stíněný kabel vřetena 5 m", q: 1, p: 350, est: 1}]},
    {n: "Zatím ruční frézka Parkside", lines: [{k: "vreteno", n: "Držák frézky (frézku máme)", q: 1, p: 365, ref: "1005010264743655"}]},
  ]},
  {key: "mot", t: "Motory", opts: [
    {n: "Bez motorů (ručně)", lines: [{k: "pohony", n: "Ruční kolo Ø80 na šroub Z", q: 1, p: 397, ref: "1005013332818425"}]},
    {n: "Jen osa Z", lines: [{k: "pohony", n: "Krokový motor NEMA23 + DM556 (osa Z)", q: 1, p: 750, est: 1}]},
    {n: "X, Y1, Y2, Z + řemeny", lines: [{k: "pohony", n: "Krokový motor NEMA23 + DM556", q: 4, p: 750, est: 1}, {k: "pohony", n: "Řemen HTD 5M 15 mm", q: 6, u: "m", p: 130, est: 1}, {k: "pohony", n: "Řemenice + kladky (sada na osu)", q: 3, p: 400, est: 1}]},
  ]},
  {key: "el", t: "Elektronika", opts: [
    {n: "Zatím žádná", lines: []},
    {n: "Minimální – vlastní ESP32", lines: () => bomNas(NAS_DEF).filter(l => l.k === "elektro")},
    {n: "Kompletní – deska 6x CNC", lines: () => ELEC(true)},
  ]},
  {key: "pr", t: "Příslušenství", multi: true, opts: [
    {n: "Odsávací hubice", lines: [{k: "prisl", n: "Odsávací hubice s kartáčem", q: 1, p: 557, ref: "1005012726723014"}]},
    {n: "Kabelové řetězy 15×30 (2 m)", lines: [{k: "prisl", n: "Kabelový řetěz 15×30", q: 2, u: "m", p: 110, ref: "techfun"}]},
    {n: "Upínky", lines: [{k: "prisl", n: "Upínky / svěrky", q: 1, p: 300, est: 1}]},
  ]},
];
const optLines = o => (typeof o.lines === "function" ? o.lines() : o.lines).map(l => Object.assign({}, l));
const optSum = o => optLines(o).reduce((s, l) => s + (l.off ? 0 : l.q * l.p), 0);
function openBuilder() {
  const sel = Object.fromEntries(BUILDER.map(g => [g.key, g.multi ? new Set([0, 1]) : 0]));
  popup("Nový vlastní návrh", `
    <div class="bld-top"><label>Název <input type="text" id="bName" value="Můj návrh ${(S.designs || []).length + 1}"></label></div>
    <p class="muted" style="margin:6px 0 12px">Vyber z každé skupiny jednu možnost. Stůl a spodní konstrukce se počítají jako „máme“. Návrh pak můžeš dál upravovat (zaškrtávat, měnit ceny, přidávat položky).</p>
    <div id="bGroups"></div>
    <div class="bld-foot"><div>Celkem <b id="bTot"></b></div><button class="btn primary" id="bMake">Vytvořit návrh</button></div>`);
  const draw = () => {
    $("#bGroups").innerHTML = BUILDER.map(g => `<div class="bgroup"><div class="pg-h">${esc(g.t)}${g.multi ? " <span class='faint'>(více možností)</span>" : ""}</div><div class="bopts">${g.opts.map((o, i) => {
      const on = g.multi ? sel[g.key].has(i) : sel[g.key] === i;
      return `<button class="bopt ${on ? "on" : ""}" data-g="${g.key}" data-i="${i}"><span>${esc(o.n)}</span><b>${kc(optSum(o))}</b></button>`;
    }).join("")}</div></div>`).join("");
    $("#bTot").textContent = kc(BUILDER.reduce((s, g) => s + (g.multi ? [...sel[g.key]].reduce((a, i) => a + optSum(g.opts[i]), 0) : optSum(g.opts[sel[g.key]])), 0));
    $$("#bGroups .bopt").forEach(b => b.onclick = () => { const g = BUILDER.find(x => x.key === b.dataset.g), i = +b.dataset.i; if (g.multi) { sel[g.key].has(i) ? sel[g.key].delete(i) : sel[g.key].add(i); } else sel[g.key] = i; draw(); });
  };
  draw();
  $("#bMake").onclick = () => {
    const bom = [...HAVE_LINES.map(l => Object.assign({}, l))];
    for (const g of BUILDER) (g.multi ? [...sel[g.key]] : [sel[g.key]]).forEach(i => bom.push(...optLines(g.opts[i])));
    const d = {id: "d" + Date.now(), name: $("#bName").value.trim() || "Můj návrh", bom};
    (S.designs = S.designs || []).push(d); S.navTab = d.id; save(); closeModal(); go("navrh"); renderNavrh(); toast("Návrh vytvořen");
  };
}
