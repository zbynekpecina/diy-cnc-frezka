/* =====================================================================
   INTERAKTIVNÍ SCHÉMATA POD 3D ANIMACÍ – nárys, bokorys a půdorys s kótami
   Vše se kreslí z parametrů návrhu (getParams + nasCalc), stejně jako 3D model. Hodnoty u kót s parametrem jdou upravit přímo:
   klik na číslo = zápis, tlačítka − / + s dynamickým krokem (1800 → 100, 300 → 10). Změna přepočítá model, animaci i výkresy.
   Souřadnice: svět v mm, y nahoru; ctx.X/ctx.Y převádějí na souřadnice SVG.
   ===================================================================== */
function scStep(val) { return Math.max(1, 10 ** (Math.floor(Math.log10(Math.max(val, 1))) - 1)); }
function scCtx(x0, x1, y0, y1) {
  const w = x1 - x0, h = y1 - y0, K = w / 1100;
  return {K, w, h, X: x => x - x0, Y: y => y1 - y, out: [], defs: `<defs><marker id="sda" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 2 L9 5 L0 8" fill="none" stroke="#d97706" stroke-width="1.4"/></marker></defs>`};
}
function scBox(c, x, y, w, h, cls = "p", extra = "") { c.out.push(`<rect x="${c.X(x)}" y="${c.Y(y + h)}" width="${w}" height="${h}" class="${cls}" ${extra}/>`); }
function scLine(c, x1, y1, x2, y2, cls = "c") { c.out.push(`<path d="M${c.X(x1)} ${c.Y(y1)}L${c.X(x2)} ${c.Y(y2)}" class="${cls}"/>`); }
function scPoly(c, pts, cls = "p") { c.out.push(`<path d="M${pts.map(([x, y]) => `${c.X(x)} ${c.Y(y)}`).join("L")}Z" class="${cls}"/>`); }
function scCirc(c, x, y, r, cls = "p") { c.out.push(`<circle cx="${c.X(x)}" cy="${c.Y(y)}" r="${r}" class="${cls}"/>`); }
/* kóta: body A, B (svět), odsazení off v px kolmo k úsečce, hodnota val; s klíčem key je upravitelná */
function scDim(c, A, B, off, val, key, p, sc = 1) {
  const K = c.K, ax = c.X(A[0]), ay = c.Y(A[1]), bx = c.X(B[0]), by = c.Y(B[1]), dx = bx - ax, dy = by - ay, L = Math.hypot(dx, dy) || 1, nx = -dy / L, ny = dx / L, o = off * K;
  const a2 = [ax + nx * o, ay + ny * o], b2 = [bx + nx * o, by + ny * o], g = 4 * K * Math.sign(o || 1), mx = (a2[0] + b2[0]) / 2, my = (a2[1] + b2[1]) / 2;
  const txt = String(Math.round(val * 10) / 10), lw = (txt.length * 7.4 + 10) * K, lh = 15 * K, bw = 14 * K;
  const ed = key && p;
  let s = `<g class="sdim${ed ? " edit" : ""}"${ed ? ` data-k="${key}" data-v="${val}" data-pv="${p[key]}" data-s="${sc}"` : ""}>`;
  s += `<path d="M${ax} ${ay}L${a2[0] + nx * g} ${a2[1] + ny * g}M${bx} ${by}L${b2[0] + nx * g} ${b2[1] + ny * g}" class="ext"/>`;
  s += `<path d="M${a2[0]} ${a2[1]}L${b2[0]} ${b2[1]}" class="dl" marker-start="url(#${c.marker || "sda"})" marker-end="url(#${c.marker || "sda"})"/>`;
  s += `<rect x="${mx - lw / 2}" y="${my - lh / 2}" width="${lw}" height="${lh}" rx="${3 * K}" class="slab"/><text x="${mx}" y="${my + 4 * K}" class="sv" text-anchor="middle">${txt}</text>`;
  if (ed) {
    s += `<g class="sbtn" data-d="-1"><rect x="${mx - lw / 2 - bw - 2 * K}" y="${my - lh / 2}" width="${bw}" height="${lh}" rx="${3 * K}"/><text x="${mx - lw / 2 - bw / 2 - 2 * K}" y="${my + 4.5 * K}" text-anchor="middle">−</text></g>`;
    s += `<g class="sbtn" data-d="1"><rect x="${mx + lw / 2 + 2 * K}" y="${my - lh / 2}" width="${bw}" height="${lh}" rx="${3 * K}"/><text x="${mx + lw / 2 + bw / 2 + 2 * K}" y="${my + 4.5 * K}" text-anchor="middle">+</text></g>`;
  }
  c.out.push(s + "</g>");
}
const scSvg = (c, cap) => `<figure class="dcard wide sch"><figcaption>${cap}</figcaption><svg class="dwg schv" viewBox="0 0 ${c.w} ${c.h}" style="--k:${c.K}" xmlns="http://www.w3.org/2000/svg">${c.defs}${c.out.join("")}</svg></figure>`;

