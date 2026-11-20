/* =====================================================================
   VÝROBNÍ VÝKRESY – rozměry dílů k výrobě (Custom, Custom2)
   Vše se počítá z parametrů návrhu (nasCalc) stejnými vzorci jako 3D model.
   Popisky ve výkresech anglicky (stejně jako schémata zapojení).
   ===================================================================== */
/* Měřítko: K = mm na 1 px při očekávané šířce vykreslení. Okraje, odsazení kót a písmo se zadávají v px
   a násobí K, takže malý i velký díl mají stejně velké kóty a písmo. */
let K = 1, PAD = [0, 0, 0, 0];
function dScale(w, pad, renderW) { PAD = pad; K = w / (renderW - pad[0] - pad[2]); return K; }
function svgDrawing(w, h, body) {
  const [l, t, r, b] = PAD.map(v => v * K);
  return `<svg class="dwg" viewBox="${-l} ${-t} ${w + l + r} ${h + t + b}" style="--k:${K}" xmlns="http://www.w3.org/2000/svg">${body}</svg>`;
}
const dRect = (x, y, w, h, cls = "p") => `<rect x="${x}" y="${y}" width="${w}" height="${h}" class="${cls}"/>`;
const dHole = (x, y, d, lbl) => `<circle cx="${x}" cy="${y}" r="${d / 2}" class="h"/><path d="M${x - d * .9} ${y}h${d * 1.8}M${x} ${y - d * .9}v${d * 1.8}" class="c"/>${lbl ? `<text x="${x + d}" y="${y - d}" class="ht">${lbl}</text>` : ""}`;
/* kóta: body (x1,y1)–(x2,y2), odsazení off kolmo k úsečce, text = rozměr */
function dDim(x1, y1, x2, y2, off, text, small, ed) {
  if (ed && typeof scDim === "function") {                                // upravitelná kóta (klik na číslo, − / +): ed = [klíč parametru, měřítko]
    const c = {K, X: x => x, Y: y => y, out: [], marker: "da"}, pp = getParams(VBY[S.variant]), val = parseFloat(String(text));
    if (Number.isFinite(val) && pp[ed[0]] != null) { scDim(c, [x1, y1], [x2, y2], off, val, ed[0], pp, ed[1] ?? 1); return c.out.join(""); }
  }
  off *= K; const g = 4 * K, tg = 4 * K;
  const hor = Math.abs(y2 - y1) < Math.abs(x2 - x1);
  const fs = small ? "dt s" : "dt";
  if (hor) {
    const yy = off < 0 ? Math.min(y1, y2) + off : Math.max(y1, y2) + off;
    return `<path d="M${x1} ${y1}V${yy + (off < 0 ? -g : g)}M${x2} ${y2}V${yy + (off < 0 ? -g : g)}" class="ext"/><path d="M${x1} ${yy}H${x2}" class="dl" marker-start="url(#da)" marker-end="url(#da)"/><text x="${(x1 + x2) / 2}" y="${yy - tg}" class="${fs}" text-anchor="middle">${text}</text>`;
  }
  const xx = off < 0 ? Math.min(x1, x2) + off : Math.max(x1, x2) + off;
  return `<path d="M${x1} ${y1}H${xx + (off < 0 ? -g : g)}M${x2} ${y2}H${xx + (off < 0 ? -g : g)}" class="ext"/><path d="M${xx} ${y1}V${y2}" class="dl" marker-start="url(#da)" marker-end="url(#da)"/><text x="${xx - tg}" y="${(y1 + y2) / 2}" class="${fs}" text-anchor="middle" transform="rotate(-90 ${xx - tg} ${(y1 + y2) / 2})">${text}</text>`;
}
const DEFS = `<defs><marker id="da" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 2 L9 5 L0 8" fill="none" stroke="#d97706" stroke-width="1.4"/></marker></defs>`;
const r1 = x => Math.round(x * 10) / 10;

/* všechny rozměry dílů z parametrů (stejné vzorce jako buildNas ve viewer3d.js) */
function nasParts(p) {
  const c = nasCalc(p), PR = 40, bs = p.blockSpacing, ps = p.postSize, bsz = p.beamSize, half = p.sideSpan / 2;
  const inL = c.inL, barX = Math.min(p.railX, inL);
  const braceTop = Math.min(c.conTop + p.postH * .6, c.lowBeamY - bsz / 2 - 15);
  const braceDy = braceTop - (c.conTop - 12.5), braceL = Math.hypot(bs, braceDy), braceA = Math.atan2(braceDy, bs) * 180 / Math.PI;
  const yE = c.yE, yC = c.conC, mY0 = c.sideTop - PR / 2, mT = yC + 46;
  const extL = yE + 12.5 - p.deckL / 2 - 5, motUp = mT - (mY0 + 12.5), idlUp = (yC + 28) - (mY0 + 12.5);
  const beamZ = c.postZ, frontZ = beamZ - bsz / 2 - c.railBar, hTopY = c.topBeamY + 470, hBackZ = beamZ + bsz / 2 + 32, hArmZ = frontZ - 190;
  const dTop = Math.max(mT + 300, p.frameH + 560);
  // díry v plexiskle (střed desky = 0,0; y nahoru)
  const plexi = [];
  for (const by of [c.topBeamY, c.lowBeamY]) for (const xc of [-c.bx, c.bx]) for (const a of [-1, 1]) for (const b of [-1, 1]) {
    const yy = by + b * 17.5 - c.plexiCY; if (Math.abs(yy) < p.plexiH / 2 - 4) plexi.push({x: xc + a * 17.5, y: yy, d: 6.6, k: "car"});
  }
  for (const a of [-1, 1]) for (const b of [-1, 0, 1]) plexi.push({x: a * 33, y: (c.modCY - c.plexiCY) + b * Math.min(60, p.plexiH / 2 - 18), d: 6.6, k: "z"});
  // díry v pásovině pod kolejnicí X (SBR20: 2 řady ±15, rozteč 150, souměrně ke středu kolejnice)
  const nX = Math.floor((p.railX - 30) / 150) + 1, railHoles = [];
  for (let i = 0; i < nX; i++) { const x = -(nX - 1) * 75 + i * 150; if (Math.abs(x) < barX / 2 - 8) railHoles.push(x); }
  return {c, bs, ps, bsz, half, inL, barX, braceTop, braceL, braceA, yE, extL, motUp, idlUp, hTopY, hBackZ, hArmZ, dTop, mT, plexi, railHoles, nX,
    hoseUp: hTopY - (c.topBeamY - bsz / 2), hoseArm: hBackZ - hArmZ + 10, dispUp: dTop - mT + 12.5};
}

