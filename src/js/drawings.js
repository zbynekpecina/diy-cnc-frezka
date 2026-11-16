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
function dDim(x1, y1, x2, y2, off, text, small) {
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
  const inL = p.sideSpan - ps, barX = Math.min(p.railX, inL);
  const braceTop = Math.min(c.conTop + p.postH * .6, c.lowBeamY - bsz / 2 - 15);
  const braceDy = braceTop - (c.conTop - 12.5), braceL = Math.hypot(bs, braceDy), braceA = Math.atan2(braceDy, bs) * 180 / Math.PI;
  const yE = p.railY / 2 + 50, yC = c.blockTop + c.barT + 12.5, mY0 = c.sideTop - PR / 2, mT = yC + 46;
  const extL = yE + 12.5 - p.deckL / 2 - 5, motUp = mT - (mY0 + 12.5), idlUp = (yC + 28) - (mY0 + 12.5);
  const beamZ = bs / 2, frontZ = beamZ - bsz / 2 - 6, hTopY = c.topBeamY + 470, hBackZ = beamZ + bsz / 2 + 32, hArmZ = frontZ - 190;
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
  return [
    ["Y carriage plate", "flat bar 50×6", q.bs + 50, 2, "8 holes Ø6.6 for SBR20UU (35×35), see drawing"],
    ["Carriage bridge", "tube 25×25×2", q.bs + 50, 2, "welded on carriage plate"],
    ["Upright", `tube ${q.ps}×${q.ps}×2`, p.postH, 2, "welded on rear end of bridge"],
    ["Brace", "tube 25×25×2", r1(q.braceL), 2, `axis length · angle ${r1(q.braceA)}° to bridge`],
    ["Cross tube", `tube ${q.bsz}×${q.bsz}×2`, q.inL, 2, `between uprights, spacing ${p.beamGap} mm (centre to centre)`],
    ["X rail support", "flat bar 50×6", q.barX, 2, `${q.railHoles.length} × 2 holes M5 (rail pitch 150, rows ±15)`],
    ["Y end extension", "tube 25×25×2", r1(q.extL), 4, "from side profile end face to motor / idler tube"],
    ["Y motor tube (vertical)", "tube 25×25×2", r1(q.motUp), 2, "C-bracket for NEMA23"],
    ["Y idler tube (vertical)", "tube 25×25×2", r1(q.idlUp), 2, "slotted plate, M6 tensioner"],
    ["Display arm – vertical", "tube 25×25×2", r1(q.dispUp), 1, "continues Y1 motor tube"],
    ["Display arm – horizontal", "tube 25×25×2", 200, 1, "inverted L, display mount at end"],
    ["Hose holder – vertical", "tube 20×20×2", r1(q.hoseUp), 1, "centred behind top cross tube, 22 mm spacer"],
    ["Hose holder – arm", "tube 20×20×2", r1(q.hoseArm), 1, "eyelet Ø52 above spindle"],
    ["X carriage plate", `plexiglass ${p.plexiT} mm`, `${p.plexiW} × ${p.plexiH}`, 1, `${q.plexi.length} holes Ø6.6, see drawing`],
    ["Spindle adapter", "Al plate 10 mm", "120 × 175", 1, "4× M5 countersunk + 8× M6 tapped"],
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
  b += `<text x="${Wt / 2}" y="${Ht + 60 * K}" class="nt" text-anchor="middle">Front view · uprights ${ps}×${ps} · cross tubes ${bsz}×${bsz} welded between uprights · dimensions to tube centre lines where marked</text>`;
  return svgDrawing(Wt, Ht, b);
}
function dwgYSide(p) {
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

function renderDrawings(v) {
  const p = getParams(v), rows = nasCutList(p);
  return `<div class="dwgs">
    <div class="tablewrap"><table class="table cut"><thead><tr><th>Part</th><th>Material</th><th class="num">Length / size [mm]</th><th class="num">Qty</th><th>Note</th></tr></thead><tbody>${rows.map(r => `<tr><td><b>${esc(r[0])}</b></td><td>${esc(r[1])}</td><td class="num">${esc(String(r[2]))}</td><td class="num">${r[3]}</td><td class="muted">${esc(r[4])}</td></tr>`).join("")}</tbody></table></div>
    <div class="dgrid">
      <figure class="dcard wide"><figcaption>Gantry frame – front view</figcaption>${dwgGantry(p)}</figure>
      <figure class="dcard wide"><figcaption>Y carriage weldment – side view</figcaption>${dwgYSide(p)}</figure>
      <figure class="dcard"><figcaption>X carriage plate (plexiglass)</figcaption>${dwgPlexi(p)}</figure>
      <figure class="dcard"><figcaption>Spindle adapter plate</figcaption>${dwgAdapter()}</figure>
      <figure class="dcard wide"><figcaption>X rail support – flat bar 50×6</figcaption>${dwgXBar(p)}</figure>
    </div>
    <p class="znote">Rozměry jsou spočítané z aktuálních parametrů návrhu. Díry pro kolejnice a vozíky před vrtáním ověřte na skutečném dílu.</p>
  </div>`;
}
