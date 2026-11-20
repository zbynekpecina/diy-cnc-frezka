/* =====================================================================
   NÁŠ NÁVRH – parametry, kontrolní výpočty, kusovník
   ===================================================================== */
const NAS_DEF = {deckL: 1800, deckW: 750, workL: 1500, workW: 600, workT: 40, frameH: 790, sideSpan: 790, rodGap: 50, railY: 1800, blockSpacing: 200, postH: 275, postSize: 25, beamL: 1000, beamSize: 25, beamGap: 150, railX: 1000, plexiW: 300, plexiH: 200, plexiT: 10, plexiEdge: 15, zStroke: 200, zOffset: 0, bridgeOff: 2, hoseH: 400, hoseArm: 130, boltGap: 4.5, bridgeRear: 0, postE: 116, reachMargin: 10};
const PARAM_INFO = {
  nas: [
    ["Stůl a spodní konstrukce (máme)", [["deckL", "Délka desky stolu"], ["deckW", "Šířka desky stolu"], ["frameH", "Výška spodního rámu"], ["sideSpan", "Rozteč bočních profilů (nad spodními)"], ["rodGap", "Rozpěrka na závitové tyči (0–100)"]]],
    ["Obrobek", [["workL", "Délka obrobku"], ["workW", "Šířka obrobku"], ["workT", "Tloušťka obrobku"]]],
    ["Osa Y", [["railY", "Délka kolejnice SBR20"], ["blockSpacing", "Rozteč vozíků Y"], ["postH", "Výška svislého jeklu"], ["postSize", "Průřez svislého jeklu"], ["bridgeOff", "Přesah spojky ven od osy kolejnice (jen Al portál)"], ["hoseH", "Výška držáku hadice nad bočním profilem (jen Al portál)"], ["hoseArm", "Rameno držáku hadice (jen Al portál)"], ["boltGap", "Odstup stojky od hlavy šroubu vozíku (jen Al portál)"], ["bridgeRear", "Přesah spojky za stojkou, oba konce; od 22 mm místo pro úhelník (jen Al portál)"], ["postE", "Přední příčník nad horním zadním (jen Al portál)"], ["reachMargin", "Přesah nástroje pod horní plochu desky (jen Al portál)"]]],
    ["Osa X", [["beamSize", "Průřez příčných jeklů"], ["beamGap", "Rozteč příčníků (pod sebou)"], ["railX", "Délka kolejnice SBR20 (osa X)"]]],
    ["Plexisklo a osa Z", [["plexiW", "Šířka plexi"], ["plexiH", "Výška plexi"], ["plexiT", "Tloušťka plexi"], ["plexiEdge", "Okraj plexi vedle vozíku"], ["zStroke", "Zdvih osy Z"], ["zOffset", "Posun modulu Z (nahoru +)"]]],
  ],
  gen: [["Rozměry", [["workX", "Šířka obrobku"], ["workY", "Délka obrobku"], ["clear", "Světlost pod příčníkem"], ["legH", "Výška stolu"]]]],
};
function getParams(v) {
  const base = v.p3.style === "nas" ? Object.assign({}, NAS_DEF, v.p3.def || {}) : {workX: v.p3.workX, workY: v.p3.workY, clear: v.p3.clear, legH: v.p3.legH};
  return Object.assign({}, base, (S.params || {})[v.id] || {});
}
function setParam(v, k, val) { S.params = S.params || {}; S.params[v.id] = Object.assign({}, S.params[v.id], {[k]: val}); save(); }
function nasCalc(p) {
  const PR = 40, deckT = 18;
  // Custom: boční profil nad spodním (rozpěrka + závitové tyče); Custom2 (flat): boční profil vedle spodního, ve stejné rovině
  // Al portál (Custom3): spojka vozíků = Al profil 30×60 naležato přímo na vozících (bez pásoviny), stojky a příčníky Al 30×30 šroubované
  const sideTop = p.flat ? p.frameH : p.frameH + p.rodGap + PR, blockTop = sideTop + 50, barT = p.alu ? 0 : 6, conTop = blockTop + barT + (p.alu ? 30 : 25);   // SBR20UU: horní plocha 50 nad spodkem kolejnice; pásovina 50×6; jekl 25
  const conC = blockTop + barT + (p.alu ? 15 : 12.5), ps0 = p.postSize, bs0 = p.blockSpacing;
  // Al portál: stojky A (zadní, nese kolejnice X) a B (přední) stojí symetricky na obou koncích spojky, vozíky jsou uvnitř mezi nimi.
  // Šroub vozíku: osa ±17,5 od středu vozíku, hlava Ø10 → hlava končí 22,5 od středu vozíku; odstup stojky od hlavy 4,5 mm.
  const postZ = p.alu ? bs0 / 2 + 22.5 + p.boltGap + ps0 / 2 : bs0 / 2, postZf = p.alu ? -postZ : 0;
  const bridgeZ0 = p.alu ? -(postZ + ps0 / 2 + p.bridgeRear) : 0, bridgeZ1 = p.alu ? postZ + ps0 / 2 + p.bridgeRear : 0, bridgeL = bridgeZ1 - bridgeZ0, bridgeZc = (bridgeZ0 + bridgeZ1) / 2;   // spojka 30×60: vpředu 5 mm za vozíkem, vzadu 23 mm za stojkou A (úhelník)
  const postDX = p.alu ? p.bridgeOff + 15 : 0, inL = p.sideSpan + 2 * postDX - p.postSize, postE = p.alu ? p.postE : 0, postLen = p.postH + postE, beamH = p.beamSize, railBar = p.alu ? 0 : 6, beamDY = p.alu ? -15 : 0;   // Al: kolejnice X přímo na profilu 30×30 (bez pásoviny), šroubovaná jednou řadou děr do drážky → profil je o 15 mm pod osou kolejnice   // Al: stojka na vnější drážce spojky; stojky o postE výš: přední příčník musí být nad vřetenem
  const topBeamY = conTop + p.postH - (p.alu ? 15 : p.beamSize / 2), lowBeamY = topBeamY - p.beamGap, plexiCY = (topBeamY + lowBeamY) / 2;
  const zLen = p.zStroke + 80, modCY = plexiCY + (p.zOffset || 0), carTop = modCY + zLen / 2 - 35;   // carTop = střed vozíku v horní poloze (deska 10 + půl vozíku 25)
  const spBot = carTop + 20 - 166, toolLen = 108, tipHigh = spBot - toolLen, tipLow = tipHigh - p.zStroke;
  const slabTop = p.frameH + deckT + p.workT, deckTop = p.frameH + deckT, reach = tipLow - deckTop;
  const bx = p.plexiW / 2 - 25 - p.plexiEdge;                       // vozík SBR20UU 50 (podél kolejnice) × 48 mm
  const travelY = p.railY - p.blockSpacing - 50, needY = Math.min(p.workL, p.deckL) + 39;
  const yE = p.alu ? Math.max(p.railY / 2 + 50, travelY / 2 + Math.max(bridgeZ1, -bridgeZ0) + 17.5) : p.railY / 2 + 50;   // konce profilů osy Y (motor, kladka) – spojka 30×60 je delší než vozíky
  const travelX = p.railX - 2 * bx - 50, needX = Math.min(p.workW, p.deckW) + 39;
  const toolX = Math.min(travelX / 2, p.sideSpan / 2 - (p.alu ? 28 : 24) - 48 - 3), cutW = Math.round(2 * toolX + 39);   // vozík SBR20 ±24, odsávací nástavec ±48, vůle 3
  const edgeV = (p.plexiH - p.beamGap) / 2 - 24;
  const btop = topBeamY + beamDY + beamH / 2, lowTop = lowBeamY + beamDY + beamH / 2, lowBot = lowBeamY + beamDY - beamH / 2, clearBeam = lowBot - slabTop;
  const diag = Math.hypot(p.blockSpacing + 15, p.postH * .6);
  return {sideTop, blockTop, barT, conTop, conC, postZ, postZf, bridgeZ0, bridgeZ1, bridgeL, bridgeZc, postDX, inL, postE, postLen, beamH, railBar, beamDY, btop, lowTop, lowBot, yE, topBeamY, lowBeamY, plexiCY, zLen, modCY, carTop, spBot, toolLen, tipHigh, tipLow, slabTop, deckTop, reach, bx, travelY, needY, travelX, needX, toolX, cutW, edgeV, clearBeam, diag, idealPost: Math.round(p.postH - reach - (p.alu ? p.reachMargin : 2))};
}
function nasChecks(p) {
  const c = nasCalc(p);
  return [
    {t: "Ponor frézy až na desku stolu (bod 0)", ok: c.reach <= 0 && c.reach > -40, v: c.reach > 0 ? `chybí ${Math.round(c.reach)} mm` : `rezerva ${Math.round(-c.reach)} mm`, hint: c.reach > 0 || c.reach <= -40 ? `nastav svislé jekly na ~${c.idealPost} mm nebo posuň modul Z dolů` : ""},
    {t: "Pojezd Y", ok: c.travelY >= c.needY, v: `${Math.round(c.travelY)} mm (potřeba ${c.needY})`, hint: c.travelY < c.needY ? "delší kolejnice (SBR20 2200) nebo menší rozteč vozíků" : ""},
    {t: "Šířka frézování (vřeteno mezi vozíky Y)", ok: c.cutW >= Math.min(p.workW, p.deckW), v: `${c.cutW} mm (obrobek ${Math.min(p.workW, p.deckW)})`, hint: c.cutW < Math.min(p.workW, p.deckW) ? `odsávací nástavec / vřeteno by narazilo do vozíků Y – užší obrobek (max ~${c.cutW}) nebo širší rozteč bočních profilů` : ""},
    {t: "Pojezd X", ok: c.travelX >= c.needX, v: `${Math.round(c.travelX)} mm (potřeba ${c.needX})`, hint: c.travelX < c.needX ? "užší plexi / vozíky blíž k sobě, nebo delší kolejnice" : ""},
    {t: "Okraj plexi nad / pod vozíkem", ok: c.edgeV >= 8, v: `${Math.round(c.edgeV)} mm`, hint: c.edgeV < 8 ? `plexi vyšší (≥ ${p.beamGap + 45 + 16} mm) nebo menší rozteč příčníků` : ""},
    {t: "Světlost pod příčníkem", ok: c.clearBeam >= 60, v: `${Math.round(c.clearBeam)} mm`, hint: ""},
    ...(p.alu ? nasAluChecks(p, c) : []),
  ];
}
/* Odhad tuhosti portálu z Al profilů – malý rovinný rámový výpočet (metoda deformací, nosníky s pružnými spoji v rozích).
   Předpoklady (odhad, ověřit zkouškou na hotovém stroji): E = 70 GPa, profil 3030 Ix ≈ 4,0 cm⁴ (dutý, drážky), kolejnice SBR20 přidává část tuhosti (jednostranné šroubování),
   šroub M6 ve zdvojené drážce ~ 3 kN/mm ve smyku → rohová deska rameno 90 ≈ 22 kN·m/rad, úhelník + plochá deska u paty ≈ 10 kN·m/rad. Patky vetknuté do spojky (vozíky + profil 30×60).
   Síla 100 N na nástroji při frézování (ve výšce horní plochy obrobku). Výsledek je posun nástroje v daném směru. */
