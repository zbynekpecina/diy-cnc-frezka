/* =====================================================================
   ZAPOJENÍ – bloková schémata (popisky ve schématech anglicky)
   ===================================================================== */
const WIRE_C = {ac: "#e5484d", pe: "#3fae5a", dc48: "#f5a524", dc24: "#e8c547", dc5: "#f2d675", sig: "#4f8ef7", rs: "#a970ff", mot: "#8f9bab", vfd: "#ff7a45"};
function svgBlocks(W, H, blocks, wires, legend) {
  /* štíhlý styl: tenký rámeček, barevný proužek vlevo, nadpis + 1–2 řádky; vodiče pravoúhlé se zaoblenými rohy */
  const box = b => {
    const [x, y, w, h] = b.r, c = b.c || "#3b4a63";
    return `<g class="zb" data-t="${esc(b.t)}"><rect x="${x}" y="${y}" width="${w}" height="${h}" rx="8" fill="var(--panel)" stroke="var(--line)" stroke-width="1.2"/>
      <rect x="${x}" y="${y}" width="4" height="${h}" rx="2" fill="${c}"/>
      <text x="${x + 13}" y="${y + 17}" class="zt">${esc(b.t)}</text>
      ${(b.l || []).map((l, i) => `<text x="${x + 13}" y="${y + 32 + i * 13.5}" class="zl">${esc(l)}</text>`).join("")}
      ${(b.pins || []).map(pn => `<circle cx="${pn[0]}" cy="${pn[1]}" r="3" fill="var(--panel)" stroke="${c}" stroke-width="1.6"/><text x="${pn[0] + (pn[3] === "l" ? -7 : 7)}" y="${pn[1] + 3.5}" class="zp" text-anchor="${pn[3] === "l" ? "end" : "start"}">${esc(pn[2])}</text>`).join("")}</g>`;
  };
  const path = pts => {                                   // pravoúhlá lomená čára se zaoblením 6 px
    let d = `M${pts[0][0]},${pts[0][1]}`;
    for (let i = 1; i < pts.length; i++) {
      const [x, y] = pts[i], n = pts[i + 1];
      if (!n) { d += ` L${x},${y}`; break; }
      const [px, py] = pts[i - 1], r = Math.min(6, Math.hypot(x - px, y - py) / 2, Math.hypot(n[0] - x, n[1] - y) / 2);
      const ax = x - Math.sign(x - px) * r, ay = y - Math.sign(y - py) * r, bx = x + Math.sign(n[0] - x) * r, by = y + Math.sign(n[1] - y) * r;
      d += ` L${ax},${ay} Q${x},${y} ${bx},${by}`;
    }
    return d;
  };
  const wire = w => {
    const p = w.p, seg = w.at ?? Math.floor((p.length - 1) / 2), a = p[seg], b = p[seg + 1] || a;
    const lx = (a[0] + b[0]) / 2, ly = (a[1] + b[1]) / 2, thick = ["mot", "ac", "vfd"].includes(w.k) ? 2.6 : 1.8;
    return `<path d="${path(p)}" fill="none" stroke="${WIRE_C[w.k]}" stroke-width="${thick}" ${w.k === "rs" ? 'stroke-dasharray="6 4"' : w.k === "pe" ? 'stroke-dasharray="2 3"' : ""} stroke-linecap="round" class="zw"/>
      ${w.t ? `<g class="zwl"><rect x="${lx - w.t.length * 2.9 - 5}" y="${ly - 8}" width="${w.t.length * 5.8 + 10}" height="15" rx="7.5" fill="var(--panel2)" stroke="${WIRE_C[w.k]}" stroke-width="1"/><text x="${lx}" y="${ly + 3}" text-anchor="middle" class="zwt">${esc(w.t)}</text></g>` : ""}`;
  };
  return `<svg viewBox="0 0 ${W} ${H}" class="zsvg" xmlns="http://www.w3.org/2000/svg">
    ${wires.map(wire).join("")}${blocks.map(box).join("")}
    ${legend ? `<g transform="translate(16,${H - 16})">${legend.map((k, i) => `<g transform="translate(${i * 150},0)"><line x1="0" y1="0" x2="22" y2="0" stroke="${WIRE_C[k[0]]}" stroke-width="2.4" ${k[0] === "rs" ? 'stroke-dasharray="6 4"' : k[0] === "pe" ? 'stroke-dasharray="2 3"' : ""}/><text x="28" y="4" class="zp">${esc(k[1])}</text></g>`).join("")}</g>` : ""}
  </svg>`;
}
const ZAP_LEGEND = [["ac", "230 V AC"], ["vfd", "3-phase (VFD)"], ["pe", "PE"], ["dc48", "36 V DC"], ["dc24", "24 / 5 V DC"], ["sig", "signal"], ["rs", "RS485 A/B"]];

