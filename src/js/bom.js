/* =====================================================================
   KUSOVNÍK (Kalkulace) – vykreslení do kontejneru
   ===================================================================== */
let BOM_EDIT = false;
function renderBomInto(v, box, onChange) {
  const mode = S.bomMode || "need", ed = BOM_EDIT || !!v.custom;
  const lines = bomLines(v), shown = lines.filter(l => inMode(l, mode));
  const tAll = bomTotal(v, "all"), tNeed = bomTotal(v, "need"), tEss = bomTotal(v, "ess");
  const cats = Object.keys(KAT).filter(k => lines.some(l => l.k === k));
  const setOv = (i, k, val) => { const o = ((S.bom[v.id] = S.bom[v.id] || {})[i] = S.bom[v.id][i] || {}); if (val === undefined) delete o[k]; else o[k] = val; };
  let rows = "";
  for (const k of cats) {
    const gl = shown.filter(l => l.k === k); if (!gl.length) continue;
    const K = KAT[k], allOn = gl.every(l => !l.off);
    rows += `<tr class="grow"><td><input type="checkbox" data-g="${k}" ${allOn ? "checked" : ""} title="Počítat celou skupinu"></td><td colspan="4"><span class="kdot" style="--c:${K.c}"></span><b>${esc(K.n)}</b>${K.have ? ` <span class="badge b-koupeno">máme</span>` : ""}${K.ess ? ` <span class="badge b-top">nejnutnější</span>` : ""}</td><td class="num"><b>${kc(bomCat(v, k))}</b></td><td></td>${ed ? "<td></td>" : ""}</tr>`;
    for (const l of gl) {
      const pr = pByRef(l.ref), shopUrl = l.urlOv || (pr && pr.url) || (l.ref && /^https?:/.test(l.ref) ? l.ref : "") || l.url || "";
      const shopNm = pr && pr.shop ? pr.shop.split(/[ ,(]/)[0] : shopUrl ? (() => { try { return new URL(shopUrl).hostname.replace(/^www\./, "").split(".")[0]; } catch (e) { return ""; } })() : "";
      const th = l.img ? `<img src="${l.img}" alt="">` : pr && pr.mini ? `<img src="${pr.mini}" alt="" loading="lazy">` : pr && pr.thumbs[0] ? `<img class="ph" src="${pr.thumbs[pr.cover || 0]}" alt="" loading="lazy">` : `<span class="ico" style="--c:${KAT[l.k].c}">${CATS[pr?.cat]?.icon || "🔩"}</span>`;
      rows += `<tr class="${l.off ? "off" : ""}" data-i="${l.i}"><td><input type="checkbox" ${l.off ? "" : "checked"} data-k="on" title="Počítat do kalkulace"></td><td class="thc">${ed ? `<div class="thpaste" tabindex="0" data-paste="${l.i}" title="Klikni sem a vlož obrázek ze schránky (Ctrl+V), nebo sem obrázek přetáhni">${th}<span class="pv">📋</span></div>${l.img ? `<button class="thdel" data-imgdel="${l.i}" title="Zrušit vlastní obrázek">✕</button>` : ""}` : pr ? `<a href="#produkt/${pr.id}" title="Detail produktu">${th}</a>` : th}</td>
        <td>${ed ? `<input type="text" class="nmIn" value="${esc(l.n)}" data-k="n" title="Název položky"><select class="kIn" data-k="k" title="Skupina">${Object.entries(KAT).map(([kk, K]) => `<option value="${kk}" ${kk === l.k ? "selected" : ""}>${esc(K.n)}</option>`).join("")}</select>`
          : `<div class="nm"><span>${pr ? `<a href="#produkt/${pr.id}">${esc(l.n)}</a>` : esc(l.n)}${l.est ? ` <span class="badge b-est" title="cena odhadem">≈</span>` : ""}${l.added ? ` <span class="badge b-top">přidáno</span>` : ""}</span>${l.note ? `<small>${esc(l.note)}</small>` : ""}</div>`}</td>
        <td class="num"><input type="number" min="0" step="${l.u === "m" ? .1 : 1}" value="${l.q}" data-k="q"> ${l.u}</td>
        <td class="num"><input type="number" min="0" step="10" value="${l.p}" data-k="p"></td>
        <td class="num"><b>${kc(l.off ? 0 : l.q * l.p)}</b></td><td class="shc">${ed ? `<input type="url" class="urlIn" data-k="url" value="${esc(l.urlOv || shopUrl)}" placeholder="odkaz do e-shopu" title="Odkaz do e-shopu (prázdné = výchozí)">` : shopUrl ? `<a class="btn sm shopbtn" href="${esc(shopUrl)}" target="_blank" rel="noopener" title="Otevřít v e-shopu">🛒 ${esc(shopNm || "Obchod")}</a>` : `<a class="btn sm ghost shopbtn" href="https://www.google.com/search?q=${encodeURIComponent(l.n)}" target="_blank" rel="noopener" title="Nemáme odkaz – vyhledat na webu">🔍 Hledat</a>`}</td>${ed ? `<td><button class="btn sm ghost danger" data-del="${l.i}" title="Smazat položku">✕</button></td>` : ""}</tr>`;
    }
  }
  box.innerHTML = `
  <div class="sumcards">
    <div class="sumcard ${mode === "ess" ? "on" : ""}" data-mode="ess"><div class="k">Nejnutnější</div><div class="v">${kc(tEss)}</div><div class="s">konstrukce · vedení · osa Z · vřeteno</div></div>
    <div class="sumcard ${mode === "need" ? "on" : ""}" data-mode="need"><div class="k">Co nám chybí</div><div class="v">${kc(tNeed)}</div><div class="s">bez stolu a spodní konstrukce</div></div>
    <div class="sumcard ${mode === "all" ? "on" : ""}" data-mode="all"><div class="k">Celý stroj</div><div class="v">${kc(tAll)}</div><div class="s">včetně toho, co máme</div></div>
  </div>
  <div class="tablewrap"><table class="table bomtab"><thead><tr><th style="width:34px"></th><th style="width:52px"></th><th>Položka <span class="faint" style="text-transform:none;letter-spacing:0;font-weight:500">· ≈ = odhad ceny</span></th><th class="num">Množství</th><th class="num">Cena/j.</th><th class="num">Celkem</th><th class="shc">E-shop</th>${ed ? "<th></th>" : ""}</tr></thead><tbody>${rows}</tbody></table></div>
  <div class="bomtools">${v.custom ? "" : `<button class="btn sm ${BOM_EDIT ? "primary" : ""}" id="bomEd">${BOM_EDIT ? "✓ Hotovo" : "✎ Upravit položky"}</button>`}${!v.custom && (Object.keys(S.bom[v.id] || {}).length || ((S.bomAdd || {})[v.id] || []).length) ? `<button class="btn sm ghost" id="bomRst" title="Vrátit položky tohoto návrhu do původního stavu">↺ Obnovit původní</button>` : ""}<span class="faint">${ed ? "název, skupinu, množství, cenu i odkaz lze přepsat · klik na náhled + Ctrl+V vloží obrázek ze schránky · ✕ smaže položku · dole přidáš novou" : "množství a cenu lze měnit přímo v tabulce"}</span></div>
  ${ed ? `<div class="addrow2"><select id="adP"><option value="">＋ přidat produkt z katalogu…</option>${P.filter(p => p.price != null).map(p => `<option value="${p.id}">${esc(splitTitle(p.title).main.slice(0, 70))} · ${kc(pTotal(p))}</option>`).join("")}</select><span class="muted">nebo</span><input type="text" id="adN" placeholder="vlastní položka"><select id="adK">${Object.entries(KAT).map(([k, K]) => `<option value="${k}">${esc(K.n)}</option>`).join("")}</select><input type="number" id="adC" placeholder="cena Kč"><button class="btn sm primary" id="adAdd">Přidat</button></div>` : ""}`;
  const redo = () => { save(); renderBomInto(v, box, onChange); onChange && onChange(); };
  $$("[data-mode]", box).forEach(b => b.onclick = () => { S.bomMode = b.dataset.mode; redo(); });
  $$("[data-g]", box).forEach(c => c.onchange = () => { shown.filter(l => l.k === c.dataset.g).forEach(l => setOv(l.i, "off", !c.checked)); redo(); });
  $$("tr[data-i]", box).forEach(tr => $$("input,select", tr).forEach(inp => inp.onchange = () => {
    const i = +tr.dataset.i, k = inp.dataset.k;
    if (k === "on") setOv(i, "off", !inp.checked); else if (k === "n") { if (!inp.value.trim()) return; setOv(i, "n", inp.value.trim()); } else if (k === "k") setOv(i, "k", inp.value); else if (k === "url") { const u = inp.value.trim(); if (u && !/^https?:\/\//i.test(u)) { toast("Odkaz musí začínat http:// nebo https://"); return; } setOv(i, "url", u || undefined); } else setOv(i, k, +inp.value);
    redo();
  }));
  const putImg = async (i, blob) => {
    try {
      const bmp = await createImageBitmap(blob), N = 128, c = document.createElement("canvas"); c.width = c.height = N;
      const sc = Math.min(N / bmp.width, N / bmp.height), w = bmp.width * sc, h = bmp.height * sc;
      c.getContext("2d").drawImage(bmp, (N - w) / 2, (N - h) / 2, w, h);
      let url = c.toDataURL("image/webp", .85); if (!url.startsWith("data:image/webp")) url = c.toDataURL("image/png");
      setOv(i, "img", url); redo(); toast("Obrázek vložen");
    } catch (e) { toast("Obrázek se nepodařilo načíst"); }
  };
  $$("[data-paste]", box).forEach(el => {
    const i = +el.dataset.paste;
    el.addEventListener("paste", e => { const it = [...(e.clipboardData?.items || [])].find(x => x.type.startsWith("image/")); if (it) { e.preventDefault(); putImg(i, it.getAsFile()); } else toast("Ve schránce není obrázek"); });
    el.addEventListener("click", async () => {
      el.focus();
      if (!navigator.clipboard?.read) { toast("Teď stiskni Ctrl+V"); return; }
      try { for (const ci of await navigator.clipboard.read()) { const t = ci.types.find(x => x.startsWith("image/")); if (t) { putImg(i, await ci.getType(t)); return; } } toast("Ve schránce není obrázek – zkopíruj ho a klikni znovu"); }
      catch (e) { toast("Teď stiskni Ctrl+V (prohlížeč nepovolil čtení schránky)"); }
    });
    el.addEventListener("dragover", e => e.preventDefault());
    el.addEventListener("drop", e => { e.preventDefault(); const f = [...e.dataTransfer.files].find(x => x.type.startsWith("image/")); if (f) putImg(i, f); });
  });
  $$("[data-imgdel]", box).forEach(b => b.onclick = () => { setOv(+b.dataset.imgdel, "img", undefined); redo(); });
  if ($("#bomEd", box)) $("#bomEd", box).onclick = () => { BOM_EDIT = !BOM_EDIT; renderBomInto(v, box, onChange); };
  if ($("#bomRst", box)) $("#bomRst", box).onclick = () => { if (!confirm("Vrátit všechny položky tohoto návrhu do původního stavu?")) return; delete S.bom[v.id]; if (S.bomAdd) delete S.bomAdd[v.id]; redo(); };
  if (!v.custom && ed) {
    $$("[data-del]", box).forEach(b => b.onclick = () => { setOv(+b.dataset.del, "del", 1); redo(); });
    $("#adAdd", box).onclick = () => {
      const pid = $("#adP", box).value, A = ((S.bomAdd = S.bomAdd || {})[v.id] = S.bomAdd[v.id] || []);
      if (pid) { const q = PBY[pid]; A.push({k: prodKat(q), n: splitTitle(q.title).main, q: 1, p: pTotal(q), ref: q.url}); }
      else if ($("#adN", box).value.trim()) A.push({k: $("#adK", box).value, n: $("#adN", box).value.trim(), q: 1, p: +$("#adC", box).value || 0, est: 1});
      else return;
      redo();
    };
  }
  if (v.custom) {
    const d = v.custom;
    $$("[data-del]", box).forEach(b => b.onclick = () => { designBake(d); d.bom.splice(+b.dataset.del, 1); redo(); });
    $("#adAdd").onclick = () => {
      designBake(d);
      const pid = $("#adP").value;
      if (pid) { const q = PBY[pid]; d.bom.push({k: prodKat(q), n: splitTitle(q.title).main, q: 1, p: pTotal(q), ref: q.url}); }
      else if ($("#adN").value.trim()) d.bom.push({k: $("#adK").value, n: $("#adN").value.trim(), q: 1, p: +$("#adC").value || 0, est: 1});
      else return;
      redo();
    };
  }
}
const prodKat = q => ({"00-hotova-reseni-a-alternativy": "osaZ", "01-konstrukce-ram": "horni", "02-linearni-vedeni": "vedeni", "03-prevody-sroub-remen": "pohony", "04-motory-a-drivery": "pohony", "05-vreteno-a-vfd": "vreteno", "06-rizeni-elektronika": "elektro", "08-kryty-stul-prislusenstvi": "prisl"})[q.cat] || "prisl";
function designBake(d) {
  const ov = S.bom[d.id] || {};
  d.bom = d.bom.map((l, i) => { const o = ov[i]; return o ? Object.assign({}, l, o.q != null ? {q: o.q} : {}, o.p != null ? {p: o.p} : {}, o.n != null ? {n: o.n} : {}, o.k != null ? {k: o.k} : {}, o.off != null ? {off: o.off ? 1 : 0} : {}, o.url != null ? {urlOv: o.url} : {}, o.img != null ? {img: o.img} : {}) : l; });
  S.bom[d.id] = {};
}
function renderBom() {}
