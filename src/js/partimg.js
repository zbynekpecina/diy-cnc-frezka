/* =====================================================================
   OBRÁZKY DÍLŮ DO KALKULACE – schematické kresby, aby bylo jasné, co hledat v e-shopu (profily v řezu, desky, úhelník, šrouby, T-matice, podložky)
   Vše se kreslí jako SVG (data URL), žádné externí soubory.
   ===================================================================== */
const PIMG_STYLE = {al: "#c9d0d8", st: "#4d5864", dk: "#2a2f36", bg: "#eef1f5", tx: "#1d2733"};
function pimgSvg(body, label, sub) {
  const c = PIMG_STYLE;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120"><rect width="120" height="120" rx="10" fill="${c.bg}"/>${body}` +
    `<text x="60" y="${sub ? 104 : 110}" text-anchor="middle" font-family="Arial,sans-serif" font-weight="700" font-size="12" fill="${c.tx}">${label}</text>` +
    (sub ? `<text x="60" y="115" text-anchor="middle" font-family="Arial,sans-serif" font-size="8.5" fill="#566275">${sub}</text>` : "") + `</svg>`;
}
const pimgSlot = (cx, topY, rot, cy, k = 1) => `<g transform="rotate(${rot} ${cx} ${cy})" fill="${PIMG_STYLE.dk}"><rect x="${cx - 7 * k}" y="${topY - .5}" width="${14 * k}" height="${5 * k + .5}"/><rect x="${cx - 12 * k}" y="${topY + 5 * k}" width="${24 * k}" height="${9 * k}"/></g>`;
const PIMG = {
  p3030: () => `<rect x="30" y="22" width="60" height="60" rx="3" fill="${PIMG_STYLE.al}" stroke="${PIMG_STYLE.st}" stroke-width="1.5"/>` + [0, 90, 180, 270].map(r => pimgSlot(60, 22, r, 52)).join("") + `<circle cx="60" cy="52" r="7" fill="${PIMG_STYLE.dk}"/>`,
  p3060: () => `<rect x="10" y="30" width="100" height="50" rx="3" fill="${PIMG_STYLE.al}" stroke="${PIMG_STYLE.st}" stroke-width="1.5"/>` +
    [35, 85].map(x => pimgSlot(x, 30, 0, 55, .9) + pimgSlot(x, 30, 180, 55, .9)).join("") +
    `<g fill="${PIMG_STYLE.dk}"><rect x="10" y="50" width="5.5" height="10"/><rect x="15.5" y="46" width="9" height="18"/><rect x="104.5" y="50" width="5.5" height="10"/><rect x="95.5" y="46" width="9" height="18"/><circle cx="35" cy="55" r="5"/><circle cx="85" cy="55" r="5"/></g>`,
  corner: () => `<path d="M22 92 L98 92 L22 16 Z" fill="${PIMG_STYLE.al}" stroke="${PIMG_STYLE.st}" stroke-width="1.5"/>` + [.3, .6].map(f => `<circle cx="34" cy="${92 - 76 * f}" r="4" fill="${PIMG_STYLE.bg}" stroke="${PIMG_STYLE.st}"/><circle cx="${22 + 76 * f}" cy="80" r="4" fill="${PIMG_STYLE.bg}" stroke="${PIMG_STYLE.st}"/>`).join(""),
  flat: () => `<rect x="36" y="14" width="48" height="84" rx="3" fill="${PIMG_STYLE.al}" stroke="${PIMG_STYLE.st}" stroke-width="1.5"/>` + [[48, 86], [72, 86], [60, 58], [60, 30]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="4" fill="${PIMG_STYLE.bg}" stroke="${PIMG_STYLE.st}"/>`).join(""),
  angle: () => `<path d="M34 18 L54 18 L54 76 L102 76 L102 96 L34 96 Z" fill="${PIMG_STYLE.al}" stroke="${PIMG_STYLE.st}" stroke-width="1.5"/><circle cx="44" cy="40" r="4" fill="${PIMG_STYLE.bg}" stroke="${PIMG_STYLE.st}"/><circle cx="82" cy="86" r="4" fill="${PIMG_STYLE.bg}" stroke="${PIMG_STYLE.st}"/>`,
  bar: () => `<rect x="12" y="42" width="96" height="34" rx="2" fill="${PIMG_STYLE.al}" stroke="${PIMG_STYLE.st}" stroke-width="1.5"/><rect x="12" y="42" width="96" height="6" fill="#dfe4ea"/>`,
  s7380: () => `<path d="M38 40 Q60 12 82 40 L82 48 L38 48 Z" fill="#3a424c" stroke="${PIMG_STYLE.st}" stroke-width="1.5"/><path d="M52 24 L68 24 L66 30 L54 30 Z" fill="#14181d"/><rect x="53" y="48" width="14" height="34" fill="${PIMG_STYLE.al}" stroke="${PIMG_STYLE.st}" stroke-width="1.2"/>` + [54, 60, 66, 72, 78].map(y => `<path d="M53 ${y} l14 3" stroke="${PIMG_STYLE.st}" stroke-width=".8"/>`).join(""),
  s912: () => `<rect x="44" y="12" width="32" height="24" rx="2" fill="#3a424c" stroke="${PIMG_STYLE.st}" stroke-width="1.5"/><path d="M54 12 L66 12 L64 20 L56 20 Z" fill="#14181d"/><rect x="53" y="36" width="14" height="62" fill="${PIMG_STYLE.al}" stroke="${PIMG_STYLE.st}" stroke-width="1.2"/>` + [44, 50, 56, 62, 68, 74, 80, 86, 92].map(y => `<path d="M53 ${y} l14 3" stroke="${PIMG_STYLE.st}" stroke-width=".8"/>`).join(""),
  tnut: () => `<rect x="22" y="62" width="76" height="22" rx="2" fill="${PIMG_STYLE.al}" stroke="${PIMG_STYLE.st}" stroke-width="1.5"/><rect x="40" y="42" width="40" height="20" fill="${PIMG_STYLE.al}" stroke="${PIMG_STYLE.st}" stroke-width="1.5"/><path d="M52 42 L52 84 M68 42 L68 84" stroke="${PIMG_STYLE.dk}" stroke-width="1.5" stroke-dasharray="3 2"/>`,
  washer: () => `<circle cx="60" cy="52" r="36" fill="${PIMG_STYLE.al}" stroke="${PIMG_STYLE.st}" stroke-width="1.5"/><circle cx="60" cy="52" r="9" fill="${PIMG_STYLE.bg}" stroke="${PIMG_STYLE.st}" stroke-width="1.5"/>`,
  mix: () => [[34, 52], [60, 42], [86, 52]].map(([x, h]) => `<rect x="${x - 12}" y="18" width="24" height="12" rx="2" fill="#3a424c"/><rect x="${x - 5}" y="30" width="10" height="${h}" fill="${PIMG_STYLE.al}" stroke="${PIMG_STYLE.st}"/>`).join(""),
};
const PIMG_LBL = {p3030: ["Profil 3030", "30×30, drážka 8 mm"], p3060: ["Profil 3060", "30×60, drážka 8 mm"], corner: ["Rohová deska", "Al plech 4 mm, trojúhelník"], flat: ["Plochá deska", "Al 4 mm, 40×70, 4 díry"], angle: ["Roh 90°", "úhelník do drážky"], bar: ["Al plochá tyč", "100×4 mm, nařezat na desky"], s7380: ["Šroub M6×12", "ISO 7380, půlkulatá hlava"], s912: ["Šroub M6×40", "DIN 912, válcová hlava"], tnut: ["T-matice M6", "do drážky 8 mm"], washer: ["Podložka M6", "DIN 9021 (velká)"], mix: ["Šrouby M6 / M5", "M6×20, M5×12 + T-matice M5"]};
const pimg = kind => { const [l, s] = PIMG_LBL[kind] || [kind, ""]; return "data:image/svg+xml;utf8," + encodeURIComponent(pimgSvg(PIMG[kind](), l, s)); };