function frame2D(nodes, members, loads, fixed, ties) {
  const N = nodes.length, nd = 3 * N + 2 * members.length, K = Array.from({length: nd}, () => new Float64Array(nd)), f = new Float64Array(nd), BIG = 1e13;
  const add = (i, j, v) => { K[i][j] += v; };
  members.forEach((m, e) => {
    const [x1, y1] = nodes[m.i], [x2, y2] = nodes[m.j], L = Math.hypot(x2 - x1, y2 - y1), cs = (x2 - x1) / L, sn = (y2 - y1) / L, EA = m.EA, EI = m.EI;
    const k = [[EA / L, 0, 0, -EA / L, 0, 0], [0, 12 * EI / L ** 3, 6 * EI / L ** 2, 0, -12 * EI / L ** 3, 6 * EI / L ** 2], [0, 6 * EI / L ** 2, 4 * EI / L, 0, -6 * EI / L ** 2, 2 * EI / L],
      [-EA / L, 0, 0, EA / L, 0, 0], [0, -12 * EI / L ** 3, -6 * EI / L ** 2, 0, 12 * EI / L ** 3, -6 * EI / L ** 2], [0, 6 * EI / L ** 2, 2 * EI / L, 0, -6 * EI / L ** 2, 4 * EI / L]];
    const T = [[cs, sn, 0, 0, 0, 0], [-sn, cs, 0, 0, 0, 0], [0, 0, 1, 0, 0, 0], [0, 0, 0, cs, sn, 0], [0, 0, 0, -sn, cs, 0], [0, 0, 0, 0, 0, 1]];
    const kg = Array.from({length: 6}, () => new Array(6).fill(0));
    for (let a = 0; a < 6; a++) for (let b = 0; b < 6; b++) { let s = 0; for (let p = 0; p < 6; p++) for (let q = 0; q < 6; q++) s += T[p][a] * k[p][q] * T[q][b]; kg[a][b] = s; }
    const ri = 3 * N + 2 * e, rj = ri + 1, dof = [3 * m.i, 3 * m.i + 1, ri, 3 * m.j, 3 * m.j + 1, rj];   // rotace konců nosníku jsou samostatné stupně volnosti
    for (let a = 0; a < 6; a++) for (let b = 0; b < 6; b++) add(dof[a], dof[b], kg[a][b]);
    add(3 * m.i + 2, 3 * m.i + 2, m.Ki ?? BIG); add(ri, ri, m.Ki ?? BIG); add(3 * m.i + 2, ri, -(m.Ki ?? BIG)); add(ri, 3 * m.i + 2, -(m.Ki ?? BIG));
    add(3 * m.j + 2, 3 * m.j + 2, m.Kj ?? BIG); add(rj, rj, m.Kj ?? BIG); add(3 * m.j + 2, rj, -(m.Kj ?? BIG)); add(rj, 3 * m.j + 2, -(m.Kj ?? BIG));
  });
  for (const t of ties || []) { add(3 * t[0], 3 * t[0], BIG); add(3 * t[1], 3 * t[1], BIG); add(3 * t[0], 3 * t[1], -BIG); add(3 * t[1], 3 * t[0], -BIG); }
  for (const l of loads) { f[3 * l.n] += l.fx || 0; f[3 * l.n + 1] += l.fy || 0; }
  for (const d0 of fixed) { for (let j = 0; j < nd; j++) { K[d0][j] = 0; K[j][d0] = 0; } K[d0][d0] = 1; f[d0] = 0; }
  const A = K.map((r, i) => [...r, f[i]]);
  for (let c0 = 0; c0 < nd; c0++) {                                      // Gaussova eliminace s částečnou volbou pivotu
    let pv = c0; for (let r = c0 + 1; r < nd; r++) if (Math.abs(A[r][c0]) > Math.abs(A[pv][c0])) pv = r;
    [A[c0], A[pv]] = [A[pv], A[c0]];
    for (let r = c0 + 1; r < nd; r++) { const q = A[r][c0] / A[c0][c0]; if (q) for (let j = c0; j <= nd; j++) A[r][j] -= q * A[c0][j]; }
  }
  const u = new Float64Array(nd);
  for (let r = nd - 1; r >= 0; r--) { let s = A[r][nd]; for (let j = r + 1; j < nd; j++) s -= A[r][j] * u[j]; u[r] = s / A[r][r]; }
  return nodes.map((_, i) => ({x: u[3 * i], y: u[3 * i + 1]}));
}
function nasStiff(p, c, o = {}) {
  const E = 70e3, F = 100, ps = p.postSize, I = o.I ?? 4.0e4, Ib = o.Ib ?? (p.alu ? 5.2e4 : 4.0e4),   // 3030 + polovina ocelové kolejnice Ø20 (7,9 cm⁴, E 3× vyšší, šroubovaná jen z jedné strany) ≈ 5,2 cm⁴
     If = o.If ?? 4.0e4, A = o.A ?? 600, Kc = o.Kc ?? 22e6, Kb = o.Kb ?? 10e6, EI = E * I, EIb = E * Ib, EA = E * A;
  const hP = c.postLen, yl = c.lowBeamY + c.beamDY - c.conTop, yt = c.topBeamY + c.beamDY - c.conTop, yb = c.plexiCY - c.conTop, yTool = c.slabTop - 3 - c.conTop, hf = hP - ps / 2;   // výšky nad horní plochou spojky
  // --- směr Y (posuv portálu): boční rám = stojky A, B + boční profil nahoře; síla pod kolejnicí se přenese dvojicí sil na příčníky zadního U (nese plexi) ---
  const gap = p.beamGap, Mp = F * (yt - yTool + 0) - F * (yt - yb), Ft = -F * (yl - yTool) / gap, Fl = F - Ft;   // síla na horním / spodním příčníku (sil. dvojice)
  const zA = c.postZ, zB = c.postZf;
  const nY = [[zA, 0], [zA, yl], [zA, yt], [zA, hP], [zB, 0], [zB, hP]];
  const mY = [{i: 0, j: 1, EA, EI, Ki: Kb}, {i: 1, j: 2, EA, EI}, {i: 2, j: 3, EA, EI}, {i: 4, j: 5, EA, EI, Ki: Kb}, {i: 3, j: 5, EA, EI: EIb, Ki: Kc, Kj: Kc}];
  const rY = frame2D(nY, mY, [{n: 1, fx: Fl / 2}, {n: 2, fx: Ft / 2}], [0, 1, 2, 3 * 4, 3 * 4 + 1, 3 * 4 + 2], []);
  const dY = rY[1].x + (rY[2].x - rY[1].x) * (yTool - yl) / (yt - yl);
  // --- směr X (podél příčníků): zadní U (stojky A + příčníky) a přední U (stojky B + zvýšený příčník), vršky spojené bočními profily ---
  const half = (c.inL + ps) / 2, bx = c.bx;
  const nX = [[-half, 0], [-half, yl], [-half, yb], [-half, yt], [-half, hP], [half, 0], [half, yl], [half, yb], [half, yt], [half, hP],
    [-half, 0], [-half, hf], [-half, hP], [half, 0], [half, hf], [half, hP]];
  const mX = [{i: 0, j: 1, EA, EI, Ki: Kb}, {i: 1, j: 2, EA, EI}, {i: 2, j: 3, EA, EI}, {i: 3, j: 4, EA, EI}, {i: 5, j: 6, EA, EI, Ki: Kb}, {i: 6, j: 7, EA, EI}, {i: 7, j: 8, EA, EI}, {i: 8, j: 9, EA, EI},
    {i: 1, j: 6, EA, EI: EIb, Ki: Kc, Kj: Kc}, {i: 3, j: 8, EA, EI: EIb, Ki: Kc, Kj: Kc},
    {i: 10, j: 11, EA, EI, Ki: Kb}, {i: 11, j: 12, EA, EI}, {i: 13, j: 14, EA, EI, Ki: Kb}, {i: 14, j: 15, EA, EI}, {i: 11, j: 14, EA, EI: E * If, Ki: Kc, Kj: Kc}];
  const rX = frame2D(nX, mX, [{n: 2, fx: F / 2}, {n: 7, fx: F / 2}], [0, 1, 2, 15, 16, 17, 30, 31, 32, 39, 40, 41], [[4, 12], [9, 15]]);
  const uLow = (rX[1].x + rX[6].x) / 2, uTop = (rX[3].x + rX[8].x) / 2, dXs = uLow + (uTop - uLow) * (yTool - yl) / (yt - yl);
  // otáčení desky vozíku X od síly pod kolejnicí: dvojice svislých sil ±P na vozících (±bx) zatěžuje oba příčníky jako oboustranně vetknutý nosník
  const lev = (c.topBeamY - c.plexiCY) + (c.plexiCY - (c.slabTop - 3)), Pv = F * (c.plexiCY - (c.slabTop - 3)) / (2 * bx) / 2, Lb = c.inL, aa = Lb / 2 - bx, bb = Lb / 2 + bx;
  const vB = Pv * aa ** 3 * bb ** 3 / (3 * EIb * Lb ** 3), dXr = 2 * vB / (2 * bx) * (c.plexiCY - (c.slabTop - 3));
  return {dX: Math.abs(dXs) + Math.abs(dXr), dXsway: Math.abs(dXs), dXrot: Math.abs(dXr), dY: Math.abs(dY), lev};
}
function nasAluChecks(p, c) {
  const st = nasStiff(p, c), fanTop = c.carTop + 61, frontClr = (c.topBeamY + c.postE - p.beamSize / 2) - fanTop, boltEdge = 30 - p.bridgeOff - 17.5;
  const ideal = c.idealPost;
  return [
    {t: "Výška stojek: deska + nůž + zdvih Z + přesah", ok: Math.abs(p.postH - ideal) <= 2, v: `${p.postH} mm (vychází ${ideal}; nástroj sjede ${r1(-c.reach)} mm pod desku, přesah ${p.reachMargin} mm)`, hint: Math.abs(p.postH - ideal) > 2 ? `nastav ${ideal} mm, ať konstrukce není zbytečně vysoká` : ""},
    {t: "Díry vozíků ve spojce 30×60 (okraj od hrany)", ok: boltEdge >= 10, v: `${r1(boltEdge)} mm (min. 10)`, hint: boltEdge < 10 ? "menší přesah ven – díry vozíků (35×35) by byly příliš blízko vnitřní hrany profilu" : ""},
    {t: "Přední příčník nad vřetenem v horní poloze Z", ok: frontClr >= 10, v: `${Math.round(frontClr)} mm (min. 10)`, hint: frontClr < 10 ? "zvýšit stojky (postE) nebo odstranit přední příčník" : ""},
    {t: "Odhad průhybu nástroje při 100 N – směr X", ok: st.dX <= .15, v: `${st.dX.toFixed(2)} mm (sway ${st.dXsway.toFixed(2)} + plexi ${st.dXrot.toFixed(2)})`, hint: st.dX > .15 ? "vyztužit rohy (větší desky), zkrátit stojky" : ""},
    {t: "Odhad průhybu nástroje při 100 N – směr Y", ok: st.dY <= .15, v: `${st.dY.toFixed(2)} mm`, hint: st.dY > .15 ? "vyztužit rohy, případně úhlopříčka v bočním rámu" : ""},
  ];
}
function bomNas(p) {
  const c = nasCalc(p), m = x => Math.round(x / 100) / 10;
  const all = [
    {k: "spodni", n: p.flat ? "Spodní konstrukce – Al solární profily 40×40, boční profily přeložené vedle podélných (opora kolejnice 80 mm)" : "Spodní konstrukce – Al solární profily 40×40, závitové tyče Ø25 (položená na dřevěném stole)", q: 1, p: 0, note: "máme"},
    {k: "stul", n: `Deska stolu ${p.deckL}×${p.deckW} mm`, q: 1, p: 0, note: "máme"},
    {k: "vedeni", bought: 1, n: "VEVOR SBR20 2× 1800 mm + 4 vozíky SBR20UU (osa Y)", q: 1, p: p.railY > 1800 ? 2300 : 1514, ref: p.railY > 1800 ? "1005009878367051" : "16415484100", note: p.railY > 1800 ? "delší než 1800 → SucceBuy SBR20 2200 (cenu ověřit)" : "Allegro · balení 1800 × 90 × 36,3 = 2 kolejnice 45 mm vedle sebe"},
    {k: "vedeni", bought: 1, n: "SucceBuy SBR20 2× 1000 mm + 4 vozíky SBR20UU (osa X)", q: 1, p: 893, ref: "17708036612", note: "Allegro · doprava zdarma · stejné SBR20 jako osa Y"},
    ...(p.alu ? [
      {k: "horni", n: `Al profil 30×60 (drážkový, typ 3D tiskárny) – spojky vozíků Y, 2× ${c.bridgeL} mm`, q: m(2 * c.bridgeL), u: "m", p: 650, est: 1, note: "naležato na vozících, přesah ven od kolejnice; stojky stojí na vnější drážce za šrouby vozíků"},
      {k: "horni", n: `Al profil ${p.postSize}×${p.postSize} – svislé stojky, 4× ${c.postLen} mm (dva U-rámy)`, q: m(4 * c.postLen), u: "m", p: 350, est: 1},
      {k: "horni", n: `Al profil ${p.beamSize}×${p.beamSize} – příčníky ${c.inL} mm (3×: horní přední, horní zadní, spodní pod kolejnici X)`, q: m(3 * c.inL), u: "m", p: 350, est: 1},
      {k: "horni", n: "Rohové spoje 30×30 (desky, úhelníky), T-matice M6, šrouby M6, podložky", q: 1, p: 650, est: 1, note: "bez svařování"},
    ] : [
    {k: "horni", n: "Jekl 25×25×2 – spojky vozíků + vzpěry", q: m(2 * (p.blockSpacing + 50) + 2 * c.diag), u: "m", p: 45, est: 1},
    {k: "horni", n: `Jekl ${p.postSize}×${p.postSize}×2 – svislé jekly ${p.postH} mm`, q: m(2 * p.postH), u: "m", p: p.postSize >= 40 ? 75 : 45, est: 1},
    {k: "horni", n: `Jekl ${p.beamSize}×${p.beamSize}×2 – příčníky ${p.sideSpan - p.postSize} mm (mezi stojky, jeden rám)`, q: m(2 * (p.sideSpan - p.postSize)), u: "m", p: p.beamSize >= 40 ? 75 : 45, est: 1},
    {k: "horni", n: "Šrouby M5/M6, matice, podložky, elektrody, barva", q: 1, p: 250, est: 1},
    ]),
    {k: "osaZ", bought: 1, n: `Plexisklo 10 mm ${p.plexiW}×${p.plexiH} – deska vozíku X`, q: 1, p: 370, ref: "d8e551a8", note: "Allegro 315 Kč + doprava 55 Kč"},
    {k: "osaZ", bought: 1, n: `Modul osy Z 200 mm – 2 tyče + kuličkový šroub Ø16, ruční kolo s aretací`, q: 1, p: 1712, ref: "18760345169", note: "Allegro weibacar 1 597 Kč + doprava 115 Kč (0 Kč se Smart) · stejný kus i za 1 355 Kč"},
    {k: "osaZ", n: "Příruba NEMA23 + spojka na šroub Ø16 (místo ručního kola)", q: 1, p: 350, est: 1, note: "až s motorem Z"},
    {k: "vreteno", bought: 1, n: "HLTNC 2,2 kW GDZ80x73 ER20 + měnič EV210 (RS485), 24 000 ot/min", q: 1, p: 4053, ref: "1005011656854811", note: "sklad DE"},
    {k: "vreteno", n: "Stíněný kabel vřetena 4×1,5 mm² (5 m)", q: 1, p: 350, est: 1},
    {k: "vreteno", bought: 1, n: "Srovnávací fréza Ø39 / stopka 8 mm", q: 1, p: 0, ref: "8687538a", note: "koupeno"},
    {k: "vreteno", n: "Kvalitní kleština ER20 (UP) 8 mm na srovnávací frézu", q: 1, p: 250, est: 1, note: "v sadě nejsou; další velikost podle stopky frézy"},
    {k: "vreteno", n: "Klíč ER20A + plochý klíč 21 mm (přidržení hřídele)", q: 1, p: 200, est: 1},
    {k: "pohony", n: "Krokový motor NEMA23 + driver DM556 (osa Z)", q: 1, p: 750, est: 1, note: "AliExpress 636–872 Kč"},
    {k: "pohony", n: "Krokový motor NEMA23 + driver DM556 (X, Y1, Y2)", q: 3, p: 750, est: 1},
    {k: "pohony", n: "Řemen GT2 10 mm (2× smyčka Y ~3,9 m + X ~1,8 m)", q: 10, u: "m", p: 45, est: 1},
    {k: "pohony", n: "Řemenice Ø30 + napínací kladka (sada na osu)", q: 3, p: 220, est: 1},
    {k: "pohony", n: "Držáky motorů, napínáky, unášeče řemenů (Al plech)", q: 1, p: 450, est: 1},
    {k: "elektro", n: "ESP32 DevKit + převodník úrovní 74HCT125", q: 1, p: 120, est: 1, note: "ESP32 máme"},
    {k: "elektro", n: "Převodník PWM → 0–10 V (otáčky) + 2× relé modul (START vřetena, vysavač)", q: 1, p: 150, est: 1, note: "RS485 má displej ESP32-P4 – modul RS485 není potřeba"},
    {k: "elektro", n: "Zdroj 36 V 10 A pro motory", q: 1, p: 450, est: 1},
    {k: "elektro", n: "Indukční senzor M12 (Z – home nahoře)", q: 1, p: 90, est: 1, note: "X a Y najíždějí na koncové spínače min"},
    {k: "elektro", n: "Mechanické koncové spínače s páčkou (X max, Y max)", q: 4, p: 25, est: 1},
    {k: "elektro", n: "Nouzový STOP + jistič/chránič (pokud zásuvka nemá)", q: 1, p: 600, est: 1},
    {k: "elektro", n: "7\" displej ESP32-P4 s RS485", q: 1, p: 0, note: "máme"},
    {k: "prisl", n: "Kabelový řetěz 15×30 (osy X + Y)", q: 2, u: "m", p: 110, ref: "techfun"},
    {k: "prisl", n: "Odsávací hubice s kartáčem", q: 1, p: 557, ref: "1005012726723014", note: "207 Kč + doprava 350 Kč"},
    {k: "prisl", n: p.alu ? "Hadice k vysavači Ø40, 5 m + spony" : "Hadice k vysavači Ø40, 5 m + spony + držák hadice (jekl 20×20)", q: 1, p: 450, est: 1, note: "dílenský vysavač máme / stačí běžný"},
    {k: "prisl", n: "Upínky / svěrky", q: 1, p: 300, est: 1},
    // přidáno na konec (indexy starších řádků se nemění – drží uložené úpravy kalkulace)
    {k: "osaZ", n: "Adaptér vřetena – Al deska 10 mm 120×175 (díry vozíku 60×30 M5, patka 95×35 M6)", q: 1, p: 350, est: 1, note: "patka vřetena (díry 95 mm od sebe) je širší než vozík modulu Z (80 mm)"},
    p.alu
      ? {k: "horni", n: `Pásovina 50×6 – pod kolejnice X (2× ~${c.inL} mm)`, q: 1, p: 300, est: 1, note: "díry SBR20 (±15 mm) jsou mimo profil 30×30; pásovina se šroubuje do drážek profilu"}
      : {k: "horni", n: "Pásovina 50×6 – pod kolejnice X (2× ~765 mm) a na vozíky Y (2× 250 mm)", q: 1, p: 450, est: 1, note: "díry SBR20 (±15 mm) i vozíků (35×35) jsou mimo jekl 25×25"},
    ...(p.alu ? [{k: "horni", n: `Al profil ${p.postSize}×${p.postSize} – boční spojky předního a zadního U nahoře, 2× ${c.postZ - c.postZf + p.postSize} mm + rohové desky`, q: m(2 * (c.postZ - c.postZf + p.postSize)), u: "m", p: 350, est: 1, note: "na každé straně spojuje horní konce stojek"}] : []),
  ];
  if (p.zPlate) return bomZPlate(p, all);
  if (!p.alu) return all;
  // Custom3: kalkulace je jen to, co je od vozíků Y nahoru. Co už máme nebo teď neřešíme, zůstává v seznamu odškrtnuté (nepočítá se).
  const flag = (l, note) => Object.assign({}, l, {off: 1, note: (l.note ? l.note + " · " : "") + note});
  const rest = all.filter(l => l.k !== "horni").map(l => {                       // nic neodstraňujeme, jen odškrtáváme: zaškrtnuté zůstává to, co je třeba koupit v této fázi (portál)
    if (l.k === "spodni" || l.k === "stul") return flag(l, "máme");
    if (l.bought) return Object.assign({}, l, {note: (l.note ? l.note + " · " : "") + "už koupeno"});     // započítané v celkové ceně, ale ne v tom, co zbývá koupit
    if (l.k === "pohony" || /^Příruba NEMA23/.test(l.n)) return flag(Object.assign({}, l, {k: "pohony"}), "motory a upevnění zatím neřešíme");
    if (l.k === "elektro") return flag(l, "elektroniku zatím neřešíme");
    if (/^Adaptér vřetena/.test(l.n)) return flag(l, "mezi vozík modulu Z a patku vřetena; s plexi zatím nepotřebujeme");
    if (/^Stíněný kabel|^Kvalitní kleština|^Klíč ER20A/.test(l.n)) return flag(l, "až při montáži vřetena");
    if (/^Odsávací hubice/.test(l.n)) return flag(l, "máme k vysavači");
    if (/^Hadice k vysavači/.test(l.n)) return flag(l, "u vysavače, délku ověřit");
    if (/^Kabelový řetěz/.test(l.n) || /^Upínky/.test(l.n)) return flag(l, /^Upínky/.test(l.n) ? "máme v dílně" : "zatím neřešíme");
    return l;
  });
  return [...bomAlu(p, c), ...rest, {k: "horni", n: "Doprava ehlinik.cz – zásilka nad 3 m, do 10 kg (tyč 6 m)", q: 1, p: 508, ref: "https://www.ehlinik.cz/doprava-a-platba", note: "420 Kč bez DPH = 508 Kč s DPH (FOFR); hranici pro dopravu zdarma stránka neuvádí; osobní odběr Pardubice 0 Kč · menší položky z ehlinik.cz jedou v téže zásilce"}];
}
/* Přesný seznam dílů portálu z Al profilů. Množství vycházejí ze stejných parametrů jako 3D model (počty desek, úhelníků a šroubů
   odpovídají tomu, co je ve 3D nakreslené). Ceny jsou odhad (est), profily řezané na míru se počítají na kus. */