function schemaGeom(p) {
  const c = nasCalc(p), alu = !!p.alu, half = p.sideSpan / 2, ps = p.postSize, bsz = p.beamSize, bh = c.beamH, bs = p.blockSpacing;
  const postX = half + c.postDX, zA = c.postZ, zB = alu ? c.postZf : null, frontZ = zA - bsz / 2 - c.railBar, plBack = frontZ - 50, plFront = plBack - p.plexiT;
  const yTop = c.conTop + c.postLen, yFb = c.topBeamY + c.postE, tW = p.sideSpan + 260, tL = p.deckL + 260, tTop = p.frameH - 40;
  const spZ = -103, toolOff = plFront + spZ, hoseTop = alu ? yTop + p.hoseH : yTop;
  return {c, alu, half, ps, bsz, bh, bs, postX, zA, zB, frontZ, plBack, plFront, yTop, yFb, tW, tL, tTop, spZ, toolOff, hoseTop};
}

/* nárys: pohled z přední strany (od obsluhy), osa x vodorovně */
function schemaFront(p) {
  const g = schemaGeom(p), c = g.c, {half, ps, bh, postX, yTop, yFb, tW, tTop, hoseTop} = g, xm = Math.max(tW / 2, p.railX / 2, postX + 60) + 90;
  const y0 = p.frameH - 230, y1 = hoseTop + 70, S = scCtx(-xm, xm, y0, y1), fy = p.frameH - 20;
  scBox(S, -tW / 2, tTop - 30, tW, 30, "p wood");                                                         // dřevěný stůl
  for (const sx of [-1, 1]) scBox(S, sx * (tW / 2 - 60) - 35, y0, 70, tTop - 30 - y0, "p wood");           // nohy (useknuté)
  scBox(S, -p.deckW / 2, p.frameH, p.deckW, 18, "p fb");                                                     // deska stolu
  for (const sx of [-1, 1]) { scBox(S, sx * (p.deckW / 2 + 20) - 20, fy - 20, 40, 40, "p al"); scBox(S, sx * (half + 20) - 20, c.sideTop - 40, 40, 40, "p al"); }   // spodní a boční profil 40×40
  for (const sx of [-1, 1]) {
    scBox(S, sx * half - 22.5, c.sideTop, 45, 8, "p al"); scBox(S, sx * half - 10, c.sideTop + 8, 20, 19, "p al");      // kolejnice SBR20
    scBox(S, sx * half - 24, c.sideTop + 11, 48, 39, "p fb");                                                          // vozík SBR20UU
    if (g.alu) { scBox(S, sx * (half + p.bridgeOff) - 30, c.blockTop, 60, 30, "p al"); scBox(S, sx * postX - ps / 2, c.conTop, ps, c.postLen, "p al"); }
    else { scBox(S, sx * half - 25, c.blockTop, 50, 6, "p fb"); scBox(S, sx * half - 12.5, c.blockTop + 6, 25, 25, "p"); scBox(S, sx * half - ps / 2, c.conTop, ps, p.postH, "p"); }
  }
  for (const by of [c.topBeamY, c.lowBeamY]) { scBox(S, -c.inL / 2, by + c.beamDY - bh / 2, c.inL, bh, "p al"); if (!g.alu) scBox(S, -c.inL / 2, by - 25, c.inL, 50, "p fb dash"); scBox(S, -p.railX / 2, by - 10, p.railX, 20, "p"); for (const sx of [-1, 1]) scBox(S, sx * c.bx - 25, by - 24, 50, 48, "p fb"); }
  if (g.alu) { scBox(S, -c.inL / 2, yFb - 15, c.inL, 30, "p al dash"); for (const sx of [-1, 1]) scBox(S, sx * postX - ps / 2, yTop - ps, ps, ps, "p al"); }
  scBox(S, -p.plexiW / 2, c.plexiCY - p.plexiH / 2, p.plexiW, p.plexiH, "p pl");                          // plexi
  scBox(S, -40, c.modCY - c.zLen / 2, 80, c.zLen, "p al");                                                // modul Z
  scBox(S, -41, c.spBot, 82, 166, "p al"); scBox(S, -4, c.tipHigh, 8, 108, "p");                          // vřeteno (horní poloha Z) + frézka
  scBox(S, -41, c.spBot - p.zStroke, 82, 166, "p dash"); scBox(S, -4, c.tipLow, 8, 108, "p dash");        // dolní poloha
  scBox(S, -p.workW / 2, c.deckTop, p.workW, p.workT, "p wood");                                          // obrobek
  if (g.alu) { scBox(S, -postX - ps / 2, yTop, ps, p.hoseH, "p al"); scBox(S, -postX + ps / 2, hoseTop - ps, p.hoseArm, ps, "p al"); }
  // kóty
  scDim(S, [-p.deckW / 2, c.deckTop + p.workT + 6], [p.deckW / 2, c.deckTop + p.workT + 6], -60, p.deckW, "deckW", p);
  scDim(S, [-half, c.sideTop - 40], [half, c.sideTop - 40], 40, p.sideSpan, "sideSpan", p);
  scDim(S, [-p.workW / 2, c.deckTop + p.workT], [p.workW / 2, c.deckTop + p.workT], -38, p.workW, "workW", p);
  scDim(S, [p.workW / 2 + 20, c.deckTop], [p.workW / 2 + 20, c.deckTop + p.workT], 20, p.workT, "workT", p);
  scDim(S, [-tW / 2, y0], [-tW / 2, p.frameH], -30, p.frameH, "frameH", p);
  scDim(S, [-postX - ps / 2 - 10, c.conTop], [-postX - ps / 2 - 10, c.conTop + p.postH], -40, p.postH, "postH", p);
  scDim(S, [postX + ps / 2 + 10, c.conTop], [postX + ps / 2 + 10, c.lowBeamY], 40, c.lowBeamY - c.conTop, "postH", p);
  scDim(S, [postX + ps / 2 + 10, c.lowBeamY], [postX + ps / 2 + 10, c.topBeamY], 40, p.beamGap, "beamGap", p);
  if (g.alu) { scDim(S, [postX + ps / 2 + 10, c.conTop], [postX + ps / 2 + 10, yTop], 90, c.postLen, "postH", p); scDim(S, [postX + ps / 2 + 10, c.topBeamY], [postX + ps / 2 + 10, yFb], 40, c.postE, "postE", p); }
  scDim(S, [-p.plexiW / 2, c.plexiCY + p.plexiH / 2], [p.plexiW / 2, c.plexiCY + p.plexiH / 2], -30, p.plexiW, "plexiW", p);
  scDim(S, [p.plexiW / 2, c.plexiCY - p.plexiH / 2], [p.plexiW / 2, c.plexiCY + p.plexiH / 2], 40, p.plexiH, "plexiH", p);
  scDim(S, [-p.railX / 2, c.topBeamY + bh / 2 + 25], [p.railX / 2, c.topBeamY + bh / 2 + 25], -45, p.railX, "railX", p);
  scDim(S, [-c.inL / 2, c.lowBot - 8], [c.inL / 2, c.lowBot - 8], 40, c.inL, "sideSpan", p);
  scDim(S, [-postX, yTop + 30], [postX, yTop + 30], -40, 2 * postX, "sideSpan", p);
  scDim(S, [60, c.tipHigh], [60, c.tipLow], 30, p.zStroke, "zStroke", p);
  scDim(S, [-c.cutW / 2, c.deckTop - 5], [c.cutW / 2, c.deckTop - 5], 70, c.cutW, "sideSpan", p);
  if (g.alu) scDim(S, [-postX - ps / 2 - 10, yTop], [-postX - ps / 2 - 10, hoseTop], -40, p.hoseH, "hoseH", p);
  if (g.alu) scDim(S, [-postX + ps / 2, hoseTop + 10], [-postX + ps / 2 + p.hoseArm, hoseTop + 10], -35, p.hoseArm, "hoseArm", p);
  scDim(S, [-xm + 70, c.deckTop], [-xm + 70, hoseTop], 25, hoseTop - c.deckTop, g.alu ? "hoseH" : "postH", p);
  return scSvg(S, "Nárys (pohled zepředu) – dvojklik/klik na číslo upraví hodnotu");
}

