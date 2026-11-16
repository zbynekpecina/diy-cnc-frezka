/* =====================================================================
   WIKI – dokumentace z docs/ (navigace vlevo, obsah stránky vpravo)
   ===================================================================== */
let wikiBuilt = false, wikiCur = null;

function wikiNav(cur) {
  let html = "", last = "";
  for (const d of DATA.wiki) {
    if (d.group !== last) { html += `${last ? "</div>" : ""}<div class="wgroup"><div class="wgroup-h">${esc(d.group)}</div>`; last = d.group; }
    html += `<a class="wdoc ${d.id === cur ? "active" : ""}" href="#wiki/${d.id}"><span class="wi">${d.icon || "📄"}</span><span>${esc(d.nav || d.title)}</span></a>`;
  }
  return html + "</div>";
}

function renderWiki(docId, anchor) {
  const el = $("#v-wiki");
  if (!wikiBuilt) {
    el.innerHTML = `<div class="wiki">
      <aside class="wside" id="wside">
        <div class="wsearch"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg><input type="search" id="wq" placeholder="Hledat ve wiki" autocomplete="off"></div>
        <nav id="wnav"></nav><div id="wres"></div>
      </aside>
      <article class="wpage" id="wpage"></article>
      <aside class="wtoc" id="wtoc"></aside>
    </div>`;
    $("#wq").oninput = e => wikiSearch(e.target.value);
    wikiBuilt = true;
  }
  const W = DATA.wiki;
  const doc = W.find(d => d.id === docId) || W[0];
  if (wikiCur !== doc.id) {
    wikiCur = doc.id;
    $("#wnav").innerHTML = wikiNav(doc.id);
    const i = W.indexOf(doc), prev = W[i - 1], next = W[i + 1];
    const body = doc.md.replace(/^\s*# .+\n/, "");                    // nadpis stránky se vykreslí zvlášť
    $("#wpage").innerHTML = `
      <div class="wcrumb"><span>Wiki</span><span>›</span><span>${esc(doc.group)}</span></div>
      <div class="wicon">${doc.icon || "📄"}</div>
      <h1 class="wtitle">${esc(doc.title)}</h1>
      <div class="wmeta">${esc(doc.src)}</div>
      <div class="md" id="wmd">${md(body)}</div>
      <nav class="wpn">${prev ? `<a href="#wiki/${prev.id}"><small>Předchozí</small><b>${prev.icon || ""} ${esc(prev.nav || prev.title)}</b></a>` : "<span></span>"}${next ? `<a class="nx" href="#wiki/${next.id}"><small>Další</small><b>${next.icon || ""} ${esc(next.nav || next.title)}</b></a>` : ""}</nav>`;
    const heads = [];
    $$("#wmd h2, #wmd h3").forEach((h, k) => { h.id = "h-" + k; heads.push({id: h.id, t: h.textContent, l: h.tagName}); });
    postMd($("#wmd"));
    $("#wtoc").innerHTML = heads.length > 1 ? `<div class="wtoc-h">Na této stránce</div>` + heads.map(h => `<a href="#wiki/${doc.id}/${h.id}" class="${h.l === "H3" ? "l3" : ""}" data-h="${h.id}">${esc(h.t)}</a>`).join("") : "";
    if (!anchor) window.scrollTo({top: 0});
  }
  if (anchor) { const t = document.getElementById(anchor); if (t) t.scrollIntoView({behavior: "smooth", block: "start"}); }
  scrollSpy();
}

function wikiSearch(q) {
  q = q.trim().toLowerCase();
  $("#wnav").style.display = q ? "none" : "";
  const res = $("#wres");
  if (!q) { res.innerHTML = ""; return; }
  const hits = [];
  for (const d of DATA.wiki) {
    let head = "";
    for (const l of d.md.split("\n")) {
      if (/^#{2,3} /.test(l)) head = l.replace(/^#+ /, "");
      if (l.toLowerCase().includes(q) && hits.length < 40) hits.push({d, head, l});
    }
  }
  const clean = s => s.replace(/[#*|>`\[\]]|\(http[^)]*\)/g, "").trim();
  res.innerHTML = `<div class="wgroup-h">${hits.length ? `Nalezeno ${hits.length}` : "Nic nenalezeno"}</div>` +
    hits.map(h => `<a class="whit" href="#wiki/${h.d.id}"><b>${h.d.icon || ""} ${esc(h.d.nav || h.d.title)}${h.head ? ` · ${esc(clean(h.head))}` : ""}</b><span>${esc(clean(h.l).slice(0, 110))}</span></a>`).join("");
}

function scrollSpy() {
  const heads = $$("#wmd h2, #wmd h3"); if (!heads.length) return;
  let cur = heads[0].id;
  for (const h of heads) if (h.getBoundingClientRect().top < 110) cur = h.id;
  $$(".wtoc a").forEach(a => a.classList.toggle("on", a.dataset.h === cur));
}
window.addEventListener("scroll", () => { if ($("#v-wiki").classList.contains("active")) scrollSpy(); }, {passive: true});

/* úpravy vykresleného markdownu: externí odkazy do nového okna, náhledy obrázků, tabulky v obalu */
function postMd(root) {
  $$("a[href^='http']", root).forEach(a => { a.target = "_blank"; a.rel = "noopener"; });
  $$("a", root).forEach(a => {
    const h = a.getAttribute("href") || "";
    if (!/^https?:/i.test(h) && /\.(png|jpe?g|webp)$/i.test(h) && !a.dataset.pv) {
      a.dataset.pv = 1; const im = document.createElement("img"); im.src = h; im.alt = a.textContent; a.after(im);
    }
  });
  $$("table", root).forEach(t => { if (!t.parentElement.classList.contains("mdtable")) { const w = document.createElement("div"); w.className = "mdtable"; t.before(w); w.append(t); } });
  $$("img", root).forEach(img => { img.loading = "lazy"; img.onclick = () => lightbox([img.getAttribute("src")], 0, [img.alt]); });
}