function alPack(pieces, stock, kerf = 3) {                          // první vejde se (od nejdelšího): kolik tyčí o délce stock a které kusy z které
  const bars = [];
  for (const L of [...pieces].sort((a, b) => b - a)) { const bar = bars.find(b => b.used + L + kerf <= stock); if (bar) { bar.used += L + kerf; bar.cuts.push(L); } else bars.push({used: L + kerf, cuts: [L]}); }
  return {bars, txt: bars.map((b, i) => `${i + 1}. ${b.cuts.map(x => r1(x)).join(" + ")}`).join("; ")};
}
/* profily stejného rozměru = jedna položka (nákup po celých tyčích); jednotlivé kusy a plán řezu jsou v rozbalovacím seznamu `parts` */
function alItems(name, items, pack, barPrice, note, img, refUrl, stockTxt, orderUrl) {
  const parts = items.map(([n, q, L]) => `${q}× ${n}`);
  parts.push(`Plán řezu (číslo tyče: kusy v mm): ${pack.txt}`);
  return [{k: "horni", n: `${name}, ${stockTxt} – ${pack.bars.length} ks`, q: pack.bars.length, p: barPrice, note, img, refUrl, ref: orderUrl, parts}];
}
/* Custom4: jeklový portál (jako Custom1), vřeteno na ocelovém plechu 200×100×5 s bočnicemi z pásoviny přišroubovanými do bočních závitů M4 vozíku Z.
   Nic se nemaže: zaškrtnuté zůstává jen to, co je potřeba koupit teď (konstrukce, plech, šrouby), koupené je označené, zbytek odškrtnutý. */