/* bokorys: osa z vodorovně, vpředu (−z, strana obsluhy a nástroje) vlevo */
function schemaSide(p) {
  const g = schemaGeom(p), c = g.c, {ps, bs, zA, zB, frontZ, plBack, plFront, yTop, yFb, tL, tTop, hoseTop, toolOff} = g, zm = tL / 2 + 80, bh = g.bh;
  const y0 = p.frameH - 150, y1 = hoseTop + 70, S = scCtx(-zm, zm, y0, y1), fy = p.frameH - 20;
  scBox(S, -tL / 2, tTop - 30, tL, 30, "p wood");
  scBox(S, -p.deckL / 2, p.frameH, p.deckL, 18, "p fb"); scBox(S, -p.deckL / 2, c.sideTop - 40, p.deckL, 40, "p al");
  scBox(S, -p.railY / 2, c.sideTop, p.railY, 27, "p al");
  for (const zc of [-bs / 2, bs / 2]) scBox(S, zc - 25, c.sideTop + 11, 50, 39, "p fb");
  if (g.alu) {
    scBox(S, c.bridgeZ0, c.blockTop, c.bridgeL, 30, "p al");
    for (const pz of [zA, zB]) scBox(S, pz - ps / 2, c.conTop, ps, c.postLen, "p al");
    scBox(S, zB + ps / 2, yTop - ps, zA - zB - ps, ps, "p al");
    scBox(S, zB - ps / 2, yFb - 15, ps, 30, "p al dash");
    scPoly(S, [[zA + ps / 2, c.btop], [zA + ps / 2 - 90, c.btop], [zA + ps / 2, c.btop - 90]], "p fb");
    scBox(S, zA - ps / 2, yTop, ps, p.hoseH, "p al dash");
  } else {
    scBox(S, -bs / 2 - 25, c.blockTop, bs + 50, 6, "p fb"); scBox(S, -bs / 2 - 25, c.blockTop + 6, bs + 50, 25, "p"); scBox(S, zA - ps / 2, c.conTop, ps, p.postH, "p");
    scLine(S, -bs / 2, c.conTop - 12, zA, Math.min(c.conTop + p.postH * .6, c.lowBeamY - 27), "br");
  }
  for (const by of [c.topBeamY, c.lowBeamY]) { scBox(S, zA - ps / 2, by + c.beamDY - bh / 2, ps, bh, "p al"); if (!g.alu) scBox(S, frontZ, by - 25, 6, 50, "p fb"); scBox(S, frontZ - 22, by - 10, 22, 20, "p"); scBox(S, frontZ - 54, by - 24, 50, 48, "p fb"); }
  scBox(S, plFront, c.plexiCY - p.plexiH / 2, p.plexiT, p.plexiH, "p pl");
  scBox(S, plFront - 70, c.modCY - c.zLen / 2, 70, c.zLen, "p al");
  scBox(S, plFront - 140, c.spBot, 82, 166, "p al"); scBox(S, plFront - 103 - 4, c.tipHigh, 8, 108, "p");
  scBox(S, plFront - 140, c.spBot - p.zStroke, 82, 166, "p dash"); scBox(S, plFront - 103 - 4, c.tipLow, 8, 108, "p dash");
  scBox(S, -p.workL / 2, c.deckTop, p.workL, p.workT, "p wood");
  const wa0 = -c.travelY / 2 + toolOff - 19.5, wa1 = c.travelY / 2 + toolOff + 19.5;
  scLine(S, wa0, c.deckTop - 22, wa1, c.deckTop - 22, "wa");
  // kóty
  scDim(S, [-p.deckL / 2, tTop - 30], [p.deckL / 2, tTop - 30], -70, p.deckL, "deckL", p);
  scDim(S, [-p.railY / 2, c.sideTop + 27], [p.railY / 2, c.sideTop + 27], 40, p.railY, "railY", p);
  scDim(S, [-bs / 2, c.sideTop + 52], [bs / 2, c.sideTop + 52], 30, bs, "blockSpacing", p);
  scDim(S, [-p.workL / 2, c.deckTop + p.workT], [p.workL / 2, c.deckTop + p.workT], -40, p.workL, "workL", p);
  scDim(S, [wa0, c.deckTop - 22], [wa1, c.deckTop - 22], 28, wa1 - wa0, "railY", p);
  scDim(S, [-p.railY / 2, c.sideTop - 40], [-p.railY / 2 + (p.railY / 2 - c.travelY / 2) * 0 + c.travelY, c.sideTop - 40], 34, c.travelY, "railY", p);
  if (g.alu) {
    scDim(S, [c.bridgeZ0, c.conTop], [c.bridgeZ1, c.conTop], 62, c.bridgeL, "bridgeRear", p, .5);
    scDim(S, [zB, c.conTop], [zA, c.conTop], 36, zA - zB, "blockSpacing", p);
    scDim(S, [zA + ps / 2, c.blockTop], [c.bridgeZ1, c.blockTop], -26, c.bridgeZ1 - zA - ps / 2, "bridgeRear", p);
    scDim(S, [zA + ps / 2 + 12, c.conTop], [zA + ps / 2 + 12, c.conTop + p.postH], 36, p.postH, "postH", p);
    scDim(S, [zA + ps / 2 + 12, c.conTop + p.postH], [zA + ps / 2 + 12, yTop], 36, c.postE, "postE", p);
    scDim(S, [zA - ps / 2 - 12, yTop], [zA - ps / 2 - 12, hoseTop], -40, p.hoseH, "hoseH", p);
  } else scDim(S, [zA + ps / 2 + 12, c.conTop], [zA + ps / 2 + 12, c.conTop + p.postH], 36, p.postH, "postH", p);
  scDim(S, [zA + ps / 2 + 90, c.lowBeamY], [zA + ps / 2 + 90, c.topBeamY], 36, p.beamGap, "beamGap", p);
  scDim(S, [plFront - 140, c.spBot - p.zStroke], [plFront - 140 + 0, c.spBot], -40, p.zStroke, "zStroke", p);
  scDim(S, [plFront, c.plexiCY - p.plexiH / 2 - 10], [plBack, c.plexiCY - p.plexiH / 2 - 10], 28, p.plexiT, "plexiT", p);
  scDim(S, [zm - 30, c.deckTop], [zm - 30, hoseTop], 20, hoseTop - c.deckTop, g.alu ? "hoseH" : "postH", p);
  return scSvg(S, "Bokorys (vlevo strana obsluhy a nástroje, vpravo zadní strana)");
}