function nasCutList(p) {
  const q = nasParts(p), c = q.c;
  const frame = p.alu ? [
    ["Carriage bridge", "Al profile 30×60", r1(c.bridgeL), 2, `laid flat on carriages, overhang ${r1(p.bridgeOff + 6)} mm outward · 8 holes Ø6.6 (35×35 per SBR20UU), see drawing`],
    ["Upright", `Al profile ${q.ps}×${q.ps}`, c.postLen, 4, "2 per side, outer slot of the bridge: A behind the rear carriage bolts, B between the carriages"],
    ["Side profile", `Al profile ${q.ps}×${q.ps}`, c.postZ - c.postZf - q.ps, 2, "between the tops of uprights A and B, flush with the front cross profile"],
    ["Cross profile (rails)", `Al profile ${q.bsz}×${q.bsz}`, q.inL, 2, `rear U: top and lower, spacing ${p.beamGap} mm, axis 15 mm below the rail axis`],
    ["Cross profile (front)", `Al profile ${q.bsz}×${q.bsz}`, q.inL, 1, `between uprights A, raised by ${c.postE} mm above the spindle (home position)`],
    ["Corner plate (top)", "Al plate 4 mm", "90 × 90", 9, "right triangle, 2× M6 per leg · 4 in the rear and front U, 4 under the side profiles, 1 at the hose arm"],
    ["Corner plate (lower)", "Al plate 4 mm", "55 × 55", 2, "rear U, lower cross profile"],
    ...(p.bridgeRear >= 22 ? [["Angle connector", "Al angle 20 wide", "30 + 22", 4, "slot of upright + slot of bridge, outer face of every upright"]] : []),
    ["Flat connecting plate", "Al plate 4 mm", "40 × 70", 6, "outer face: upright + bridge in one plane (4), hose holder on both faces (2)"],
  ] : [
    ["Y carriage plate", "flat bar 50×6", q.bs + 50, 2, "8 holes Ø6.6 for SBR20UU (35×35), see drawing"],
    ["Carriage bridge", "tube 25×25×2", q.bs + 50, 2, "welded on carriage plate"],
    ["Upright", `tube ${q.ps}×${q.ps}×2`, p.postH, 2, "welded on rear end of bridge"],
    ["Brace", "tube 25×25×2", r1(q.braceL), 2, `axis length · angle ${r1(q.braceA)}° to bridge`],
    ["Cross tube", `tube ${q.bsz}×${q.bsz}×2`, q.inL, 2, `between uprights, spacing ${p.beamGap} mm (centre to centre)`],
  ];
  return [
    ...frame,
    ...(p.alu ? [["X rails", "SBR20 on the profile", p.railX, 2, `bolted directly, one row of holes (${q.railHoles.length} per rail) into the slot, M5 + T-nut; rail overhangs the profile by 22 mm on one side`]] : [["X rail support", "flat bar 50×6", q.barX, 2, `${q.railHoles.length} × 2 holes M5 (rail pitch 150, rows ±15)`]]),
    ["Y end extension", "tube 25×25×2", r1(q.extL), 4, "from side profile end face to motor / idler tube"],
    ["Y motor tube (vertical)", "tube 25×25×2", r1(q.motUp), 2, "C-bracket for NEMA23"],
    ["Y idler tube (vertical)", "tube 25×25×2", r1(q.idlUp), 2, "slotted plate, M6 tensioner"],
    ["Display arm – vertical", "tube 25×25×2", r1(q.dispUp), 1, "continues Y1 motor tube"],
    ["Display arm – horizontal", "tube 25×25×2", 200, 1, "inverted L, display mount at end"],
    ...(p.alu ? [["Hose holder – vertical", "Al profile 30×30", p.hoseH, 1, "on the rear corner post (−X side), above the side profile"], ["Hose holder – arm", "Al profile 30×30", p.hoseArm, 1, "inwards, eyelet Ø52 at the end"]] : [
    ["Hose holder – vertical", "tube 20×20×2", r1(q.hoseUp), 1, "centred behind top cross tube, 22 mm spacer"],
    ["Hose holder – arm", "tube 20×20×2", r1(q.hoseArm), 1, "eyelet Ø52 above spindle"]]),
    ["X carriage plate", `plexiglass ${p.plexiT} mm`, `${p.plexiW} × ${p.plexiH}`, 1, `${q.plexi.length} holes Ø6.6, see drawing`],
    ...(p.zPlate ? [["Spindle plate", "steel plate 5 mm", "200 × 100", 1, "4× M5 countersunk (60×30) + 4× M6 (95×35)"], ["Side bar", "flat bar 5 mm", "50 × 32", 2, "welded to the plate, 2× M4 into the Z carriage side"]] : [["Spindle adapter", "Al plate 10 mm", "120 × 175", 1, "4× M5 countersunk + 8× M6 tapped"]]),
    ["Y rails", "SBR20", p.railY, 2, "no cutting"],
    ["X rails", "SBR20", p.railX, 2, p.railX > q.inL + q.ps ? `overhangs frame by ${r1((p.railX - q.inL - 2 * q.ps) / 2)} mm per side` : "no cutting"],
  ];
}