function bomZPlate(p, all) {
  const flag = (l, note) => Object.assign({}, l, {off: 1, note: (l.note ? l.note + " · " : "") + note});
  const out = all.map(l => {
    if (l.k === "spodni" || l.k === "stul") return flag(l, "máme");
    if (l.bought) return Object.assign({}, l, {note: (l.note ? l.note + " · " : "") + "už koupeno"});
    if (l.k === "pohony" || /^Příruba NEMA23/.test(l.n)) return flag(Object.assign({}, l, {k: "pohony"}), "motory a upevnění zatím neřešíme");
    if (l.k === "elektro") return flag(l, "elektroniku zatím neřešíme");
    if (/^Adaptér vřetena/.test(l.n)) return Object.assign({}, l, {n: "Ocelový plech 200×100×5 + 2 bočnice z pásoviny (vřeteno na vozík modulu Z)", p: 250, est: 1, img: pimg("bar"),
      note: "plech na líc vozíku (4× M5 zápustné, rozteč 60×30), bočnice přivařené k plechu a přišroubované do bočních závitů vozíku (M4), na plech vřeteno (rozteč 95×35, M6) · cena odhad"});
    if (/^Šrouby M5\/M6, matice/.test(l.n)) return Object.assign({}, l, {n: "Matice, podložky, elektrody, barva", note: "šrouby jsou zvlášť níže"});
    if (/^Stíněný kabel|^Kvalitní kleština|^Klíč ER20A/.test(l.n)) return flag(l, "až při montáži vřetena");
    if (/^Odsávací hubice/.test(l.n)) return flag(l, "máme k vysavači");
    if (/^Hadice k vysavači/.test(l.n)) return flag(l, "u vysavače, délku ověřit");
    if (/^Kabelový řetěz/.test(l.n)) return flag(l, "zatím neřešíme");
    if (/^Upínky/.test(l.n)) return flag(l, "máme v dílně");
    return l;
  });
  // šrouby pro vozíky X, Y, Z (nové řádky jen na konec)
  return out.concat([
    {k: "osaZ", img: pimg("mix"), n: "Šroub M5×10 zápustný imbus (plech → vozík modulu Z), 10 ks", q: 1, p: 40, est: 1, note: "potřeba 4 ks + rezerva"},
    {k: "osaZ", img: pimg("s912"), n: "Šroub M5×15 imbus (modul Z → plexi), 10 ks", q: 1, p: 40, est: 1, note: "potřeba 6 ks + rezerva"},
    {k: "osaZ", img: pimg("s912"), n: "Šroub M4×10 imbus (bočnice → bok vozíku Z), 10 ks", q: 1, p: 30, est: 1, note: "2 závity M4 na každém boku vozíku"},
    {k: "horni", img: pimg("s912"), n: "Šroub M6×15 imbus (vozíky Y → pásovina na jeklu), 20 ks", q: 1, p: 70, est: 1, note: "4 vozíky × 4 díry = 16 ks + rezerva"},
    {k: "osaZ", img: pimg("s912"), n: "Šroub M6×20 imbus (vozíky X → plexi), 20 ks", q: 1, p: 80, est: 1, note: "4 vozíky × 4 díry = 16 ks + rezerva"},
  ]);
}
function bomAlu(p, c) {
  const ps = p.postSize, sideL = c.postZ - c.postZf - ps, pr3 = len => Math.round(len * .36), pr6 = len => Math.round(len * .539);   // 3030: ~360 Kč/m (Allegro, T-SLOT 30x30 [8], stříbrný); 3060: 539 Kč/m (Allegro, ENPRAG KA-3060, řezání na míru)
  const SRC = "cena z výpisu Allegra 18. 11. 2026, před koupí ověřit", NOLINK = "odkaz na konkrétní nabídku doplň tlačítkem ✎";
  const nPl90 = 8 + 1, nPl55 = 2, nFlat = 4 + 2, nAng = p.bridgeRear >= 22 ? 4 : 0;                 // rohové desky (U + boční profily + rameno hadice), ploché desky, úhelníky
  const nM6 = nPl90 * 4 + nPl55 * 4 + nFlat * 4 + nAng * 2;                       // M6×12 do drážek
  const barX = Math.min(p.railX, c.inL), nX = Math.floor((p.railX - 30) / 150) + 1;
  let nH = 0; for (let i = 0; i < nX; i++) if (Math.abs(-(nX - 1) * 75 + i * 150) < barX / 2 - 8) nH++;
  const nM5 = 2 * nH;                                                           // kolejnice X přímo na profil, jedna řada děr do drážky: 2 kolejnice × dvojice děr
  const nPl = nPl90 + nPl55 + nFlat;
  const len30 = 4 * c.postLen + 3 * c.inL + 2 * sideL + p.hoseH + p.hoseArm + 11 * 5;   // součet délek kusů + prořez 5 mm na řez
  const pk60 = alPack([c.bridgeL, c.bridgeL], 700), pk30 = alPack([c.postLen, c.postLen, c.postLen, c.postLen, c.inL, c.inL, c.inL, sideL, sideL, p.hoseH, p.hoseArm], 6000, 5);   // 3060: kus 700 mm za 286 Kč (Allegro); 3030: ehlinik.cz, vždy celá tyč 6 m za 1 126 Kč, prořez 5 mm   // nákup po celých kusech: kolik tyčí a jak je rozřezat
  return [
    ...alItems("Profil 3060 (30×60, drážka 8 mm)", [[`spojka vozíků Y, ${r1(c.bridgeL)} mm`, 2, c.bridgeL]], pk60, 286,
      "Allegro: „Konstrukční hliníkový profil T-drážka 30x60 [8] 700 mm“ 286 Kč za kus · Reference: eprofily.cz, řezaný profil 30×60 [8] 616 Kč/m bez DPH (18. 11. 2026)", pimg("p3060"), "https://www.eprofily.cz/hlinikovy-konstrukcni-profil-30x60-s-drazkou-8-mm-992457/kat1014.html", "kus 70 cm", "https://allegro.cz/produkt/konstrukcni-hlinikovy-profil-t-drazka-30x60-8-700mm-39a618be-7d7c-4456-9b08-eac5e8a1cb3c?offerId=18392654230"),
    ...alItems("Profil 3030 (30×30) K3030", [[`svislá stojka, ${c.postLen} mm`, 4, c.postLen], [`příčník, ${c.inL} mm (2 pod kolejnice X, 1 přední)`, 3, c.inL], [`boční profil, ${r1(sideL)} mm`, 2, sideL], [`držák hadice – svislý, ${p.hoseH} mm`, 1, p.hoseH], [`držák hadice – rameno, ${p.hoseArm} mm`, 1, p.hoseArm]], pk30, 1126,
      "ehlinik.cz: Hliníkový profil K3030, 187,60 Kč/m s DPH, objednává se vždy celá tyč 6 m a řeže se na míru (±1 mm, prořez ~5 mm se počítá do ceny, zbytek do 2 m se naúčtuje a přibalí): 6 m × 187,60 = 1 126 Kč · počet drážek a dopravu stránka neuvádí, ověřit · alternativa Allegro: tyč 1 m 380 Kč", pimg("p3030"), "https://www.v-slot.pl/cs_CZ/p/Konstrukcni-hlinikovy-profil-30x30-8-1500-mm/886", "tyč 6 m, řez na míru", "https://www.ehlinik.cz/hlinikovy-profil-k3030"),
    {k: "horni", img: pimg("corner"), n: `Sada spojek 3030 (4× rohová deska, 20× šroub M6×12, 20× T-matice M6, klíč 4 mm) – ${Math.ceil(nPl / 4)} sady`, q: Math.ceil(nPl / 4), p: 376, ref: "https://allegro.cz/produkt/spojka-pro-konstrukcni-profily-pro-hlinikovy-profil-3030-ve-tvaru-0b74ebab-088e-4302-a2cf-0d25a367f92f?offerId=19060862627", note: `potřeba ${nPl} desek (rohové ${nPl90 + nPl55}, ploché ${nFlat}) a ${nM6} šroubů s T-maticemi – sady je pokrývají (${Math.ceil(nPl / 4) * 20} ks). Tvar desek z Allegra se může lišit od trojúhelníků ve 3D · 376 Kč za sadu`},
    {k: "horni", img: pimg("corner"), refUrl: "https://www.ehlinik.cz/hlinikova-tyc-plocha-100x5", n: `Al plech 4 mm – rohové desky 90 / 55 a ploché 40×70 (${nPl} ks)`, q: 1, p: 150, est: 1, off: 1, note: `místo toho sady spojek výše · ehlinik.cz nemá 100×4, nejbližší je plochá tyč 100×5 mm (291,85 Kč/m s DPH) nebo 100×3 mm (180,77 Kč/m); hotové L desky: „Spojovací plát L K30“ 72,60 Kč/ks · jedna hliníková plochá tyč 100×4 mm, 1 m, nařezat na ${nPl90 + nPl55} čtverců 100×100 (z každého dvě rohové desky) a ${nFlat} destiček 40×70; díry Ø6,5 · cena odhad · ${NOLINK}`},
    ...(nAng ? [{k: "horni", img: pimg("angle"), n: "Roh 90° pro hliníkové profily 30×30 (úhelník do drážek)", q: nAng, p: 15, ref: "https://allegro.cz/produkt/roh-90-stupnu-pro-hlinikove-profily-30x30-e6279078-3135-4a35-8fc2-ad3634b327b3", note: "jedno čelo každé stojky (4) · " + SRC}] : []),
    {k: "horni", img: pimg("s7380"), refUrl: "https://www.ehlinik.cz/sroub-pulkulata-hlava-m6x12", n: `Šroub M6×12 ISO 7380-2 černý (balení 20 ks) – ${Math.ceil(nM6 / 20)} balení`, q: Math.ceil(nM6 / 20), p: 40, est: 1, off: 1, note: `jsou v sadách spojek výše · ehlinik.cz: šroub půlkulatá hlava M6×12 nerez A2, 2,42 Kč/ks s DPH · potřeba ${nM6} ks: desky a úhelníky. Allegro: „Šroub hříbkový s imbusovou přírubou M6x12 Černá Pozink ISO 7380-2 20 KS“ · cena odhad · ${NOLINK}`},
    {k: "horni", img: pimg("tnut"), refUrl: "https://www.ehlinik.cz/kamen-zasouvaci-m6-k30", n: "T-matice M6 do drážky 8 mm, 100 ks", q: 1, p: 676, off: 1, note: `jsou v sadách spojek výše · ehlinik.cz: „Kámen zasouvací M6 K30“ 7,26 Kč/ks s DPH (šířku drážky stránka neuvádí) · Allegro: „T-matice M6 8 mm x 100 kusů“ 676 Kč (potřeba ${nM6} + ${nM5} M5 se řeší zvlášť) · ${SRC} · ${NOLINK}`},
    {k: "horni", img: pimg("s912"), refUrl: "https://www.hornbach.cz/p/sroub-metricky-m6x25-inbus-valcova-hlava-pevnost-8-8-zinek-bily-10ks/12663717/", n: "Šroub DIN 912 M6×40 (spojka → vozíky Y), balení 10 ks", q: 2, p: 50, est: 1, note: "potřeba 16 ks; Allegro: „M6X40 VÁLCOVÝ IMBUSOVÝ ŠROUB 912 A2 NEREZ 10“ · cena odhad · " + NOLINK},
    {k: "horni", img: pimg("washer"), refUrl: "https://www.ehlinik.cz/podlozka-plocha-64-18-mm", n: "Podložka DIN 9021 M6 nerez A2, 50 ks", q: 1, p: 60, est: 1, note: "potřeba 16 + 22 ks; ehlinik.cz: podložka plochá 6,4/18 mm (velikost DIN 9021) 1,21 Kč/ks s DPH · Allegro: „M6 ŠIROKÁ ZVĚTŠENÁ PODLOŽKA DIN 9021 A2 NEREZOVÁ 50 ks“ (verifikovaná nabídka 1000 ks za 482 Kč je zbytečně velká: https://allegro.cz/produkt/nerezova-podlozka-a2-din-9021-m6-1000-kusu-664709ac-1592-4ec1-92cc-bfa8c4ad61c1) · cena odhad"},
    {k: "horni", img: pimg("mix"), refUrl: "https://www.ehlinik.cz/sroub-pulkulata-hlava-m6x20", n: `Šrouby M6×20 (plexi, modul Z) a M5×12 + T-matice M5 (kolejnice X na profil, ${nM5} ks)`, q: 1, p: 22 * 6 + nM5 * 9, est: 1, note: "22× M6×20, " + nM5 + "× M5×12 + T-matice M5 pro drážku 8 · ehlinik.cz: šroub půlkulatá M6×20 2,42 Kč/ks, „Kámen zasouvací M5 K30“ (https://www.ehlinik.cz/kamen-zasouvaci-m5-k30) 7,26 Kč/ks · cena odhad · " + NOLINK},
  ];
}
const NAS_VARIANT = {
  id: "nas", name: "Custom2", short: "Custom2", color: "#7c3aed",
  get area() { const p = getParams(this); return [Math.min(p.workW, p.deckW), Math.min(p.workL, p.deckL)]; },
  tags: ["svařené jekly 25×25", "SBR20 na obou osách", "vozík X z plexiskla", "hotový modul Z"],
  desc: "Stávající spodní konstrukce z **hliníkových solárních profilů 40×40** s deskou 1 800 × 750 mm leží na dřevěném stole a zůstává beze změny. Výška a rovinnost se nastavují **závitovými tyčemi Ø25**. Na boční profily se přišroubuje vedení **SBR20 1 800 mm**. Na každé straně jsou dva vozíky spojené pásovinou a **jeklem 25×25**, na zadním je svislá stojka a vzpěra vede od předního. Dva **příčníky 25×25** svařené mezi stojkami tvoří s nimi jeden rám a nesou vedení **SBR20 1 000 mm**. Čtyři vozíky osy X spojuje deska z **plexiskla 300 × 200 × 10 mm**, na ní je **hotový modul osy Z** a přes hliníkový adaptér **vřeteno 2,2 kW**.",
  pros: ["Nejnižší cena – stůl a spodní konstrukce už jsou", "Díly dostupné na Allegru a AliExpressu", "Jednoduché svařování jeklů", "Osa Z jako hotový modul"],
  cons: ["Plexisklo je pružné a u šroubů může pod zatížením praskat", "SBR vedení a tenké jekly: nižší tuhost, vhodné na dřevo, ne na hliník", "Kolejnice 1 800 mm nepokryje celou délku desky"],
  score: {tuhost: 2, presnost: 2, hlinik: 1, narocnost: 2, cas: 1, rozsir: 3},
  p3: {style: "nas"},
  get bom() { return bomNas(getParams(this)); },
  steps: [
    ["Spodní konstrukce", "Zkontrolovat rovinnost bočních profilů 40×40 a závitovými tyčemi Ø25 je srovnat do roviny a rovnoběžně (měřit úhlopříčky).", "Base frame"],
    ["Vedení Y", "Kolejnice SBR20 1 800 mm přišroubovat na boční profily (nýtovací matice M5 nebo přes pásovinu). Jednu kolejnici srovnat jako referenční, druhou k ní rovnoběžně.", "Y rails"],
    ["Vozíky Y a stojky", "Na každé straně spojit dva vozíky pásovinou 50×6 a jeklem 25×25, na zadní vozík přivařit stojku a vzpěru od předního vozíku. Svařovat mimo stroj, aby se vozíky nepoškodily.", "Y carriages and uprights"],
    ["Příčníky a vedení X", "Dva jekly 25×25 přivařit mezi stojky (jeden rám, rozteč 150 mm). Na čelo přes pásovinu 50×6 přišroubovat SBR20 1 000 mm.", "Cross beams and X rails"],
    ["Vozík X", "Do plexiskla vyvrtat otvory na rozteč vozíků SBR20UU (35 × 35 mm) a přišroubovat čtyři vozíky šrouby M6 s velkými podložkami.", "X carriage"],
    ["Osa Z a vřeteno", "Na plexisklo přišroubovat modul osy Z, na jeho vozík hliníkový adaptér a na něj patku vřetena.", "Z axis and spindle"],
    ["Elektronika", "Do skříňky měnič EV210, drivery DM556, ESP32 s FluidNC a zdroje. Kabely vést v řetězech, vřeteno i rám uzemnit.", "Electronics"],
    ["První frézování", "Upnout desku, nastavit nulu Z a srovnat povrch frézou Ø39.", "First cut"],
  ],
};