/* 1 · silová část: řada zleva doprava, pod stykačem napájecí větve */
function zapPower() {
  const R = (i, y = 34, w = 130, h = 44) => [20 + i * 158, y, w, h];
  const B = [
    {t: "Mains 230 V", r: R(0), c: "#e5484d", l: ["dedicated C16 circuit"]},
    {t: "Main switch", r: R(1), c: "#e5484d", l: ["2-pole, on enclosure"]},
    {t: "RCD 30 mA", r: R(2), c: "#e5484d", l: ["type A / F"]},
    {t: "EMI filter 20 A", r: R(3), c: "#e5484d", l: ["case bonded to PE"]},
    {t: "Contactor + E-stop", r: R(4), c: "#b91c1c", l: ["E-stop opens coil"]},
    {t: "VFD EV210", r: R(5), c: "#ff7a45", l: ["1-ph 230 V → 3-ph"]},
    {t: "Spindle 2.2 kW", r: R(6), c: "#ff7a45", l: ["shielded 4×1.5 mm²"]},
    {t: "PSU 36 V / 10 A", r: R(3, 128), c: "#f5a524", l: ["4× DM556 driver"]},
    {t: "PSU 24 V / 2 A", r: R(4, 128), c: "#e8c547", l: ["sensors, coils"]},
    {t: "PSU 5 V / 3 A", r: R(5, 128), c: "#e8c547", l: ["FluidNC, display"]},
    {t: "Vacuum outlet", r: R(6, 128), c: "#e5484d", l: ["contactor ← relay"]},
    {t: "PE bus – frame, spindle body, VFD, enclosure, cable shield (VFD side only)", r: [20, 206, 1078, 30], c: "#3fae5a"},
  ];
  const Wr = [];
  for (let i = 0; i < 6; i++) Wr.push({k: i === 5 ? "vfd" : "ac", p: [[150 + i * 158, 56], [178 + i * 158, 56]], t: ""});
  Wr.push({k: "ac", p: [[717, 78], [717, 104]]}, {k: "ac", p: [[559, 104], [1033, 104]], t: "after contactor"});
  for (const x of [559, 717, 875, 1033]) Wr.push({k: "ac", p: [[x, 104], [x, 128]]});
  Wr.push({k: "pe", p: [[60, 78], [60, 206]], t: "PE"});
  return svgBlocks(1118, 270, B, Wr, ZAP_LEGEND);
}