/* --- jednotlivé výkresy --- */
function dwgPlexi(p) {
  const q = nasParts(p), W = p.plexiW, H = p.plexiH, X = x => x + W / 2, Y = y => H / 2 - y;
  dScale(W, [90, 40, 70, 70], 620);
  let b = DEFS + dRect(0, 0, W, H, "p pl");
  const car = q.plexi.filter(h => h.k === "car"), zz = q.plexi.filter(h => h.k === "z");
  car.forEach(h => b += dHole(X(h.x), Y(h.y), h.d)); zz.forEach(h => b += dHole(X(h.x), Y(h.y), h.d));
  const cx = [...new Set(car.map(h => X(h.x)))].sort((a, b2) => a - b2), cy = [...new Set(car.map(h => Y(h.y)))].sort((a, b2) => a - b2);
  b += dDim(0, 0, W, 0, -22, `${W}`) + dDim(W, 0, W, H, 26, `${H}`);
  b += dDim(0, H, cx[0], H, 18, `${r1(cx[0])}`, 1) + dDim(cx[0], H, cx[1], H, 18, `${r1(cx[1] - cx[0])}`, 1);
  if (cx.length > 2) b += dDim(cx[1], H, cx[2], H, 36, `${r1(cx[2] - cx[1])}`, 1);
  b += dDim(0, 0, 0, cy[0], -20, `${r1(cy[0])}`, 1) + dDim(0, cy[0], 0, cy[1], -20, `${r1(cy[1] - cy[0])}`, 1);
  if (cy.length > 2) b += dDim(0, cy[1], 0, cy[2], -38, `${r1(cy[2] - cy[1])}`, 1);
  const zx = [...new Set(zz.map(h => X(h.x)))].sort((a, b2) => a - b2), zy = [...new Set(zz.map(h => Y(h.y)))].sort((a, b2) => a - b2);
  b += dDim(zx[0], zy[0], zx[1], zy[0], -12, `${r1(zx[1] - zx[0])}`, 1) + dDim(zx[1], zy[0], zx[1], zy[1], 14, `${r1(zy[1] - zy[0])}`, 1) + dDim(zx[1], zy[1], zx[1], zy[2], 14, `${r1(zy[2] - zy[1])}`, 1);
  b += `<text x="${W / 2}" y="${H + 58 * K}" class="nt" text-anchor="middle">${car.length}× Ø6.6 carriages (M6) · ${zz.length}× Ø6.6 Z module (M6) · R10 corners · t = ${p.plexiT} mm</text>`;
  return svgDrawing(W, H, b);
}
function dwgZPlate() {                                            // ocelový plech 200×100×5 pod vřeteno (Custom4); střed plechu je 20 mm pod středem vozíku
  const W = 200, H = 100, X = x => x + W / 2, Y = y => H / 2 - y;
  dScale(W, [60, 40, 60, 80], 620);
  let b = DEFS + dRect(0, 0, W, H, "p fb");
  const car = [], sp = [];
  for (const a of [-1, 1]) for (const yy of [35, 5]) car.push([a * 30, yy]);
  for (const a of [-1, 1]) for (const yy of [10, -25]) sp.push([a * 47.5, yy]);
  car.forEach(([x, y]) => b += dHole(X(x), Y(y), 5.5) + `<circle cx="${X(x)}" cy="${Y(y)}" r="5" class="h cs"/>`);
  sp.forEach(([x, y]) => b += dHole(X(x), Y(y), 5));
  b += `<rect x="${X(-42.5) - 2.5}" y="${Y(45)}" width="5" height="50" class="p fb dash"/><rect x="${X(42.5) - 2.5}" y="${Y(45)}" width="5" height="50" class="p fb dash"/>`;
  b += dDim(0, 0, W, 0, -22, "200") + dDim(W, 0, W, H, 26, "100");
  b += dDim(X(-30), Y(35), X(30), Y(35), -12, "60", 1) + dDim(X(30), Y(35), X(30), Y(5), 12, "30", 1);
  b += dDim(X(-47.5), H, X(47.5), H, 16, "95", 1) + dDim(X(47.5), Y(10), X(47.5), Y(-25), 14, "35", 1);
  b += dDim(0, 0, 0, Y(35), -18, `${r1(Y(35))}`, 1) + dDim(0, Y(10), 0, Y(-25), -36, "35", 1);
  b += `<text x="${W / 2}" y="${H + 46 * K}" class="nt" text-anchor="middle">steel 5 mm · 4× M5 countersunk (Z carriage 60×30) · 4× M6 tapped or nut behind (spindle 95×35) · side bars 5×50×32 welded at ±42.5 (dashed), 2× M4 each</text>`;
  return svgDrawing(W, H, b);
}
function dwgAdapter() {
  const W = 120, H = 175, X = x => x + W / 2, Y = y => H / 2 - y;
  dScale(W, [150, 40, 150, 76], 620);
  let b = DEFS + dRect(0, 0, W, H, "p al");
  const carH = [], footH = [];
  for (const a of [-1, 1]) for (const yy of [65, 35]) carH.push([a * 30, yy]);
  for (const a of [-1, 1]) for (const yy of [40, 5, -30, -65]) footH.push([a * 47.5, yy]);
  carH.forEach(([x, y]) => b += dHole(X(x), Y(y), 5.5) + `<circle cx="${X(x)}" cy="${Y(y)}" r="5" class="h cs"/>`);
  footH.forEach(([x, y]) => b += dHole(X(x), Y(y), 5));
  b += dDim(0, 0, W, 0, -22, "120") + dDim(W, 0, W, H, 30, "175");
  b += dDim(X(-30), Y(65), X(30), Y(65), -10, "60", 1) + dDim(X(30), Y(65), X(30), Y(35), 12, "30", 1);
  b += dDim(X(-47.5), H, X(47.5), H, 16, "95", 1);
  b += dDim(0, 0, 0, Y(40), -18, `${r1(Y(40))}`, 1) + dDim(0, Y(40), 0, Y(5), -18, "35", 1) + dDim(0, Y(5), 0, Y(-30), -18, "35", 1) + dDim(0, Y(-30), 0, Y(-65), -18, "35", 1);
  b += dDim(0, Y(65), 0, Y(35), -40, "30", 1) + dDim(0, 0, 0, Y(65), -40, `${r1(Y(65))}`, 1);
  b += `<text x="${W / 2}" y="${H + 50 * K}" class="nt" text-anchor="middle">4× M5 countersunk (Z carriage 60×30)</text><text x="${W / 2}" y="${H + 66 * K}" class="nt" text-anchor="middle">8× M6 tapped (spindle foot 95 × 30/35/35/35) · t = 10 mm</text>`;
  return svgDrawing(W, H, b);
}
function dwgGantry(p) {
  const q = nasParts(p), c = q.c, ps = q.ps, bsz = q.bsz, Wt = p.sideSpan + ps, Ht = p.postH;
  const yB = y => Ht - (y - c.conTop);                       // svislá souřadnice od spodku stojky
  dScale(Wt, [60, 50, 90, 70], 1300);
  let b = DEFS;
  b += dRect(0, 0, ps, Ht) + dRect(Wt - ps, 0, ps, Ht);
  for (const by of [c.topBeamY, c.lowBeamY]) b += dRect(ps, yB(by) - bsz / 2, q.inL, bsz);
  const xb0 = (Wt - q.barX) / 2;
  b += `<rect x="${xb0}" y="${yB(c.topBeamY) - 25}" width="${q.barX}" height="50" class="p fb"/><rect x="${xb0}" y="${yB(c.lowBeamY) - 25}" width="${q.barX}" height="50" class="p fb"/>`;
  b += dDim(0, 0, Wt, 0, -30, `${Wt}`) + dDim(ps, yB(c.lowBeamY) + bsz / 2, Wt - ps, yB(c.lowBeamY) + bsz / 2, (Ht - yB(c.lowBeamY) - bsz / 2) / K + 26, `${q.inL} (cross tube)`);
  b += dDim(Wt, 0, Wt, Ht, 30, `${Ht}`) + dDim(Wt - ps, yB(c.topBeamY), Wt - ps, yB(c.lowBeamY), -16, `${p.beamGap}`, 1);
  b += dDim(Wt - ps, yB(c.lowBeamY), Wt - ps, Ht, -16, `${r1(Ht - yB(c.lowBeamY))}`, 1);
  b += dDim(xb0, yB(c.lowBeamY) + 25, xb0 + q.barX, yB(c.lowBeamY) + 25, 14, `${q.barX} (flat bar 50×6)`, 1);
  b += `<text x="${Wt / 2}" y="${Ht + 60 * K}" class="nt" text-anchor="middle">${p.alu ? `Rear U, front view · uprights ${ps}×${ps} Al profile · cross profiles ${bsz}×${bsz} bolted between uprights (front U has the top profile only)` : `Front view · uprights ${ps}×${ps} · cross tubes ${bsz}×${bsz} welded between uprights · dimensions to tube centre lines where marked`}</text>`;
  return svgDrawing(Wt, Ht, b);
}
function dwgBridgeAlu(p) {                                     // spojka vozíků 30×60: půdorys s dírami pro vozíky a polohou stojek
  const q = nasParts(p), c = q.c, L = c.bridgeL, W = 60, ps = q.ps, o = p.bridgeOff, X = z => z - c.bridgeZ0, Y = x => x;   // x od vnitřní hrany profilu, z od předního konce
  dScale(L, [60, 40, 60, 100], 900);
  let b = DEFS + dRect(0, 0, L, W, "p al");
  for (const pz of [c.postZ, c.postZf]) b += `<rect x="${X(pz) - ps / 2}" y="30" width="${ps}" height="${ps}" class="p fb" style="opacity:.55"/>`;   // stojky na vnější drážce
  const hx = [30 - o - 17.5, 30 - o + 17.5], zs = [];
  for (const zc of [-q.bs / 2, q.bs / 2]) for (const a of [-1, 1]) { zs.push(X(zc + a * 17.5)); for (const yy of hx) b += dHole(X(zc + a * 17.5), Y(yy), 6.6); }
  zs.sort((a, b2) => a - b2);
  b += dDim(0, 0, L, 0, -26, `${r1(L)}`, 0, ["bridgeRear", .5]) + dDim(L, 0, L, W, 22, "60", 1);
  b += dDim(0, W, zs[0], W, 18, `${r1(zs[0])}`, 1) + dDim(zs[0], W, zs[1], W, 18, "35", 1) + dDim(zs[1], W, zs[2], W, 18, `${r1(zs[2] - zs[1])}`, 1) + dDim(zs[2], W, zs[3], W, 18, "35", 1) + dDim(zs[3], W, L, W, 18, `${r1(L - zs[3])}`, 1);
  const zb = X(c.postZf), za = X(c.postZ);
  b += dDim(0, 0, zb, 0, -52, `${r1(zb)} (post B centre)`, 1) + dDim(zb, 0, za, 0, -52, `${r1(za - zb)} (A–B)`, 1);
  b += dDim(0, 0, 0, hx[0], -22, `${r1(hx[0])}`, 1) + dDim(0, hx[0], 0, hx[1], -22, "35", 1);
  b += `<text x="${L / 2}" y="${W + 66 * K}" class="nt" text-anchor="middle">Carriage bridge ×2 · Al profile 30×60 laid flat, plan view (front = left) · 8× Ø6.6 through both walls (M6×40 into SBR20UU 35×35) · shifted ${o} mm outward</text>`;
  b += `<text x="${L / 2}" y="${W + 82 * K}" class="nt" text-anchor="middle">grey squares: uprights ${ps}×${ps} on the outer slot · B between the carriages next to the bolts, A behind the rear carriage bolts (overhang only on the rear side)</text>`;
  return svgDrawing(L, W, b);
}
function dwgYSide(p) {
  if (p.alu) return dwgBridgeAlu(p);
  const q = nasParts(p), c = q.c, L = q.bs + 50, Ht = p.postH + 6 + 25, ps = q.ps;
  const yT = y => Ht - (y - c.blockTop);                        // od horní plochy vozíku
  dScale(L, [500, 30, 500, 96], 1300);
  let b = DEFS;
  b += dRect(0, yT(c.blockTop + 6), L, 6, "p fb") + dRect(0, yT(c.blockTop + 31), L, 25);
  const px = L / 2 + q.bs / 2 - ps / 2;
  b += dRect(px, yT(c.conTop + p.postH), ps, p.postH);
  const x1 = 25, y1 = yT(c.conTop - 12.5), x2 = L / 2 + q.bs / 2, y2 = yT(q.braceTop);
  b += `<path d="M${x1} ${y1}L${x2} ${y2}" class="br"/>`;
  for (const zc of [-q.bs / 2, q.bs / 2]) for (const a of [-1, 1]) b += dHole(L / 2 + zc + a * 17.5, yT(c.blockTop + 3), 4);
  b += dDim(0, Ht, L, Ht, 24, `${L}`) + dDim(L / 2 - q.bs / 2 - 17.5, Ht, L / 2 - q.bs / 2 + 17.5, Ht, 46, "35", 1);
  b += dDim(L / 2 - q.bs / 2, Ht, L / 2 + q.bs / 2, Ht, 66, `${q.bs} (carriage spacing)`, 1);
  b += dDim(px + ps, yT(c.conTop + p.postH), px + ps, yT(c.conTop), 22, `${p.postH}`);
  b += `<text x="${(x1 + x2) / 2 - 10}" y="${(y1 + y2) / 2 - 14}" class="dt s" text-anchor="middle" transform="rotate(${-q.braceA} ${(x1 + x2) / 2 - 10} ${(y1 + y2) / 2 - 14})">brace ${r1(q.braceL)} · ${r1(q.braceA)}°</text>`;
  b += `<text x="${L / 2}" y="${Ht + 86 * K}" class="nt" text-anchor="middle">Side view of Y carriage weldment (×2, mirrored) · flat bar 50×6 · bridge tube 25×25 · hole pattern 35×35 per SBR20UU</text>`;
  return svgDrawing(L, Ht, b);
}
function dwgXBar(p) {
  const q = nasParts(p), L = q.barX, H = 50;
  dScale(L, [40, 36, 50, 60], 1300);
  let b = DEFS + dRect(0, 0, L, H, "p fb");
  q.railHoles.forEach(x => { b += dHole(L / 2 + x, H / 2 - 15, 4.2) + dHole(L / 2 + x, H / 2 + 15, 4.2); });
  const hx = q.railHoles.map(x => L / 2 + x);
  b += dDim(0, 0, L, 0, -20, `${L}`) + dDim(L, 0, L, H, 18, "50", 1);
  if (hx.length) b += dDim(0, H, hx[0], H, 16, `${r1(hx[0])}`, 1) + (hx.length > 1 ? dDim(hx[0], H, hx[1], H, 16, "150", 1) : "") + dDim(hx[0], H / 2 - 15, hx[0], H / 2 + 15, -14, "30", 1);
  b += `<text x="${L / 2}" y="${H + 50 * K}" class="nt" text-anchor="middle">${hx.length * 2}× M5 tapped (Ø4.2 drill) · rail centred on flat bar · ${q.nX - q.railHoles.length} rail hole pairs fall outside the bar</text>`;
  return svgDrawing(L, H, b);
}