/* Custom2: boční profily se rozeberou a přeloží vedle podélných spodních profilů (ve stejné rovině). Kolejnice SBR20
   (podpěra 45 mm) pak leží na dvojici profilů 40 + 40 mm, odpadají závitové tyče v rozích a celý portál je níž. */
const NAS2_VARIANT = {
  id: "nas2", name: "Custom1", short: "Custom1", color: "#0f9d8a",
  get area() { const p = getParams(this); return [Math.min(p.workW, p.deckW), Math.min(p.workL, p.deckL)]; },
  tags: ["boční profily vedle spodních", "opora kolejnice 80 mm", "bez závitových tyčí", "nižší portál"],
  desc: "Stávající spodní konstrukce z **hliníkových solárních profilů 40×40** s deskou 1 800 × 750 mm leží na dřevěném stole. Boční profily se rozeberou a přišroubují **vedle podélných spodních profilů** ve stejné rovině. Kolejnice **SBR20** (podpěra 45 mm) tak leží na dvojici profilů o šířce **80 mm**, ne na jediném profilu 40 mm. Odpadají **závitové tyče a rozpěrky** v rozích a vedení je o 90 mm níž. Portál ze svařených **jeklů 25×25** se stojkami 370 mm nese vedení **SBR20 1 000 mm**, vozík X z **plexiskla 300 × 200 × 10 mm**, **hotový modul osy Z** a **vřeteno 2,2 kW**. Na spodní konstrukci zůstává podkladová deska, na kterou se klade obrobek.",
  pros: ["Kolejnice leží celou šířkou podpěry na dvou profilech", "Odpadá rovnání čtyř závitových tyčí", "Nižší a tužší spodní část", "Šířka frézování 719 mm – obrobek 700 mm se vejde"],
  cons: ["Spodní konstrukci je potřeba rozebrat a přeskládat", "Delší stojky portálu (větší páka)", "Rovinnost kolejnic závisí na rovinnosti spodní konstrukce – podložit"],
  score: {tuhost: 3, presnost: 2, hlinik: 1, narocnost: 2, cas: 2, rozsir: 3},
  p3: {style: "nas", flat: true, def: {flat: 1, sideSpan: 830, rodGap: 0, postH: 370}},
  get bom() { return bomNas(getParams(this)); },
  steps: [
    ["Spodní konstrukce", "Rozebrat boční profily a přišroubovat je vedle podélných spodních profilů (vnější strana, stejná rovina). Srovnat do roviny podložkami, změřit úhlopříčky.", "Base frame"],
    ...NAS_VARIANT.steps.slice(1),
  ],
};
/* Custom3: portál z hliníkových drážkových profilů (typ 3D tiskárny), bez svařování. Na každé straně spojuje dva vozíky Y profil 30×60
   (300 mm, naležato, s přesahem ven od kolejnice). Na jeho koncích stojí dva profily 30×30; nahoře je spojuje příčník 30×30
   a v rozích jsou desky: obrácené U. Takové U jsou dvě (přední a zadní). Zadní nese dva příčníky s kolejnicemi X (horní je součástí U,
   druhý je vložen pod něj). Spodní konstrukce je stejná jako u Custom1. */