/* půdorys: stejná vodorovná osa z jako bokorys, osa x svisle */
function schemaPlan(p) {
  const g = schemaGeom(p), c = g.c, {half, ps, bsz, bs, postX, zA, zB, frontZ, plBack, plFront, tW, tL, toolOff} = g, zm = tL / 2 + 80, xm = Math.max(tW / 2, p.railX / 2, postX + p.hoseArm) + 90;
  const S = scCtx(-zm, zm, -xm, xm);
  scBox(S, -tL / 2, -tW / 2, tL, tW, "p wood"); scBox(S, -p.deckL / 2, -p.deckW / 2, p.deckL, p.deckW, "p fb");
  for (const sx of [-1, 1]) { scBox(S, -p.deckL / 2, sx * (p.deckW / 2 + 20) - 20, p.deckL, 40, "p al"); scBox(S, -p.deckL / 2, sx * (half + 20) - 20, p.deckL, 40, "p al"); scBox(S, -p.railY / 2, sx * half - 22.5, p.railY, 45, "p al"); }
  scBox(S, -p.workL / 2, -p.workW / 2, p.workL, p.workW, "p wood dash");
  const wa0 = -c.travelY / 2 + toolOff - 19.5, wa1 = c.travelY / 2 + toolOff + 19.5;
  scBox(S, wa0, -c.cutW / 2, wa1 - wa0, c.cutW, "p wa");
  for (const sx of [-1, 1]) {
    for (const zc of [-bs / 2, bs / 2]) scBox(S, zc - 25, sx * half - 24, 50, 48, "p fb");
    if (g.alu) {
      scBox(S, c.bridgeZ0, sx * (half + p.bridgeOff) - 30, c.bridgeL, 60, "p al");
      for (const pz of [zA, zB]) scBox(S, pz - ps / 2, sx * postX - ps / 2, ps, ps, "p fb");
      scBox(S, zB - ps / 2, sx * postX - ps / 2, zA - zB + ps, ps, "p al dash");
      for (const zc of [-bs / 2, bs / 2]) for (const a of [-1, 1]) for (const b of [-1, 1]) scCirc(S, zc + a * 17.5, sx * half + b * 17.5, 3.3, "h");
    } else { scBox(S, -bs / 2 - 25, sx * half - 25, bs + 50, 50, "p fb"); scBox(S, zA - ps / 2, sx * half - ps / 2, ps, ps, "p"); }
  }
  scBox(S, zA - bsz / 2, -c.inL / 2, bsz, c.inL, "p al");
  if (g.alu) scBox(S, zB - bsz / 2, -c.inL / 2, bsz, c.inL, "p al dash");
  if (!g.alu) scBox(S, frontZ, -c.inL / 2, 6, c.inL, "p fb"); scBox(S, frontZ - 27, -p.railX / 2, 20, p.railX, "p");
  scBox(S, plFront, -p.plexiW / 2, p.plexiT, p.plexiW, "p pl"); scBox(S, plFront - 70, -40, 70, 80, "p al");
  scCirc(S, plFront - 103, 0, 41, "p al"); scCirc(S, plFront - 103, 0, 19.5, "p dash");
  if (g.alu) { scBox(S, zA - ps / 2, -postX - ps / 2, ps, ps, "p al"); scBox(S, zA - ps / 2, -postX + ps / 2, ps, p.hoseArm, "p al dash"); }
  scLine(S, -zm, 0, zm, 0, "c");
  // kóty
  scDim(S, [-p.deckL / 2, tW / 2], [p.deckL / 2, tW / 2], -34, p.deckL, "deckL", p);
  scDim(S, [-tL / 2, -p.deckW / 2], [-tL / 2, p.deckW / 2], -34, p.deckW, "deckW", p);
  scDim(S, [-p.deckL / 2 - 30, -half], [-p.deckL / 2 - 30, half], -50, p.sideSpan, "sideSpan", p);
  scDim(S, [-p.railY / 2, half + 40], [p.railY / 2, half + 40], -26, p.railY, "railY", p);
  scDim(S, [-bs / 2, half + 5], [bs / 2, half + 5], -34, bs, "blockSpacing", p);
  scDim(S, [-p.workL / 2, p.workW / 2], [p.workL / 2, p.workW / 2], -78, p.workL, "workL", p);
  scDim(S, [p.workL / 2 + 20, -p.workW / 2], [p.workL / 2 + 20, p.workW / 2], -40, p.workW, "workW", p);
  scDim(S, [wa0, -c.cutW / 2], [wa1, -c.cutW / 2], 60, wa1 - wa0, "railY", p);
  scDim(S, [wa1 + 12, -c.cutW / 2], [wa1 + 12, c.cutW / 2], -34, c.cutW, "sideSpan", p);
  if (g.alu) {
    scDim(S, [c.bridgeZ0, -half - p.bridgeOff - 30], [c.bridgeZ1, -half - p.bridgeOff - 30], 22, c.bridgeL, "bridgeRear", p, .5);
    scDim(S, [zB, -postX - ps / 2], [zA, -postX - ps / 2], -68, zA - zB, "blockSpacing", p);
    scDim(S, [c.bridgeZ1 - 4, half + p.bridgeOff - 30], [c.bridgeZ1 - 4, half + p.bridgeOff + 30], -34, 60);
    scDim(S, [zA + ps / 2 + 2, half], [zA + ps / 2 + 2, half + p.bridgeOff + 30], -70, p.bridgeOff + 30, "bridgeOff", p);
    scDim(S, [zA + 8, -postX + ps / 2], [zA + 8, -postX + ps / 2 + p.hoseArm], -48, p.hoseArm, "hoseArm", p);
    scDim(S, [c.bridgeZ0, half + p.bridgeOff + 30], [zB - ps / 2, half + p.bridgeOff + 30], 24, zB - ps / 2 - c.bridgeZ0, "bridgeRear", p);
    scDim(S, [zA - ps / 2 - p.boltGap, half + 20], [zA - ps / 2, half + 20], 20, p.boltGap, "boltGap", p);
    scDim(S, [zA - 5, -c.inL / 2], [zA - 5, c.inL / 2], 40, c.inL, "sideSpan", p);
  }
  return scSvg(S, "Půdorys (shora, stejná osa z jako bokorys)");
}