/* 2 · řízení: FluidNC řídí pohyb a vřeteno (0–10 V + start) a spíná vysavač; displej ESP32-P4 je ovladač (WiFi) a po RS485 čte měnič */
function zapControl() {
  const B = [
    {t: "Relay → vacuum", r: [20, 30, 200, 44], c: "#e5484d", l: ["on with spindle (M8)"]},
    {t: "FluidNC – ESP32", r: [290, 30, 230, 196], c: "#2f6fd6", l: ["STEP / DIR / EN × 4", "inputs: limits, home, probe", "E-stop input", "spindle PWM + enable", "VFD fault input", "vacuum relay output", "", "motion + spindle control"]},
    {t: "DM556 → NEMA23 · X", r: [600, 30, 230, 40], c: "#8f9bab"},
    {t: "DM556 → NEMA23 · Y1", r: [600, 80, 230, 40], c: "#8f9bab"},
    {t: "DM556 → NEMA23 · Y2", r: [600, 130, 230, 40], c: "#8f9bab"},
    {t: "DM556 → NEMA23 · Z", r: [600, 180, 230, 40], c: "#8f9bab"},
    {t: "PSU 36 V", r: [900, 30, 200, 44], c: "#f5a524", l: ["stepper drivers"]},
    {t: "PSU 24 V", r: [900, 90, 200, 44], c: "#e8c547", l: ["sensors"]},
    {t: "Sensors", r: [20, 270, 200, 58], c: "#3fae5a", l: ["NC limits X, Y1, Y2", "inductive Z, probe"]},
    {t: "PWM → 0–10 V + relay", r: [290, 270, 230, 58], c: "#4f8ef7", l: ["speed to AI, run to X1"]},
    {t: "VFD EV210", r: [600, 270, 230, 58], c: "#ff7a45", l: ["AI · X1 · TA/TC · 485+/−"]},
    {t: "Display 7\" ESP32-P4", r: [900, 270, 200, 58], c: "#4f8ef7", l: ["custom firmware, WiFi", "RS485 Modbus master"]},
    {t: "Home Assistant", r: [900, 370, 200, 40], c: "#41bdf5", l: ["optional, WiFi"]},
  ];
  const Wr = [
    {k: "ac", p: [[290, 52], [220, 52]], t: "relay"},
    ...[50, 100, 150, 200].map((y, i) => ({k: "sig", p: [[520, y], [600, y]], t: i ? "" : "STEP DIR"})),
    {k: "dc48", p: [[900, 52], [866, 52], [866, 200], [830, 200]], at: 1, t: "36 V"},
    ...[50, 100, 150].map(y => ({k: "dc48", p: [[866, y], [830, y]]})),
    {k: "dc24", p: [[900, 112], [882, 112], [882, 258], [120, 258], [120, 270]], at: 2, t: "24 V"},
    {k: "sig", p: [[220, 299], [252, 299], [252, 190], [290, 190]], at: 1, t: "inputs"},
    {k: "sig", p: [[405, 226], [405, 270]], t: "PWM · EN"},
    {k: "sig", p: [[520, 299], [600, 299]], t: "0–10 V · X1"},
    {k: "sig", p: [[700, 270], [700, 246], [548, 246], [548, 210], [520, 210]], at: 1, t: "fault TA/TC"},
    {k: "sig", p: [[1000, 270], [1000, 234], [470, 234], [470, 226]], at: 1, t: "WiFi (WebSocket)"},
    {k: "rs", p: [[830, 299], [900, 299]], t: "RS485"},
    {k: "sig", p: [[1000, 328], [1000, 370]], t: "WiFi"},
  ];
  return svgBlocks(1118, 440, B, Wr, ZAP_LEGEND);
}

/* 3 · svorky: FluidNC → převodník/relé → EV210 ↔ RS485 ↔ displej ESP32-P4 */
function zapTerminals() {
  const B = [
    {t: "FluidNC (ESP32)", r: [20, 30, 210, 290], c: "#2f6fd6", l: ["spindle type: 10V", "PWM + enable", "", "", "", "", "", "fault via optocoupler", "(3.3 V input, pull-up)"],
      pins: [[230, 100, "GPIO PWM", "l"], [230, 200, "GPIO EN", "l"], [230, 250, "GPIO FAULT", "l"], [230, 290, "GND", "l"]]},
    {t: "Converter", r: [290, 40, 150, 84], c: "#4f8ef7", l: ["PWM → 0–10 V", "supply 12–24 V"], pins: [[290, 100, "PWM", "r"], [440, 92, "0–10 V", "l"], [440, 110, "GND", "l"]]},
    {t: "Run relay", r: [290, 150, 150, 74], c: "#4f8ef7", l: ["5 V coil / opto"], pins: [[290, 200, "IN", "r"], [440, 196, "NO", "l"], [440, 212, "COM", "l"]]},
    {t: "EV210 settings", r: [728, 172, 136, 148], c: "#ff7a45", l: ["P0-02 = 1 terminals", "P0-03 = 2 AI", "J5 = AVI (0–10 V)", "Pd-00 = 6 19200", "Pd-01 = 1 8E1", "Pd-02 = 1 address", "Pd-05 = 1 Modbus", "read-only via RS485"]},
    {t: "VFD EV210", r: [490, 30, 220, 290], c: "#ff7a45", l: [],
      pins: [[490, 92, "AI", "r"], [490, 110, "GND", "r"], [490, 196, "X1", "r"], [490, 212, "COM", "r"], [490, 250, "TA", "r"], [490, 278, "TC", "r"], [710, 110, "485+", "l"], [710, 140, "485−", "l"]]},
    {t: "Display 7\" ESP32-P4", r: [880, 30, 218, 290], c: "#4f8ef7", l: ["built-in RS485 port", "Modbus RTU master", "", "", "", "", "", "reads 1001H–1007H,", "3000H, 8000H:", "speed, current, power,", "status, fault code", "", "WiFi → FluidNC"],
      pins: [[880, 110, "A", "r"], [880, 140, "B", "r"]]},
  ];
  const Wr = [
    {k: "sig", p: [[230, 100], [290, 100]]},
    {k: "sig", p: [[440, 92], [490, 92]]},
    {k: "sig", p: [[440, 110], [490, 110]]},
    {k: "sig", p: [[230, 200], [290, 200]]},
    {k: "sig", p: [[440, 196], [490, 196]]},
    {k: "sig", p: [[440, 212], [490, 212]]},
    {k: "sig", p: [[490, 250], [230, 250]], t: "TA"},
    {k: "sig", p: [[490, 278], [466, 278], [466, 290], [230, 290]], at: 2, t: "TC → GND"},
    {k: "rs", p: [[710, 110], [880, 110]], t: "A ↔ 485+"},
    {k: "rs", p: [[710, 140], [880, 140]], t: "B ↔ 485−"},
  ];
  return svgBlocks(1118, 352, B, Wr, [["sig", "signal"], ["rs", "RS485 (twisted pair, shield to GND at VFD)"]]);
}