const NAS3_VARIANT = {
  id: "nas3", name: "Custom3", short: "Custom3", color: "#e8590c",
  get area() { const p = getParams(this); return [Math.min(p.workW, p.deckW), Math.min(p.workL, p.deckL)]; },
  tags: ["Al drážkové profily", "vozíky Y jen 120 mm od sebe", "boční rám + dvě U", "bez svařování"],
  desc: "Spodní konstrukce a kolejnice jsou stejné jako u **Custom1**, portál je z **hliníkových drážkových profilů** typu 3D tiskárny a skládá se šrouby. Na každé straně spojuje dva vozíky osy Y (rozteč **130 mm**) profil **30×60 dlouhý 244 mm**, položený naležato a posunutý o 8 mm ven od kolejnice. Na jeho vnější drážce stojí na obou koncích jedna stojka 30×30 (A vzadu, B vpředu), vozíky jsou uvnitř mezi nimi a stojky jsou 4,5 mm za hlavami jejich šroubů. Každou drží plochá deska na vnější straně spojky (spojka končí v rovině s vnějším čelem stojek). Mezi horními konci stojek je boční profil v rovině s předním příčníkem, vznikne uzavřený boční rám. Zadní U nese vedení osy X na dvou příčnících 30×30, kolejnice SBR20 se šroubují přímo na profil jednou řadou děr do drážky. Přední příčník 30×30 je zvýšený nad vřeteno. Hadice vysavače vede vnitřkem portálu přes oko na držáku v zadním rohu. Plexisklo **300 × 220 × 10 mm**, **modul osy Z** a **vřeteno 2,2 kW** jsou jako u Custom1.",
  pros: ["Bez svařování – jen řezání, vrtání a šroubování", "Profily jdou snadno přestavět nebo rozšířit (T-matice)", "Dvě U-vazby a rohové desky dávají tužší portál než jeden rám", "Spodní konstrukce a kolejnice jako u Custom1"],
  cons: ["Drážkové profily 30×30 jsou dražší než jekl 25×25", "Šroubové spoje je potřeba dotahovat a pojistit", "Hadice vysavače musí vést před předním U a přes oko v rohu", "Kolejnice X 1 000 mm přesahuje rám stejně jako u Custom1"],
  score: {tuhost: 3, presnost: 2, hlinik: 1, narocnost: 3, cas: 3, rozsir: 4},
  p3: {style: "nas", flat: true, def: {flat: 1, alu: 1, sideSpan: 830, rodGap: 0, postH: 367, postSize: 30, beamSize: 30, plexiH: 220, blockSpacing: 130}},
  get bom() { return bomNas(getParams(this)); },
  steps: [
    ["Spodní konstrukce", "Rozebrat boční profily a přišroubovat je vedle podélných spodních profilů (vnější strana, stejná rovina). Srovnat do roviny podložkami, změřit úhlopříčky.", "Base frame"],
    ["Vedení Y", "Kolejnice SBR20 1 800 mm přišroubovat na boční profily. Jednu kolejnici srovnat jako referenční, druhou k ní rovnoběžně.", "Y rails"],
    ["Vozíky Y a stojky", "Na každé straně přišroubovat na dva vozíky profil 30×60 (244 mm) naležato. Na jeho vnější drážku přišroubovat na obou koncích stojku 30×30 (A vzadu, B vpředu), vozíky jsou uvnitř (plochá deska na vnější straně).", "Y carriages and uprights"],
    ["Příčníky a vedení X", "Horní příčníky 30×30 přišroubovat mezi stojky předního a zadního U, na stojky položit boční profily 30×30; v rozích rohové desky. Do zadního U vložit druhý příčník 150 mm pod horní a na čela přes pásovinu 50×6 přišroubovat SBR20 1 000 mm.", "Cross beams and X rails"],
    ...NAS_VARIANT.steps.slice(4),
  ],
};
/* Custom4: Custom1 (portál ze svařených jeklů 25×25) s jiným uchycením vřetena: ocelový plech 200×100×5 na vozíku modulu Z,
   bočnice z pásoviny přivařené k plechu a přišroubované do bočních závitů M4 vozíku (plech drží ze tří stran), na plechu vřeteno. */
