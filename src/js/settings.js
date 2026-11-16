/* =====================================================================
   NASTAVENÍ (export / import)
   ===================================================================== */
function renderNastaveni() {
  const el = $("#v-nastaveni");
  el.innerHTML = `<div class="sec-title"><div><h2>Nastavení</h2><p>Výběr produktů, kalkulace, úpravy kusovníků a parametry se ukládají ${API ? "na server a jsou sdílené pro všechna zařízení." : "do tohoto prohlížeče."}</p></div></div>
  <div class="setgrid">
    <section class="panel pad"><h3>Záloha projektu</h3><p class="muted">Export uloží celý stav do souboru JSON. Import ho načte a přepíše současný stav.</p>
      <div class="row"><button class="btn primary" id="sExp">Exportovat JSON</button><label class="btn">Importovat JSON<input type="file" id="sImp" accept=".json,application/json" hidden></label></div>
      <div class="faint small" id="sInfo"></div></section>
    <section class="panel pad"><h3>Kurzy měn</h3><p class="muted">Pro přepočet cen v eurech a dolarech.</p>
      <div class="fields"><div class="field"><label>EUR → Kč</label><input type="number" id="sEur" value="${S.rates.eur}" step="0.1"></div><div class="field"><label>USD → Kč</label><input type="number" id="sUsd" value="${S.rates.usd}" step="0.1"></div></div></section>
    <section class="panel pad"><h3>Vzhled</h3><p class="muted">Světlý nebo tmavý motiv, případně podle systému.</p><div class="row"><button class="btn" data-th="light">Světlý</button><button class="btn" data-th="dark">Tmavý</button><button class="btn" data-th="">Podle systému</button></div></section>
    <section class="panel pad"><h3>Obnovit výchozí stav</h3><p class="muted">Smaže výběr produktů, vlastní návrhy, úpravy kusovníků a parametry.</p><div class="row"><button class="btn danger" id="sReset">Vymazat data</button></div></section>
    <section class="panel pad wide"><h3>Data webu</h3><p class="muted">Produkty a wiki se generují ze složky <span class="mono">docs/</span>. Po úpravě dokumentace sestav web znovu příkazem <span class="mono">python tools/build.py</span>.</p>
      <div class="faint small">Sestaveno ${esc(DATA.generated)} · ${P.length} produktů · ${DATA.wiki.length} stránek wiki</div></section>
  </div>`;
  const info = () => $("#sInfo").textContent = `V návrhu ${cartLines().length} položek · ${Object.keys(S.bom).length} upravených kusovníků`;
  info();
  $("#sExp").onclick = () => download(`cnc-frezka-projekt-${new Date().toISOString().slice(0, 10)}.json`, JSON.stringify({app: "cnc-frezka", version: 1, exported: new Date().toISOString(), state: S}, null, 2), "application/json");
  $("#sImp").onchange = async e => {
    const f = e.target.files[0]; if (!f) return;
    try { const j = JSON.parse(await f.text()); const st = j.state || j; S = Object.assign(defState(), st); save(); applyTheme(); Object.keys(rendered).forEach(k => delete rendered[k]); toast("Projekt načten"); renderNastaveni(); }
    catch (err) { toast("Soubor nejde načíst: " + err.message); }
  };
  $("#sEur").onchange = e => { S.rates.eur = +e.target.value; save(); delete rendered.kalkulacky; };
  $("#sUsd").onchange = e => { S.rates.usd = +e.target.value; save(); delete rendered.kalkulacky; };
  $$("[data-th]", el).forEach(b => b.onclick = () => { S.theme = b.dataset.th || null; save(); applyTheme(); });
  $("#sReset").onclick = () => { const b = $("#sReset"); if (!b.dataset.c) { b.dataset.c = 1; b.textContent = "Potvrdit vymazání"; return; } const th = S.theme; S = defState(); S.theme = th; save(); Object.keys(rendered).forEach(k => delete rendered[k]); toast("Data vymazána"); renderNastaveni(); };
}