const ZAP_TABLE = [
  ["Drivery DM556", "PUL+, DIR+, ENA+ na 5 V; PUL−, DIR−, ENA− na výstupy desky", "pulz 4–5 µs, dir_delay 5 µs"],
  ["Osa Y1 + Y2", "každý driver vlastní STEP/DIR, ve FluidNC jako ganged axis", "každá strana má vlastní spínač – automatické srovnání portálu"],
  ["Čidla", "mechanické spínače NC (C + NC), indukční M12 NPN přes optočlen", "přerušený vodič se projeví jako sepnutý spínač"],
  ["Otáčky vřetena", "FluidNC spindle 10V: PWM → převodník 0–10 V (napájení 24 V) → AI + GND, enable → relé na X1–COM", "P0-02 = 1, P0-03 = 2, J5 = AVI; ve FluidNC max. 24 000 ot/min"],
  ["Porucha měniče", "relé TA–TC (výchozí funkce porucha) → optočlen → vstup FluidNC", "funkci relé ověřit v parametrech výstupů EV210"],
  ["RS485", "A ↔ 485+, B ↔ 485−, kroucený pár, stínění na GND jen u měniče", "19 200 Bd, 8E1, adresa 1; při nekomunikaci prohodit A a B"],
  ["Vysavač", "výstup chlazení FluidNC (M8) → relé → cívka stykače zásuvky", "vysavač spínat jen stykačem (rozběhový proud)"],
  ["Řídicí deska", "klasické ESP32 (WROOM-32); FluidNC na ESP32-P4 neběží", "ovládání i z mobilu přes WebUI FluidNC"],
  ["Displej ESP32-P4", "vlastní firmware (LVGL): WiFi → FluidNC WebSocket, RS485 → měnič", "FluidTouch podporuje jen CrowPanel ESP32-S3"],
  ["Nouzové zastavení", "dva kontakty NC: cívka hlavního stykače a vstup E-stop desky", "samotné softwarové zastavení nestačí"],
  ["Uzemnění", "PE na rám, kostru vřetena, měnič a skříňku; stínění kabelu vřetena jen u měniče", "jeden společný bod"],
];
function renderZapojeni() {
  const el = $("#v-zapojeni");
  el.innerHTML = `<div class="pagehead"><h2>Zapojení</h2><span class="muted">Blokové schéma elektroniky. Najetím myší se blok zvýrazní.</span></div>
  <section class="panel zcard"><h3>Power circuit · 230 V AC</h3>${zapPower()}</section>
  <section class="panel zcard"><h3>Control · FluidNC + display ESP32-P4</h3>${zapControl()}</section>
  <section class="panel zcard"><h3>Terminals · VFD, spindle, RS485</h3>${zapTerminals()}
  <p class="znote">Displej je jediný Modbus master na sběrnici RS485 a měnič jen čte. Pohyb, start vřetena a vysavač řídí FluidNC přes svorky, takže výpadek displeje chod stroje neovlivní.</p></section>
  <section class="panel zcard"><h3>Poznámky k zapojení</h3><div class="tablewrap"><table class="table"><thead><tr><th>Část</th><th>Zapojení</th><th>Poznámka</th></tr></thead><tbody>${ZAP_TABLE.map(r => `<tr><td><b>${esc(r[0])}</b></td><td>${esc(r[1])}</td><td class="muted">${esc(r[2])}</td></tr>`).join("")}</tbody></table></div>
  <p class="znote">Silovou část 230 V zapojuje elektrikář s oprávněním.</p></section>`;
}