const NAS4_VARIANT = {
  id: "nas4", name: "Custom4", short: "Custom4", color: "#1c7ed6",
  get area() { const p = getParams(this); return [Math.min(p.workW, p.deckW), Math.min(p.workL, p.deckL)]; },
  tags: ["jekly 25×25 jako Custom1", "vřeteno na ocelovém plechu 200×100×5", "plech přichycený ze tří stran", "kalkulace jen na tuto fázi"],
  desc: "Portál a spodní konstrukce jsou stejné jako u **Custom1**: boční profily vedle spodních, kolejnice **SBR20**, portál ze svařených **jeklů 25×25**, vozík X z **plexiskla** a **hotový modul osy Z**. Rozdíl je v uchycení vřetena: vozík modulu Z je užší než patka vřetena (rozteč děr 95 mm proti 60 mm), proto je mezi nimi **ocelový plech 200 × 100 × 5 mm**. Plech je přišroubovaný na líc vozíku čtyřmi zápustnými šrouby M5 a k jeho zadní straně jsou přivařené dvě **bočnice z pásoviny**, které se přišroubují do bočních závitů M4 vozíku. Plech tak drží ze tří stran a na něm je teprve vřeteno.",
  pros: ["Stejný ověřený portál jako Custom1", "Plech drží vozík ze tří stran – menší namáhání čtyř šroubů M5", "Plech 200 mm dává místo na patku vřetena 95 mm", "Svařuje se jen jednoduchý plech s pásovinou"],
  cons: ["Ocelový plech 5 mm a bočnice přidají hmotnost na osu Z", "Závity M6 pro vřeteno v plechu 5 mm jsou krátké – lépe matice zezadu nebo silnější plech", "Svářením se plech může zkroutit – rovnat před vrtáním"],
  score: {tuhost: 3, presnost: 2, hlinik: 1, narocnost: 2, cas: 2, rozsir: 3},
  p3: {style: "nas", flat: true, def: {flat: 1, sideSpan: 830, rodGap: 0, postH: 370, zPlate: 1}},
  get bom() { return bomNas(getParams(this)); },
  steps: [
    ...NAS2_VARIANT.steps.slice(0, 5),
    ["Osa Z a vřeteno", "Modul osy Z přišroubovat na plexisklo (M5×15). Na vozík modulu přišroubovat ocelový plech 200×100×5 čtyřmi zápustnými šrouby M5×10, přivařené bočnice z pásoviny přišroubovat do bočních závitů vozíku (M4×10). Na plech přišroubovat patku vřetena (rozteč 95×35, M6).", "Z axis and spindle"],
    ...NAS2_VARIANT.steps.slice(6),
  ],
};
VARIANTS.unshift(NAS2_VARIANT, NAS_VARIANT);
VARIANTS.unshift(NAS3_VARIANT);
VARIANTS.unshift(NAS4_VARIANT);
const VBY = Object.fromEntries(VARIANTS.map(v => [v.id, v]));
const SCORE_L = {tuhost: "Tuhost", presnost: "Přesnost", hlinik: "Hliník", narocnost: "Náročnost stavby", cas: "Čas stavby", rozsir: "Rozšiřitelnost"};

