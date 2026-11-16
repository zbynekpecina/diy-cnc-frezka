/* =====================================================================
   KALKULAČKY
   ===================================================================== */
const SCREWS = {"SFU1204": [12, 4, 9.9], "SFU1605": [16, 5, 12.9], "SFU1610": [16, 10, 12.9], "SFU2005": [20, 5, 16.9], "SFU2010": [20, 10, 16.9], "SFU2505": [25, 5, 21.9]};
const SECTIONS = {
  "Jekl ocel 80×40×3": ["rect", 40, 80, 3, "st"], "Jekl ocel 100×50×4": ["rect", 50, 100, 4, "st"], "Jekl ocel 120×60×4": ["rect", 60, 120, 4, "st"], "Jekl ocel 120×80×4": ["rect", 80, 120, 4, "st"],
  "Jekl ocel 80×80×3": ["rect", 80, 80, 3, "st"], "Jekl ocel 75×50×3": ["rect", 50, 75, 3, "st"],
  "Al profil 40×80 (Item, Iy 101 cm⁴)": ["I", 101, 4.53, "al"], "Al profil 45×90 lehký (≈130 cm⁴)": ["I", 130, 3.06, "al"], "Al profil 90×90 těžký (≈330 cm⁴)": ["I", 330, 8.5, "al"],
  "V-slot 20×80 (≈18 cm⁴)": ["I", 18, 1.5, "al"], "Vlastní jekl…": ["custom"],
};
function renderKalk() {
  const el = $("#v-kalkulacky");
  el.innerHTML = `<div class="sec-title"><div><h2>Výpočty</h2><p>Pomocné výpočty pro návrh a provoz stroje. Výsledky se přepočítávají při změně hodnot.</p></div></div>
  <div class="calcs">
    <div class="panel pad calc" id="c-defl"><h3><span class="ic">📏</span>Průhyb příčníku portálu</h3><p class="d">Nosník podepřený na koncích, síla uprostřed (nejhorší místo). Řezná síla při srovnávání ~50–150 N, hmotnost Z + vřetena ~10 kg.</p>
      <div class="fields"><div class="field" style="grid-column:1/-1"><label>Průřez</label><select id="d-sec">${Object.keys(SECTIONS).map(k => `<option>${k}</option>`).join("")}</select></div>
      <div class="field cust"><label>Šířka b [mm]</label><input type="number" id="d-b" value="60"></div><div class="field cust"><label>Výška h [mm]</label><input type="number" id="d-h" value="120"></div>
      <div class="field cust"><label>Stěna t [mm]</label><input type="number" id="d-t" value="4"></div><div class="field cust"><label>Materiál</label><select id="d-m"><option value="st">ocel</option><option value="al">hliník</option></select></div>
      <div class="field"><label>Rozpětí L [mm]</label><input type="number" id="d-L" value="1500"></div><div class="field"><label>Síla F [N]</label><input type="number" id="d-F" value="150"></div>
      <div class="field"><label>Směr síly</label><select id="d-dir"><option value="v">svisle (váha)</option><option value="h">vodorovně (řez)</option></select></div><div class="field"><label>Zátěž Z+vřeteno [kg]</label><input type="number" id="d-mz" value="10"></div></div>
      <div class="out" id="d-out"></div></div>

    <div class="panel pad calc" id="c-crit"><h3><span class="ic">🌀</span>Kritické otáčky kuličkového šroubu</h3><p class="d">Kdy se dlouhý šroub rozkmitá (whip). Počítá se s 80 % kritických otáček (THK/Hiwin).</p>
      <div class="fields"><div class="field"><label>Šroub</label><select id="s-t">${Object.keys(SCREWS).map(k => `<option ${k === "SFU1610" ? "selected" : ""}>${k}</option>`).join("")}</select></div>
      <div class="field"><label>Délka mezi ložisky [mm]</label><input type="number" id="s-L" value="1200"></div>
      <div class="field"><label>Uložení</label><select id="s-f"><option value="15.1">pevné–podepřené (BK+BF)</option><option value="21.9">pevné–pevné</option><option value="9.7">podepřené–podepřené</option><option value="3.4">pevné–volné</option></select></div>
      <div class="field"><label>Max. otáčky motoru</label><input type="number" id="s-m" value="900"></div></div>
      <div class="out" id="s-out"></div></div>

    <div class="panel pad calc" id="c-steps"><h3><span class="ic">⚙️</span>Kroky na mm (FluidNC)</h3><p class="d">Hodnota <span class="mono">steps_per_mm</span> do konfigurace FluidNC a potřebná frekvence pulzů.</p>
      <div class="fields"><div class="field"><label>Převod</label><select id="k-type"><option value="screw">kuličkový šroub</option><option value="belt">řemen (HTD/GT2)</option><option value="rack">hřeben + pastorek</option></select></div>
      <div class="field"><label id="k-l1">Stoupání [mm]</label><input type="number" id="k-a" value="5"></div>
      <div class="field"><label id="k-l2">—</label><input type="number" id="k-b" value="20"></div>
      <div class="field"><label>Redukce (motor:osa)</label><input type="number" id="k-i" value="1" step="0.5"></div>
      <div class="field"><label>Kroky motoru / ot.</label><select id="k-s"><option>200</option><option>400</option></select></div>
      <div class="field"><label>Mikrokrok</label><select id="k-u"><option>1</option><option>2</option><option>4</option><option selected>8</option><option>16</option><option>32</option></select></div>
      <div class="field" style="grid-column:1/-1"><label>Rychloposuv [mm/min]</label><input type="number" id="k-v" value="5000"></div></div>
      <div class="out" id="k-out"></div></div>

    <div class="panel pad calc" id="c-cut"><h3><span class="ic">🪵</span>Řezné podmínky</h3><p class="d">Otáčky, posuv na zub → posuv stolu a řezná rychlost.</p>
      <div class="presets"><button class="btn sm" data-pre="39,3,14000,0.12">Srovnávací Ø39 / 3 břity</button><button class="btn sm" data-pre="6,2,18000,0.05">Spirálová 6 mm dřevo</button><button class="btn sm" data-pre="6,1,16000,0.03">1břitá 6 mm hliník</button><button class="btn sm" data-pre="8,2,18000,0.08">Spirálová 8 mm MDF</button></div>
      <div class="fields"><div class="field"><label>Průměr frézy D [mm]</label><input type="number" id="r-D" value="39"></div><div class="field"><label>Počet břitů z</label><input type="number" id="r-z" value="3"></div>
      <div class="field"><label>Otáčky n [ot/min]</label><input type="number" id="r-n" value="14000" step="500"></div><div class="field"><label>Posuv na zub fz [mm]</label><input type="number" id="r-f" value="0.12" step="0.01"></div></div>
      <div class="out" id="r-out"></div></div>

    <div class="panel pad calc" id="c-flat"><h3><span class="ic">⏱️</span>Čas srovnání desky</h3><p class="d">Kolik trvá jeden průchod srovnávací frézou přes desku (řádkování).</p>
      <div class="fields"><div class="field"><label>Délka desky [mm]</label><input type="number" id="f-L" value="1800"></div><div class="field"><label>Šířka desky [mm]</label><input type="number" id="f-W" value="800"></div>
      <div class="field"><label>Průměr frézy [mm]</label><input type="number" id="f-D" value="39"></div><div class="field"><label>Překrytí (krok) [% D]</label><input type="number" id="f-s" value="70"></div>
      <div class="field"><label>Posuv [mm/min]</label><input type="number" id="f-F" value="5000"></div><div class="field"><label>Počet průchodů (vrstev)</label><input type="number" id="f-n" value="3"></div></div>
      <div class="out" id="f-out"></div></div>

    <div class="panel pad calc" id="c-el"><h3><span class="ic">⚡</span>Elektřina: proud, jistič, spotřeba</h3><p class="d">Odběr měniče z jedné fáze 230 V a cena provozu.</p>
      <div class="fields"><div class="field"><label>Výkon vřetena [kW]</label><input type="number" id="e-P" value="2.2" step="0.1"></div><div class="field"><label>Průměrné zatížení [%]</label><input type="number" id="e-l" value="45"></div>
      <div class="field"><label>Motory + elektronika [W]</label><input type="number" id="e-m" value="250"></div><div class="field"><label>Cena elektřiny [Kč/kWh]</label><input type="number" id="e-k" value="${S.kwh}" step="0.1"></div></div>
      <div class="out" id="e-out"></div></div>

    <div class="panel pad calc" id="c-fx"><h3><span class="ic">💱</span>Přepočet měn</h3><p class="d">Kurzy jsou nastavitelné v Nastavení.</p>
      <div class="fields"><div class="field"><label>Částka</label><input type="number" id="x-a" value="64"></div><div class="field"><label>Měna</label><select id="x-c"><option value="usd">USD</option><option value="eur">EUR</option></select></div></div>
      <div class="out" id="x-out"></div></div>
  </div>`;
  const val = id => +$("#" + id).value;
  const R = (k, v, h) => `<div class="r"><span>${k}</span><b>${v}</b></div>` + (h || "");
  const H = (cls, t) => `<div class="hint ${cls}">${t}</div>`;
  function defl() {
    const sec = SECTIONS[$("#d-sec").value]; const cust = sec[0] === "custom";
    $$("#c-defl .cust").forEach(x => x.style.display = cust || sec[0] === "rect" ? "" : "none");
    let I, Iw, kgm, mat;
    if (sec[0] === "rect" || cust) {
      let b, h, t; if (cust) { b = val("d-b"); h = val("d-h"); t = val("d-t"); mat = $("#d-m").value; } else { [, b, h, t, mat] = sec; $("#d-b").value = b; $("#d-h").value = h; $("#d-t").value = t; $("#d-m").value = mat; }
      const Ib = (bb, hh) => (bb * hh ** 3 - (bb - 2 * t) * (hh - 2 * t) ** 3) / 12;
      I = Ib(b, h); Iw = Ib(h, b); kgm = (b * h - (b - 2 * t) * (h - 2 * t)) * 1e-6 * (mat === "st" ? 7850 : 2700);
    } else { I = Iw = sec[1] * 1e4; kgm = sec[2]; mat = sec[3]; }
    const E = mat === "st" ? 210000 : 70000, L = val("d-L"), F = val("d-F");
    const Iuse = $("#d-dir").value === "v" ? I : Iw;
    const dF = F * L ** 3 / (48 * E * Iuse);
    const dW = ($("#d-dir").value === "v") ? (val("d-mz") * 9.81 * L ** 3 / (48 * E * I) + 5 * (kgm * 9.81 / 1000) * L ** 4 / (384 * E * I)) : 0;
    const um = dF * 1000;
    const cls = um < 20 ? ["ok", "Výborné – vhodné i na hliník."] : um < 50 ? ["ok", "Dobré pro dřevo i plasty."] : um < 120 ? ["warn", "Na dřevo OK, na hliník slabé."] : ["bad", "Příliš měkké – větší průřez nebo kratší rozpětí."];
    $("#d-out").innerHTML = R("Průhyb od řezné síly", `${num(um, 1)} µm`) + (dW ? R("Statický průhyb (váha Z + nosník)", `${num(dW * 1000, 0)} µm`) : "") + R("Moment setrvačnosti I", `${num(Iuse / 1e4, 1)} cm⁴`) + R("Hmotnost nosníku", `${num(kgm, 1)} kg/m · ${num(kgm * L / 1000, 1)} kg`) + R("Tuhost", `${num(F / dF / 1000, 1)} N/µm`) + H(cls[0], cls[1]);
  }
  function crit() {
    const [d, lead, dr] = SCREWS[$("#s-t").value], L = val("s-L"), f = +$("#s-f").value;
    const n = f * dr / L ** 2 * 1e7, n8 = n * .8, nm = Math.min(n8, val("s-m"));
    $("#s-out").innerHTML = R("Kritické otáčky", `${num(n)} ot/min`) + R("Bezpečně (80 %)", `${num(n8)} ot/min`) + R("Max. posuv šroubem", `${num(n8 * lead / 1000, 1)} m/min`) + R("Reálně (limit motoru)", `${num(nm * lead / 1000, 1)} m/min`) +
      (n8 * lead < 3000 ? H("bad", "Šroub je na tuto délku moc pomalý → větší průměr, větší stoupání nebo řemen/hřeben.") : n8 * lead < 6000 ? H("warn", "Použitelné, ale rychloposuvy budou omezené.") : H("ok", "V pořádku."));
  }
  function stepsCalc() {
    const t = $("#k-type").value;
    $("#k-l1").textContent = {screw: "Stoupání [mm]", belt: "Rozteč řemene [mm]", rack: "Modul [mm]"}[t];
    $("#k-l2").textContent = t === "screw" ? "—" : "Počet zubů řemenice/pastorku";
    $("#k-b").disabled = t === "screw";
    const a = val("k-a"), b = val("k-b"), i = val("k-i") || 1;
    const mmPerRev = t === "screw" ? a : t === "belt" ? a * b : Math.PI * a * b;
    const spr = +$("#k-s").value * +$("#k-u").value;
    const spm = spr * i / mmPerRev, f = spm * val("k-v") / 60;
    $("#k-out").innerHTML = R("Posuv na otáčku motoru", `${num(mmPerRev / i, 3)} mm`) + R("steps_per_mm", `<span class="mono">${num(spm, 3)}</span>`) + R("Rozlišení", `${num(1000 / spm, 2)} µm/krok`) + R("Frekvence pulzů při rychloposuvu", `${num(f / 1000, 1)} kHz`) + R("Otáčky motoru", `${num(val("k-v") / mmPerRev * i)} ot/min`) +
      (f > 200000 ? H("bad", "Nad možnosti ESP32 (~250 kHz) – snížit mikrokrok.") : val("k-v") / mmPerRev * i > 1000 ? H("warn", "Krokový motor nad ~900 ot/min ztrácí moment.") : H("ok", "V pořádku pro ESP32 + DM556."));
  }
  function cutCalc() {
    const D = val("r-D"), z = val("r-z"), n = val("r-n"), fz = val("r-f"), vc = Math.PI * D * n / 1000, F = n * z * fz;
    $("#r-out").innerHTML = R("Řezná rychlost vc", `${num(vc)} m/min`) + R("Posuv stolu F", `${num(F)} mm/min`) + R("Obvodová rychlost", `${num(vc / 60, 1)} m/s`) +
      (D >= 30 && n > 16000 ? H("warn", "Velká fréza – zbytečně vysoké otáčky, doporučeno 12–16 tis. ot/min.") : F > 8000 ? H("warn", "Posuv nad 8 m/min – ověř tuhost a motory.") : fz < .02 ? H("warn", "Malý posuv na zub = tření a pálení dřeva.") : H("ok", "Rozumné hodnoty."));
  }
  function flat() {
    const L = val("f-L"), W = val("f-W"), D = val("f-D"), so = D * val("f-s") / 100, F = val("f-F"), n = val("f-n");
    const rows = Math.ceil((W + D * .2) / so), len = rows * (L + D) + W, t = len / F * n;
    $("#f-out").innerHTML = R("Počet řádků", num(rows)) + R("Dráha jednoho průchodu", `${num(len / 1000, 1)} m`) + R("Čas jednoho průchodu", `${num(len / F, 1)} min`) + R("Celkem", `<span>${Math.floor(t / 60)} h ${num(t % 60)} min</span>`);
  }
  function el2() {
    const P = val("e-P") * 1000, l = val("e-l") / 100, m = val("e-m"), k = val("e-k");
    const Imax = (P / .85 + m) / (230 * .7), Iavg = (P * l / .85 + m) / (230 * .7);
    const kwh = (P * l / .85 + m) / 1000;
    S.kwh = k; save();
    $("#e-out").innerHTML = R("Proud ze sítě (plný výkon)", `${num(Imax, 1)} A`) + R("Proud průměrně", `${num(Iavg, 1)} A`) + R("Spotřeba", `${num(kwh, 2)} kWh/h`) + R("Cena provozu", `${num(kwh * k, 1)} Kč/h`) + H("warn", "Doporučení: samostatný okruh, jistič <b>C16</b>, proudový chránič typ <b>A</b> nebo <b>F</b> (ne AC), stíněný kabel k vřetenu, uzemnění.");
  }
  function fx() { const a = val("x-a"), c = $("#x-c").value; $("#x-out").innerHTML = R(`${num(a, 2)} ${c.toUpperCase()}`, kc(a * S.rates[c])) + R("Kurz", `${S.rates[c]} Kč`); }
  const bind = (sel, fn) => { $$(sel + " input, " + sel + " select").forEach(i => i.oninput = fn); fn(); };
  bind("#c-defl", defl); bind("#c-crit", crit); bind("#c-steps", stepsCalc); bind("#c-cut", cutCalc); bind("#c-flat", flat); bind("#c-el", el2); bind("#c-fx", fx);
  $$("[data-pre]").forEach(b => b.onclick = () => { const [D, z, n, f] = b.dataset.pre.split(","); $("#r-D").value = D; $("#r-z").value = z; $("#r-n").value = n; $("#r-f").value = f; cutCalc(); });
}
