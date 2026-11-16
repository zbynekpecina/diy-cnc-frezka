/* =====================================================================
   3D MODEL
   ===================================================================== */
let varBuilt = false, asmTimer = null;
function popup(title, html, sub) {
  openModal(`<div class="mhead"><div><h2>${esc(title)}</h2>${sub ? `<div class="sub">${esc(sub)}</div>` : ""}</div><button class="iconbtn mclose" title="Zavřít (Esc)">✕</button></div><div class="mpad">${html}</div>`);
}
function renderVarianty() {
  const el = $("#v-varianty");
  const v = VBY[S.variant] || VARIANTS[0];
  if (!varBuilt) {
    el.innerHTML = `
    <div class="pills" id="vlist"></div>
    <div class="viewer-wrap" id="vwrap">
      <div id="viewer"></div>
      <div class="vhud"><div class="box"><div class="title" id="hudt"></div><div id="hudarea" style="color:#9aa6b6"></div></div><div class="box coords mono" id="hudc"></div><div class="box"><span id="hudsens"></span> · <span id="hudp">0 %</span></div></div>
      <div class="steplabel" id="steplabel"></div>
      <div class="v3tip" id="v3tip"></div>
      <div class="vtool">
        <div class="grp"><button id="bPlay" class="on" title="Pauza / spustit">⏸</button><button id="bReset" title="Nová deska">↺</button><input type="range" class="speed" id="bSpeed" min="1" max="30" value="6" title="Rychlost"><select id="bProg" title="Program frézování"><option value="both">NEČUM → srovnání</option><option value="text">jen NEČUM</option><option value="flat">jen srovnání</option></select></div>
        <div class="sep"></div>
        <div class="grp gstep"><label>Stavba</label><input type="range" id="bStep" min="1" max="8" value="8" style="width:80px"><button id="bAsm" title="Postavit krok za krokem">▶</button></div>
        <div class="sep"></div>
        <select id="bView" title="Pohled kamery"><option value="iso">celkový pohled</option><option value="front">zepředu</option><option value="side">z boku</option><option value="top">shora</option><option value="dZ">detail: osa Z</option><option value="dX">detail: vozík X</option><option value="dY">detail: vozíky Y</option><option value="dEl">detail: elektronika</option><option value="dDisp">detail: displej</option></select>
        <div style="flex:1"></div>
        <button id="bLab" title="Popisky dílů">🏷<span class="t"> Popisky</span></button><button id="bDim" title="Kóty a rozměry">📏<span class="t"> Kóty</span></button><button id="bExp" title="Rozložit všechny sestavy">🧩<span class="t"> Rozložit</span></button><button id="bCol" title="Složit vše zpět do sebe">📦<span class="t"> Složit vše</span></button><button id="bHud" class="on" title="Info panely (souřadnice) zobrazit / skrýt">ⓘ<span class="t"> Info</span></button><button id="bSnd" class="on" title="Zvuk frézování">🔊<span class="t"> Zvuk</span></button><button id="bFs" title="Celá obrazovka">⛶</button>
      </div>
    </div>
    <div class="vhint"><span class="desk">Levé tlačítko otáčí, pravé posouvá, kolečko přibližuje. Pravým kliknutím na díl se sestava rozloží, kliknutím na žlutou kótu se mění rozměr.</span><span class="mob">Tažením otáčíte, dvěma prsty přibližujete a posouváte.</span></div>
    <div class="vbar" id="vbar"></div>
    <details class="panel ptable" id="ptwrap" open><summary>📐 Rozměry a parametry</summary><div id="ptable"></div></details>
    <details class="panel ptable" id="dwwrap"><summary>📏 Výrobní výkresy a řezný plán</summary><div id="dwg"></div></details>`;
    V3.init($("#viewer"));
    setInterval(() => { if (V3.state.step >= 8 && $("#v-varianty").classList.contains("active")) updateStepLabel(VBY[S.variant]); }, 500);   // fáze gravírování / srovnání
    V3.onParam = (k, val) => { setParam(VBY[S.variant], k, val); rebuild3d(); };
    $("#bPlay").onclick = () => { const on = V3.togglePlay(); $("#bPlay").textContent = on ? "⏸" : "▶"; $("#bPlay").classList.toggle("on", on); updateStepLabel(VBY[S.variant]); };
    $("#bReset").onclick = () => V3.reset();
    $("#bSpeed").oninput = e => V3.setSpeed(+e.target.value);
    $("#bProg").onchange = e => V3.setProg(e.target.value);
    $("#bStep").oninput = e => { stopAsm(); stepTo(+e.target.value); };
    $("#bAsm").onclick = () => { if (asmTimer) stopAsm(); else startAsm(1500); };
    $("#bView").onchange = e => V3.fitView(e.target.value);
    $("#bFs").onclick = () => $("#vwrap").classList.toggle("fs");
    const hudOn = on => { $("#vwrap").classList.toggle("nohud", !on); $("#bHud").classList.toggle("on", on); try { localStorage.setItem(STORE + ".hud", on ? "1" : "0"); } catch (e) {} };
    let hudPref = null; try { hudPref = localStorage.getItem(STORE + ".hud"); } catch (e) {}
    hudOn(hudPref ? hudPref === "1" : !matchMedia("(max-width: 700px)").matches);
    $("#bHud").onclick = () => hudOn($("#vwrap").classList.contains("nohud"));
    $("#bLab").onclick = () => $("#bLab").classList.toggle("on", V3.toggleLabels());
    $("#bDim").onclick = () => $("#bDim").classList.toggle("on", V3.toggleDims());
    $("#bExp").onclick = () => { const b = $("#bExp"), on = !b.classList.contains("on"); b.classList.toggle("on", on); on ? V3.explodeAll() : V3.collapseAll(); b.innerHTML = on ? "🧩<span class=\"t\"> Složit</span>" : "🧩<span class=\"t\"> Rozložit</span>"; };
    $("#bCol").onclick = () => { V3.collapseAll(); const b = $("#bExp"); b.classList.remove("on"); b.innerHTML = "🧩<span class=\"t\"> Rozložit</span>"; };
    $("#bSnd").onclick = () => { const on = V3.toggleSound(); $("#bSnd").classList.toggle("on", on); $("#bSnd").innerHTML = on ? "🔊<span class=\"t\"> Zvuk</span>" : "🔇<span class=\"t\"> Zvuk</span>"; };
    varBuilt = true;
  }
  renderVlist();
  if (V3.cur !== v) { V3.build(v); $("#bStep").value = V3.state.step; $("#bView").value = "iso"; $("#bExp").classList.remove("on"); $("#bExp").innerHTML = "🧩<span class=\"t\"> Rozložit</span>"; }
  if (!introDone) {                                  // úvodní animace: stavba krok za krokem, pak gravírování nápisu a srovnání
    introDone = true;
    if (!matchMedia("(prefers-reduced-motion: reduce)").matches) startAsm(1100, () => { V3.reset(); updateStepLabel(VBY[S.variant]); });
  }
  $("#hudt").textContent = v.short; $("#hudarea").textContent = `obrobek ${v.area[1]} × ${v.area[0]} mm`;
  renderVbar(v); renderPtable(v); renderDwg(v); updateStepLabel(v);
}
function renderDwg(v) {
  const on = v.p3.style === "nas"; $("#dwwrap").classList.toggle("hidden", !on);
  if (on) $("#dwg").innerHTML = renderDrawings(v);
}
function rebuild3d() { const v = VBY[S.variant]; V3.build(v, true); renderVbar(v); renderPtable(v); renderDwg(v); renderVlist(); $("#hudarea").textContent = `obrobek ${v.area[1]} × ${v.area[0]} mm`; }
let introDone = false;
function startAsm(ms, done) {                          // postaví stroj krok za krokem (1 → 8)
  let n = 1; stepTo(1, true); $("#bAsm").textContent = "■";
  asmTimer = setInterval(() => { n++; if (n > 8) { stopAsm(); if (done) done(); return; } stepTo(n); }, ms);
}
function stopAsm() { clearInterval(asmTimer); asmTimer = null; const b = $("#bAsm"); if (b) b.textContent = "▶"; }
function stepTo(n, instant) { V3.setStep(n, instant); $("#bStep").value = n; updateStepLabel(VBY[S.variant]); }
function updateStepLabel(v) {
  const n = V3.state.step, s = v.steps[n - 1];
  $("#steplabel").innerHTML = n >= 8 ? (V3.state.play ? (V3.state.prog !== "flat" && V3.state.seg < (V3.state.textEnd || 0) ? `<b>Engraving</b>text with Ø39 cutter` : `<b>Milling</b>surfacing with Ø39 cutter`) : `<b>Paused</b>`) : `<b>Step ${n} / 8</b>${esc(s[2] || s[0])}`;
}
function renderVlist() {
  $("#vlist").innerHTML = VARIANTS.map(v => vcardHTML(v, v.id === S.variant)).join("");
  $$("#vlist [data-v]").forEach(c => c.onclick = () => { S.variant = c.dataset.v; save(); stopAsm(); history.replaceState(null, "", "#varianta/" + c.dataset.v); renderVarianty(); });
}
function renderVbar(v) {
  $("#vbar").innerHTML = `<div class="vbar-l"><b>${esc(v.name)}</b><span class="muted">${v.tags.map(esc).join(" · ")}</span></div>
    <div class="vbar-p"><span>Nejnutnější<b>${kc(bomTotal(v, "ess"))}</b></span><span>Chybí celkem<b>${kc(bomTotal(v, "need"))}</b></span></div>
    <div class="vbar-b"><button class="btn sm" data-pop="desc">ℹ Popis</button><button class="btn sm" data-pop="steps">🛠 Postup stavby</button><button class="btn sm" data-pop="cmp">⚖ Srovnání</button><button class="btn sm primary" data-pop="kalk">🧮 Kalkulace</button></div>`;
  $$("#vbar [data-pop]").forEach(b => b.onclick = () => ({desc: popDesc, steps: popSteps, cmp: popCmp, kalk: () => { S.navTab = v.id; save(); go("navrh"); }})[b.dataset.pop](v));
}
function dots(n) { return `<span class="dots">${"●".repeat(n)}<i>${"●".repeat(5 - n)}</i></span>`; }
function popDesc(v) {
  popup(v.name, `<div class="md">${md(v.desc)}</div>
  <div class="proscons"><div><div class="pc-h" style="color:var(--ok)">➕ Plusy</div><ul>${v.pros.map(x => `<li>${esc(x)}</li>`).join("")}</ul></div><div><div class="pc-h" style="color:var(--bad)">➖ Mínusy</div><ul>${v.cons.map(x => `<li>${esc(x)}</li>`).join("")}</ul></div></div>
  <div class="bars" style="margin-top:12px">${Object.entries(v.score).map(([k, s]) => `<div class="row"><span>${SCORE_L[k]}</span><div class="bar"><i style="width:${s * 20}%"></i></div><b>${s}/5</b></div>`).join("")}</div>`, v.tags.join(" · "));
}
function popSteps(v) {
  const done = S.steps[v.id] || [];
  popup("Postup stavby", `<p class="muted" style="margin-top:0">Klik na krok ukáže stroj ve 3D v tomto stavu. Zaškrtávej hotové.</p><div class="steps">${v.steps.map((s, i) => `<div class="step ${done.includes(i) ? "done" : ""}" data-i="${i}"><div class="no"></div><div style="flex:1"><b>${esc(s[0])}</b><span>${esc(s[1])}</span></div><input type="checkbox" title="hotovo" ${done.includes(i) ? "checked" : ""}></div>`).join("")}</div>`, v.short);
  $$("#mbox .step").forEach(el => {
    const i = +el.dataset.i;
    el.onclick = e => { if (e.target.type === "checkbox") return; stopAsm(); stepTo(i + 1); closeModal(); };
    $("input", el).onchange = e => { const d = new Set(S.steps[v.id] || []); e.target.checked ? d.add(i) : d.delete(i); S.steps[v.id] = [...d]; save(); el.classList.toggle("done", e.target.checked); };
  });
}
function popCmp() {
  const rows = [["Obrobek", v => `${v.area[1]} × ${v.area[0]}`], ["Nejnutnější", v => `<b>${kc(bomTotal(v, "ess"))}</b>`], ["Chybí celkem", v => kc(bomTotal(v, "need"))], ...Object.keys(SCORE_L).map(k => [SCORE_L[k], v => dots(v.score[k])]), ["Pohon X/Y", v => ({manual: "ručně (zatím)", belt: "řemen HTD", screw: "kuličkové šrouby", nas: "ručně / motor Z"})[v.p3.drive || v.p3.style] || "—"]];
  popup("Srovnání variant", `<div class="tablewrap"><table class="table cmp"><thead><tr><th></th>${VARIANTS.map(v => `<th style="color:${v.color}">${esc(v.short)}</th>`).join("")}</tr></thead><tbody>${rows.map(r => `<tr><td><b>${r[0]}</b></td>${VARIANTS.map(v => `<td>${r[1](v)}</td>`).join("")}</tr>`).join("")}</tbody></table></div>`);
}
function renderPtable(v) {
  const p = getParams(v), groups = (PARAM_INFO[v.p3.style === "nas" ? "nas" : "gen"]).map(([g, rows]) => [g, rows.filter(([k]) => !(p.flat && k === "rodGap"))]);
  const checks = v.p3.style === "nas" ? nasChecks(p) : [];
  $("#ptable").innerHTML = `
  ${checks.length ? `<div class="checks">${checks.map(c => `<div class="chk ${c.ok ? "ok" : "warn"}"><b>${esc(c.t)}</b><span>${esc(c.v)}</span>${c.hint ? `<small>${esc(c.hint)}</small>` : ""}</div>`).join("")}</div>` : ""}
  <div class="pgroups">${groups.map(([g, items]) => `<div class="pgroup"><div class="pg-h">${esc(g)}</div>${items.map(([k, l]) => `<label class="prow"><span>${esc(l)}</span><input type="number" data-p="${k}" value="${p[k]}" step="${k === "zOffset" ? 10 : 5}"><em>mm</em></label>`).join("")}</div>`).join("")}</div>
  <div style="margin-top:10px;display:flex;gap:8px;align-items:center"><button class="btn sm" id="pReset">↺ Výchozí rozměry</button><span class="faint" style="font-size:12.5px">Změny se hned propíšou do 3D modelu, kót i kalkulace.</span></div>`;
  $$("#ptable [data-p]").forEach(i => i.onchange = () => { if (+i.value >= 0) { setParam(v, i.dataset.p, +i.value); rebuild3d(); } });
  $("#pReset").onclick = () => { if (S.params) delete S.params[v.id]; save(); rebuild3d(); };
}