/* ---------- detailní výkresy vrchní konstrukce (Al portál) ---------- */
const dPoly = (pts, cls = "p fb") => `<path d="M${pts.map(q => q.join(" ")).join("L")}Z" class="${cls}"/>`;
function dwgSideFrameAlu(p) {                                       // bokorys uzavřeného bočního rámu: spojka, stojky A a B, boční profil, desky, úhelníky
  const q = nasParts(p), c = q.c, ps = q.ps, bs = q.bs, zA = c.postZ, zB = c.postZf, z0 = c.bridgeZ0, z1 = c.bridgeZ1, yTop = c.conTop + c.postLen, yb0 = c.blockTop - 39, y1 = yTop;
  const W = z1 - z0 + 60, H = y1 - yb0, X = z => z - z0 + 30, Y = y => y1 - y, yFb = c.topBeamY + c.postE;
  dScale(W, [150, 50, 170, 130], 900);
  let b = DEFS;
  for (const zc of [-bs / 2, bs / 2]) b += dRect(X(zc) - 25, Y(c.blockTop), 50, 39, "p fb") + `<path d="M${X(zc - 17.5)} ${Y(c.conTop)}V${Y(c.blockTop - 20)}M${X(zc + 17.5)} ${Y(c.conTop)}V${Y(c.blockTop - 20)}" class="c"/>`;
  b += dRect(X(z0), Y(c.conTop), z1 - z0, 30, "p al");
  for (const pz of [zA, zB]) b += dRect(X(pz) - ps / 2, Y(yTop), ps, c.postLen, "p al") + (p.bridgeRear < 22 ? "" : pz > 0 ? dRect(X(pz + ps / 2), Y(c.conTop + 30), 4, 30, "p fb") + dRect(X(pz + ps / 2), Y(c.conTop + 4), 22, 4, "p fb") : dRect(X(pz - ps / 2) - 4, Y(c.conTop + 30), 4, 30, "p fb") + dRect(X(pz - ps / 2) - 22, Y(c.conTop + 4), 22, 4, "p fb"));
  b += dRect(X(zB) + ps / 2, Y(y1), zA - zB - ps, ps, "p al");
  b += dRect(X(zB) - ps / 2, Y(yFb + 15), ps, 30, "p fb dash") + dRect(X(zA) - ps / 2, Y(c.btop), ps, c.beamH, "p fb dash") + dRect(X(zA) - ps / 2, Y(c.lowTop), ps, c.beamH, "p fb dash");
  b += dPoly([[X(zA + ps / 2), Y(y1)], [X(zA + ps / 2 - 70), Y(y1)], [X(zA + ps / 2), Y(y1 - 70)]]) + dPoly([[X(zB - ps / 2), Y(y1)], [X(zB - ps / 2 + 70), Y(y1)], [X(zB - ps / 2), Y(y1 - 70)]]);
  const hb = Y(yb0);
  b += dDim(X(z0), hb, X(z1), hb, 24, `${r1(z1 - z0)}`, 0, ["bridgeRear", .5]) + dDim(X(z0), hb, X(zB - ps / 2), hb, 50, `${r1(zB - ps / 2 - z0)}`, 1, ["bridgeRear"]) + dDim(X(zB - ps / 2), hb, X(zB + ps / 2), hb, 50, `${ps}`, 1) + dDim(X(zB + ps / 2), hb, X(zA - ps / 2), hb, 50, `${r1(zA - zB - ps)}`, 1, ["blockSpacing"]) + dDim(X(zA - ps / 2), hb, X(zA + ps / 2), hb, 50, `${ps}`, 1) + dDim(X(zA + ps / 2), hb, X(z1), hb, 50, `${r1(z1 - zA - ps / 2)}`, 1, ["bridgeRear"]);
  b += dDim(X(-bs / 2), hb, X(bs / 2), hb, 78, `${bs}`, 1, ["blockSpacing"]) + dDim(X(zB), hb, X(zA), hb, 102, `${r1(zA - zB)}`, 1, ["blockSpacing"]);
  const xr = X(z1) + 24;
  b += dDim(xr, Y(c.conTop), xr, Y(c.lowBeamY), 26, `${r1(c.lowBeamY - c.conTop)}`, 1, ["postH"]) + dDim(xr, Y(c.lowBeamY), xr, Y(c.topBeamY), 26, `${p.beamGap}`, 1, ["beamGap"]) + dDim(xr, Y(c.topBeamY), xr, Y(yFb), 26, `${c.postE}`, 1, ["postE"]) + dDim(xr, Y(c.conTop), xr, Y(yTop), 70, `${c.postLen}`, 0, ["postH"]) + dDim(xr, Y(yTop), xr, Y(y1), 26, `${ps}`, 1);
  const xl = X(z0) - 24;
  b += dDim(xl, Y(c.blockTop), xl, Y(c.conTop), -26, "30", 1) + dDim(xl, Y(yb0), xl, Y(c.blockTop), -26, "39", 1) + dDim(xl, Y(c.conTop), xl, Y(c.conTop + p.postH), -26, `${p.postH}`, 1, ["postH"]) + dDim(xl, Y(yb0), xl, Y(y1), -62, `${r1(y1 - yb0)}`, 0, ["postH"]);
  b += `<text x="${W / 2}" y="${H + 150 * K}" class="nt" text-anchor="middle">Side frame (front = left) · bridge 30×60 on two SBR20UU carriages · uprights A (rear, behind the bolts) and B (between the carriages) · side profile on top · corner plates 90 mm · angle connectors on the rear face of each upright</text>`;
  return svgDrawing(W, H, b);
}
function dwgPlanUpperAlu(p) {                                       // půdorys vrchní konstrukce: spojky, stojky, příčníky, kolejnice X, plexi
  const q = nasParts(p), c = q.c, ps = q.ps, bs = q.bs, half = q.half, postX = half + c.postDX, zA = c.postZ, zB = c.postZf, frontZ = zA - p.beamSize / 2 - c.railBar, plBack = frontZ - 50, plFront = plBack - p.plexiT;
  const xm = Math.max(p.railX / 2, postX + 40) + 20, zmax = c.bridgeZ1 + 10, zmin = Math.min(plFront, c.bridgeZ0) - 10, X = x => x + xm, Y = z => zmax - z, W = 2 * xm, H = zmax - zmin;
  dScale(W, [60, 50, 60, 120], 1100);
  let b = DEFS;
  for (const sx of [-1, 1]) {
    b += dRect(X(sx * (half + p.bridgeOff) - 30), Y(c.bridgeZ1), 60, c.bridgeL, "p al");
    for (const zc of [-bs / 2, bs / 2]) for (const a of [-1, 1]) for (const bb of [-1, 1]) b += dHole(X(sx * half + a * 17.5), Y(zc + bb * 17.5), 6.6);
    for (const pz of [zA, zB]) b += dRect(X(sx * postX - ps / 2), Y(pz + ps / 2), ps, ps, "p fb");
    b += dRect(X(sx * postX - ps / 2), Y(zA + ps / 2), ps, zA - zB + ps, "p al dash");
  }
  b += dRect(X(-c.inL / 2), Y(zA + p.beamSize / 2), c.inL, p.beamSize, "p al") + dRect(X(-c.inL / 2), Y(zB + p.beamSize / 2), c.inL, p.beamSize, "p al dash");
  b += dRect(X(-p.railX / 2), Y(frontZ - 7), p.railX, 20, "p") + dRect(X(-p.plexiW / 2), Y(plBack), p.plexiW, p.plexiT, "p pl");
  const yb = Y(c.bridgeZ0) + 6;
  b += dDim(X(-p.railX / 2), Y(zmax), X(p.railX / 2), Y(zmax), -22, `${p.railX}`, 0, ["railX"]) + dDim(X(-c.inL / 2), Y(zA - 4), X(c.inL / 2), Y(zA - 4), 26, `${c.inL}`, 1, ["sideSpan"]) + dDim(X(-postX), yb, X(postX), yb, 26, `${r1(2 * postX)}`, 1, ["sideSpan"]) + dDim(X(-p.plexiW / 2), Y(plBack - p.plexiT), X(p.plexiW / 2), Y(plBack - p.plexiT), 26, `${p.plexiW}`, 1, ["plexiW"]);
  const xr = X(postX + ps / 2 + 24);
  b += dDim(xr, Y(c.bridgeZ1), xr, Y(c.bridgeZ0), 26, `${r1(c.bridgeL)}`, 0, ["bridgeRear", .5]) + dDim(xr, Y(zA), xr, Y(zB), 26, `${r1(zA - zB)}`, 1, ["blockSpacing"]) + dDim(xr, Y(zA), xr, Y(frontZ), 60, `${r1(zA - frontZ)}`, 1);
  const xl = X(-postX - ps / 2 - 24);
  b += dDim(X(half - 17.5), Y(bs / 2 + 30), X(half + 17.5), Y(bs / 2 + 30), -22, "35", 1) + dDim(X(half), Y(zmin + 4), X(postX), Y(zmin + 4), 22, `${c.postDX}`, 1, ["bridgeOff"]) + dDim(X(half + 24), Y(zmin + 4), X(half + p.bridgeOff + 30), Y(zmin + 4), 22, `${p.bridgeOff + 6}`, 1, ["bridgeOff"]);
  b += `<text x="${W / 2}" y="${H + 100 * K}" class="nt" text-anchor="middle">Plan of the upper structure (rear at the top) · bridges 30×60, uprights A and B, cross profiles (rear 3060 on edge, front 3030), X rail support bars and rails, plexiglass plate</text>`;
  return svgDrawing(W, H, b);
}
function dwgUAlu(p, front) {                                        // nárys zadního (nese kolejnice) nebo předního U
  const q = nasParts(p), c = q.c, ps = q.ps, postX = q.half + c.postDX, yTop = c.conTop + c.postLen, W = 2 * postX + ps, H = c.postLen, X = x => x + postX + ps / 2, Y = y => yTop - y, bh = c.beamH, yFb = c.topBeamY + c.postE;
  dScale(W, [150, 50, 130, 110], 1000);
  let b = DEFS + dRect(0, Y(yTop), ps, c.postLen, "p al") + dRect(W - ps, Y(yTop), ps, c.postLen, "p al");
  const tri = (sx, y, leg) => dPoly([[sx < 0 ? 0 : W, Y(y)], [sx < 0 ? leg : W - leg, Y(y)], [sx < 0 ? 0 : W, Y(y) + leg]]);
  const xr = W + 24;
  if (front) {
    b += dRect(ps, Y(yFb + 15), c.inL, 30, "p al") + tri(-1, yFb + 15, 90) + tri(1, yFb + 15, 90);
    b += dDim(ps, Y(yFb + 15), W - ps, Y(yFb + 15), -26, `${c.inL}`, 0, ["sideSpan"]) + dDim(xr, Y(c.conTop), xr, Y(yFb), 26, `${r1(yFb - c.conTop)}`, 1, ["postH"]) + dDim(xr, Y(yFb), xr, Y(yTop), 26, `${r1(yTop - yFb)}`, 1);
    b += `<text x="${W / 2}" y="${H + 100 * K}" class="nt" text-anchor="middle">Front U – cross profile 30×30 flush with the top of the uprights, raised ${c.postE} mm so the spindle passes under it in the home position · corner plates 90 mm</text>`;
  } else {
    for (const by of [c.topBeamY, c.lowBeamY]) b += dRect(ps, Y(by + c.beamDY + bh / 2), c.inL, bh, "p al") + dRect(ps, Y(by + 10), c.inL, 20, "p fb dash");   // přerušovaně kolejnice SBR20 (osa v by)
    b += tri(-1, c.btop, 90) + tri(1, c.btop, 90) + tri(-1, c.lowTop, 55) + tri(1, c.lowTop, 55);
    b += dRect(W / 2 - p.plexiW / 2, Y(c.plexiCY + p.plexiH / 2), p.plexiW, p.plexiH, "p pl dash");
    b += dDim(ps, Y(c.btop), W - ps, Y(c.btop), -26, `${c.inL}`, 0, ["sideSpan"]) + dDim(0, Y(yTop), W, Y(yTop), -52, `${r1(W)}`, 1, ["sideSpan"]);
    b += dDim(xr, Y(c.conTop), xr, Y(c.lowBeamY), 26, `${r1(c.lowBeamY - c.conTop)}`, 1, ["postH"]) + dDim(xr, Y(c.lowBeamY), xr, Y(c.topBeamY), 26, `${p.beamGap}`, 1, ["beamGap"]) + dDim(xr, Y(c.topBeamY), xr, Y(yTop), 26, `${r1(yTop - c.topBeamY)}`, 1, ["postE", 1]) + dDim(xr, Y(c.conTop), xr, Y(yTop), 70, `${c.postLen}`, 0, ["postH"]);
    b += dDim(-24, Y(c.btop), -24, Y(c.btop - bh), -26, `${bh}`, 1) + dDim(W / 2 - p.plexiW / 2, Y(c.plexiCY - p.plexiH / 2), W / 2 + p.plexiW / 2, Y(c.plexiCY - p.plexiH / 2), 30, `${p.plexiW}`, 1, ["plexiW"]);
    b += `<text x="${W / 2}" y="${H + 100 * K}" class="nt" text-anchor="middle">Rear U (front view) – cross profiles 30×30 carry the X rails directly (rail 15 mm above the profile axis, one row of holes in the slot) · corner plates 90 mm (top) and 55 mm (lower) · plexiglass outline dashed</text>`;
  }
  return svgDrawing(W, H, b);
}
function dwgJointsAlu(p) {                                          // spojovací díly: rohové desky, plochá deska, úhelník
  const c = nasCalc(p), W = 460, H = 130;
  dScale(W, [20, 30, 20, 100], 1000);
  const Y = y => 100 - y;
  let b = DEFS;
  const plate = (x0, leg) => { const f = [.3, .6]; let s = dPoly([[x0, Y(0)], [x0 + leg, Y(0)], [x0, Y(leg)]], "p al"); for (const a of f) { s += dHole(x0 + 15, Y(leg * a), 6.5) + dHole(x0 + leg * a, Y(15), 6.5); } return s; };
  b += plate(0, 90) + dDim(0, Y(0), 90, Y(0), 20, "90") + dDim(0, Y(90), 0, Y(0), -22, "90") + dDim(0, Y(27), 15, Y(27), -12, "15", 1) + dDim(0, Y(0), 0, Y(27), -50, "27", 1);
  b += plate(130, 55) + dDim(130, Y(0), 185, Y(0), 20, "55") + dDim(130, Y(55), 130, Y(0), -22, "55");
  b += dRect(240, Y(70), 40, 70, "p al") + [[-12, 25], [12, 25], [0, 55], [0, 30]].map(([dx, yy]) => dHole(260 + dx, Y(yy), 6.5)).join("") + dDim(240, Y(0), 280, Y(0), 20, "40") + dDim(280, Y(70), 280, Y(0), 22, "70") + dDim(240, Y(25), 260, Y(25), -12, "20", 1);
  b += dPoly([[330, Y(0)], [352, Y(0)], [352, Y(4)], [334, Y(4)], [334, Y(30)], [330, Y(30)]], "p al") + dHole(332, Y(15), 6.5) + dDim(330, Y(0), 352, Y(0), 20, "22", 1) + dDim(334, Y(30), 334, Y(0), 28, "30", 1);
  b += `<text x="${W / 2}" y="${H}" class="nt" text-anchor="middle">Left to right: corner plate 90 (×9), corner plate 55 (×2), flat connecting plate 40×70 (×5), angle connector in the slots (×6, 20 mm wide) · Al plate 4 mm, holes Ø6.5 for M6 and T-nuts</text>`;
  return svgDrawing(W, H, b);
}