function bomLines(v) {
  const ov = S.bom[v.id] || {}, order = Object.keys(KAT), add = v.custom ? [] : ((S.bomAdd || {})[v.id] || []);
  const src = v.bom.map((l, i) => [l, i]).concat(add.map((l, j) => [l, 1000 + j]));
  return src.filter(([, i]) => !(ov[i] || {}).del).map(([l, i]) => {
    const o = ov[i] || {}, k = o.k && KAT[o.k] ? o.k : l.k;
    return Object.assign({}, l, {i, k, n: o.n ?? l.n, g: KAT[k].n, q: o.q ?? l.q, p: o.p ?? l.p, off: !!(o.off ?? l.off), bought: !!(o.bought ?? l.bought), refUrl: o.refUrl ?? l.refUrl ?? "", parts: l.parts, u: l.u || "ks", urlOv: o.url ?? l.urlOv ?? "", img: o.img ?? l.img ?? "", added: i >= 1000});
  }).sort((a, b) => order.indexOf(a.k) - order.indexOf(b.k) || a.i - b.i);
}
const bomTotal = (v, mode = "all") => bomLines(v).reduce((s, l) => s + (l.off || !inMode(l, mode) ? 0 : l.q * l.p), 0);
const bomCat = (v, k) => bomLines(v).reduce((s, l) => s + (l.off || l.k !== k ? 0 : l.q * l.p), 0);
