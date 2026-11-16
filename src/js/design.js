/* =====================================================================
   NÁŠ NÁVRH – parametry, kontrolní výpočty, kusovník
   ===================================================================== */
const NAS_DEF = {deckL: 1800, deckW: 750, workL: 1500, workW: 600, workT: 40, frameH: 790, sideSpan: 790, rodGap: 50, railY: 1800, blockSpacing: 200, postH: 275, postSize: 25, beamL: 1000, beamSize: 25, beamGap: 150, railX: 1000, plexiW: 300, plexiH: 200, plexiT: 10, plexiEdge: 15, zStroke: 200, zOffset: 0};
const PARAM_INFO = {
  nas: [
    ["Stůl a spodní konstrukce (máme)", [["deckL", "Délka desky stolu"], ["deckW", "Šířka desky stolu"], ["frameH", "Výška spodního rámu"], ["sideSpan", "Rozteč bočních profilů (nad spodními)"], ["rodGap", "Rozpěrka na závitové tyči (0–100)"]]],
    ["Obrobek", [["workL", "Délka obrobku"], ["workW", "Šířka obrobku"], ["workT", "Tloušťka obrobku"]]],
    ["Osa Y", [["railY", "Délka kolejnice SBR20"], ["blockSpacing", "Rozteč vozíků Y"], ["postH", "Výška svislého jeklu"], ["postSize", "Průřez svislého jeklu"]]],
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
  const sideTop = p.flat ? p.frameH : p.frameH + p.rodGap + PR, blockTop = sideTop + 50, barT = 6, conTop = blockTop + barT + 25;   // SBR20UU: horní plocha 50 nad spodkem kolejnice; pásovina 50×6; jekl 25
  const topBeamY = conTop + p.postH - p.beamSize / 2, lowBeamY = topBeamY - p.beamGap, plexiCY = (topBeamY + lowBeamY) / 2;
  const zLen = p.zStroke + 80, modCY = plexiCY + (p.zOffset || 0), carTop = modCY + zLen / 2 - 35;   // carTop = střed vozíku v horní poloze (deska 10 + půl vozíku 25)
  const spBot = carTop + 20 - 166, toolLen = 108, tipHigh = spBot - toolLen, tipLow = tipHigh - p.zStroke;
  const slabTop = p.frameH + deckT + p.workT, deckTop = p.frameH + deckT, reach = tipLow - deckTop;
  const bx = p.plexiW / 2 - 25 - p.plexiEdge;                       // vozík SBR20UU 50 (podél kolejnice) × 48 mm
  const travelY = p.railY - p.blockSpacing - 50, needY = Math.min(p.workL, p.deckL) + 39;
  const travelX = p.railX - 2 * bx - 50, needX = Math.min(p.workW, p.deckW) + 39;
  const toolX = Math.min(travelX / 2, p.sideSpan / 2 - 24 - 48 - 3), cutW = Math.round(2 * toolX + 39);   // vozík SBR20 ±24, odsávací nástavec ±48, vůle 3
  const edgeV = (p.plexiH - p.beamGap) / 2 - 24;
  const clearBeam = (lowBeamY - p.beamSize / 2) - slabTop;
  const diag = Math.hypot(p.blockSpacing + 15, p.postH * .6);
  return {sideTop, blockTop, barT, conTop, topBeamY, lowBeamY, plexiCY, zLen, modCY, carTop, spBot, toolLen, tipHigh, tipLow, slabTop, deckTop, reach, bx, travelY, needY, travelX, needX, toolX, cutW, edgeV, clearBeam, diag, idealPost: Math.round(p.postH - reach - 2)};
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
  ];
}
function bomNas(p) {
  const c = nasCalc(p), m = x => Math.round(x / 100) / 10;
  return [
    {k: "spodni", n: p.flat ? "Spodní konstrukce – Al solární profily 40×40, boční profily přeložené vedle podélných (opora kolejnice 80 mm)" : "Spodní konstrukce – Al solární profily 40×40, závitové tyče Ø25 (položená na dřevěném stole)", q: 1, p: 0, note: "máme"},
    {k: "stul", n: `Deska stolu ${p.deckL}×${p.deckW} mm`, q: 1, p: 0, note: "máme"},
    {k: "vedeni", n: "VEVOR SBR20 2× 1800 mm + 4 vozíky SBR20UU (osa Y)", q: 1, p: p.railY > 1800 ? 2300 : 1514, ref: p.railY > 1800 ? "1005009878367051" : "16415484100", note: p.railY > 1800 ? "delší než 1800 → SucceBuy SBR20 2200 (cenu ověřit)" : "objednáno 15. 11. · Allegro · balení 1800 × 90 × 36,3 = 2 kolejnice 45 mm vedle sebe"},
    {k: "vedeni", n: "SucceBuy SBR20 2× 1000 mm + 4 vozíky SBR20UU (osa X)", q: 1, p: 893, ref: "17708036612", note: "Allegro · doprava zdarma · stejné SBR20 jako osa Y"},
    {k: "horni", n: "Jekl 25×25×2 – spojky vozíků + vzpěry", q: m(2 * (p.blockSpacing + 50) + 2 * c.diag), u: "m", p: 45, est: 1},
    {k: "horni", n: `Jekl ${p.postSize}×${p.postSize}×2 – svislé jekly ${p.postH} mm`, q: m(2 * p.postH), u: "m", p: p.postSize >= 40 ? 75 : 45, est: 1},
    {k: "horni", n: `Jekl ${p.beamSize}×${p.beamSize}×2 – příčníky ${p.sideSpan - p.postSize} mm (mezi stojky, jeden rám)`, q: m(2 * (p.sideSpan - p.postSize)), u: "m", p: p.beamSize >= 40 ? 75 : 45, est: 1},
    {k: "horni", n: "Šrouby M5/M6, matice, podložky, elektrody, barva", q: 1, p: 250, est: 1},
    {k: "osaZ", n: `Plexisklo 10 mm ${p.plexiW}×${p.plexiH} – deska vozíku X`, q: 1, p: 370, ref: "d8e551a8", note: "Allegro 315 Kč + doprava 55 Kč"},
    {k: "osaZ", n: `Modul osy Z 200 mm – 2 tyče + kuličkový šroub Ø16, ruční kolo s aretací`, q: 1, p: 1712, ref: "18760345169", note: "Allegro weibacar 1 597 Kč + doprava 115 Kč (0 Kč se Smart) · stejný kus i za 1 355 Kč"},
    {k: "osaZ", n: "Příruba NEMA23 + spojka na šroub Ø16 (místo ručního kola)", q: 1, p: 350, est: 1, note: "až s motorem Z"},
    {k: "vreteno", n: "HLTNC 2,2 kW GDZ80x73 ER20 + měnič EV210 (RS485), 24 000 ot/min", q: 1, p: 4053, ref: "1005011656854811", note: "objednáno 15. 11. · sklad DE · doručení 21.–26. 11."},
    {k: "vreteno", n: "Stíněný kabel vřetena 4×1,5 mm² (5 m)", q: 1, p: 350, est: 1},
    {k: "vreteno", n: "Srovnávací fréza Ø39 / stopka 8 mm", q: 1, p: 0, ref: "8687538a", note: "koupeno"},
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
    {k: "prisl", n: "Hadice k vysavači Ø40, 5 m + spony + držák hadice (jekl 20×20)", q: 1, p: 450, est: 1, note: "dílenský vysavač máme / stačí běžný"},
    {k: "prisl", n: "Upínky / svěrky", q: 1, p: 300, est: 1},
    // přidáno na konec (indexy starších řádků se nemění – drží uložené úpravy kalkulace)
    {k: "osaZ", n: "Adaptér vřetena – Al deska 10 mm 120×175 (díry vozíku 60×30 M5, patka 95×35 M6)", q: 1, p: 350, est: 1, note: "patka vřetena (díry 95 mm od sebe) je širší než vozík modulu Z (80 mm)"},
    {k: "horni", n: "Pásovina 50×6 – pod kolejnice X (2× ~765 mm) a na vozíky Y (2× 250 mm)", q: 1, p: 450, est: 1, note: "díry SBR20 (±15 mm) i vozíků (35×35) jsou mimo jekl 25×25"},
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
VARIANTS.unshift(NAS2_VARIANT, NAS_VARIANT);
const VBY = Object.fromEntries(VARIANTS.map(v => [v.id, v]));
const SCORE_L = {tuhost: "Tuhost", presnost: "Přesnost", hlinik: "Hliník", narocnost: "Náročnost stavby", cas: "Čas stavby", rozsir: "Rozšiřitelnost"};

function bomLines(v) {
  const ov = S.bom[v.id] || {}, order = Object.keys(KAT), add = v.custom ? [] : ((S.bomAdd || {})[v.id] || []);
  const src = v.bom.map((l, i) => [l, i]).concat(add.map((l, j) => [l, 1000 + j]));
  return src.filter(([, i]) => !(ov[i] || {}).del).map(([l, i]) => {
    const o = ov[i] || {}, k = o.k && KAT[o.k] ? o.k : l.k;
    return Object.assign({}, l, {i, k, n: o.n ?? l.n, g: KAT[k].n, q: o.q ?? l.q, p: o.p ?? l.p, off: !!(o.off ?? l.off), u: l.u || "ks", urlOv: o.url ?? l.urlOv ?? "", img: o.img ?? l.img ?? "", added: i >= 1000});
  }).sort((a, b) => order.indexOf(a.k) - order.indexOf(b.k) || a.i - b.i);
}
const bomTotal = (v, mode = "all") => bomLines(v).reduce((s, l) => s + (l.off || !inMode(l, mode) ? 0 : l.q * l.p), 0);
const bomCat = (v, k) => bomLines(v).reduce((s, l) => s + (l.off || l.k !== k ? 0 : l.q * l.p), 0);