function renderDrawings(v) {
  const p = getParams(v), rows = nasCutList(p);
  return `<div class="dwgs">
    <div class="tablewrap"><table class="table cut"><thead><tr><th>Part</th><th>Material</th><th class="num">Length / size [mm]</th><th class="num">Qty</th><th>Note</th></tr></thead><tbody>${rows.map(r => `<tr><td><b>${esc(r[0])}</b></td><td>${esc(r[1])}</td><td class="num">${esc(String(r[2]))}</td><td class="num">${r[3]}</td><td class="muted">${esc(r[4])}</td></tr>`).join("")}</tbody></table></div>
    <div class="dgrid">
      ${p.alu ? `<figure class="dcard wide"><figcaption>Upper structure – side frame (bokorys)</figcaption>${dwgSideFrameAlu(p)}</figure>
      <figure class="dcard wide"><figcaption>Upper structure – plan (půdorys)</figcaption>${dwgPlanUpperAlu(p)}</figure>
      <figure class="dcard"><figcaption>Rear U – carries the X rails</figcaption>${dwgUAlu(p, false)}</figure>
      <figure class="dcard"><figcaption>Front U – cross profile above the spindle</figcaption>${dwgUAlu(p, true)}</figure>
      <figure class="dcard wide"><figcaption>Connecting parts – plates and angle connector</figcaption>${dwgJointsAlu(p)}</figure>` : `<figure class="dcard wide"><figcaption>Gantry frame – front view</figcaption>${dwgGantry(p)}</figure>`}
      <figure class="dcard wide"><figcaption>${p.alu ? "Y carriage bridge – Al profile 30×60" : "Y carriage weldment – side view"}</figcaption>${dwgYSide(p)}</figure>
      <figure class="dcard"><figcaption>X carriage plate (plexiglass)</figcaption>${dwgPlexi(p)}</figure>
      ${p.zPlate ? `<figure class="dcard"><figcaption>Spindle plate – steel 200×100×5</figcaption>${dwgZPlate()}</figure>` : `<figure class="dcard"><figcaption>Spindle adapter plate</figcaption>${dwgAdapter()}</figure>`}
      ${p.alu ? "" : `<figure class="dcard wide"><figcaption>X rail support – flat bar 50×6</figcaption>${dwgXBar(p)}</figure>`}
    </div>
    <p class="znote">Rozměry jsou spočítané z aktuálních parametrů návrhu. Díry pro kolejnice a vozíky před vrtáním ověřte na skutečném dílu.</p>
  </div>`;
}