function renderSchema(v) {
  const el = $("#schema"), wrap = $("#schwrap"); if (!el) return;
  const on = v.p3.style === "nas"; if (wrap) wrap.classList.toggle("hidden", !on);
  if (!on) { el.innerHTML = ""; return; }
  const p = getParams(v);
  el.innerHTML = `<div class="schgrid">${schemaFront(p)}${schemaSide(p)}${schemaPlan(p)}</div>`;
}
/* úprava hodnot: klik na číslo = zápis, − / + = dynamický krok */
function schemaEdit(v, k, val) { if (!(val > 0)) return; setParam(v, k, val); rebuild3d(); }
document.addEventListener("click", e => {
  const root = e.target.closest && e.target.closest("#schema, #dwg"); if (!root) return;
  const v = VBY[S.variant], g = e.target.closest(".sdim.edit"); if (!g) return;
  const k = g.dataset.k, cur = +g.dataset.v, pv = +g.dataset.pv, sc = +g.dataset.s || 1, inc = scStep(cur), toParam = nv => Math.round((pv + sc * (nv - cur)) * 10) / 10;
  const apply = nv => { const np = toParam(nv); if (np >= 0 && np !== pv) { setParam(v, k, np); rebuild3d(); } };
  const b = e.target.closest(".sbtn");
  if (b) { const up = +b.dataset.d > 0; apply(up ? (Math.floor(cur / inc + 1e-9) + 1) * inc : (Math.ceil(cur / inc - 1e-9) - 1) * inc); return; }
  const tx = e.target.closest(".sv"); if (!tx || root.querySelector(".schinp")) return;
  const r = tx.getBoundingClientRect(), rr = root.getBoundingClientRect();
  const inp = document.createElement("input"); inp.type = "number"; inp.value = cur; inp.step = inc; inp.className = "schinp";
  inp.style.cssText = `left:${r.left - rr.left + r.width / 2 - 38}px;top:${r.top - rr.top - 6}px`;
  root.appendChild(inp); inp.focus(); inp.select();
  let fin = false; const done = ok => { if (fin) return; fin = true; const nv = +inp.value; inp.remove(); if (ok && Number.isFinite(nv) && nv !== cur) apply(nv); };
  inp.onkeydown = ev => { ev.stopPropagation(); if (ev.key === "Enter") done(true); if (ev.key === "Escape") done(false); };
  inp.onblur = () => done(true);
});
