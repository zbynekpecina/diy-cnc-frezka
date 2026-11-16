/* =====================================================================
   3D VIEWER (three.js)
   ===================================================================== */
const V3 = (() => {
  let renderer, scene, camera, controls, root, clock, host, labLayer, paused = true, ready = false;
  let M = {}, DYN = [], LABELS = [], DIMS = [], EXPL = [], labelsOn = false, dimsOn = false, follow = null, tween = null;
  const ray = new THREE.Raycaster();
  const st = {prog: "both", play: true, speed: 6, t: 0, tPend: 0, path: null, seg: 0, segT: 0, step: 8, anim: [], cutDone: 0, cutting: false};
  let curV = null;
  const STEPS_N = 8;
  const mm = v => v / 1000;
  const tmpV = new THREE.Vector3(), tmpV2 = new THREE.Vector3();

  function init(container) {
    host = container;
    if (!window.THREE) { host.innerHTML = `<div class="empty" style="color:#ccc">3D knihovna se nenačetla.</div>`; return; }
    renderer = new THREE.WebGLRenderer({antialias: true, alpha: false});
    renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
    renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.outputEncoding = THREE.sRGBEncoding;
    renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.05;
    host.appendChild(renderer.domElement);
    labLayer = document.createElement("div"); labLayer.className = "v3labels"; host.appendChild(labLayer);
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x151a22);
    scene.fog = new THREE.Fog(0x151a22, 9, 24);
    camera = new THREE.PerspectiveCamera(40, 1, 0.02, 60);
    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true; controls.dampingFactor = .08; controls.maxPolarAngle = Math.PI * .495; controls.minDistance = .15; controls.maxDistance = 12;
    controls.addEventListener("start", () => { tween = null; });
    controls.enableZoom = true;
    const cv = renderer.domElement;
    const ndc = e => { const r = cv.getBoundingClientRect(); return {x: ((e.clientX - r.left) / r.width) * 2 - 1, y: -((e.clientY - r.top) / r.height) * 2 + 1}; };
    // levé = otáčení kolem bodu pod kurzorem · pravé / prostřední = posun · kolečko = zoom k bodu pod kurzorem · pravý klik = rozložit
    controls.mouseButtons = {LEFT: THREE.MOUSE.ROTATE, MIDDLE: THREE.MOUSE.PAN, RIGHT: THREE.MOUSE.PAN};
    controls.screenSpacePanning = true; controls.dampingFactor = .12; controls.rotateSpeed = .9; controls.panSpeed = 1;
    const pickPoint = e => { ray.setFromCamera(ndc(e), camera); const h = ray.intersectObject(root || scene, true).find(q => q.object.type === "Mesh" && isVis(q.object)); return h ? h.point : null; };
    host.addEventListener("pointerdown", e => {               // otáčení kolem místa, na které ukazuju (bez skoku pohledu)
      if (e.button !== 0 || !root) return; tween = null; follow = null;
      const P = pickPoint(e); if (!P) return;
      const fwd = controls.target.clone().sub(camera.position).normalize(), d = P.clone().sub(camera.position).dot(fwd);
      if (d > .05) controls.target.copy(camera.position).addScaledVector(fwd, d);
    }, {capture: true});
    host.addEventListener("mousedown", e => { if (e.button === 1) e.preventDefault(); });
    host.addEventListener("wheel", e => {                     // kolečko = přiblížení k bodu pod kurzorem
      e.preventDefault(); e.stopPropagation(); tween = null; follow = null;
      const n = ndc(e); ray.setFromCamera(n, camera);
      const h = root && ray.intersectObject(root, true).find(q => q.object.type === "Mesh" && isVis(q.object));
      const dist = camera.position.distanceTo(controls.target), P = h ? h.point : camera.position.clone().addScaledVector(ray.ray.direction, dist);
      const f = Math.pow(1.0015, clamp(e.deltaY, -120, 120)), nd = camera.position.distanceTo(P) * f;
      if ((f < 1 && nd < .06) || (f > 1 && dist * f > 14)) return;
      camera.position.sub(P).multiplyScalar(f).add(P); controls.target.sub(P).multiplyScalar(f).add(P);
    }, {passive: false, capture: true});
    let down = null;
    const okObj = o => (o.isMesh || o.type === "Group") && !o.isInstancedMesh && !o.setSpan && !o.userData.isDim && ![M.car, M.gantry, M.z, M.cut, M.skin && M.skin.m].includes(o);
    const hitAt = e => { ray.setFromCamera(ndc(e), camera); return ray.intersectObject(root, true).find(h => h.object.type === "Mesh" && !h.object.isInstancedMesh && isVis(h.object)); };
    const bb = new THREE.Box3(), cA = new THREE.Vector3(), cB = new THREE.Vector3();
    const diag = o => { bb.setFromObject(o); return bb.isEmpty() ? 0 : bb.getSize(cA).length(); };
    // najde, co se má rozložit: hotová sestava, nebo nejmenší rozumná skupina, nebo shluk sousedních dílů kolem místa kliku
    const target = hit => {
      if (!hit) return null;
      let o = hit.object; while (o && o !== root && !o.userData.explode) o = o.parent;
      if (o && o !== root) return o;
      o = hit.object.parent;
      while (o && o !== root) {
        const kids = o.children.filter(okObj);
        if (kids.length >= 2 && diag(o) < .7) { if (!o.userData.explode) makeAuto(o, kids, null); return o; }
        o = o.parent;
      }
      const m = hit.object, par = m.parent;                       // shluk kolem bodu kliku
      if (m.userData.cluster) return m.userData.cluster;
      const P = hit.point, near = par.children.filter(c => okObj(c) && diag(c) < 1.2 && (bb.setFromObject(c), !bb.isEmpty() && bb.distanceToPoint(P) < .14));
      if (near.length < 2) { const pseudo = {userData: {}}; makeAuto(pseudo, [m], P); m.userData.cluster = pseudo; return pseudo; }
      const pseudo = {userData: {}}; makeAuto(pseudo, near, P); near.forEach(c => c.userData.cluster = pseudo); return pseudo;
    };
    function makeAuto(holder, items, P) {
      const ctr = new THREE.Vector3();
      if (P) ctr.copy(P); else { bb.setFromObject(holder); bb.getCenter(ctr); }
      const list = items.map((obj, i) => {
        bb.setFromObject(obj); bb.getCenter(cB); const sz = bb.getSize(cA).length();
        const d = cB.clone().sub(ctr); if (d.length() < .004 || items.length === 1) d.set(0, 1, 0).add(new THREE.Vector3((i % 3 - 1) * .3, 0, 0));
        d.normalize().multiplyScalar(.045 + sz * .35);
        const wp = obj.parent.getWorldPosition(new THREE.Vector3()), local = obj.parent.worldToLocal(wp.clone().add(d)).sub(obj.parent.worldToLocal(wp.clone()));
        return {obj, v: local, base: obj.position.clone()};
      });
      holder.userData.explode = {name: "tato část", on: false, k: 0, items: list, auto: true};
      EXPL.push(holder);
    }
    cv.addEventListener("contextmenu", e => e.preventDefault());
    cv.addEventListener("pointerdown", e => { down = [e.clientX, e.clientY, e.button]; });
    cv.addEventListener("pointerup", e => {                   // PRAVÝ klik (bez tažení) = rozložit / složit oblast pod kurzorem
      if (!down || down[2] !== 2 || e.button !== 2 || Math.hypot(e.clientX - down[0], e.clientY - down[1]) > 5 || !root) return;
      const o = target(hitAt(e)); if (o) toggleExplode(o);
    });
    cv.addEventListener("pointermove", e => {
      if (e.buttons || !root || (cv._t && performance.now() - cv._t < 90)) return; cv._t = performance.now();
      const h = hitAt(e); let o = h && h.object; while (o && o !== root && !o.userData.explode) o = o.parent;
      const ex = o && o !== root ? o.userData.explode : h && h.object.userData.cluster ? h.object.userData.cluster.userData.explode : null;
      const tip = document.getElementById("v3tip");
      if (tip) { tip.textContent = h ? (ex && ex.on ? "Pravý klik = složit" : "Pravý klik = rozložit") + (ex && !ex.auto ? ": " + ex.name : "") : ""; tip.style.opacity = h ? 1 : 0; }
    });
    scene.add(new THREE.HemisphereLight(0xdfe8ff, 0x2a2118, .65));
    const sun = new THREE.DirectionalLight(0xffffff, 1.15); sun.position.set(3.5, 6, 3); sun.castShadow = true;
    sun.shadow.mapSize.set(2048, 2048); const sc = sun.shadow.camera; sc.left = -4; sc.right = 4; sc.top = 4; sc.bottom = -4; sc.near = .5; sc.far = 20; sun.shadow.bias = -0.0004;
    scene.add(sun);
    const fill = new THREE.DirectionalLight(0x9fc4ff, .4); fill.position.set(-4, 3, -3); scene.add(fill);
    const floor = new THREE.Mesh(new THREE.PlaneGeometry(40, 40), new THREE.MeshStandardMaterial({color: 0x232a35, roughness: .95}));
    floor.rotation.x = -Math.PI / 2; floor.receiveShadow = true; scene.add(floor);
    const grid = new THREE.GridHelper(20, 40, 0x3a4556, 0x2b3442); grid.position.y = .001; scene.add(grid);
    clock = new THREE.Clock();
    new ResizeObserver(resize).observe(host);
    resize(); ready = true; loop();
  }
  function resize() { if (!renderer) return; const w = host.clientWidth, h = host.clientHeight; renderer.setSize(w, h); camera.aspect = w / h; camera.updateProjectionMatrix(); }

  // ---------- materiály a textury ----------
  const MAT = {};
  function canvasTex(w, h, draw) { const c = document.createElement("canvas"); c.width = w; c.height = h; draw(c.getContext("2d"), w, h); const t = new THREE.CanvasTexture(c); t.encoding = THREE.sRGBEncoding; return t; }
  function mats(frameColor) {
    const std = (c, r = .5, m = .2, o = {}) => new THREE.MeshStandardMaterial(Object.assign({color: c, roughness: r, metalness: m}, o));
    const screwTex = canvasTex(64, 64, (x) => { x.fillStyle = "#dfe3e7"; x.fillRect(0, 0, 64, 64); x.strokeStyle = "#7d858d"; x.lineWidth = 9; for (let i = -64; i < 128; i += 21) { x.beginPath(); x.moveTo(i, 0); x.lineTo(i + 64, 64); x.stroke(); } });
    screwTex.wrapS = screwTex.wrapT = THREE.RepeatWrapping;
    const fins = canvasTex(64, 64, (x) => { x.fillStyle = "#c9d0d6"; x.fillRect(0, 0, 64, 64); x.fillStyle = "#9aa3ab"; for (let i = 0; i < 64; i += 8) x.fillRect(0, i, 64, 3); });
    fins.wrapS = fins.wrapT = THREE.RepeatWrapping; fins.repeat.set(1, 6);
    Object.assign(MAT, {
      frame: std(frameColor, .45, .35), alu: std(0xc4cbd2, .35, .7), aluD: std(0x9aa4ae, .4, .7), aluB: std(0x2b2f35, .45, .5), rail: std(0xe3e7eb, .22, .92),
      blockS: std(0xb5bcc3, .3, .85), black: std(0x1b1d21, .6, .3), motor: std(0x24272c, .5, .4), plastic: std(0x2a2c30, .7, .05),
      mdf: std(0xb79b74, .85, 0), wood: std(0x9a7348, .8, 0), steel: std(0xb9c0c7, .3, .85), brass: std(0xc9a04a, .3, .8),
      belt: std(0x141518, .85, 0), chain: std(0x1e2024, .7, .05), cab: std(0xdfe2e6, .5, .25), cabIn: std(0xc7ccd2, .6, .2), din: std(0x9aa1a8, .4, .7),
      duct: std(0x8c9298, .8, 0), pcb: std(0x1f6e43, .6, .1), pcbB: std(0x1d3f8a, .6, .1), green: std(0x2f9e4f, .5, .1), red: std(0xd32f2f, .5, .2), yellow: std(0xf2c230, .5, .1),
      redS: std(0xb3261e, .6, .1), blueS: std(0x2c63c4, .5, .1), white: std(0xf1f2f4, .6, 0), orange: std(0xe0761b, .6, .05),
      cutter: std(0x8d969e, .25, .9), brush: std(0x222222, 1, 0, {transparent: true, opacity: .72}), glass: std(0x9fc4ff, .1, .1, {transparent: true, opacity: .18}),
      cabOrange: std(0xe0761b, .55, 0), cabBlack: std(0x16181b, .6, 0), cabGrey: std(0x5f6670, .6, 0), cabBlue: std(0x3f7fd9, .6, 0), hose: std(0x3c4350, .55, .1),
      ledOff: std(0x3a2a10, .5, 0), ledOn: std(0xff9a1a, .4, 0, {emissive: 0xff8a00, emissiveIntensity: 2.2}), ledG: std(0x1a5c2a, .4, 0, {emissive: 0x22ff66, emissiveIntensity: 1.4}),
      ghost: std(0x8fd0ff, .3, .1, {transparent: true, opacity: .22, depthWrite: false}),
      fins: std(0xffffff, .4, .6, {map: fins}),
    });
    MAT.screwTex = screwTex;
  }
  // ---------- základní tvary (rozměry a polohy v mm) ----------
  function mesh(geo, mat, x, y, z, parent) { const m = new THREE.Mesh(geo, mat); m.position.set(mm(x), mm(y), mm(z)); m.castShadow = m.receiveShadow = true; parent.add(m); return m; }
  function B(w, h, d, mat, x, y, z, parent) { return mesh(new THREE.BoxGeometry(mm(w), mm(h), mm(d)), mat, x, y, z, parent); }
  function Cy(r, len, mat, x, y, z, axis, parent, seg = 20, rTop) {
    const m = mesh(new THREE.CylinderGeometry(mm(rTop ?? r), mm(r), mm(len), seg), mat, x, y, z, parent);
    if (axis === "x") m.rotation.z = Math.PI / 2; if (axis === "z") m.rotation.x = Math.PI / 2; return m;
  }
  function part(step, parent) { const g = new THREE.Group(); g.userData.step = step; g.userData.base = new THREE.Vector3(); (parent || root).add(g); return g; }
  function ghostify(g) { g.traverse(o => { if (o.isMesh) { o.material = MAT.ghost; o.castShadow = false; } }); }
  function orient(g, dir) { const r = g.rotation; ({"y+": () => 0, "y-": () => r.x = Math.PI, "x+": () => r.z = -Math.PI / 2, "x-": () => r.z = Math.PI / 2, "z+": () => r.x = Math.PI / 2, "z-": () => r.x = -Math.PI / 2})[dir](); }
  function grp(parent, x, y, z) { const g = new THREE.Group(); g.position.set(mm(x), mm(y), mm(z)); parent.add(g); return g; }
  function spinner(parent, x, y, z, dir) { const o = grp(parent, x, y, z); orient(o, dir); const i = new THREE.Group(); o.add(i); return i; }
  // rám pro lineární vedení: lokálně kolejnice podél Z, „nahoru“ = Y
  function railFrame(parent, x, y, z, kind) {
    const g = grp(parent, x, y, z);
    if (kind === "x") g.rotation.set(-Math.PI / 2, Math.PI / 2, 0);     // kolejnice podél X, temeno do −Z (čelo příčníku)
    if (kind === "y") g.rotation.x = -Math.PI / 2;                      // kolejnice svisle, temeno do −Z (osa Z)
    return g;
  }
  function hgRail(g, L, size = 20) {
    const w = size, h = size === 15 ? 15 : 17.5;
    B(w, h, L, MAT.rail, 0, h / 2, 0, g);
    for (const s of [-1, 1]) B(.8, 3, L, MAT.aluB, s * w / 2, h * .6, 0, g);
    const n = Math.min(36, Math.floor(L / 60)), stp = L / n;
    for (let i = 0; i < n; i++) Cy(w * .24, .6, MAT.aluB, 0, h + .1, -L / 2 + stp * (i + .5), "y", g, 10);
    for (const s of [-1, 1]) B(w + 6, h + 4, 8, MAT.black, 0, (h + 4) / 2, s * (L / 2 + 4), g);   // dorazy
  }
  function hgBlock(g, zc, size = 20, flange = false) {
    const rh = size === 15 ? 15 : 17.5, w = size === 15 ? 34 : (flange ? 63 : 44), H = size === 15 ? 24 : 30, L = size === 15 ? 61.4 : 77.5, body = L - 16, y0 = rh * .35;
    B(w, H - y0, body, MAT.blockS, 0, (H + y0) / 2, zc, g);
    for (const s of [-1, 1]) { B(w - 3, H - y0 - 1, 6, MAT.black, 0, (H + y0) / 2, zc + s * (body / 2 + 3), g); B(w - 5, H - y0 - 3, 1.5, MAT.redS, 0, (H + y0) / 2, zc + s * (body / 2 + 6.7), g); }
    Cy(2.2, 6, MAT.brass, 0, H - 9, zc - body / 2 - 10, "z", g, 8);
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) Cy(3.4, 1, MAT.aluB, sx * w * .33, H + .3, zc + sz * body * .3, "y", g, 8);
  }
  function sbrRail(g, L) {             // SBR20: Ø20, osa 27 nad spodkem, základna 45×5, stojina ~19, díry Ø5,5 (M5) ve 2 řadách ±15, rozteč 150
    B(45, 5, L, MAT.aluD, 0, 2.5, 0, g); B(19, 17, L, MAT.aluD, 0, 13.5, 0, g); B(10, 4, L, MAT.aluD, 0, 19, 0, g);
    Cy(10, L, MAT.rail, 0, 27, 0, "z", g, 24);
    const n = Math.floor((L - 30) / 150) + 1, z0 = -(n - 1) * 75;
    for (let i = 0; i < n; i++) for (const s of [-1, 1]) Cy(4.2, 1.4, MAT.aluB, s * 15, 5.6, z0 + i * 150, "y", g, 8);
  }
  function sbrBlock(g, zc) {            // SBR20UU: 50 × 48, výška bloku 39 (11…50 nad spodkem kolejnice), osa 27, díry 4× M6 35 × 35
    B(48, 23, 50, MAT.alu, 0, 38.5, zc, g);
    for (const s of [-1, 1]) B(14.5, 16, 50, MAT.alu, s * 16.75, 19, zc, g);
    Cy(14.5, 51, MAT.steel, 0, 27, zc, "z", g, 20);
    Cy(2.5, 4, MAT.aluB, 22, 38, zc, "x", g, 8);
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) Cy(3.4, 1, MAT.aluB, sx * 17.5, 50.3, zc + sz * 17.5, "y", g, 8);
  }
  // krokový motor NEMA23: lokálně hřídel +Y, tělo v −Y
  function nema23(parent, x, y, z, dir, len = 76, label) {
    const g = grp(parent, x, y, z); orient(g, dir);
    B(57, 9, 57, MAT.aluB, 0, -4.5, 0, g);
    B(55, len - 18, 55, MAT.motor, 0, -len / 2, 0, g);
    B(57, 9, 57, MAT.aluB, 0, -len + 4.5, 0, g);
    for (const a of [-1, 1]) for (const b of [-1, 1]) Cy(2.6, len + .5, MAT.steel, a * 23.6, -len / 2, b * 23.6, "y", g, 8);
    Cy(19, 2, MAT.alu, 0, 1, 0, "y", g, 24);
    Cy(3.18, 21, MAT.steel, 0, 10.5, 0, "y", g, 12);
    B(16, 12, 14, MAT.plastic, 0, -len + 18, 33, g);
    B(30, 14, .5, MAT.white, 0, -len / 2, 27.8, g);
    return g;
  }
  function pulley(inner, r = 16, w = 17) {
    Cy(r, w, MAT.alu, 0, 0, 0, "y", inner, 28);
    for (const s of [-1, 1]) Cy(r + 3.5, 1.6, MAT.aluD, 0, s * (w / 2 + .8), 0, "y", inner, 28);
    Cy(10, 10, MAT.alu, 0, -(w / 2 + 6), 0, "y", inner, 20);
    B(3, 2, r, MAT.black, 0, w / 2 + 2, r / 2, inner);
  }
  function idler(inner, r = 11, w = 17) {
    Cy(r, w, MAT.steel, 0, 0, 0, "y", inner, 24);
    for (const s of [-1, 1]) Cy(r + 2.5, 1.2, MAT.aluB, 0, s * (w / 2 + .6), 0, "y", inner, 24);
    B(2, 1, r * .8, MAT.black, 0, w / 2 + 1.4, r * .4, inner);
  }
  function coupling(inner, r = 12.5, l = 30) { Cy(r, l, MAT.alu, 0, 0, 0, "y", inner, 20); for (const s of [-1, 1]) B(2 * r + .5, 2, 3, MAT.aluB, 0, s * l * .3, 0, inner); }
  function screwMesh(inner, r, L) {
    const t = MAT.screwTex.clone(); t.needsUpdate = true; t.repeat.set(1, L / 15);
    Cy(r, L, new THREE.MeshStandardMaterial({map: t, roughness: .25, metalness: .9}), 0, 0, 0, "y", inner, 20);
  }
  let conduitTex = null;
  function conduitMat() {                                       // vroubkovaná ochranná hadice (husí krk) na svazky kabelů
    if (!conduitTex) {
      const cv = document.createElement("canvas"); cv.width = 8; cv.height = 32; const g = cv.getContext("2d");
      g.fillStyle = "#26292e"; g.fillRect(0, 0, 8, 32); g.fillStyle = "#0e0f11"; g.fillRect(0, 0, 3, 32); g.fillStyle = "#3a3e45"; g.fillRect(4, 0, 2, 32);
      conduitTex = new THREE.CanvasTexture(cv); conduitTex.wrapS = conduitTex.wrapT = THREE.RepeatWrapping;
    }
    const m = new THREE.MeshStandardMaterial({map: conduitTex.clone(), roughness: .6, metalness: .05}); m.map.needsUpdate = true; return m;
  }
  /* kabel jako trubka po bodech; opt.conduit = svazek v bužírce, opt.ties = rozestup stahovacích pásek [mm] */
  function cable(parent, pts, r, mat, step, opt = {}) {
    const dense = [];
    pts.forEach((q, i) => { if (i) { const a = pts[i - 1], L = Math.hypot(q[0] - a[0], q[1] - a[1], q[2] - a[2]), n = Math.min(40, Math.max(2, Math.floor(L / 45))); for (let k = 1; k < n; k++) dense.push([a[0] + (q[0] - a[0]) * k / n, a[1] + (q[1] - a[1]) * k / n, a[2] + (q[2] - a[2]) * k / n]); } dense.push(q); });
    const curve = new THREE.CatmullRomCurve3(dense.map(p => new THREE.Vector3(mm(p[0]), mm(p[1]), mm(p[2]))), false, "centripetal", .35);
    const len = curve.getLength() * 1000;
    const m3 = opt.conduit ? conduitMat() : mat;
    if (opt.conduit) m3.map.repeat.set(len / 3.2, 1);
    const m = new THREE.Mesh(new THREE.TubeGeometry(curve, Math.max(32, Math.round(len / 6)), mm(opt.conduit ? r + .6 : r), 12, false), m3);
    m.castShadow = true; m.userData.step = step; m.userData.base = new THREE.Vector3(); parent.add(m);
    if (opt.ties) {                                              // stahovací pásky kolmo na kabel
      const n = Math.floor(len / opt.ties); if (n > 0) {
        const tg = new THREE.TorusGeometry(mm(r + 1.1), mm(.9), 6, 14), im = new THREE.InstancedMesh(tg, MAT.black, n);
        const q = new THREE.Quaternion(), z = new THREE.Vector3(0, 0, 1), s1 = new THREE.Vector3(1, 1, 1), M4 = new THREE.Matrix4();
        for (let i = 0; i < n; i++) { const u = (i + .5) / n; q.setFromUnitVectors(z, curve.getTangentAt(u).normalize()); M4.compose(curve.getPointAt(u), q, s1); im.setMatrixAt(i, M4); }
        m.add(im);
      }
    }
    return m;
  }
  function sensor(parent, x, y, z, axis, label, sub, step) {
    const g = grp(parent, x, y, z);
    const body = Cy(6, 42, MAT.steel, 0, 0, 0, axis, g, 16);
    const nutPos = axis === "x" ? [8, 0, 0] : axis === "z" ? [0, 0, 8] : [0, 8, 0];
    Cy(9, 4, MAT.aluB, nutPos[0], nutPos[1], nutPos[2], axis, g, 6);
    Cy(9, 4, MAT.aluB, -nutPos[0], -nutPos[1], -nutPos[2], axis, g, 6);
    const lp = axis === "x" ? [-22, 0, 0] : axis === "z" ? [0, 0, -22] : [0, -22, 0];
    const led = Cy(4, 3, MAT.ledOff, lp[0], lp[1], lp[2], axis, g, 12);
    if (label) lab(g, 0, 14, 0, label, sub, step);
    return {g, led};
  }
  // energetický řetěz: O = začátek dolní větve, A = směr pojezdu, U = směr ohybu
  function chain({parent, O, A, U, sF, sMax, R, pitch = 26, w = 38, h = 22, getS, step, extra = 60}) {
    const Lp = (sMax - sF) + extra, total = Lp + Math.PI * R, n = Math.ceil(total / pitch);
    const im = new THREE.InstancedMesh(new THREE.BoxGeometry(mm(pitch * .9), mm(h), mm(w)), MAT.chain, n);
    im.castShadow = true; im.receiveShadow = true; im.frustumCulled = false; im.userData.step = step; im.userData.base = new THREE.Vector3(); parent.add(im);
    const Av = new THREE.Vector3(...A), Uv = new THREE.Vector3(...U), Wv = new THREE.Vector3().crossVectors(Av, Uv), Ov = new THREE.Vector3(...O);
    const m4 = new THREE.Matrix4(), T = new THREE.Vector3(), N = new THREE.Vector3(), P = new THREE.Vector3();
    function upd() {
      const sM = getS(), sB = (Lp + sF + sM) / 2, lower = sB - sF;
      for (let i = 0; i < n; i++) {
        const u = (i + .5) * pitch; let s, hh, th;
        if (u <= lower) { s = sF + u; hh = 0; th = 0; }
        else if (u <= lower + Math.PI * R) { th = (u - lower) / R; s = sB + R * Math.sin(th); hh = R - R * Math.cos(th); }
        else { s = sB - (u - lower - Math.PI * R); hh = 2 * R; th = Math.PI; }
        T.copy(Av).multiplyScalar(Math.cos(th)).addScaledVector(Uv, Math.sin(th));
        N.copy(Av).multiplyScalar(-Math.sin(th)).addScaledVector(Uv, Math.cos(th));
        m4.makeBasis(T, N, Wv);
        P.copy(Ov).addScaledVector(Av, s).addScaledVector(Uv, hh).multiplyScalar(.001);
        m4.setPosition(P); im.setMatrixAt(i, m4);
      }
      im.instanceMatrix.needsUpdate = true;
    }
    upd(); DYN.push(upd); return im;
  }
  // řemen napnutý mezi dvěma body podél osy (dynamická délka)
  function strip(parent, axis, w, h, fixed, mat, step) {
    const geo = axis === "z" ? new THREE.BoxGeometry(mm(w), mm(h), .001) : new THREE.BoxGeometry(.001, mm(h), mm(w));
    const m = new THREE.Mesh(geo, mat); m.castShadow = true; m.userData.step = step; parent.add(m);
    m.position.set(mm(fixed[0]), mm(fixed[1]), mm(fixed[2])); m.userData.base = m.position.clone();
    m.setSpan = (a, b) => { const L = Math.max(1, Math.abs(b - a)), c = (a + b) / 2; if (axis === "z") { m.scale.z = L; m.position.z = mm(c); } else { m.scale.x = L; m.position.x = mm(c); } };
    return m;
  }
  // ---------- popisky ----------
  function lab(parent, x, y, z, text, sub, step, major) {
    const o = new THREE.Object3D(); o.position.set(mm(x), mm(y), mm(z)); parent.add(o);
    const el = document.createElement("div"); el.className = "v3lab" + (major ? " major" : "");
    el.innerHTML = esc(text) + (sub ? `<small>${esc(sub)}</small>` : ""); labLayer.appendChild(el);
    LABELS.push({o, el, step, major});
  }
  function isVis(o) { while (o) { if (!o.visible) return false; o = o.parent; } return true; }
  // ---------- rozložený pohled ----------
  // díl se při stavbě nezasune shora, ale ve svém směru (šrouby po ose, vozíky po kolejnici, deska zepředu…)
  function ins(o, dx, dy, dz, delay = 0) { if (o) o.userData.ins = {v: new THREE.Vector3(mm(dx), mm(dy), mm(dz)), delay, base: o.position.clone()}; return o; }
  function explodable(g, name, items) {
    g.userData.explode = {name, on: false, k: 0, items: items.filter(it => it[0]).map(([obj, v]) => ({obj, v: new THREE.Vector3(mm(v[0]), mm(v[1]), mm(v[2])), base: obj.position.clone()}))};
    EXPL.push(g); return g;
  }
  function toggleExplode(g, force) { const e = g.userData.explode; e.on = force ?? !e.on; }
  function tickExplode(dt) {
    for (const g of EXPL) {
      const e = g.userData.explode, tgt = e.on ? 1 : 0; if (e.k === tgt) continue;
      e.k = e.on ? Math.min(1, e.k + dt * 1.4) : Math.max(0, e.k - dt * 1.4);
      const k = e.k < .5 ? 2 * e.k * e.k : 1 - Math.pow(-2 * e.k + 2, 2) / 2;
      for (const it of e.items) it.obj.position.copy(it.base).addScaledVector(it.v, k);
    }
  }
  // ---------- kóty ----------
  function dim(parent, a, b, off, text, opt = {}) {
    const A = new THREE.Vector3(...a), Bv = new THREE.Vector3(...b), O = new THREE.Vector3(...off);
    const A2 = A.clone().add(O), B2 = Bv.clone().add(O), ext = O.clone().normalize().multiplyScalar(12);
    const d = Bv.clone().sub(A).normalize(), tk = new THREE.Vector3().crossVectors(d, O.clone().normalize()).normalize().add(d).multiplyScalar(7);
    const pts = [A, A2.clone().add(ext), Bv, B2.clone().add(ext), A2, B2, A2.clone().sub(tk), A2.clone().add(tk), B2.clone().sub(tk), B2.clone().add(tk)];
    const geo = new THREE.BufferGeometry().setFromPoints(pts.map(q => q.clone().multiplyScalar(.001)));
    const line = new THREE.LineSegments(geo, new THREE.LineBasicMaterial({color: opt.warn ? 0xff5a5a : 0xffc94d, depthTest: false, transparent: true, opacity: .95}));
    line.renderOrder = 999; parent.add(line);
    const o = new THREE.Object3D(); o.position.copy(A2.clone().add(B2).multiplyScalar(.0005)); parent.add(o);
    const el = document.createElement("div"); el.className = "v3dim" + (opt.param ? " edit" : "") + (opt.warn ? " warn" : "");
    const html = `${esc(text)}${opt.sub ? `<small>${esc(opt.sub)}</small>` : ""}`; el.innerHTML = html;
    if (opt.param) {
      el.title = "Klikni a uprav rozměr";
      el.addEventListener("click", ev => {
        ev.stopPropagation(); if (el.querySelector("input")) return;
        const inp = document.createElement("input"); inp.type = "number"; inp.value = opt.val; el.innerHTML = ""; el.appendChild(inp); inp.focus(); inp.select();
        let fin = false; const done = ok => { if (fin) return; fin = true; if (ok && +inp.value > 0 && +inp.value !== opt.val) api.onParam && api.onParam(opt.param, +inp.value); else el.innerHTML = html; };
        inp.onkeydown = k => { k.stopPropagation(); if (k.key === "Enter") done(true); if (k.key === "Escape") done(false); };
        inp.onblur = () => done(true);
      });
    }
    labLayer.appendChild(el);
    DIMS.push({o, el, line, step: opt.step ?? 1, major: opt.major || opt.warn});
  }
  function updDims() {
    const w = host.clientWidth, h = host.clientHeight;
    for (const D of DIMS) {
      let show = dimsOn && D.step <= st.step && isVis(D.line.parent);
      if (show) {
        D.o.getWorldPosition(tmpV);
        if (!D.major && tmpV.distanceTo(camera.position) > 1.6) show = false;
        tmpV.project(camera);
        if (show && (tmpV.z > 1 || Math.abs(tmpV.x) > 1.02 || Math.abs(tmpV.y) > 1.02)) show = false;
        if (show) D.el.style.transform = `translate3d(${(tmpV.x * .5 + .5) * w}px,${(-tmpV.y * .5 + .5) * h}px,0) translate(-50%,-50%)`;
      }
      D.line.visible = show;
      D.el.classList.toggle("on", show);
    }
  }
  // ---------- zvuk frézování (WebAudio, syntéza) ----------
  const SND = {on: true};
  const sndKick = e => { if (!SND.on || !(e.target instanceof Element) || !e.target.closest("#viewer")) return; /* zvuk až po kliknutí do 3D animace */ if (!SND.ctx) soundInit(); SND.ctx.resume(); if (!paused) SND.master.gain.setTargetAtTime(.5, SND.ctx.currentTime, .1); };
  ["pointerdown", "keydown", "touchstart"].forEach(ev => window.addEventListener(ev, sndKick, {passive: true}));
  function soundInit() {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const o1 = ctx.createOscillator(); o1.type = "sawtooth"; o1.frequency.value = 233;
    const o2 = ctx.createOscillator(); o2.type = "sine"; o2.frequency.value = 466;
    const lp = ctx.createBiquadFilter(); lp.type = "lowpass"; lp.frequency.value = 1600;
    const gS = ctx.createGain(); gS.gain.value = 0; o1.connect(lp); o2.connect(lp); lp.connect(gS);
    const buf = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate), dd = buf.getChannelData(0); let br = 0;
    for (let i = 0; i < dd.length; i++) { const wv = Math.random() * 2 - 1; br = (br + .02 * wv) / 1.02; dd[i] = wv * .5 + br * 3.5; }
    const ns = ctx.createBufferSource(); ns.buffer = buf; ns.loop = true;
    const bp = ctx.createBiquadFilter(); bp.type = "bandpass"; bp.frequency.value = 1100; bp.Q.value = .7;
    const gN = ctx.createGain(); gN.gain.value = 0; ns.connect(bp); bp.connect(gN);
    const master = ctx.createGain(); master.gain.value = 0; gS.connect(master); gN.connect(master); master.connect(ctx.destination);
    o1.start(); o2.start(); ns.start();
    Object.assign(SND, {ctx, o1, o2, gS, gN, bp, master});
  }
  function soundTick() {
    if (!SND.ctx || !SND.on) return;
    const t = SND.ctx.currentTime, run = st.play && st.step >= STEPS_N && !paused, cut = run && st.cutting;
    SND.gS.gain.setTargetAtTime(run ? .06 : 0, t, .2);
    SND.gN.gain.setTargetAtTime(0, t, .05);                       // bez šumu řezání – jen bzučení vřetena
    const f = cut ? 226 : 233;                                    // při řezu otáčky mírně klesnou
    SND.o1.frequency.setTargetAtTime(f, t, .25); SND.o2.frequency.setTargetAtTime(f * 2, t, .25);
  }
  function updLabels() {
    const w = host.clientWidth, h = host.clientHeight;
    for (const L of LABELS) {
      let show = labelsOn && L.step <= st.step;
      if (show) {
        L.o.getWorldPosition(tmpV);
        const d = tmpV.distanceTo(camera.position);
        if (d > (follow ? (L.major ? 1.6 : 1.25) : (L.major ? 99 : 1.3))) show = false;
        tmpV.project(camera);
        if (tmpV.z > 1 || Math.abs(tmpV.x) > 1.02 || Math.abs(tmpV.y) > 1.02) show = false;
        else L.el.style.transform = `translate3d(${(tmpV.x * .5 + .5) * w}px,${(-tmpV.y * .5 + .5) * h}px,0) translate(-50%,-100%)`;
      }
      L.el.classList.toggle("on", show);
    }
  }

  // ---------- textura obrobku (river table) ----------
  let slabTex, slabCtx, slabCan;
  function makeSlabTexture(w, l) {
    slabCan = document.createElement("canvas"); const R = 900 / Math.max(w, l);
    slabCan.width = Math.round(w * R); slabCan.height = Math.round(l * R);
    slabCtx = slabCan.getContext("2d", {willReadFrequently: true}); drawSlab(); slabTex = new THREE.CanvasTexture(slabCan); slabTex.encoding = THREE.sRGBEncoding; return slabTex;
  }
  let RAW = null;                                               // surová deska: obrys + kresba letokruhů
  function rng(seed) { let x = seed >>> 0; return () => ((x = (x * 1664525 + 1013904223) >>> 0) / 4294967296); }
  function rawEdges(t) {                                        // t 0..1 po délce -> [levý, pravý] okraj v 0..1 šířky
    const l = .07 + .045 * Math.sin(t * 5.1 + .4) + .025 * Math.sin(t * 13.7) + .012 * Math.sin(t * 31 + 1);
    const r = .07 + .05 * Math.sin(t * 4.3 + 2.1) + .02 * Math.sin(t * 11.3 + .7) + .012 * Math.sin(t * 27 + 2);
    const flare = Math.pow(Math.abs(t - .5) * 2, 6) * -.04;
    return [Math.max(.01, l + flare), 1 - Math.max(.01, r + flare)];
  }
  function drawRaw() {
    const c = slabCtx, W = slabCan.width, H = slabCan.height, R = rng(7);
    c.clearRect(0, 0, W, H);
    const g = c.createLinearGradient(0, 0, W, 0);
    g.addColorStop(0, "#a8784a"); g.addColorStop(.25, "#8f5d33"); g.addColorStop(.5, "#7a4a26"); g.addColorStop(.75, "#8f5d33"); g.addColorStop(1, "#a8784a");
    c.fillStyle = g; c.fillRect(0, 0, W, H);
    const cx = W * .5, rings = 34;
    for (let i = 1; i <= rings; i++) {
      const w0 = i / rings, dark = i % 3 === 0;
      c.strokeStyle = `rgba(${dark ? 70 : 95},${dark ? 40 : 58},${dark ? 18 : 28},${dark ? .55 : .3})`;
      c.lineWidth = dark ? 1.8 + R() * 1.2 : .8 + R();
      for (const sgn of [-1, 1]) {
        c.beginPath();
        for (let y = 0; y <= H; y += 6) {
          const t = y / H, peak = .5 + .18 * Math.sin(i * .7);
          const bulge = Math.exp(-Math.pow((t - peak) * (3.2 - w0 * 1.6), 2)) * W * .06 * (1 - w0);
          const x = cx + sgn * (w0 * W * .5 - bulge) + Math.sin(t * 9 + i) * 3 + Math.sin(t * 23 + i * 2) * 1.2;
          if (y) c.lineTo(x, y); else c.moveTo(x, y);
        }
        c.stroke();
      }
    }
    for (let i = 0; i < 260; i++) { c.strokeStyle = `rgba(60,35,15,${.05 + R() * .08})`; c.lineWidth = .6; c.beginPath(); const x0 = R() * W, y0 = R() * H, len = 40 + R() * 160; c.moveTo(x0, y0); c.lineTo(x0 + (R() - .5) * 4, y0 + len); c.stroke(); }
    for (let k = 0; k < 4; k++) {
      const kx = W * (.25 + R() * .5), ky = H * (.12 + R() * .76), kr = 5 + R() * 8;
      for (let j = 5; j >= 1; j--) { c.fillStyle = j === 1 ? "rgba(40,22,10,.9)" : `rgba(80,45,20,${.12 + .05 * (5 - j)})`; c.beginPath(); c.ellipse(kx, ky, kr * j * .6, kr * j * 1.6, 0, 0, 7); c.fill(); }
    }
    c.fillStyle = "#3b2a1c";
    for (let y = 0; y < H; y += 2) { const e = rawEdges(y / H); c.fillRect(0, y, e[0] * W, 2); c.fillRect(e[1] * W, y, W - e[1] * W, 2); }
    const sap = W * .035, bark = W * .022;
    for (let y = 0; y < H; y += 2) {
      const e = rawEdges(y / H), xl = e[0] * W, xr = e[1] * W;
      c.fillStyle = "rgba(214,178,128,.85)"; c.fillRect(xl, y, sap * (.7 + .3 * Math.sin(y * .05)), 2); c.fillRect(xr - sap * (.7 + .3 * Math.cos(y * .045)), y, sap, 2);
      c.fillStyle = "#3b2a1c"; c.fillRect(xl - 2, y, bark * (.5 + .5 * Math.abs(Math.sin(y * .13))), 2); const bw = bark * (.5 + .5 * Math.abs(Math.cos(y * .11))); c.fillRect(xr - bw + 2, y, bw, 2);
    }
    c.fillStyle = "rgba(255,255,255,.05)"; c.fillRect(0, 0, W, H);
  }
  function makeBarkTex() {
    return canvasTex(128, 256, (x, w, h) => {
      x.fillStyle = "#4a3523"; x.fillRect(0, 0, w, h); const R = rng(3);
      for (let i = 0; i < 60; i++) { x.fillStyle = R() > .5 ? "rgba(30,20,12,.7)" : "rgba(110,85,60,.45)"; x.fillRect(R() * w, 0, 2 + R() * 6, h); }
      for (let i = 0; i < 120; i++) { x.fillStyle = "rgba(20,12,6,.6)"; x.fillRect(R() * w, R() * h, 3 + R() * 10, 1 + R() * 2); }
    });
  }
  function makeRawSlab(W, L, T) {                               // nepravidelný obrys, kůra na bocích
    const sh = new THREE.Shape(), N = 90, pts = [];
    for (let i = 0; i <= N; i++) { const t = i / N; pts.push([(rawEdges(t)[0] - .5) * W, (t - .5) * L]); }
    for (let i = N; i >= 0; i--) { const t = i / N; pts.push([(rawEdges(t)[1] - .5) * W, (t - .5) * L]); }
    pts.forEach((q, i) => i ? sh.lineTo(mm(q[0]), mm(-q[1])) : sh.moveTo(mm(q[0]), mm(-q[1])));
    const geo = new THREE.ExtrudeGeometry(sh, {depth: mm(T), bevelEnabled: true, bevelThickness: mm(3), bevelSize: mm(4), bevelSegments: 2, curveSegments: 4});
    makeSlabTexture(W, L); const tex = slabTex.clone(); tex.needsUpdate = true; tex.repeat.set(1 / mm(W), 1 / mm(L)); tex.offset.set(.5, .5);   // vlastní kopie – sdílená textura povrchu zůstává 1:1
    const bt = makeBarkTex(); bt.wrapS = bt.wrapT = THREE.RepeatWrapping; bt.repeat.set(30, 2);
    const m = new THREE.Mesh(geo, [new THREE.MeshStandardMaterial({map: tex, roughness: .78}), new THREE.MeshStandardMaterial({map: bt, roughness: 1, color: 0xb59a80})]);
    m.rotation.x = -Math.PI / 2; m.castShadow = m.receiveShadow = true;
    return m;
  }
  // ---------- odebírání materiálu: výšková mapa povrchu + třísky ----------
  function makeSkin(par, W, L, base, amp, cut) {               // base = výška pod nerovnostmi, amp = max. nerovnost (mm)
    const st2 = 4, nx = Math.round(W / st2), nz = Math.round(L / st2), N = (nx + 1) * (nz + 1);
    const pos = new Float32Array(N * 3), uv = new Float32Array(N * 2), h0 = new Float32Array(N), R = rng(11);
    const ph = [R() * 6, R() * 6, R() * 6, R() * 6];
    for (let j = 0; j <= nz; j++) for (let i = 0; i <= nx; i++) {
      const k = j * (nx + 1) + i, x = -W / 2 + i * W / nx, z = -L / 2 + j * L / nz, u = (x + W / 2) / W, t = (z + L / 2) / L, e = rawEdges(t);
      let y;
      if (u < e[0] || u > e[1]) y = base - 45;                 // mimo fošnu – stěna dolů
      else {
        const tw = (u - .5) * (t - .5) * 1.6;                  // mírné zkroucení fošny
        const wav = .5 + .25 * Math.sin(t * 7 + ph[0]) + .15 * Math.sin(u * 9 + ph[1]) + .1 * Math.sin((t * 23 + u * 5) + ph[2]);
        y = base + amp * clamp(wav + tw, 0, 1);
      }
      pos[k * 3] = mm(x); pos[k * 3 + 1] = mm(y); pos[k * 3 + 2] = mm(z); uv[k * 2] = u; uv[k * 2 + 1] = 1 - t; h0[k] = y;
    }
    const idx = [];
    for (let j = 0; j < nz; j++) for (let i = 0; i < nx; i++) { const a = j * (nx + 1) + i, b = a + 1, c2 = a + nx + 1, d = c2 + 1; idx.push(a, c2, b, b, c2, d); }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(pos, 3)); geo.setAttribute("uv", new THREE.BufferAttribute(uv, 2)); geo.setIndex(idx); geo.computeVertexNormals();
    const m = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({map: slabTex, roughness: .8})); m.castShadow = m.receiveShadow = true; par.add(m);
    M.skin = {m, geo, pos, h0, nx, nz, W, L, cut, top: base + amp, dirty: 0, t: 0};
  }
  function carve(x, z, r) {
    const K = M.skin; if (!K) return;
    const i0 = Math.max(0, Math.floor((x - r - 4 + K.W / 2) / K.W * K.nx)), i1 = Math.min(K.nx, Math.ceil((x + r + 4 + K.W / 2) / K.W * K.nx));
    const j0 = Math.max(0, Math.floor((z - r - 4 + K.L / 2) / K.L * K.nz)), j1 = Math.min(K.nz, Math.ceil((z + r + 4 + K.L / 2) / K.L * K.nz));
    const cy = mm(K.cut), r2 = r + 4;
    for (let j = j0; j <= j1; j++) for (let i = i0; i <= i1; i++) {
      const vx = -K.W / 2 + i * K.W / K.nx, vz = -K.L / 2 + j * K.L / K.nz, d = Math.hypot(vx - x, vz - z); if (d > r2) continue;
      const k = (j * (K.nx + 1) + i) * 3 + 1, lim = cy + mm(Math.max(0, d - r) * 1.5);   // čistý řez + malé zkosení na okraji dráhy
      if (K.pos[k] > lim) { K.pos[k] = lim; K.dirty = 1; }
    }
  }
  function skinH(x, z) {                                        // původní (hrubá) výška povrchu v bodě
    const K = M.skin; if (!K) return M.slab ? M.slab.top : 0;
    const i = clamp(Math.round((x + K.W / 2) / K.W * K.nx), 0, K.nx), j = clamp(Math.round((z + K.L / 2) / K.L * K.nz), 0, K.nz);
    return K.h0[j * (K.nx + 1) + i];
  }
  function carveE(x, z, r, depth) {                              // gravírování: dno = původní povrch − hloubka (zůstane i po srovnání plochy)
    const K = M.skin; if (!K) return;
    const i0 = Math.max(0, Math.floor((x - r - 4 + K.W / 2) / K.W * K.nx)), i1 = Math.min(K.nx, Math.ceil((x + r + 4 + K.W / 2) / K.W * K.nx));
    const j0 = Math.max(0, Math.floor((z - r - 4 + K.L / 2) / K.L * K.nz)), j1 = Math.min(K.nz, Math.ceil((z + r + 4 + K.L / 2) / K.L * K.nz));
    const base = Math.max(skinH(x, z), K.cut + 2) - depth;
    for (let j = j0; j <= j1; j++) for (let i = i0; i <= i1; i++) {
      const vx = -K.W / 2 + i * K.W / K.nx, vz = -K.L / 2 + j * K.L / K.nz, d = Math.hypot(vx - x, vz - z); if (d > r + 3) continue;
      const k = (j * (K.nx + 1) + i) * 3 + 1, lim = mm(base + Math.max(0, d - r) * 2.5);
      if (K.pos[k] > lim) { K.pos[k] = lim; K.dirty = 1; }
    }
  }
  function skinReset() { const K = M.skin; if (!K) return; for (let k = 0; k < K.h0.length; k++) K.pos[k * 3 + 1] = mm(K.h0[k]); K.dirty = 1; }
  function skinTick(dt) {
    const K = M.skin; if (!K || !K.dirty) return;
    K.geo.attributes.position.needsUpdate = true;
    if ((K.t += dt) > .2) { K.t = 0; K.geo.computeVertexNormals(); K.dirty = 0; }
  }
  // třísky a prach
  const CH = {n: 700};
  function makeChips(par) {
    const pos = new Float32Array(CH.n * 3), col = new Float32Array(CH.n * 3);
    for (let i = 0; i < CH.n; i++) { pos[i * 3 + 1] = -10; const sh = .75 + Math.random() * .35; col[i * 3] = .86 * sh; col[i * 3 + 1] = .66 * sh; col[i * 3 + 2] = .42 * sh; }
    const g = new THREE.BufferGeometry(); g.setAttribute("position", new THREE.BufferAttribute(pos, 3)); g.setAttribute("color", new THREE.BufferAttribute(col, 3));
    const pts = new THREE.Points(g, new THREE.PointsMaterial({size: mm(3.2), vertexColors: true, sizeAttenuation: true}));
    pts.frustumCulled = false; par.add(pts);
    Object.assign(CH, {pts, g, pos, vel: new Float32Array(CH.n * 3), life: new Float32Array(CH.n), next: 0});
  }
  function chipsTick(dt, spawn, tx, ty, tz, dirX, dirZ) {
    if (!CH.pts) return;
    if (spawn) for (let s2 = 0; s2 < 9; s2++) {
      const i = CH.next = (CH.next + 1) % CH.n, a = Math.random() * 6.283, sp = .4 + Math.random() * .9;
      CH.pos[i * 3] = mm(tx + Math.cos(a) * 19); CH.pos[i * 3 + 1] = mm(ty + 2); CH.pos[i * 3 + 2] = mm(tz + Math.sin(a) * 19);
      CH.vel[i * 3] = Math.cos(a + 1.57) * sp - dirX * .2; CH.vel[i * 3 + 1] = .3 + Math.random() * .7; CH.vel[i * 3 + 2] = Math.sin(a + 1.57) * sp - dirZ * .2;
      CH.life[i] = .6 + Math.random() * .8;
    }
    const floorY = mm(M.slab ? M.slab.top - 6 : 0);
    for (let i = 0; i < CH.n; i++) {
      if (CH.life[i] <= 0) { if (CH.pos[i * 3 + 1] > -5) CH.pos[i * 3 + 1] = -10; continue; }
      CH.life[i] -= dt; CH.vel[i * 3 + 1] -= 3.5 * dt;
      CH.pos[i * 3] += CH.vel[i * 3] * dt; CH.pos[i * 3 + 1] += CH.vel[i * 3 + 1] * dt; CH.pos[i * 3 + 2] += CH.vel[i * 3 + 2] * dt;
      if (CH.pos[i * 3 + 1] < floorY) { CH.pos[i * 3 + 1] = floorY; CH.vel[i * 3] *= .3; CH.vel[i * 3 + 2] *= .3; CH.vel[i * 3 + 1] = 0; CH.life[i] = Math.min(CH.life[i], .25); }
    }
    CH.g.attributes.position.needsUpdate = true;
  }
  function drawSlab() {
    if (RAW) return drawRaw();
    const c = slabCtx, W = slabCan.width, H = slabCan.height;
    const g = c.createLinearGradient(0, 0, W, 0); g.addColorStop(0, "#7b5532"); g.addColorStop(.5, "#9b6c3f"); g.addColorStop(1, "#6f4b2b");
    c.fillStyle = g; c.fillRect(0, 0, W, H);
    for (let i = 0; i < 70; i++) { c.strokeStyle = `rgba(${40 + Math.random() * 30},${25 + Math.random() * 15},10,${.15 + Math.random() * .2})`; c.lineWidth = 1 + Math.random() * 2; c.beginPath(); const x0 = Math.random() * W; c.moveTo(x0, 0); for (let y = 0; y <= H; y += 20) c.lineTo(x0 + Math.sin(y / 60 + i) * 8, y); c.stroke(); }
    c.fillStyle = "#1f6fa6"; c.beginPath();
    for (let y = 0; y <= H; y += 8) c.lineTo(W * .5 + Math.sin(y / H * 6.3) * W * .12 - W * .06, y);
    for (let y = H; y >= 0; y -= 8) c.lineTo(W * .5 + Math.sin(y / H * 6.3 + .6) * W * .1 + W * .06, y);
    c.closePath(); c.fill();
    c.fillStyle = "rgba(255,255,255,.07)"; c.fillRect(0, 0, W, H);
  }
  function paintCut(u, v, r, eng) {
    const c = slabCtx, x = u * slabCan.width, y = v * slabCan.height;
    const img = c.getImageData(Math.max(0, x - r), Math.max(0, y - r), r * 2, r * 2);
    const d = img.data, cx = Math.min(r, x), cy = Math.min(r, y);
    for (let j = 0; j < img.height; j++) for (let i = 0; i < img.width; i++) {
      const dx = i - cx, dy = j - cy; if (dx * dx + dy * dy > r * r) continue; const k = (j * img.width + i) * 4;
      if (d[k + 3] === 253) continue;
      if (eng) { if (d[k + 3] === 252) continue; d[k] = d[k] * .55 + 18; d[k + 1] = d[k + 1] * .5 + 10; d[k + 2] = d[k + 2] * .45 + 4; d[k + 3] = 252; continue; }
      if (d[k + 3] >= 252) continue; d[k] = Math.min(255, d[k] * 1.45 + 30); d[k + 1] = Math.min(255, d[k + 1] * 1.4 + 24); d[k + 2] = Math.min(255, d[k + 2] * 1.3 + 14); d[k + 3] = 253;
    }
    c.putImageData(img, Math.max(0, x - r), Math.max(0, y - r)); slabTex.needsUpdate = true;
  }
  // ---------- displej 7" (živá textura) ----------
  let pendCan, pendCtx, pendTex, vfdCan, vfdCtx, vfdTex;
  function drawPendant() {
    if (!pendCtx) return;
    const g = pendCtx, W = pendCan.width, H = pendCan.height;
    const x = M.car ? M.car.position.x * 1000 : 0, y = M.gantry ? M.gantry.position.z * 1000 : 0, z = M.z ? M.z.position.y * 1000 : 0;
    const run = st.play && st.step >= STEPS_N, rpm = run ? 14000 : 0;
    const btn = (bx, by, bw, bh, txt, bg, fg = "#e7eef8", fs = 17) => { g.fillStyle = bg; g.beginPath(); g.roundRect ? g.roundRect(bx, by, bw, bh, 8) : g.rect(bx, by, bw, bh); g.fill(); g.fillStyle = fg; g.font = `700 ${fs}px Inter, sans-serif`; g.textAlign = "center"; g.textBaseline = "middle"; g.fillText(txt, bx + bw / 2, by + bh / 2 + 1); g.textAlign = "left"; g.textBaseline = "alphabetic"; };
    g.fillStyle = "#0b1220"; g.fillRect(0, 0, W, H);
    // horní lišta – režim a stav
    g.fillStyle = "#121c30"; g.fillRect(0, 0, W, 34);
    g.font = "700 15px Inter, sans-serif"; g.fillStyle = "#9fb3cf"; g.fillText("CNC router · FluidNC", 12, 22);
    btn(250, 5, 64, 24, "MAN", run ? "#1c2a44" : "#2563eb", "#fff", 13); btn(318, 5, 64, 24, "AUTO", run ? "#16a34a" : "#1c2a44", "#fff", 13);
    g.fillStyle = run ? "#22c55e" : "#f59e0b"; g.beginPath(); g.arc(W - 70, 17, 6, 0, 7); g.fill();
    g.fillStyle = "#e7eef8"; g.font = "700 14px Inter, sans-serif"; g.fillText(run ? "RUN" : "IDLE", W - 58, 22);
    // souřadnice + tlačítka bod 0
    [["X", x], ["Y", -y], ["Z", z]].forEach(([n, v], i) => {
      const yy = 42 + i * 44; g.fillStyle = "#13203a"; g.fillRect(8, yy, 220, 38);
      g.fillStyle = "#f5a524"; g.font = "800 24px Inter, sans-serif"; g.fillText(n, 18, yy + 28);
      g.fillStyle = "#fff"; g.font = "700 24px JetBrains Mono, monospace"; g.textAlign = "right"; g.fillText(v.toFixed(2), 220, yy + 28); g.textAlign = "left";
      btn(232, yy + 2, 50, 34, "0", "#334155", "#fde68a", 18);
    });
    btn(8, 176, 136, 34, "⌂ HOME ALL", "#1f3b6b"); btn(148, 176, 134, 34, "◎ ZERO (XYZ)", "#1f3b6b", "#fde68a", 15);
    // ruční posuv (JOG)
    const jx = 296, jy = 44, k = 44;
    g.fillStyle = "#9fb3cf"; g.font = "600 12px Inter, sans-serif"; g.fillText("MANUAL (JOG)", jx, jy - 4);
    btn(jx + k, jy, k - 4, k - 4, "Y+", "#24324c"); btn(jx, jy + k, k - 4, k - 4, "X−", "#24324c"); btn(jx + 2 * k, jy + k, k - 4, k - 4, "X+", "#24324c"); btn(jx + k, jy + 2 * k, k - 4, k - 4, "Y−", "#24324c");
    btn(jx + k, jy + k, k - 4, k - 4, "•", "#1c2a44", "#64748b");
    btn(jx + 3 * k + 8, jy, k, k + 16, "Z▲", "#3b2f63"); btn(jx + 3 * k + 8, jy + k + 20, k, k + 16, "Z▼", "#3b2f63");
    ["0.1", "1", "10", "50"].forEach((t, i) => btn(jx + i * 48, jy + 3 * k + 2, 44, 26, t, i === 2 ? "#2563eb" : "#1c2a44", "#fff", 13));
    g.fillStyle = "#64748b"; g.font = "600 11px Inter, sans-serif"; g.fillText("step mm", jx + 196, jy + 3 * k + 19);
    // vřeteno – otáčky
    const sx = 8, sy = 218; g.fillStyle = "#13203a"; g.fillRect(sx, sy, 274, 84);
    g.fillStyle = "#9fb3cf"; g.font = "600 12px Inter, sans-serif"; g.fillText("SPINDLE · VFD RS485", sx + 10, sy + 16);
    g.fillStyle = "#fff"; g.font = "800 26px Inter, sans-serif"; g.fillText(rpm.toLocaleString("cs-CZ"), sx + 10, sy + 46); g.font = "600 13px Inter, sans-serif"; g.fillText("rpm", sx + 112, sy + 46);
    g.fillStyle = "#24324c"; g.fillRect(sx + 10, sy + 56, 254, 8); g.fillStyle = "#2ec4ad"; g.fillRect(sx + 10, sy + 56, 254 * rpm / 24000, 8);
    g.fillStyle = "#9fb3cf"; g.font = "600 11px JetBrains Mono, monospace"; g.fillText(`${(rpm / 60).toFixed(0)} Hz  ${(run ? 4.1 : 0).toFixed(1)} A  ${run ? 31 : 24}°C`, sx + 10, sy + 78);
    btn(sx + 190, sy + 66 - 40, 36, 26, "−", "#24324c", "#fff", 18); btn(sx + 230, sy + 66 - 40, 36, 26, "+", "#24324c", "#fff", 18);
    // průběh programu
    g.fillStyle = "#9fb3cf"; g.font = "600 12px Inter, sans-serif"; g.fillText(`Program: slab surfacing · ${Math.round(st.cutDone * 100)} %`, 296, 228);
    g.fillStyle = "#24324c"; g.fillRect(296, 236, 336, 10); g.fillStyle = "#f5a524"; g.fillRect(296, 236, 336 * st.cutDone, 10);
    g.fillStyle = "#9fb3cf"; g.fillText("feed 3,600 mm/min · 100 %", 296, 266);
    btn(500, 252, 40, 22, "−", "#24324c", "#fff", 14); btn(544, 252, 40, 22, "+", "#24324c", "#fff", 14);
    // spodní lišta – START / PAUZA / STOP / VŘETENO
    btn(8, H - 50, 150, 42, "▶ START", run ? "#14532d" : "#16a34a", "#fff", 18);
    btn(166, H - 50, 140, 42, "❚❚ PAUSE", "#a16207", "#fff", 17);
    btn(314, H - 50, 150, 42, "⟳ SPINDLE", run ? "#0e7490" : "#334155", "#fff", 16);
    btn(472, H - 50, 160, 42, "■ STOP", "#b91c1c", "#fff", 19);
    pendTex.needsUpdate = true;
    if (vfdCtx) { vfdCtx.fillStyle = "#1a0505"; vfdCtx.fillRect(0, 0, 128, 48); vfdCtx.fillStyle = "#ff3b2f"; vfdCtx.font = "700 34px JetBrains Mono, monospace"; vfdCtx.fillText((rpm / 60).toFixed(1).padStart(5, " "), 8, 38); vfdTex.needsUpdate = true; }
  }

  // ---------- stavba stroje ----------
  function makeDisplay(parent0, base, postH, reach, yaw = 0, square = false) {
    const parent = grp(parent0, base[0], 0, base[2]); parent.rotation.y = yaw; base = [0, base[1], 0];
    if (square) { B(25, postH + 12.5, 25, MAT.frame, base[0], base[1] + postH / 2 + 6, base[2], parent); B(23, 1, 23, MAT.black, base[0], base[1] + postH + 13, base[2], parent); }
    else Cy(14, postH, MAT.aluB, base[0], base[1] + postH / 2, base[2], "y", parent, 16);
    B(26, 26, reach, MAT.aluB, base[0], base[1] + postH, base[2] - reach / 2 + 10, parent);
    const disp = grp(parent, base[0], base[1] + postH + 10, base[2] - reach - 5); disp.rotation.x = .5;   // obrazovka mírně nahoru
    B(196, 124, 22, MAT.black, 0, 0, 0, disp); B(196, 124, 2, MAT.aluB, 0, 0, 12, disp);
    pendCan = document.createElement("canvas"); pendCan.width = 640; pendCan.height = 360; pendCtx = pendCan.getContext("2d");
    pendTex = new THREE.CanvasTexture(pendCan); pendTex.encoding = THREE.sRGBEncoding;
    const scr = new THREE.Mesh(new THREE.PlaneGeometry(mm(155), mm(87)), new THREE.MeshBasicMaterial({map: pendTex, toneMapped: false}));
    scr.position.set(0, 0, mm(-11.2)); scr.rotation.y = Math.PI; disp.add(scr);
    Cy(13, 14, MAT.red, 112, -40, -6, "z", disp, 20); Cy(17, 6, MAT.yellow, 112, -40, 2, "z", disp, 20);
    lab(disp, 0, 70, 0, "7\" display ESP32-P4", "custom firmware · WiFi → FluidNC · RS485 → VFD", 7, true);
    lab(disp, 112, -30, -10, "STOP", "", 7);
    const an = new THREE.Object3D(); disp.add(an); return an;
  }
  function build(v, keep) {
    if (!ready) return;
    curV = v;
    if (root) { scene.remove(root); root.traverse(o => { if (o.geometry) o.geometry.dispose(); }); }
    LABELS.forEach(l => l.el.remove()); DIMS.forEach(d => d.el.remove()); LABELS = []; DIMS = []; EXPL = []; DYN = []; tween = null;
    if (!keep) follow = null;
    root = new THREE.Group(); scene.add(root); M = {sensors: []};
    RAW = null; M.skin = null; CH.pts = null;
    if (v.p3.style === "nas") return buildNas(v, keep);
    const p = Object.assign({}, v.p3, getParams(v)); mats(p.frameColor);
    const ghostDrive = p.drive === "manual", drive = ghostDrive ? "belt" : p.drive;
    const WX = p.workX, WY = p.workY, bw = p.beam[0], bh = p.beam[1];
    const FW = WX + 2 * 140 + 2 * bw, FL = WY + 520, top = p.legH, half = FW / 2;
    const sbrY = p.railY === "sbr", sbrX = p.railX === "sbr";
    const railX = p.style === "table" ? half - 35 : half - bw / 2;
    const fm = p.style === "alu" ? MAT.alu : MAT.frame;

    // ===== 1 rám =====
    const F = part(1);
    if (p.style === "table") {
      B(FW - 40, 110, FL, MAT.mdf, 0, top - 55, 0, F); B(FW - 60, 6, FL - 20, MAT.wood, 0, top - 112, 0, F);
      for (const sx of [-1, 1]) for (const sz of [-1, 0, 1]) B(60, top - 115, 60, MAT.frame, sx * (half - 120), (top - 115) / 2, sz * (FL / 2 - 200), F);
      for (const sx of [-1, 1]) B(40, 40, FL - 300, MAT.frame, sx * (half - 120), 160, 0, F);
      for (const sx of [-1, 1]) B(30, 70, FL, MAT.frame, sx * (half - 35), top - 35, 0, F);
    } else {
      for (const sx of [-1, 1]) { B(bw, bh, FL, fm, sx * (half - bw / 2), top - bh / 2, 0, F); for (const sz of [-1, 1]) B(bw - 2, bh - 2, 3, MAT.black, sx * (half - bw / 2), top - bh / 2, sz * (FL / 2 + 1.5), F); }
      const nC = Math.max(3, Math.round(FL / 520) + 1);
      for (let i = 0; i < nC; i++) B(FW - 2 * bw, bw * .8, bh, fm, 0, top - bw * .4, -FL / 2 + bh / 2 + i * (FL - bh) / (nC - 1), F);
      if (p.style === "bolt") {
        B(FW + 160, 40, FL + 120, MAT.wood, 0, top - bh - 20, 0, F);
        for (const sx of [-1, 1]) for (const sz of [-1, 1]) B(70, top - bh - 40, 70, MAT.aluB, sx * (FW / 2 + 20), (top - bh - 40) / 2, sz * (FL / 2 - 20), F);
        for (const sx of [-1, 1]) B(60, 60, FL, MAT.aluB, sx * (FW / 2 + 20), 220, 0, F);
        for (const sx of [-1, 1]) for (let i = 0; i < 8; i++) Cy(6, 3, MAT.steel, sx * (half - bw / 2), top + 1, -FL / 2 + 100 + i * (FL - 200) / 7, "y", F, 6);
      } else {
        const legs = FL > 1900 ? [-1, 0, 1] : [-1, 1], leg = p.style === "alu" ? 90 : 60;
        for (const sx of [-1, 1]) for (const sz of legs) {
          const lz = sz * (FL / 2 - leg / 2 - 10), lx = sx * (half - bw / 2);
          B(leg, top - bh - 30, leg, fm, lx, (top - bh) / 2 + 30, lz, F);
          B(leg + 30, 8, leg + 30, fm, lx, 34, lz, F);                       // patka
          Cy(32, 14, MAT.black, lx, 7, lz, "y", F, 24);                      // nivelační talíř
          Cy(8, 26, MAT.steel, lx, 26, lz, "y", F, 12);
          Cy(12, 8, MAT.steel, lx, 22, lz, "y", F, 6);
          for (const s of [-1, 1]) { const gs = B(6, 70, 70, fm, lx + s * 0, top - bh - 30, lz + s * (leg / 2 + 20), F); gs.rotation.x = s * Math.PI / 4; gs.scale.set(1, .7, .7); }
        }
        for (const sx of [-1, 1]) B(leg * .7, leg * .7, FL - 60, fm, sx * (half - bw / 2), 230, 0, F);
        B(FW - 2 * bw, leg * .7, leg * .7, fm, 0, 230, 0, F);
      }
    }
    lab(F, -half, top, FL / 2 - 200, p.style === "alu" ? "Aluminium profile frame 45×90" : p.style === "table" ? "Table = frame (torsion box)" : `Frame, ${bw}×${bh} tube`, p.style === "weld" ? "welded" : p.style === "bolt" ? "bolted" : "", 1, true);

    // ===== 8 stůl, obětní deska, obrobek, sondy =====
    const T8 = part(8);
    const spoilT = 25, spoilTop = top + spoilT;
    const SPW = Math.min(WX + 140, FW - 2 * bw - 30), SPL = WY + 160;
    B(SPW, spoilT, SPL, MAT.mdf, 0, top + spoilT / 2, 0, T8);
    for (let i = 0; i < 9; i++) for (const s of [-1, 1]) Cy(4, 1, MAT.aluB, s * (SPW / 2 - 25), spoilTop + .3, -SPL / 2 + 60 + i * (SPL - 120) / 8, "y", T8, 8);
    const slabW = Math.min(800, WX), slabL = Math.min(1800, WY * .98), slabT = 60, slabZ = 0;
    const tex = makeSlabTexture(slabW, slabL);
    const side = new THREE.MeshStandardMaterial({color: 0x6f4a29, roughness: .9}), topM = new THREE.MeshStandardMaterial({map: tex, roughness: .7});
    const slab = new THREE.Mesh(new THREE.BoxGeometry(mm(slabW), mm(slabT), mm(slabL)), [side, side, topM, side, side, side]);
    slab.position.set(0, mm(spoilTop + slabT / 2), mm(slabZ)); slab.castShadow = slab.receiveShadow = true; T8.add(slab);
    const slabTop = spoilTop + slabT;
    for (const sx of [-1, 1]) for (const sz of [-1, 0, 1]) { const zc = sz * slabL * .38; B(70, 14, 34, MAT.red, sx * (slabW / 2 + 30), spoilTop + 20, zc, T8); Cy(5, 40, MAT.steel, sx * (slabW / 2 + 45), spoilTop + 12, zc, "y", T8, 8); Cy(9, 6, MAT.black, sx * (slabW / 2 + 45), spoilTop + 30, zc, "y", T8, 6); B(30, 12, 30, MAT.black, sx * (slabW / 2 + 12), spoilTop + 18, zc, T8); }
    lab(T8, 0, slabTop, slabL / 2 - 150, "Slab 800 × 1800 mm", "workpiece (river table)", 8, true);
    lab(T8, SPW / 2 - 40, spoilTop, -SPL / 2 + 60, "MDF spoilboard 25 mm", "surface flat before use", 8);
    // senzor délky nástroje + dotyková sonda
    const tsX = -SPW / 2 + 45, tsZ = -SPL / 2 + 45;
    Cy(20, 30, MAT.aluB, tsX, spoilTop + 15, tsZ, "y", T8, 24); Cy(12, 10, MAT.steel, tsX, spoilTop + 35, tsZ, "y", T8, 24);
    lab(T8, tsX, spoilTop + 40, tsZ, "Tool length sensor", "tool setter → PROBE input", 8);
    const tpX = slabW / 2 - 70, tpZ = slabZ - slabL / 2 + 70;
    B(50, 8, 50, MAT.alu, tpX, slabTop + 4, tpZ, T8); B(14, 6, 8, MAT.red, tpX + 30, slabTop + 6, tpZ, T8);
    cable(T8, [[tpX + 34, slabTop + 6, tpZ], [tpX + 70, slabTop + 30, tpZ - 40], [slabW / 2 + 80, spoilTop + 10, -SPL / 2 + 40]], 2, MAT.red, 8);
    lab(T8, tpX, slabTop + 8, tpZ, "Touch plate (probe)", "Z zeroing, G38.2", 8);

    // ===== 2 vedení Y =====
    const R2 = part(2);
    const railH = sbrY ? 50 : 30;
    for (const sx of [-1, 1]) { const rf = railFrame(R2, sx * railX, top, 0, "z"); sbrY ? sbrRail(rf, FL - 20) : hgRail(rf, FL - 20, 20); }
    lab(R2, railX, top + 30, -FL / 2 + 160, sbrY ? "Y rail – SBR20" : "Y rail – HGR20", sbrY ? "supported rod Ø20, 2× ~2200 mm" : "profile rail, 2× ~2200 mm", 2, true);

    // ===== 3 portál =====
    const G = new THREE.Group(); root.add(G); M.gantry = G;
    const P3 = part(3, G);
    const carTop = top + railH;
    const gb = p.gBeam, beamY = slabTop + p.clear + gb[1] / 2, beamTop = beamY + gb[1] / 2, frontZ = -gb[0] / 2;
    const plateT = p.style === "alu" || p.style === "bolt" ? 15 : 12, plateXa = railX + 75 - plateT / 2, plateOut = railX + 75;
    const yb = top - Math.min(bh, 90) / 2;                                 // výška řemene Y
    const xIn = plateXa - plateT / 2;
    for (const sx of [-1, 1]) {
      const rf = railFrame(P3, sx * railX, top, 0, "z");
      for (const zc of [-80, 80]) sbrY ? sbrBlock(rf, zc) : hgBlock(rf, zc, 20);
      const fw = drive === "screw" ? 200 : 150, fx = drive === "screw" ? sx * (railX - 25) : sx * railX;
      B(fw, 12, 260, MAT.alu, fx, carTop + 6, 0, P3);
      for (const a of [-1, 1]) for (const b of [-1, 1]) Cy(5, 3, MAT.aluB, sx * railX + a * 30, carTop + 13, b * 80 + 20 * b / Math.abs(b) * 0, "y", P3, 6);
      const y0 = drive === "belt" ? yb - 40 : carTop, y1 = beamTop + 30;
      B(plateT, y1 - y0, 280, p.style === "weld" || p.style === "table" ? MAT.frame : MAT.alu, sx * plateXa, (y0 + y1) / 2, 0, P3);
      for (const a of [-1, 1]) for (const b of [-1, 1]) Cy(6.5, 4, MAT.steel, sx * (plateOut + 2), beamY + a * gb[1] * .3, b * gb[0] * .3, "x", P3, 6);
      const gs = B(8, 90, 90, MAT.alu, sx * (xIn - 4), beamY - gb[1] / 2 - 25, gb[0] / 2 + 20, P3); gs.rotation.x = Math.PI / 4; gs.scale.set(1, .75, .75);
    }
    B(2 * xIn, gb[1], gb[0], p.style === "alu" ? MAT.alu : MAT.frame, 0, beamY, 0, P3);
    lab(P3, 0, beamTop, gb[0] / 2, "Gantry beam", `${gb[0]}×${gb[1]} · clear span ~${Math.round(2 * xIn)} mm`, 3, true);
    lab(P3, -railX, carTop, 120, sbrY ? "SBR20UU carriages" : "HGH20CA carriages", "2 per rail", 3);
    if (ghostDrive) for (const sx of [-1, 1]) { Cy(12, 140, MAT.black, sx * (plateOut + 20), beamY, -60, "z", P3); lab(P3, sx * (plateOut + 20), beamY, -130, "Handle (manual feed)", "stage 0–1", 3); }

    // ===== 4 vedení X + vozík =====
    const P4 = part(4, G);
    const rsp = Math.max(gb[1] - 30, 50) / 2;
    for (const sy of [-1, 1]) { const rf = railFrame(P4, 0, beamY + sy * rsp, frontZ, "x"); sbrX ? sbrRail(rf, 2 * xIn - 20) : hgRail(rf, 2 * xIn - 20, 20); }
    lab(P4, -xIn * .6, beamY + rsp, frontZ - 20, sbrX ? "X rail – SBR20" : "X rail – 2× HGR20", "stacked on beam front face", 4);
    const C = new THREE.Group(); G.add(C); M.car = C;
    const C4 = part(4, C);
    for (const sy of [-1, 1]) { const rf = railFrame(C4, 0, beamY + sy * rsp, frontZ, "x"); for (const zc of [-55, 55]) sbrX ? sbrBlock(rf, zc) : hgBlock(rf, zc, 20); }
    const cpBack = frontZ - (sbrX ? 50 : 30), cpF = cpBack - 15;
    const cTop = beamY + rsp + 160, cBot = beamY - rsp - 95, cY = (cTop + cBot) / 2, Hc = cTop - cBot;
    B(200, Hc, 15, MAT.alu, 0, cY, cpBack - 7.5, C4);
    for (const a of [-1, 1]) for (const b of [-1, 1]) Cy(4, 3, MAT.aluB, a * 55, beamY + b * rsp, cpF - 1, "z", C4, 6);
    lab(C4, 100, cY, cpF, "X-axis carriage", "15 mm Al plate", 4);

    // ===== 5 osa Z + vřeteno =====
    const C5 = part(5, C);
    for (const sx of [-1, 1]) { const rf = railFrame(C5, sx * 55, cY, cpF, "y"); hgRail(rf, Hc - 10, 15); }
    const Z = new THREE.Group(); C.add(Z); M.z = Z;
    const Z5 = part(5, Z);
    const toolLen = 108, spBot = slabTop + 100 + toolLen, zpBot = spBot - 12, zpF0 = cpF - 24;
    for (const sx of [-1, 1]) { const rf = railFrame(Z5, sx * 55, 0, cpF, "y"); for (const yy of [zpBot + 75, zpBot + 205]) hgBlock(rf, yy, 15); }
    B(170, 300, 15, MAT.alu, 0, zpBot + 150, zpF0 - 7.5, Z5);
    lab(C5, -55, cTop - 20, cpF, "Z rail – 2× HGR15", "4 carriages", 5);
    lab(Z5, 85, zpBot + 280, zpF0 - 15, "Z-axis plate", "15 mm Al", 5);
    // kuličkový šroub Z
    const screwZ = cpF - 12, yS0 = cBot + 18, yS1 = cTop - 22;
    B(60, 22, 22, MAT.aluB, 0, cBot + 18, cpF - 11, C5);                           // BF12
    B(60, 34, 22, MAT.aluB, 0, cTop - 36, cpF - 11, C5);                           // BK12
    const zScrew = spinner(C5, 0, (yS0 + yS1) / 2, screwZ, "y+"); screwMesh(zScrew, 8, yS1 - yS0);
    lab(C5, 0, cBot + 30, screwZ - 14, "Ball screw SFU1605", "5 mm lead · BF12 at bottom", 5);
    lab(C5, 0, cTop - 36, screwZ - 14, "BK12 bearing block", "fixed screw support", 5);
    B(48, 40, 20, MAT.alu, 0, zpBot + 140, screwZ, Z5);
    Cy(24, 10, MAT.brass, 0, zpBot + 165, screwZ, "y", Z5, 24);
    lab(Z5, 30, zpBot + 165, screwZ - 20, "Nut + DSG16H housing", "drives Z plate", 5);
    // držák motoru Z
    B(110, 10, 80, MAT.alu, 0, cTop + 5, screwZ + 8, C5);
    for (const s of [-1, 1]) B(10, 62, 70, MAT.alu, s * 40, cTop + 41, screwZ + 8, C5);
    B(100, 10, 80, MAT.alu, 0, cTop + 77, screwZ + 8, C5);
    const zCoup = spinner(C5, 0, cTop + 40, screwZ, "y+"); coupling(zCoup);
    lab(C5, 45, cTop + 40, screwZ - 20, "Coupling 8×10", "motor ↔ screw", 5);
    // vřeteno – hranaté 2,2 kW
    const SP = new THREE.Group(); Z5.add(SP);
    const spZ = zpF0 - 15 - 10 - 36.5;
    B(110, 166, 10, MAT.alu, 0, spBot + 83, zpF0 - 20, SP);
    for (const a of [-1, 1]) for (const b of [0, 1, 2, 3]) Cy(4.5, 3, MAT.aluB, a * 48, spBot + 30 + b * 35, zpF0 - 26, "z", SP, 6);
    B(82, 166, 73, MAT.fins, 0, spBot + 83, spZ, SP);
    B(50, 30, .6, MAT.white, 0, spBot + 120, spZ - 36.8, SP);
    // ventilátor nahoře
    const capY = spBot + 186;
    for (const s of [-1, 1]) { B(82, 40, 3, MAT.black, 0, capY, spZ + s * 35, SP); B(3, 40, 73, MAT.black, s * 39.5, capY, spZ, SP); }
    for (let i = -3; i <= 3; i++) B(80, 2, 4, MAT.black, 0, capY + 19, spZ + i * 9, SP);
    const fan = spinner(SP, 0, capY + 4, spZ, "y+"); M.fan = fan;
    for (let i = 0; i < 6; i++) { const bl = B(32, 2, 9, MAT.aluD, 16, 0, 0, fan); bl.parent.remove(bl); const pv = new THREE.Group(); pv.rotation.y = i * Math.PI / 3; fan.add(pv); bl.rotation.x = .5; pv.add(bl); }
    Cy(8, 8, MAT.aluB, 0, 0, 0, "y", fan, 12);
    // svorkovnice + konektor + čidlo
    B(40, 50, 40, MAT.black, 52, spBot + 140, spZ, SP); Cy(9, 16, MAT.aluB, 52, spBot + 173, spZ, "y", SP, 6);
    Cy(4, 10, MAT.blueS, -42, spBot + 60, spZ, "x", SP, 10);
    lab(SP, -45, spBot + 60, spZ, "Spindle temperature sensor (NTC)", "→ ESP32 analog input", 5);
    lab(SP, 52, spBot + 165, spZ, "Spindle terminal box", "U V W + PE, shielded cable", 5);
    // nos, kleština, nástroj
    Cy(29.25, 36, MAT.steel, 0, spBot - 18, spZ, "y", SP, 32);
    lab(SP, 0, spBot + 166, spZ - 37, "Spindle 2.2 kW ER20", "HLTNC GDZ80x73 · air-cooled · max 24,000 rpm", 5, true);
    const cut = new THREE.Group(); SP.add(cut); M.cut = cut; cut.position.set(0, mm(spBot - 36), mm(spZ));
    Cy(17, 18, MAT.steel, 0, -9, 0, "y", cut, 6);
    Cy(4, 40, MAT.cutter, 0, -38, 0, "y", cut, 16);
    Cy(19.5, 12, MAT.cutter, 0, -66, 0, "y", cut, 18);
    for (let i = 0; i < 3; i++) { const ins = B(8, 12, 6, MAT.brass, Math.cos(i * 2.09) * 17, -66, Math.sin(i * 2.09) * 17, cut); ins.rotation.y = -i * 2.09; }
    lab(SP, 0, spBot - 100, spZ - 22, "Surfacing bit Ø39", "8 mm shank · ER20 collet", 5);
    // odsávací hubice + hadice
    const shoe = new THREE.Group(); SP.add(shoe);
    Cy(64, 10, MAT.aluB, 0, spBot - 30, spZ, "y", shoe, 32);
    const br = new THREE.Mesh(new THREE.CylinderGeometry(mm(62), mm(62), mm(58), 32, 1, true), MAT.brush); br.position.set(0, mm(spBot - 64), mm(spZ)); shoe.add(br);
    Cy(25, 70, MAT.aluB, 85, spBot - 22, spZ, "x", shoe, 20);
    cable(SP, [[118, spBot - 22, spZ], [150, spBot + 30, spZ + 10], [150, spBot + 220, spZ + 60], [130, spBot + 380, cpF + 90]], 19, MAT.hose, 5);
    lab(SP, 70, spBot - 30, spZ - 60, "Dust shoe with brush", "→ Ø50 hose to vacuum / cyclone", 5);

    // ===== 6 pohony (motory, řemeny, šrouby) =====
    const D6r = part(6), D6g = part(6, G), D6c = part(6, C);
    nema23(D6c, 0, cTop + 82, screwZ + 8, "y-");
    lab(D6c, 32, cTop + 120, screwZ, "Z motor – NEMA23 3 Nm", "direct drive to screw", 6);
    let anchorY = null, anchorX = null;
    const pulleys = [];
    if (drive === "belt") {
      // --- Y: řemen HTD natažený podél rámu, omega na portálu ---
      for (const sx of [-1, 1]) {
        const bx = sx * (plateOut + 25);
        for (const sz of [-1, 1]) { B(34, 46, 22, MAT.alu, bx, yb + 8, sz * (FL / 2 + 14), D6r); B(Math.abs(bx) - half + 20, 20, 22, MAT.alu, sx * (half + (Math.abs(bx) - half) / 2), yb + 8, sz * (FL / 2 + 14), D6r); Cy(4, 40, MAT.steel, bx, yb + 8, sz * (FL / 2 + 34), "z", D6r, 8); }
        const s1 = strip(D6r, "z", 15, 3, [bx, yb, 0], MAT.belt, 6), s2 = strip(D6r, "z", 15, 3, [bx, yb, 0], MAT.belt, 6);
        DYN.push(() => { const gz = G.position.z * 1000; s1.setSpan(-FL / 2 - 4, gz - 42); s2.setSpan(gz + 42, FL / 2 + 4); });
        const pu = spinner(D6g, bx, yb + 46, 0, sx > 0 ? "x+" : "x-"); pulley(pu); pulleys.push({o: pu, axis: "y", k: 1 / 16});
        for (const sz of [-1, 1]) { const id = spinner(D6g, bx, yb + 13, sz * 42, sx > 0 ? "x+" : "x-"); idler(id); pulleys.push({o: id, axis: "y", k: -1 / 11}); }
        for (const sz of [-1, 1]) { const sg = B(15, 3, 44, MAT.belt, bx, yb + 30, sz * 22, D6g); sg.rotation.x = -sz * .95; }
        const arc = new THREE.Mesh(new THREE.CylinderGeometry(mm(18), mm(18), mm(15), 24, 1, true, 0, Math.PI), MAT.belt); arc.rotation.z = Math.PI / 2; arc.rotation.y = 0; arc.position.set(mm(bx), mm(yb + 46), 0); D6g.add(arc);
        B(8, 120, 130, MAT.alu, sx * (plateOut + 48), yb + 30, 0, D6g);
        for (const a of [-1, 1]) for (const b of [-1, 1]) Cy(5, 40, MAT.steel, sx * (plateOut + 24), yb + 30 + a * 48, b * 55, "x", D6g, 10);
        nema23(D6g, sx * (plateOut + 52), yb + 46, 0, sx > 0 ? "x-" : "x+");
        if (sx > 0) anchorY = (() => { const o = new THREE.Object3D(); o.position.set(mm(bx), mm(yb + 40), 0); D6g.add(o); return o; })();
        lab(D6g, sx * (plateOut + 95), yb + 80, 0, `Y${sx < 0 ? "1" : "2"} motor – NEMA23`, "2 motors = auto-squaring", 6);
        lab(D6g, bx, yb + 70, -20, "HTD 20T pulley + 2 idlers", "omega drive", 6);
        lab(D6r, bx, yb + 4, -FL / 2 + 220, "Belt HTD 5M 15 mm", "steel-cord, statically tensioned", 6);
        lab(D6r, bx, yb + 30, FL / 2 + 14, "Belt tensioner", "", 6);
      }
      // --- X: řemen na temeni příčníku ---
      const bz = 0, by = beamTop + 6;
      for (const s of [-1, 1]) { B(28, 34, 34, MAT.alu, s * (xIn - 16), beamTop + 17, bz, D6g); Cy(4, 36, MAT.steel, s * (xIn - 4), by + 7, bz, "x", D6g, 8); }
      const xs1 = strip(D6g, "x", 3, 15, [0, by + 7.5, bz], MAT.belt, 6), xs2 = strip(D6g, "x", 3, 15, [0, by + 7.5, bz], MAT.belt, 6);
      DYN.push(() => { const cx = C.position.x * 1000; xs1.setSpan(-xIn + 30, cx - 42); xs2.setSpan(cx + 42, xIn - 30); });
      const brY = beamTop + 48, brZ0 = cpBack, brZ1 = gb[0] / 2 + 75;
      B(200, 10, brZ1 - brZ0, MAT.alu, 0, brY, (brZ0 + brZ1) / 2, D6c);
      B(200, brY - cTop + 5 > 0 ? 10 : 10, 10, MAT.alu, 0, brY, brZ0, D6c);
      const pu = spinner(D6c, 0, by + 7, 46, "y+"); pulley(pu); pulleys.push({o: pu, axis: "y", k: 1 / 16, x: true});
      for (const s of [-1, 1]) { const id = spinner(D6c, s * 42, by + 7, 13, "y+"); idler(id); pulleys.push({o: id, axis: "y", k: -1 / 11, x: true}); Cy(4, brY - by - 6, MAT.steel, s * 42, (brY + by + 14) / 2, 13, "y", D6c, 8); }
      for (const s of [-1, 1]) { const sg = B(44, 15, 3, MAT.belt, s * 22, by + 7.5, 30, D6c); sg.rotation.y = s * .95; }
      nema23(D6c, 0, brY + 5, 46, "y-");
      anchorX = (() => { const o = new THREE.Object3D(); o.position.set(0, mm(by + 20), mm(30)); D6c.add(o); return o; })();
      lab(D6c, 0, brY + 85, 46, "X motor – NEMA23", "on carriage", 6);
      lab(D6c, 50, by + 10, 30, "X omega drive", "pulley + 2 idlers", 6);
      lab(D6g, -xIn * .5, by + 15, bz, "X belt HTD 5M", "tensioned along beam", 6);
    } else if (drive === "screw") {
      // --- Y: 2 kuličkové šrouby ---
      for (const sx of [-1, 1]) {
        const xs = sx * (railX - 70), ys = top + 38, L = FL - 140;
        B(60, 45, 26, MAT.aluB, xs, ys - 4, -FL / 2 + 80, D6r); B(60, 40, 22, MAT.aluB, xs, ys - 6, FL / 2 - 70, D6r);
        const sc = spinner(D6r, xs, ys, 5, "z+"); screwMesh(sc, 8, L); pulleys.push({o: sc, axis: "y", k: 2 * Math.PI / 10, screwY: true});
        B(70, 70, 50, MAT.alu, xs, ys, -FL / 2 + 30, D6r);
        nema23(D6r, xs, ys, -FL / 2 + 4, "z+");
        B(56, 46, 46, MAT.alu, xs, ys, 0, D6g);
        lab(D6r, xs, ys + 40, -FL / 2 + 20, `Y${sx < 0 ? "1" : "2"} motor + SFU2010`, "BK15 at motor end", 6);
      }
      anchorY = (() => { const o = new THREE.Object3D(); o.position.set(mm(-(railX - 70)), mm(top + 40), 0); D6g.add(o); return o; })();
      // --- X: šroub na čele příčníku ---
      const zsX = frontZ - 14, L = 2 * xIn - 70;
      const scx = spinner(D6g, 0, beamY, zsX, "x+"); screwMesh(scx, 8, L); pulleys.push({o: scx, axis: "y", k: 2 * Math.PI / 10, x: true, screw: true});
      B(26, 44, 34, MAT.aluB, -(xIn - 20), beamY, zsX, D6g); B(26, 44, 34, MAT.aluB, xIn - 20, beamY, zsX, D6g);
      B(50, 70, 70, MAT.alu, plateOut + 25, beamY, zsX, D6g);
      nema23(D6g, plateOut + 50, beamY, zsX, "x-");
      B(30, 40, 16, MAT.alu, 0, beamY, zsX, D6c);
      anchorX = (() => { const o = new THREE.Object3D(); o.position.set(0, mm(beamY), mm(zsX)); D6c.add(o); return o; })();
      lab(D6g, plateOut + 90, beamY + 40, zsX, "X motor + SFU1610", "", 6);
    }
    if (ghostDrive) { ghostify(D6r); ghostify(D6g); D6c.children.forEach(ch => { if (ch.position.y > mm(beamTop + 20) && Math.abs(ch.position.z - mm(46)) < 1e-3) ghostify(ch); }); }
    if (ghostDrive) { lab(D6r, -(plateOut + 25), yb + 40, -FL / 2 + 420, "Prepared for: belt + X/Y motors", "stage 2–3 (manual for now)", 6); }
    M.pulleys = pulleys;

    // ===== 7 elektronika, kabely, řetězy, senzory, displej =====
    const E = part(7), Eg = part(7, G), Ec = part(7, C), Ez = part(7, Z);
    // --- rozvaděč ---
    const cabW = 520, cabH = 640, cabD = 230, cabX = -(plateOut + 560), cabZ = -FL / 2 + 260, cabY = 330 + cabH / 2;
    const cab = grp(E, cabX, cabY, cabZ);
    B(cabW, cabH, 4, MAT.cab, 0, 0, cabD / 2 - 2, cab);
    for (const s of [-1, 1]) { B(4, cabH, cabD, MAT.cab, s * (cabW / 2 - 2), 0, 0, cab); B(cabW, 4, cabD, MAT.cab, 0, s * (cabH / 2 - 2), 0, cab); }
    B(cabW - 20, cabH - 20, 3, MAT.cabIn, 0, 0, cabD / 2 - 6, cab);
    const door = grp(cab, -cabW / 2, 0, -cabD / 2); door.rotation.y = 1.85;
    B(cabW, cabH, 4, MAT.cab, cabW / 2, 0, 0, door); B(cabW - 60, 6, 2, MAT.duct, cabW / 2, cabH / 2 - 40, 3, door);
    Cy(26, 20, MAT.yellow, cabW / 2, 160, -12, "z", door, 24); Cy(16, 30, MAT.red, cabW / 2, 160, -28, "z", door, 24);
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) B(30, 40, 30, MAT.black, sx * (cabW / 2 - 40), -cabH / 2 - 20, sz * (cabD / 2 - 30), cab);
    B(70, 330, 70, MAT.frame, 0, -cabH / 2 - 165 - 40, 0, cab); B(300, 12, 260, MAT.frame, 0, -cabH / 2 - 340 - 34, 0, cab);
    const back = cabD / 2 - 8;
    const rows = [200, 20, -190];
    rows.forEach(ry => { B(cabW - 40, 7, 10, MAT.din, 0, ry, back - 5, cab); });
    for (const ry of [110, -85]) B(cabW - 40, 40, 40, MAT.duct, 0, ry, back - 20, cab);
    B(40, 520, 40, MAT.duct, cabW / 2 - 40, 0, back - 20, cab);
    const comp = (w, h, d, mat, x, y, title, sub) => { const m = B(w, h, d, mat, x, y, back - 10 - d / 2, cab); if (title) lab(cab, x, y + h / 2, back - 10 - d, title, sub, 7); return m; };
    comp(18, 85, 70, MAT.white, -205, rows[0], "Circuit breaker C16", "dedicated circuit"); B(6, 14, 8, MAT.black, -205, rows[0] + 5, back - 84, cab);
    comp(36, 85, 70, MAT.white, -170, rows[0], "RCD type A / F", "30 mA"); B(10, 14, 8, MAT.blueS, -170, rows[0] + 5, back - 84, cab);
    comp(90, 55, 45, MAT.steel, -85, rows[0], "EMI filtr 1F 20 A", "");
    comp(45, 80, 75, MAT.cabGrey, 0, rows[0], "Contactor 24 V", "cuts 48 V on STOP");
    comp(80, 90, 35, MAT.aluD, 90, rows[0], "Zdroj 24 V (logika)", "LRS-50-24");
    comp(36, 80, 60, MAT.cabBlue, 175, rows[0], "Svorky", "");
    const vfd = comp(110, 160, 140, MAT.cabBlack, -170, rows[1] - 20, "VFD EV210 2.2 kW", "1-ph 230 V → 3-ph, RS485");
    vfdCan = document.createElement("canvas"); vfdCan.width = 128; vfdCan.height = 48; vfdCtx = vfdCan.getContext("2d");
    vfdTex = new THREE.CanvasTexture(vfdCan);
    const vfdScr = new THREE.Mesh(new THREE.PlaneGeometry(mm(60), mm(22)), new THREE.MeshBasicMaterial({map: vfdTex}));
    vfdScr.position.set(mm(-170), mm(rows[1] + 20), mm(back - 10 - 140 - .6)); vfdScr.rotation.y = Math.PI; cab.add(vfdScr);
    for (let i = 0; i < 4; i++) B(10, 8, 2, MAT.cabGrey, -195 + i * 17, rows[1] - 15, back - 151, cab);
    B(60, 40, 4, MAT.cabOrange, -170, rows[1] - 70, back - 151, cab);
    comp(215, 115, 50, MAT.aluD, 40, rows[1], "Zdroj 48 V 600 W", "LRS-600-48 · motory");
    for (let i = 0; i < 9; i++) B(2, 100, 1, MAT.aluB, -50 + i * 25, rows[1], back - 60.6, cab);
    for (let i = 0; i < 4; i++) { comp(34, 118, 75, MAT.cabBlack, -200 + i * 42, rows[2], i === 0 ? "DM556 drivers ×4" : null, i === 0 ? "X · Y1 · Y2 · Z" : null); B(30, 12, 8, MAT.green, -200 + i * 42, rows[2] + 50, back - 90, cab); B(30, 12, 8, MAT.green, -200 + i * 42, rows[2] - 50, back - 90, cab); }
    comp(110, 85, 22, MAT.pcb, 30, rows[2], "6x CNC controller board (ESP32)", "FluidNC 4.1 · WiFi");
    B(26, 40, 4, MAT.steel, 15, rows[2] + 10, back - 34, cab); for (let i = 0; i < 6; i++) B(12, 10, 10, MAT.green, -10 + i * 16, rows[2] - 35, back - 38, cab);
    comp(40, 50, 18, MAT.pcbB, 120, rows[2] + 10, "RS485 module (isolated)", "Modbus → VFD");
    comp(45, 30, 25, MAT.cabGrey, 185, rows[2] + 20, "Relay (dust extraction)", "");
    lab(cab, 0, cabH / 2 + 10, -cabD / 2, "Control cabinet", "protection · VFD · PSUs · drivers · ESP32", 7, true);
    lab(door, cabW / 2, 160, -40, "Main switch + STOP", "", 7);
    const anchorEl = new THREE.Object3D(); anchorEl.position.set(0, 0, 0); cab.add(anchorEl);
    // --- 7" displej ESP32 na rameni ---
    const armBase = [cabX + cabW / 2 - 60, cabY + cabH / 2, cabZ - 20];
    const anchorDisp = makeDisplay(E, armBase, 260, 220);
    drawPendant();
    // --- energetické řetězy ---
    const sY = [], sXr = [], sZr = [];
    const chainYx = -(plateOut + 175), chainYlow = top - 55, RY = 75;
    B(70, 5, FL * .55, MAT.aluD, chainYx, chainYlow - 14, -FL * .1, E);
    for (const zz of [-FL * .3, 0, FL * .15]) B(Math.abs(chainYx) - half + 20, 6, 30, MAT.aluD, -(half + (Math.abs(chainYx) - half) / 2), chainYlow - 14, zz, E);
    M.chainY = {x: chainYx, low: chainYlow, R: RY};
    const xChainZ = gb[0] / 2 + 45, xLow = beamTop - 110, RX = 60;
    B(2 * xIn - 40, 5, 50, MAT.aluD, 0, xLow - 13, xChainZ, Eg);
    for (const s of [-1, 0, 1]) B(10, 40, 50, MAT.aluD, s * xIn * .7, xLow - 2, gb[0] / 2 + 25, Eg);
    const zChainX = -112, RZ = 30, zcz = cpF - 30;
    // --- kabely ---
    const KB = MAT.cabBlack, KO = MAT.cabOrange, KS = MAT.cabBlue;
    cable(E, [[cabX + cabW / 2, cabY - 150, cabZ + 40], [cabX + cabW / 2 + 120, chainYlow + 20, cabZ + 60], [chainYx, chainYlow + 10, -FL * .2], [chainYx, chainYlow + 5, -40]], 7, KO, 7);
    cable(E, [[cabX + cabW / 2, cabY - 170, cabZ + 60], [cabX + cabW / 2 + 110, chainYlow + 15, cabZ + 80], [chainYx + 5, chainYlow + 8, -FL * .2], [chainYx + 6, chainYlow + 6, -40]], 4, KB, 7);
    // na portálu: z konce Y-řetězu k motorům a k X-řetězu
    const yEnd = [chainYx, chainYlow + 2 * RY, 0];
    B(Math.abs(chainYx) - plateOut + 10, 10, 60, MAT.aluD, -(plateOut + (Math.abs(chainYx) - plateOut) / 2), yEnd[1] + 18, 0, Eg);
    cable(Eg, [yEnd, [-(plateOut + 60), yEnd[1] + 40, 30], [-(plateOut + 10), beamTop + 20, gb[0] / 2 + 20], [-xIn * .6, xLow + 6, xChainZ], [-20, xLow + 2, xChainZ]], 7, KO, 7);
    if (drive === "belt") {
      cable(Eg, [yEnd, [-(plateOut + 110), yEnd[1] - 40, 40], [-(plateOut + 90), yb + 46, 50]], 4, KB, 7);
      cable(Eg, [yEnd, [-(plateOut + 30), beamY - gb[1] / 2 - 20, gb[0] / 2 + 10], [plateOut - 40, beamY - gb[1] / 2 - 20, gb[0] / 2 + 10], [plateOut + 60, yb + 80, 50], [plateOut + 90, yb + 46, 50]], 4, KB, 7);
    }
    // na vozíku X: z konce X-řetězu k motoru Z, motoru X a do Z-řetězu
    const xEnd = [0, xLow + 2 * RX, xChainZ];
    B(60, 10, xChainZ - cpBack + 10, MAT.aluD, 0, xEnd[1] + 16, (xChainZ + cpBack) / 2, Ec);
    cable(Ec, [xEnd, [0, cTop + 30, xChainZ - 20], [30, cTop + 110, screwZ + 40], [30, cTop + 110, screwZ + 30]], 4, KB, 7);
    cable(Ec, [xEnd, [-60, cY + 40, cpBack + 30], [zChainX, cY - 30, zcz]], 6, KO, 7);
    // na desce Z: ze Z-řetězu do vřetena
    const zAttY = zpBot + 250;
    B(Math.abs(zChainX - 2 * RZ) - 85 + 10, 10, 30, MAT.aluD, -(85 + Math.abs(zChainX - 2 * RZ)) / 2, zAttY - 12, zcz, Ez);
    cable(Ez, [[zChainX - 2 * RZ, zAttY, zcz], [zChainX - 2 * RZ - 10, spBot + 215, spZ + 10], [0, spBot + 215, spZ - 10], [52, spBot + 190, spZ], [52, spBot + 181, spZ]], 6, KO, 7);
    cable(Ez, [[zChainX - 2 * RZ, zAttY - 4, zcz], [zChainX - 2 * RZ + 5, spBot + 100, spZ - 10], [-50, spBot + 62, spZ - 10], [-47, spBot + 60, spZ]], 2, KS, 7);
    lab(Ec, zChainX - RZ, cTop + 10, zcz, "Z cable chain", "spindle cable + NTC", 7);
    lab(Eg, xIn * .4, beamTop + 40, xChainZ, "X cable chain 25×38", "on rear side of beam", 7);
    lab(E, chainYx, chainYlow + 2 * RY + 30, FL * .25, "Y cable chain 25×38", "cables from control cabinet", 7);
    lab(E, cabX + cabW / 2 + 120, chainYlow + 40, cabZ + 60, "Shielded spindle cable", "4×1.5 mm², shield to PE", 7);
    // --- senzory koncových poloh ---
    const sens = (s, active) => { M.sensors.push({...s, active}); };
    for (const sx of [-1, 1]) {
      const s = sensor(E, sx * (railX - 46), top + 22, -FL / 2 + 70, "z", `Y${sx < 0 ? 1 : 2} sensor (home)`, sx < 0 ? "inductive NPN M12 · gantry squaring" : "inductive NPN M12", 7);
      B(10, 30, 26, MAT.aluD, sx * (railX - 46), top + 22, -FL / 2 + 52, E);
      B(10, 20, 6, MAT.steel, sx * (railX - 46), carTop - 2, -132, Eg);
      sens({name: `Y${sx < 0 ? 1 : 2}`, led: s.led}, () => G.position.z * 1000 - 132 < -FL / 2 + 70 + 70);
    }
    {
      const s = sensor(Eg, -(xIn - 30), beamY - gb[1] / 2 - 12, frontZ - 25, "x", "X sensor (home)", "inductive M12", 7);
      B(8, 20, 30, MAT.steel, -100, beamY - gb[1] / 2 - 12, cpBack - 8, Ec);
      sens({name: "X", led: s.led}, () => C.position.x * 1000 - 100 < -(xIn - 30) + 60);
      const s2 = sensor(Ec, -96, cTop - 14, cpF - 18, "y", "Z sensor (home at top)", "inductive M12", 7);
      B(26, 6, 26, MAT.steel, -96, zpBot + 252, cpF - 18, Ez);
      sens({name: "Z", led: s2.led}, () => Z.position.y * 1000 > -20);
    }
    const es2 = grp(Eg, -(plateOut + 30), beamTop + 10, -100);
    B(60, 60, 50, MAT.yellow, 0, 0, 0, es2); Cy(20, 14, MAT.red, 0, 0, -30, "z", es2, 24);
    lab(es2, 0, 34, 0, "STOP on gantry", "", 7);
    // --- dráhy, řetězy a dynamika ---
    M.lim = {x: xIn - 140, zMax: FL / 2 - 220};
    M.beamY = beamY; M.FL = FL; M.FW = FW; M.spBot = spBot; M.toolLen = toolLen; M.toolOffZ = spZ;
    M.slab = {w: slabW, l: slabL, top: slabTop, z: slabZ};
    G.position.z = mm(M.lim.zMax * .6 - spZ); C.position.x = 0; Z.position.y = 0;
    st.path = makePath(); st.seg = 0; st.segT = 0; st.cutDone = 0;
    const gzs = st.path.map(q => q.z - spZ), xs = st.path.map(q => q.x), zs = st.path.map(q => q.y);
    chain({parent: E, O: [chainYx, chainYlow, 0], A: [0, 0, 1], U: [0, 1, 0], sF: -40, sMax: Math.max(...gzs) + 20, R: RY, getS: () => G.position.z * 1000, step: 7});
    chain({parent: Eg, O: [0, xLow, xChainZ], A: [1, 0, 0], U: [0, 1, 0], sF: -20, sMax: Math.max(...xs.map(Math.abs)) + 20, R: RX, getS: () => C.position.x * 1000, step: 7});
    chain({parent: Ec, O: [zChainX, 0, zcz], A: [0, 1, 0], U: [-1, 0, 0], sF: cY - 30, sMax: zAttY + Math.max(...zs) + 10, R: RZ, w: 30, h: 15, pitch: 18, getS: () => zAttY + Z.position.y * 1000, step: 7, extra: 40});
    // rotace řemenic / šroubů
    let lastG = G.position.z, lastC = C.position.x, lastZ = Z.position.y;
    DYN.push(() => {
      const dG = (G.position.z - lastG) * 1000, dC = (C.position.x - lastC) * 1000, dZ = (Z.position.y - lastZ) * 1000;
      lastG = G.position.z; lastC = C.position.x; lastZ = Z.position.y;
      for (const q of M.pulleys) q.o.rotation.y += (q.x ? dC : dG) * q.k * (q.screw || q.screwY ? 1 : 1);
      zScrew.rotation.y += dZ / 5 * 2 * Math.PI; zCoup.rotation.y += dZ / 5 * 2 * Math.PI;
    });
    DYN.push(() => { for (const s of M.sensors) { const a = s.active(); if (a !== s.on) { s.on = a; s.led.material = a ? MAT.ledOn : MAT.ledOff; } } });
    M.xFront = drive === "screw";
    explodable(C5, "osa Z (šroub, spojka, vřeteno)", [[zCoup.parent, [0, 60, -40]], [zScrew.parent, [0, 0, -70]], [SP, [0, 0, -260]]]);
    explodable(SP, "vřeteno (fréza, hubice)", [[shoe, [0, -140, 0]], [cut, [0, -120, 0]]]);
    D6c.children.filter(o => o.type === "Group").forEach(g => explodable(g, "motor NEMA23", [[g, [0, 110, 0]]]));
    const dy = top + 40;
    dim(root, [-half, dy, -FL / 2], [-half, dy, FL / 2], [-160, 0, 0], `${Math.round(FL)} mm`, {sub: "frame length", step: 1});
    dim(root, [-half, dy, -FL / 2], [half, dy, -FL / 2], [0, 0, -180], `${Math.round(FW)} mm`, {sub: "frame width", step: 1});
    dim(root, [half + 60, 0, -FL / 2], [half + 60, top, -FL / 2], [80, 0, 0], `${Math.round(top)} mm`, {sub: "table height", param: "legH", val: p.legH, step: 1});
    dim(root, [-slabW / 2, slabTop, slabZ + slabL / 2], [slabW / 2, slabTop, slabZ + slabL / 2], [0, 0, 120], `${Math.round(slabW)} mm`, {sub: "workpiece width", param: "workX", val: p.workX, step: 8});
    dim(root, [slabW / 2, slabTop, slabZ - slabL / 2], [slabW / 2, slabTop, slabZ + slabL / 2], [140, 0, 0], `${Math.round(slabL)} mm`, {sub: "workpiece length", param: "workY", val: p.workY, step: 8});
    dim(G, [-xIn, beamY - gb[1] / 2 - 10, gb[0] / 2 + 20], [xIn, beamY - gb[1] / 2 - 10, gb[0] / 2 + 20], [0, -60, 0], `${Math.round(2 * xIn)} mm`, {sub: "gantry clear span", step: 3});
    dim(G, [xIn - 30, slabTop, gb[0] / 2 + 60], [xIn - 30, beamY - gb[1] / 2, gb[0] / 2 + 60], [0, 0, 60], `${Math.round(beamY - gb[1] / 2 - slabTop)} mm`, {sub: "clearance under beam", param: "clear", val: p.clear, step: 3});
    M.anchors = {z: (() => { const o = new THREE.Object3D(); o.position.set(0, mm(spBot + 120), mm(spZ + 30)); Z.add(o); return o; })(), y: anchorY, x: anchorX, el: anchorEl, disp: anchorDisp};
    setStep(st.step, true);
    DYN.forEach(f => f());
    if (!keep) fitView("iso", true);
    updateHUD();
  }
  // =====================================================================
  //   NÁŠ NÁVRH – svařované jekly na stávajícím stole z Al solárních profilů
  // =====================================================================
  function sbr16Rail(g, L) {
    B(40, 5, L, MAT.aluD, 0, 2.5, 0, g); B(10, 16, L, MAT.aluD, 0, 11, 0, g);
    Cy(8, L, MAT.rail, 0, 25, 0, "z", g, 22);
    const n = Math.min(24, Math.floor(L / 150)), stp = L / n;
    for (let i = 0; i < n; i++) for (const s of [-1, 1]) Cy(3, 1.4, MAT.aluB, s * 14, 5.6, -L / 2 + stp * (i + .5), "y", g, 8);
  }
  function sbr16Block(g, zc) {
    B(45, 27, 45, MAT.alu, 0, 31.5, zc, g);                 // SBR16UU 45×45, výška 45
    B(12, 9, 46, MAT.aluB, 0, 20, zc, g);
    Cy(11.5, 46, MAT.steel, 0, 25, zc, "z", g, 20);
    Cy(2.2, 4, MAT.aluB, 21, 31, zc, "x", g, 8);
  }
  function profile40(len, x, y, z, axis, par) {                // Al profil pro solární panely 40×40 s drážkou
    const PR = 40;
    if (axis === "z") { B(PR, PR, len, MAT.alu, x, y, z, par); B(8, 1.5, len, MAT.aluB, x, y + PR / 2 + .3, z, par); for (const s of [-1, 1]) B(1.2, 8, len, MAT.aluB, x + s * (PR / 2 + .3), y, z, par); }
    else { B(len, PR, PR, MAT.alu, x, y, z, par); B(len, 1.5, 8, MAT.aluB, x, y + PR / 2 + .3, z, par); for (const s of [-1, 1]) B(len, 8, 1.2, MAT.aluB, x, y, z + s * (PR / 2 + .3), par); }
  }
  function tubeBetween(par, a, b, size, mat) {                 // jekl mezi dvěma body (pro vzpěry)
    const A = new THREE.Vector3(...a), Bv = new THREE.Vector3(...b), L = A.distanceTo(Bv);
    const m = B(size, size, L, mat, (a[0] + b[0]) / 2, (a[1] + b[1]) / 2, (a[2] + b[2]) / 2, par);
    const dir = Bv.clone().sub(A).normalize(); m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), dir);
    return m;
  }
  function buildNas(v, keep) {
    const p = getParams(v), c = nasCalc(p);
    mats(0x2f6fa8);
    const PR = 40, half = p.sideSpan / 2, deckT = 18, fy = p.frameH - PR / 2;
    const plexiMat = new THREE.MeshStandardMaterial({color: 0xbfe3ff, roughness: .08, metalness: 0, transparent: true, opacity: .32, depthWrite: false});
    // ===== 1 spodní konstrukce (máme) =====
    const F = part(1);
    for (const s of [-1, 1]) profile40(p.deckL, s * (p.deckW / 2 + PR / 2), fy, 0, "z", F);     // podélné profily vedle desky
    const rodX = half + PR;                                     // závitová tyč je vně bočního profilu
    for (const zz of [-1, -1 / 3, 1 / 3, 1]) profile40(p.deckW, 0, fy, zz * (p.deckL / 2 - PR / 2), "x", F);   // příčné mezi podélnými, v jedné rovině
    B(p.deckW, deckT, p.deckL, MAT.mdf, 0, p.frameH + deckT / 2, 0, F);
    // perforace: díry Ø25, rozteč 100 mm napříč (kratší strana) a 200 mm podél
    const HX = [], HZ = [];
    for (let x = 50; x <= p.deckW / 2 - 25; x += 100) HX.push(-x, x);                     // ±50, ±150, … (souměrně)
    for (let z = 0; z <= p.deckL / 2 - 50; z += 200) HZ.push(...(z ? [-z, z] : [0]));
    HX.sort((a, b) => a - b); HZ.sort((a, b) => a - b);
    { const holeM = new THREE.MeshBasicMaterial({color: 0x2a1e14}), im = new THREE.InstancedMesh(new THREE.CircleGeometry(mm(12.5), 20), holeM, HX.length * HZ.length), M4 = new THREE.Matrix4(), rx = new THREE.Matrix4().makeRotationX(-Math.PI / 2);
      let i = 0; for (const x of HX) for (const z of HZ) { M4.makeTranslation(mm(x), mm(p.frameH + deckT + .3), mm(z)).multiply(rx); im.setMatrixAt(i++, M4); }
      F.add(im); }
    M.holes = {x: HX, z: HZ};
    const sideY = c.sideTop - PR / 2;
    for (const s of [-1, 1]) profile40(p.deckL, s * (p.flat ? half + PR / 2 : half), sideY, 0, "z", F);   // Custom2: vedle spodního profilu
    // rohy (podle fotky): vedle podélného spodního profilu (z vnější strany, v jeho rovině) je přišroubovaný odřezek jeklu,
    // z něj trčí nahoru závitová tyč Ø25 až do horního jeklu 100 mm na boku bočního profilu (matice nahoře).
    // Mezi spodním a bočním profilem je jen vložená rozpěrka – odřezek Al profilu (výška = rodGap). Tyč je vidět celá.
    if (!p.flat) for (const sz of [-1, 1]) for (const sx of [-1, 1]) {
      const zc = sz * (p.deckL / 2 - PR / 2), x = sx * rodX, cg = grp(F, 0, 0, 0);
      const lo = grp(cg, 0, 0, 0), sp = grp(cg, 0, 0, 0), up = grp(cg, 0, 0, 0), rod = grp(cg, 0, 0, 0);
      const upY = sideY, loY = fy;
      B(PR, PR, 60, MAT.frame, x, loY, zc, lo);                                          // spodní odřezek jeklu 40×40×60 vedle podélného profilu
      for (const s2 of [-1, 1]) B(PR - 2, PR - 2, 1, MAT.black, x, loY, zc + s2 * 30, lo);
      for (const zz of [-18, 18]) Cy(5.5, 4, MAT.steel, x + sx * (PR / 2 + 2), loY, zc + zz, "x", lo, 6);   // šrouby skrz jekl do podélného profilu
      const spZ0 = zc - sz * 10;
      B(PR, p.rodGap, 50, MAT.alu, sx * half, p.frameH + p.rodGap / 2, spZ0, sp);        // rozpěrka – odřezek Al profilu, jen vložená mezi profily
      for (const s2 of [-1, 1]) B(1.5, p.rodGap, 8, MAT.aluB, sx * half + s2 * (PR / 2 + .3), p.frameH + p.rodGap / 2, spZ0, sp);
      B(PR, PR, 100, MAT.frame, x, upY, zc, up);                                         // horní jekl 100 mm, přišroubovaný na bok bočního profilu
      for (const s2 of [-1, 1]) B(PR - 2, PR - 2, 1, MAT.black, x, upY, zc + s2 * 50, up);
      for (const zz of [-30, 30]) Cy(6.5, 5, MAT.steel, x + sx * (PR / 2 + 2), upY, zc + zz, "x", up, 6);
      const y0 = loY - PR / 2 + 2, y1 = upY + PR / 2 + 34;
      Cy(12.5, y1 - y0, MAT.steel, x, (y0 + y1) / 2, zc, "y", rod, 18);                 // závitová tyč Ø25
      Cy(23, 2, MAT.steel, x, upY + PR / 2 + 1, zc, "y", up, 20); Cy(20, 14, MAT.steel, x, upY + PR / 2 + 9, zc, "y", up, 6);   // podložka + matice
      explodable(cg, "roh: závitová tyč, jekly, rozpěrka", [[up, [sx * 70, 90, 0]], [sp, [0, 0, sz * 120]], [rod, [0, 200, 0]], [lo, [sx * 60, 0, 0]]]);
    }
    // obyčejný dřevěný stůl – Al konstrukce s deskou se na něj jen položí
    const tTop = fy - PR / 2, tT = 30, tL = p.deckL + 260, tW = p.sideSpan + 260, legH = tTop - tT, apron = 90;
    const woodT = new THREE.MeshStandardMaterial({color: 0x8a5a33, roughness: .75}), woodL = new THREE.MeshStandardMaterial({color: 0x7a4e2c, roughness: .8});
    B(tW, tT, tL, woodT, 0, tTop - tT / 2, 0, F);
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) B(70, legH, 70, woodL, sx * (tW / 2 - 60), legH / 2, sz * (tL / 2 - 60), F);
    for (const sx of [-1, 1]) B(25, apron, tL - 120, woodL, sx * (tW / 2 - 60), legH - apron / 2, 0, F);
    for (const sz of [-1, 1]) B(tW - 120, apron, 25, woodL, 0, legH - apron / 2, sz * (tL / 2 - 60), F);
    lab(F, tW / 2, tTop - 60, -tL / 2 + 200, "Wooden table (existing)", "Al structure just rests on it", 1);
    lab(F, -half, sideY + 30, p.deckL / 2 - 150, "Base frame – existing", "40×40 Al profiles (solar) in one plane · board set inside", 1);
    if (p.flat) lab(F, half + PR / 2, c.sideTop + 45, -p.deckL / 2 + 120, "Side profile beside base profile", "rail support 40 + 40 mm, same plane, no threaded rods", 1);
    else lab(F, rodX, c.sideTop + 45, -p.deckL / 2 + 20, "Threaded rod Ø25 + nuts", `from tube beside base profile to tube on side profile · ${p.rodGap} mm spacer between profiles`, 1);
    // ===== 8 obrobek =====
    const T8 = part(8);
    const slabW = Math.min(p.workW, p.deckW), slabL = Math.min(p.workL, p.deckL), slabTop = c.slabTop, slabZ = 0;
    RAW = true;
    const slab = makeRawSlab(slabW, slabL, p.workT - 12); slab.position.set(0, mm(slabTop - p.workT), 0); T8.add(slab);
    makeSkin(T8, slabW, slabL, slabTop - 7, 7, slabTop - 9);      // hrubý povrch: nerovnosti 0–7 mm, frézuje se 9 mm pod horní hranu
    makeChips(T8);
    // upnutí: dřevěné kolíky v dírách desky + klíny zatlučené mezi kolík a obrobek, ze 4 stran; nic není výš než obrobek
    { const H = M.holes, woodK = new THREE.MeshStandardMaterial({color: 0xc9a06a, roughness: .7}), woodW = new THREE.MeshStandardMaterial({color: 0xb0864f, roughness: .75});
      const kH = Math.max(15, p.workT - 6), y0 = p.frameH + deckT;
      const near = (arr, v) => arr.filter(a => a > v).sort((a, b) => a - b)[0];
      const peg = (x, z, dx, dz, gap) => {                                     // kolík Ø24 + klín ve směru (dx, dz) k obrobku
        Cy(12, kH + 20, woodK, x, y0 + (kH - 20) / 2, z, "y", T8, 16);         // 20 mm v díře, nahoře kH nad deskou
        if (gap < 4) return;
        // klín leží naplocho na desce a zatlouká se z boku (podél hrany obrobku) mezi kolík a obrobek:
        // v půdorysu je to klínový trojúhelník, uprostřed (u kolíku) má tloušťku = mezera
        const L = 110, hW = Math.min(kH - 4, 22), sh = new THREE.Shape();
        sh.moveTo(mm(-L / 2), 0); sh.lineTo(mm(L / 2), 0); sh.lineTo(mm(L / 2), mm(gap * .35)); sh.lineTo(mm(-L / 2), mm(gap * 1.65)); sh.closePath();
        const geo = new THREE.ExtrudeGeometry(sh, {depth: mm(hW), bevelEnabled: false}); geo.rotateX(-Math.PI / 2);
        const w = new THREE.Mesh(geo, woodW); w.castShadow = true;
        const g = grp(T8, x + dx * (12 + gap), y0, z + dz * (12 + gap)); g.rotation.y = Math.atan2(dx, dz); g.add(w);
      };
      const ex = near(H.x, slabW / 2 + 12), ez = near(H.z, slabL / 2 + 12);
      if (ex != null) for (const s of [-1, 1]) for (const z of [-H.z[Math.floor(H.z.length / 2) + 1] || -200, H.z[Math.floor(H.z.length / 2) + 1] || 200]) peg(s * ex, z, -s, 0, ex - 12 - slabW / 2);
      if (ez != null) for (const s of [-1, 1]) for (const x of [-(H.x.find(v => v > 0) || 50) - 100, (H.x.find(v => v > 0) || 50) + 100]) peg(x, s * ez, 0, -s, ez - 12 - slabL / 2);
      lab(T8, ex != null ? -ex : 0, y0 + kH + 10, 0, "Wooden pegs + wedges", "pegs in Ø25 holes, wedge driven between peg and workpiece · 4 sides", 8);
    }
    lab(T8, 0, slabTop, slabL / 2 - 160, `Rough slab ${slabL} × ${slabW} mm`, "live edge (bark) · surfacing with Ø39 bit", 8);
    // ===== 2 vedení Y – SBR20 na bočních profilech =====
    const R2 = part(2);
    for (const s of [-1, 1]) { const rf = railFrame(R2, s * half, c.sideTop, 0, "z"); sbrRail(rf, p.railY); }
    lab(R2, -half, c.sideTop + 40, -p.railY / 2 + 120, `Y rail – SBR20 ${p.railY} mm`, "VEVOR, bolted to side profile", 2);
    // ===== 3 vozíky Y + svařované stojny =====
    const G = new THREE.Group(); root.add(G); M.gantry = G;
    const P3 = part(3, G), bs = p.blockSpacing, ps = p.postSize, postZ = bs / 2;   // svislý jekl na ZADNÍM vozíku, vzpěra i vřeteno vpředu
    for (const s of [-1, 1]) {
      const asm = grp(P3, 0, 0, 0);
      const blk = grp(asm, 0, 0, 0), weld = grp(asm, 0, 0, 0), bolts = grp(asm, 0, 0, 0);
      const rf = railFrame(blk, s * half, c.sideTop, 0, "z"); for (const zc of [-bs / 2, bs / 2]) sbrBlock(rf, zc);
      B(50, c.barT, bs + 50, MAT.frame, s * half, c.blockTop + c.barT / 2, 0, weld);              // pásovina 50×6 – díry vozíků 35×35 jsou mimo jekl 25
      B(25, 25, bs + 50, MAT.frame, s * half, c.blockTop + c.barT + 12.5, 0, weld);               // spojka vozíků jekl 25×25 přivařená na pásovinu
      B(ps, p.postH, ps, MAT.frame, s * half, c.conTop + p.postH / 2, postZ, weld);                // svislý jekl
      const braceTop = Math.min(c.conTop + p.postH * .6, c.lowBeamY - p.beamSize / 2 - 15);
      tubeBetween(weld, [s * half, c.conTop - 12.5, -bs / 2], [s * half, braceTop, postZ], 25, MAT.frame);   // vzpěra: osa z osy spojky (přední vozík) do osy svislého jeklu → konce zapuštěné, lícuje
      B(ps + 8, 4, ps + 8, MAT.aluB, s * half, c.conTop + p.postH + 2, postZ, weld);
      for (const zc of [-bs / 2, bs / 2]) for (const a of [-1, 1]) for (const b of [-1, 1]) Cy(5, 4, MAT.steel, s * half + a * 17.5, c.blockTop + c.barT + 2, zc + b * 17.5, "y", bolts, 6);
      ins(blk, 0, 0, -p.railY / 2 - 150); ins(weld, 0, 160, 0, .35); ins(bolts, 0, 90, 0, .7);   // vozíky se nasunou z konce kolejnice
      explodable(asm, `vozíky Y ${s < 0 ? "vlevo" : "vpravo"} + svařenec`, [[bolts, [0, 150, 0]], [weld, [0, 90, 0]], [blk, [0, 25, 0]]]);
      lab(asm, s * half, c.conTop + p.postH * .5, postZ - ps, `Upright ${ps}×${ps} tube`, `${p.postH} mm, welded to carriage bridge`, 3);
      lab(asm, s * half, c.conTop + 10, -bs / 2 - 40, "Brace, 25×25 tube", "from front carriage", 3);
      lab(asm, s * half, c.blockTop + 30, 0, "Carriage bridge, 25×25 tube", `on 50×6 flat bar · SBR20UU carriages, ${bs} mm spacing`, 3);
    }
    // ===== 4 příčné jekly + vedení X =====
    const P4 = part(4, G), bsz = p.beamSize, beamZ = postZ, frontZ = beamZ - bsz / 2 - 6, inL = p.sideSpan - ps;   // frontZ = čelo pásoviny 50×6 přivařené na jekl   // příčníky jsou mezi stojkami → jeden rám v jedné rovině
    for (const by of [c.topBeamY, c.lowBeamY]) {
      B(inL, bsz, bsz, MAT.frame, 0, by, beamZ, P4);
      for (const s of [-1, 1]) for (const zz of [-1, 1]) B(3, bsz, 1.5, MAT.aluD, s * (inL / 2 - 1.5), by, beamZ + zz * (bsz / 2 + .4), P4);   // svar
      B(Math.min(p.railX, inL), 50, 6, MAT.frame, 0, by, frontZ + 3, P4);                 // pásovina 50×6 (kolejnice M5 do závitů v pásovině)
      const rf = railFrame(P4, 0, by, frontZ, "x"); sbrRail(rf, p.railX);
    }
    lab(P4, -inL / 2 + 80, c.topBeamY + bsz / 2 + 10, beamZ, `Cross tubes ${bsz}×${bsz} · ${inL} mm`, `welded between uprights – one frame, ${p.beamGap} mm spacing`, 4);
    lab(P4, p.railX / 2 - 120, c.lowBeamY - 30, frontZ - 30, `X rail – SBR20 ${p.railX} mm`, "SucceBuy, 2 rails + 4 carriages", 4);
    // vozík X: 4 vozíky SBR20UU + plexisklo + šrouby
    const C = new THREE.Group(); G.add(C); M.car = C;
    const C4 = part(4, C), cAsm = grp(C4, 0, 0, 0);
    const xBlk = grp(cAsm, 0, 0, 0), xScr = grp(cAsm, 0, 0, 0), plexG = grp(cAsm, 0, 0, 0);
    for (const by of [c.topBeamY, c.lowBeamY]) { const rf = railFrame(xBlk, 0, by, frontZ, "x"); for (const xc of [-c.bx, c.bx]) sbrBlock(rf, xc); }
    const plBack = frontZ - 50, plZ = plBack - p.plexiT / 2, plFront = plBack - p.plexiT;
    {
      const W = p.plexiW, H = p.plexiH, rr = 10, sh = new THREE.Shape(), q = v => mm(v);
      sh.moveTo(q(-W / 2 + rr), q(-H / 2)); sh.lineTo(q(W / 2 - rr), q(-H / 2)); sh.quadraticCurveTo(q(W / 2), q(-H / 2), q(W / 2), q(-H / 2 + rr));
      sh.lineTo(q(W / 2), q(H / 2 - rr)); sh.quadraticCurveTo(q(W / 2), q(H / 2), q(W / 2 - rr), q(H / 2)); sh.lineTo(q(-W / 2 + rr), q(H / 2));
      sh.quadraticCurveTo(q(-W / 2), q(H / 2), q(-W / 2), q(H / 2 - rr)); sh.lineTo(q(-W / 2), q(-H / 2 + rr)); sh.quadraticCurveTo(q(-W / 2), q(-H / 2), q(-W / 2 + rr), q(-H / 2));
      const hole = (x, y, r) => { const h = new THREE.Path(); h.absarc(q(x), q(y), q(r), 0, Math.PI * 2, true); sh.holes.push(h); };
      for (const by of [c.topBeamY, c.lowBeamY]) for (const xc of [-c.bx, c.bx]) for (const a of [-1, 1]) for (const b of [-1, 1]) { const yy = by + b * 17.5 - c.plexiCY; if (Math.abs(yy) < H / 2 - 4) hole(xc + a * 17.5, yy, 3.3); }
      for (const a of [-1, 1]) for (const b of [-1, 0, 1]) hole(a * 33, (c.modCY - c.plexiCY) + b * Math.min(60, H / 2 - 18), 3.3);
      const geo = new THREE.ExtrudeGeometry(sh, {depth: q(p.plexiT), bevelEnabled: true, bevelThickness: q(.8), bevelSize: q(.8), bevelSegments: 1, curveSegments: 10});
      const edgeMat = new THREE.MeshStandardMaterial({color: 0xd6f0ff, roughness: .15, transparent: true, opacity: .75, depthWrite: false});
      const pl = new THREE.Mesh(geo, [plexiMat, edgeMat]); pl.position.set(0, mm(c.plexiCY), mm(plFront)); plexG.add(pl);
      const ed = new THREE.LineSegments(new THREE.EdgesGeometry(geo, 25), new THREE.LineBasicMaterial({color: 0xe8f6ff, transparent: true, opacity: .8})); ed.position.copy(pl.position); plexG.add(ed);
    }
    for (const by of [c.topBeamY, c.lowBeamY]) for (const xc of [-c.bx, c.bx]) for (const a of [-1, 1]) for (const b of [-1, 1]) {
      const hx = xc + a * 17.5, hy = by + b * 17.5;
      Cy(4.2, 5, MAT.black, hx, hy, plFront - 2.5, "z", xScr, 6); Cy(5.5, 1, MAT.steel, hx, hy, plFront - .5, "z", xScr, 12);
      Cy(2.5, p.plexiT + 12, MAT.steel, hx, hy, plZ + 4, "z", xScr, 8);
    }
    ins(xBlk, p.railX / 2 + 120, 0, 0); ins(plexG, 0, 0, -160, .35); ins(xScr, 0, 0, -90, .7);
    lab(plexG, p.plexiW / 2, c.plexiCY + p.plexiH / 2, plFront, `Plexiglass plate ${p.plexiW}×${p.plexiH}×${p.plexiT} mm`, "X carriage plate, holes on 35×35 mm pattern (M6)", 4);
    lab(xBlk, -c.bx, c.topBeamY + 30, frontZ - 40, "SBR20UU carriages ×4", "48×50 mm, 4× M6 (35×35 pattern)", 4);
    lab(xScr, c.bx + 16, c.lowBeamY - 15, plFront - 6, "M6 screws ×16", "through plexi into carriages", 4);
    // ===== 5 modul osy Z (Allegro 200 mm: 2 tyče + kuličkový šroub Ø16, ruční kolo → později NEMA23) =====
    const C5 = part(5, C), zAsm = grp(C5, 0, c.modCY, plFront);
    const zL = c.zLen, zBody = grp(zAsm, 0, 0, 0), zTop = grp(zAsm, 0, 0, 0), zMot = grp(zAsm, 0, 0, 0);
    B(80, zL - 20, 20, MAT.alu, 0, 0, -10, zBody);                             // základní Al profil 80×20 (drážky pro matice M6)
    for (const s of [-1, 1]) for (const xx of [-26, 0, 26]) B(6, zL - 22, 1, MAT.aluD, xx, 0, -20.4, zBody);
    for (const s of [-1, 1]) B(80, 10, 56, MAT.aluD, 0, s * (zL / 2 - 5), -28, s > 0 ? zTop : zBody);   // čelní desky 80×56×10
    for (const s of [-1, 1]) Cy(6, zL - 20, MAT.rail, s * 27, 0, -40, "y", zBody, 18);     // vodicí tyče Ø12
    const zScrew = spinner(zBody, 0, 0, -40, "y+"); screwMesh(zScrew, 8, zL - 20);
    const zBolts = grp(zAsm, 0, 0, 0);                          // 6× M6 zezadu skrz plexi do T-matic v profilu modulu (2 řady, rozteč 66)
    for (const a of [-1, 1]) for (const b of [-1, 0, 1]) {
      const by = b * Math.min(60, p.plexiH / 2 - 18), bx2 = a * 33;
      Cy(2.5, p.plexiT + 14, MAT.steel, bx2, by, p.plexiT / 2 - 5, "z", zBolts, 8);
      Cy(4.6, 4, MAT.black, bx2, by, p.plexiT + 3.5, "z", zBolts, 6); Cy(5.5, 1, MAT.steel, bx2, by, p.plexiT + 1, "z", zBolts, 14);
    }
    ins(zBody, 0, 0, -140); ins(zTop, 0, 0, -140); ins(zBolts, 0, 0, 80, .4);
    lab(zBolts, 33, Math.min(60, p.plexiH / 2 - 18), p.plexiT + 6, "M6 screws ×6", "from behind through plexi into Z module T-nuts (row spacing 66)", 5);
    B(70, 50, 60, MAT.alu, 0, zL / 2 + 25, -36, zMot);                           // příruba NEMA23 (místo ručního kola)
    B(50, 30, 62, MAT.black, 0, zL / 2 + 25, -36, zMot);
    const zCoup = spinner(zMot, 0, zL / 2 + 25, -40, "y+"); coupling(zCoup, 11, 26);
    const D6 = part(6, zMot); nema23(D6, 0, zL / 2 + 52, -40, "y-");
    lab(zBody, 40, -zL / 2 + 20, -60, "Z-axis module 200 mm (Allegro)", `2 guide rods + Ø16 ball screw, ${p.zStroke} mm stroke`, 5);
    lab(zMot, 30, zL / 2 + 100, -36, "Z motor NEMA23", "flange + coupling 6.35 × screw journal (to be measured)", 6);
    // vozík Z (pohyblivý) + adaptér + vřeteno
    const Z = new THREE.Group(); zAsm.add(Z); M.z = Z;
    const carC0 = zL / 2 - 35;                                                  // vozík v horní poloze (deska 10 + půl vozíku 25)
    const zCar = grp(Z, 0, 0, 0), zAdp = grp(Z, 0, 0, 0), SP = grp(Z, 0, 0, 0);
    const Z5 = part(5, zCar), A5 = part(5, zAdp);
    B(80, 50, 32, MAT.black, 0, carC0, -40, Z5);                               // vozík 50 × 80 × 32, líc 56 nad spodkem modulu, 4× M5 30 × 60
    for (const s of [-1, 1]) Cy(9.5, 51, MAT.steel, s * 27, carC0, -40, "y", Z5, 16);
    Cy(14, 51, MAT.brass, 0, carC0, -40, "y", Z5, 18);
    // adaptér: Al deska 10 mm – patka vřetena má díry 95 mm od sebe, vozík je široký jen 80 (díry M5 60 × 30)
    B(120, 175, 10, MAT.alu, 0, carC0 - 50, -61, A5);
    for (const a of [-1, 1]) for (const b of [-1, 1]) Cy(4.2, 3, MAT.black, a * 30, carC0 + b * 15, -67.5, "z", A5, 6);        // 4× M5 zápustné do vozíku
    ins(zCar, 0, 0, -120); ins(zAdp, 0, 0, -120, .35);
    lab(A5, 70, carC0 - 120, -66, "Spindle adapter – 10 mm Al 120×175", "carriage holes 60×30 (M5) · mount holes 95 × 35 (M6)", 5);
    // vřeteno 2,2 kW (step 6)
    const S6 = ins(part(6, SP), 0, 0, -220), spZ = -66 - 37, spTop = carC0 + 20, spBot = spTop - 166;   // vřeteno se přisune zepředu na adaptér   // osa vřetena 37 mm od líce patky
    B(110, 165.5, 9, MAT.alu, 0, spBot + 83, -70.5, S6);                       // patka 110 × 165,5
    B(82, 165.5, 64, MAT.fins, 0, spBot + 83, -66 - 9 - 32, S6);                  // tělo (celkem 73 od líce patky)
    for (const a of [-1, 1]) for (let k = 0; k < 4; k++) Cy(5, 4, MAT.black, a * 47.5, spBot + 165.5 - 30 - k * 35, -77, "z", S6, 6);   // 8× M6 do adaptéru
    B(50, 30, .6, MAT.white, 0, spBot + 110, spZ - 36.8, S6);
    for (const s of [-1, 1]) { B(82, 40, 3, MAT.black, 0, spTop + 20, spZ + s * 35, S6); B(3, 40, 73, MAT.black, s * 39.5, spTop + 20, spZ, S6); }
    for (let i = -3; i <= 3; i++) B(80, 2, 4, MAT.black, 0, spTop + 39, spZ + i * 9, S6);
    const fan = spinner(S6, 0, spTop + 24, spZ, "y+"); M.fan = fan;
    for (let i = 0; i < 6; i++) { const pv = new THREE.Group(); pv.rotation.y = i * Math.PI / 3; fan.add(pv); const bl = B(32, 2, 9, MAT.aluD, 16, 0, 0, pv); bl.rotation.x = .5; }
    B(40, 50, 40, MAT.black, 52, spBot + 120, spZ, S6);
    Cy(29.25, 36, MAT.steel, 0, spBot - 18, spZ, "y", S6, 32);
    const cut = new THREE.Group(); S6.add(cut); M.cut = cut; cut.position.set(0, mm(spBot - 36), mm(spZ));
    Cy(17, 18, MAT.steel, 0, -9, 0, "y", cut, 6); Cy(4, 40, MAT.cutter, 0, -38, 0, "y", cut, 16); Cy(19.5, 12, MAT.cutter, 0, -66, 0, "y", cut, 18);
    for (let i = 0; i < 3; i++) { const ins = B(8, 12, 6, MAT.brass, Math.cos(i * 2.09) * 17, -66, Math.sin(i * 2.09) * 17, cut); ins.rotation.y = -i * 2.09; }
    lab(S6, 0, spTop + 45, spZ - 37, "Spindle HLTNC 2.2 kW ER20", "110 × 95 mount on adapter, Ø39 bit", 6, true);
    // odsávací nástavec: Al deska na nose vřetena (2 pásky na bocích těla), průhledná komora, kartáče dolů, hrdlo Ø40 vpředu nahoru
    const shoe = grp(S6, 0, 0, 0), shBr = grp(shoe, 0, 0, 0), qq = v => mm(v);
    const S_shX = 48, S_shF = spZ - 102.5, S_shR = spZ + 36, S_tipYl = spBot - 108, S_plY = spBot - 14, S_brB = S_tipYl - 2, S_chB = S_brB + 40, S_portZ = spZ - 73.5;
    const S_rr = (x0, z0, x1, z1, r) => { const sh2 = new THREE.Shape(); sh2.moveTo(qq(x0 + r), qq(-z0)); sh2.lineTo(qq(x1 - r), qq(-z0)); sh2.quadraticCurveTo(qq(x1), qq(-z0), qq(x1), qq(-z0 - r));
      sh2.lineTo(qq(x1), qq(-z1 + r)); sh2.quadraticCurveTo(qq(x1), qq(-z1), qq(x1 - r), qq(-z1)); sh2.lineTo(qq(x0 + r), qq(-z1)); sh2.quadraticCurveTo(qq(x0), qq(-z1), qq(x0), qq(-z1 + r));
      sh2.lineTo(qq(x0), qq(-z0 - r)); sh2.quadraticCurveTo(qq(x0), qq(-z0), qq(x0 + r), qq(-z0)); return sh2; };
    const S_hl = (x, z, r) => { const h = new THREE.Path(); h.absarc(qq(x), qq(-z), qq(r), 0, Math.PI * 2, true); return h; };
    const S_ext = (sh2, d, mat, y) => { const g2 = new THREE.ExtrudeGeometry(sh2, {depth: qq(d), bevelEnabled: false, curveSegments: 8}); const m2 = new THREE.Mesh(g2, mat); m2.rotation.x = -Math.PI / 2; m2.position.y = qq(y); m2.castShadow = true; shoe.add(m2); return m2; };
    { const top = S_rr(-S_shX, S_shF, S_shX, S_shR, 18); top.holes.push(S_hl(0, spZ, 31), S_hl(0, S_portZ, 20)); S_ext(top, 4, MAT.aluD, S_plY - 4); }
    {
      const wall = S_rr(-S_shX, S_shF, S_shX, S_shR, 18); wall.holes.push(new THREE.Path(S_rr(-S_shX + 3, S_shF + 3, S_shX - 3, S_shR - 3, 15).getPoints(10).reverse())); S_ext(wall, S_plY - 4 - S_chB, plexiMat, S_chB); }
    { const rim = S_rr(-S_shX - 1, S_shF - 1, S_shX + 1, S_shR + 1, 19); rim.holes.push(new THREE.Path(S_rr(-S_shX + 5, S_shF + 5, S_shX - 5, S_shR - 5, 13).getPoints(10).reverse())); S_ext(rim, 9, MAT.black, S_chB - 7); }   // lišta, ve které jsou kartáče sevřené
    { const S_pth = S_rr(-S_shX + 2.5, S_shF + 2.5, S_shX - 2.5, S_shR - 2.5, 16), S_pts2 = S_pth.getSpacedPoints(260), S_H = S_chB - 4 - S_brB, NR = 3;
      const S_bm = new THREE.MeshStandardMaterial({color: 0x26221e, roughness: .9, transparent: true, opacity: .28, depthWrite: false});   // husté, hodně průhledné štětiny (délka ~36 mm)
      const S_im = new THREE.InstancedMesh(new THREE.BoxGeometry(qq(1.5), qq(S_H), qq(1.5)), S_bm, S_pts2.length * NR), S_m4 = new THREE.Matrix4();
      const S_cx0 = 0, S_cz0 = qq(-(S_shF + S_shR) / 2);
      S_pts2.forEach((pt, i) => { for (let k = 0; k < NR; k++) {                               // 3 řady štětin těsně u sebe (krok ~0,9 mm), střídavě posunuté
        const dx = pt.x - S_cx0, dz = pt.y - S_cz0, L = Math.hypot(dx, dz) || 1, off = qq(k * .9), sh = (i % 2) * .5;
        const cx = pt.x - dx / L * off, cz = pt.y - dz / L * off, ln = S_H * (1 - ((i * 7 + k * 3) % 5) * .012);
        S_m4.makeScale(1, ln / S_H, 1); S_m4.setPosition(cx + sh * 0, qq(S_chB - 4 - ln / 2), -cz); S_im.setMatrixAt(i * NR + k, S_m4); } });
      S_im.castShadow = false; shBr.add(S_im); }
    for (const sx of [-1, 1]) { B(4, 62, 26, MAT.aluD, sx * 43, spBot + 16, spZ, shoe); Cy(4, 3, MAT.steel, sx * 45.5, spBot + 34, spZ, "x", shoe, 6); }
    Cy(20, 34, MAT.black, 0, S_plY + 17, S_portZ, "y", shoe, 24); Cy(22, 7, MAT.steel, 0, S_plY + 26, S_portZ, "y", shoe, 24);   // hrdlo + spona hadice
    const S_hosePort = new THREE.Object3D(); S_hosePort.position.set(0, qq(S_plY + 34), qq(S_portZ)); shoe.add(S_hosePort);
    lab(shoe, 0, S_brB + 6, S_shF - 10, "Dust shoe with brushes", "clear chamber, Ø40 port for vacuum hose", 6);
    explodable(shoe, "odsávací nástavec", [[shBr, [0, -60, 0]]]);
    explodable(zAsm, "osa Z (motor, spojka, vozík, adaptér, vřeteno)", [[zBolts, [0, 0, 90]], [zMot, [0, 140, 0]], [zTop, [0, 60, 0]], [zCar, [0, 0, -50]], [zAdp, [0, 0, -110]], [SP, [0, -40, -230]]]);
    explodable(cAsm, "vozík X (vozíky, plexi, šrouby, osa Z)", [[xBlk, [0, 0, 45]], [plexG, [0, 0, -25]], [xScr, [0, 0, -90]], [zAsm, [0, 0, -170]]]);
    // ===== 7 elektronika, kabely, senzory, displej =====
    const E = part(7), Eg = part(7, G), Ec = part(7, C), Ev = part(7), Ex = part(7, G);
    E.scale.x = -1;                                                   // rozvaděč a displej na straně +X (kreslí se zrcadlově); kabelové řetězy na −X
    const Ey = part(7);
    // rozvaděč pod deskou stolu: zavěšený na dvou pásovinách přišroubovaných zespodu do desky, dvířka ven (strana −X)
    const boxX = -(tW / 2 - 120), boxY = legH - 100 - 120, boxZ = -tL / 2 + 275;
    const box = grp(E, boxX, boxY, boxZ); box.rotation.y = Math.PI / 2;
    B(320, 240, 160, MAT.cab, 0, 0, 0, box); B(300, 220, 2, MAT.cabIn, 0, 0, -81, box);
    B(110, 140, 120, MAT.cabBlack, -80, 0, -20, box); B(60, 22, 1, MAT.red, -80, 40, -81.5, box);
    B(26, 90, 50, MAT.cabBlack, 40, -20, -60, box); B(60, 40, 10, MAT.pcb, 100, 30, -78, box);
    Cy(16, 20, MAT.red, 120, -80, -90, "z", box, 24);
    for (const zz of [-130, 130]) {                                                       // závěs: pásovina 40×5 + patka pod deskou
      B(5, legH - (boxY - 60), 40, MAT.aluD, boxX + 82.5, (legH + boxY - 60) / 2, boxZ + zz, E);
      B(60, 5, 40, MAT.aluD, boxX + 110, legH - 2.5, boxZ + zz, E);
      for (const dx of [95, 125]) Cy(4, 3, MAT.steel, boxX + dx, legH - 6, boxZ + zz, "y", E, 6);
    }
    lab(box, 0, 130, -80, "Control box", "under the table top · VFD EV210 · DM556 · ESP32 · PSU", 7, true);
    const anchorEl = new THREE.Object3D(); box.add(anchorEl);
    // displej: jekl 25×25 z rohového jeklu motoru Y1 (strana −X, konec −Z) nahoru a pak do strany = obrácené L
    const dBaseY = c.blockTop + c.barT + 12.5 + 46, dTop = Math.max(dBaseY + 170, p.frameH + 380);
    const anchorDisp = makeDisplay(E, [-half, dBaseY, -(p.railY / 2 + 50)], dTop - dBaseY, 200, Math.PI / 2, true);
    anchorDisp.parent.scale.x = -1;                                   // obrazovka se nezrcadlí (čitelný text)
    lab(E, -half - 100, dTop + 40, -(p.railY / 2 + 50), "Display arm", "25×25 tube welded to Y2 motor tube, inverted L", 7);
    // řetěz Y podél levého bočního profilu, řetěz X na horním příčníku
    const chX = -(half + 110), chLow = Math.max(sideY - 10, tTop + 18), RY = 55;   // žlab řetězu Y nad deskou stolu (u Custom1 je profil níž)
    B(50, 4, p.deckL * .55, MAT.aluD, chX, chLow - 12, -p.deckL * .1, Ey);
    { const pf = half + (p.flat ? PR : PR / 2), bl = Math.abs(chX) - pf + 25;                   // konzoly žlabu od vnějšího boku profilu
      for (const zz of [-p.deckL * .3, 0, p.deckL * .15]) { B(bl, 4, 25, MAT.aluD, -(pf + bl / 2), chLow - 12, zz, Ey); B(4, chLow - 12 - (sideY - PR / 2) + 2, 25, MAT.aluD, -(pf + 2), (chLow - 12 + sideY - PR / 2) / 2, zz, Ey); } }
    const xLow = c.topBeamY + bsz / 2 + 12, RX = 40, xChZ = beamZ + 5;
    const KB = MAT.cabBlack, KO = MAT.cabOrange;
    // kabel ze zadní stěny skříňky (strana +X) pod deskou na stranu −X, vně hrany stolu nahoru do řetězu Y
    const bkX = -(boxX + 80);                                                             // zadní stěna skříňky ve světových souřadnicích
    Cy(6.5, 12, MAT.black, boxX + 86, boxY + 40, boxZ, "x", E, 12); Cy(8, 3, MAT.black, boxX + 81, boxY + 40, boxZ, "x", E, 6);   // vývodka M16
    cable(Ey, [[bkX - 6, boxY + 40, boxZ], [bkX - 40, boxY + 40, boxZ], [bkX - 90, legH - 110, boxZ - 20], [-(tW / 2 - 110), legH - 110, boxZ - 20], [-(tW / 2 + 22), legH - 90, boxZ - 10], [-(tW / 2 + 24), tTop - 40, boxZ + 20], [-(tW / 2 + 10), tTop + 14, boxZ + 70], [chX, chLow + 8, -p.deckL * .2], [chX, chLow + 4, -30]], 3.2, KO, 7, {ties: 140});
    for (const zz of [boxZ - 20, boxZ + 90]) B(14, 3, 10, MAT.aluD, -(tW / 2 + 24), tTop - 32 - (zz < boxZ ? 50 : 0), zz, Ey);    // příchytky na hraně desky
    for (const xx of [bkX - 140, -(tW / 2 - 160), 0]) B(12, 3, 14, MAT.aluD, xx, legH - 104, boxZ - 20, Ey);                  // příchytky pod deskou
    const yEnd = [chX, chLow + 2 * RY, 0];
    B(Math.abs(chX) - half + 10, 8, 40, MAT.aluD, -(half + (Math.abs(chX) - half) / 2), yEnd[1] + 15, 0, Eg);
    cable(Eg, [yEnd, [-(half + 20), yEnd[1] + 40, 20], [-(half + 16), c.conTop + 40, postZ + ps / 2 + 6], [-(half + 4), c.conTop + p.postH - 60, postZ + ps / 2 + 6], [-half + 30, xLow + 8, xChZ], [-20, xLow + 4, xChZ]], 3.2, KO, 7, {ties: 110});
    const xEnd = [0, xLow + 2 * RX, xChZ];
    // úchyt konce řetězu X na vozíku – v ose řetězu, přišroubovaný na horní hranu plexi; kabely přichycené páskami
    const plTop = c.plexiCY + p.plexiH / 2, brY = xEnd[1] + 12, brB = plFront + p.plexiT;
    const chB = grp(Ec, 0, 0, 0);
    B(46, 4, xChZ + 30 - brB, MAT.alu, 0, brY, (xChZ + 30 + brB) / 2, chB);                 // vodorovná část nad řetězem
    B(46, brY - plTop + 30, 4, MAT.alu, 0, (brY + plTop - 30) / 2, brB + 2, chB);            // svislá část na zadní stranu plexi
    B(34, 10, 30, MAT.chain, 0, brY - 8, xChZ + 8, chB);                                       // koncový článek řetězu
    for (const b2 of [-1, 1]) { Cy(2.5, p.plexiT + 10, MAT.steel, b2 * 14, plTop - 15, plFront + p.plexiT / 2, "z", chB, 8); Cy(4.5, 3, MAT.black, b2 * 14, plTop - 15, plFront - 1.5, "z", chB, 6); }
    const tie = (par, x, y, z, ax, r) => { const t = new THREE.Mesh(new THREE.TorusGeometry(mm(r), mm(1.1), 6, 16), MAT.black); if (ax === "x") t.rotation.y = Math.PI / 2; if (ax === "y") t.rotation.x = Math.PI / 2; t.position.set(mm(x), mm(y), mm(z)); par.add(t); };
    for (const zz of [brB + 10, brB + 30]) tie(chB, 0, brY + 6, zz, "z", 7);
    lab(chB, 0, brY + 20, brB + 20, "X chain mount", "in line with chain, cables zip-tied", 7);
    cable(Ec, [[4, brY + 6, xChZ], [4, brY + 6, brB + 10], [10, brY + 20, plFront - 30], [20, c.modCY + zL / 2 + 110, plFront - 60], [10, c.modCY + zL / 2 + 80, plFront - 36]], 2.4, KB, 7, {ties: 90});
    cable(Ec, [[-4, brY + 6, xChZ], [-4, brY + 6, brB + 10], [-30, brY + 10, plFront - 40], [-90, c.modCY, plFront - 80], [-60, c.modCY - 60, plFront - 120]], 3.2, KO, 7, {ties: 90});
    lab(Eg, -half + 40, xLow + 50, xChZ, "X cable chain 15×30", "", 7);
    lab(Ey, chX, chLow + 2 * RY + 20, p.deckL * .2, "Y cable chain 15×30", "side away from operator · cables from control box under the table", 7);
    // ===== 6 pohony X a Y – uzavřená smyčka řemene GT2 10 mm: motor s řemenicí na jednom konci, napínací kladka na druhém,
    //       horní větev je sevřená v unášeči na vozíku (Y: svařenec, X: plexisklo) =====
    const D6r = part(6), D6g = part(6, G), D6c = part(6, C), pul = [];
    const PRr = 15, BW = 10, BT = 2;                              // poloměr řemenice/kladky (Ø30), šířka a tloušťka řemene
    const wrap = (par, x, y, z, axis, start) => {                  // půlkruh řemene kolem řemenice
      const m = new THREE.Mesh(new THREE.CylinderGeometry(mm(PRr + BT / 2), mm(PRr + BT / 2), mm(BW), 24, 1, true, start, Math.PI), MAT.belt);
      if (axis === "x") m.rotation.z = Math.PI / 2; else m.rotation.x = Math.PI / 2;
      m.position.set(mm(x), mm(y), mm(z)); m.material.side = THREE.DoubleSide; par.add(m); return m;
    };
    // ---- osa Y (obě strany): smyčka řemene z VNĚJŠÍ strany, ve výšce svařené spojky vozíků.
    //      Motor i kladka jsou na deskách přišroubovaných na rohové jekly, unášeč je přivařený na spojku vozíků. ----
    const yE = p.railY / 2 + 50, yC = c.blockTop + c.barT + 12.5, yU = yC + PRr, yL = yC - PRr, upJ = c.sideTop - PR / 2;
    for (const s of [-1, 1]) {
      const bx = s * (half + 42), plX = s * (half + PR / 2 + PR + 3);    // rovina řemene; deska na vnějším boku rohového jeklu
      const mkPlate = (g, zEnd) => {                                 // deska 6 mm: od rohového jeklu přes konec profilu až k řemenici
        const z0 = Math.sign(zEnd) * (p.deckL / 2 - PR / 2 - 50), z1 = zEnd + Math.sign(zEnd) * 40;
        B(6, yC + 40 - (upJ - 20), Math.abs(z1 - z0), MAT.alu, plX, (yC + 40 + upJ - 20) / 2, (z0 + z1) / 2, g);
        for (const zz of [z0 + Math.sign(zEnd) * 15, z0 + Math.sign(zEnd) * 40]) Cy(5.5, 4, MAT.steel, plX + s * 4, upJ, zz, "x", g, 6);
      };
      // motor – konec −Z
      // motor – konec −Z: stejně jako kladka – destička na čele bočního profilu, jekl 25×25 kousek dál a nahoru,
      // na něm C-držák z Al plechu: zadní stěna na jeklu, nahoře a dole příruby, vpředu deska motoru; řemenice je uvnitř držáku
      const mg = grp(D6r, 0, 0, 0), mpe = p.deckL / 2, mY0 = c.sideTop - PR / 2, mjx = s * half, mT = yC + 46;
      B(PR, PR, 5, MAT.frame, mjx, mY0, -(mpe + 2.5), mg);
      for (const a2 of [-1, 1]) Cy(5, 4, MAT.steel, mjx + a2 * 14, mY0 + 13, -(mpe + 7), "z", mg, 6);
      B(25, 25, yE + 12.5 - mpe - 5, MAT.frame, mjx, mY0, -(mpe + 5 + yE + 12.5) / 2, mg);
      B(25, mT - (mY0 + 12.5), 25, MAT.frame, mjx, (mT + mY0 + 12.5) / 2, -yE, mg);
      B(23, 1, 23, MAT.black, mjx, mT + .5, -yE, mg);
      const cIn = half + 12.5, cOut = Math.abs(plX) + 3, cD = 66;
      B(4, 84, cD, MAT.alu, s * (cIn + 2), yC, -yE, mg);                                   // zadní stěna na jeklu
      for (const yy of [-40, 40]) B(cOut - cIn, 4, cD, MAT.alu, s * (cIn + cOut) / 2, yC + yy, -yE, mg);   // příruby
      B(6, 84, cD, MAT.alu, plX, yC, -yE, mg);                                             // deska motoru
      for (const yy of [-25, 25]) { Cy(4, 3, MAT.steel, s * (cIn + 5.5), yC + yy, -yE, "x", mg, 6); }
      const mt = grp(mg, 0, 0, 0); nema23(mt, plX + s * 3, yC, -yE, s > 0 ? "x-" : "x+"); ins(mt, s * 140, 0, 0, .3);   // motor po ose hřídele
      const pu = spinner(mg, bx, yC, -yE, "x+"); pulley(pu, PRr - 2, BW + 2); pul.push({o: pu, a: "z", k: 1 / PRr});
      wrap(mg, bx, yC, -yE, "x", Math.PI / 2);
      // napínací kladka – konec +Z (kladka na šroubu v drážce desky, napínací šroub M6)
      const tg = grp(D6r, 0, 0, 0), pe = p.deckL / 2, sY0 = c.sideTop - PR / 2, jx = s * half;
      B(PR, PR, 5, MAT.frame, jx, sY0, pe + 2.5, tg);                                      // destička na čele bočního profilu (2× M8 do profilu)
      for (const a of [-1, 1]) Cy(5, 4, MAT.steel, jx + a * 14, sY0 + 13, pe + 7, "z", tg, 6);
      B(25, 25, yE + 12.5 - pe - 5, MAT.frame, jx, sY0, (pe + 5 + yE + 12.5) / 2, tg);   // jekl 25×25 – prodloužení profilu
      const vT = yC + 28, vB = sY0 + 12.5;
      B(25, vT - vB, 25, MAT.frame, jx, (vT + vB) / 2, yE, tg);                            // jekl nahoru
      B(23, 1, 23, MAT.black, jx, vT + .5, yE, tg);
      const ppx = s * (half + 12.5 + 2.5);
      B(5, 46, 64, MAT.alu, ppx, yC, yE + 4, tg);                                          // destička s drážkou (napínání)
      B(1, 8, 34, MAT.aluB, ppx + s * 2.6, yC, yE, tg);
      Cy(3, Math.abs(bx - ppx) + 12, MAT.steel, (ppx + bx) / 2 + s * 4, yC, yE, "x", tg, 8);   // osa kladky M6
      Cy(6, 5, MAT.steel, bx + s * (BW / 2 + 4), yC, yE, "x", tg, 6);
      B(14, 14, 6, MAT.aluD, s * (half + 12.5 + 9), yC, yE + 33, tg);                     // oko napínacího šroubu
      Cy(3, 30, MAT.steel, s * (half + 12.5 + 9), yC, yE + 18, "z", tg, 8); Cy(5.5, 4, MAT.steel, s * (half + 12.5 + 9), yC, yE + 38, "z", tg, 6);
      const id = spinner(tg, bx, yC, yE, "x+"); idler(id, PRr - 2, BW + 2); pul.push({o: id, a: "z", k: 1 / PRr});
      wrap(tg, bx, yC, yE, "x", -Math.PI / 2);
      // větve: spodní stojí, horní je sevřená v unášeči
      const low = strip(D6r, "z", BW, BT, [bx, yL, 0], MAT.belt, 6); low.setSpan(-yE, yE);
      const u1 = strip(D6r, "z", BW, BT, [bx, yU, 0], MAT.belt, 6), u2 = strip(D6r, "z", BW, BT, [bx, yU, 0], MAT.belt, 6);
      DYN.push(() => { const gz = G.position.z * 1000; u1.setSpan(-yE, gz - 20); u2.setSpan(gz + 20, yE); });
      // unášeč: jekl 20×20 přivařený na bok spojky vozíků + svěrka řemene (spodní a horní čelist, 2× M4)
      const cl = grp(D6g, 0, 0, 0), armL = Math.abs(bx) - half - 12.5 + 10;
      B(armL, 10, 20, MAT.frame, s * (half + 12.5 + armL / 2), yC + 2, 0, cl);
      B(BW + 10, yU - 1 - (yC + 7), 40, MAT.aluD, bx, (yU - 1 + yC + 7) / 2, 0, cl);
      B(BW + 10, 6, 40, MAT.aluD, bx, yU + 4, 0, cl);
      for (const zz of [-13, 13]) { Cy(2, yU + 10 - yC, MAT.steel, bx, (yU + 10 + yC) / 2, zz, "y", cl, 8); Cy(4, 3, MAT.black, bx, yU + 8.5, zz, "y", cl, 6); }
      for (let t = -15; t <= 15; t += 3) B(BW, 1, 1.2, MAT.belt, bx, yU - 1.5, t, cl);   // zuby řemene ve svěrce
      explodable(mg, `motor Y${s < 0 ? 1 : 2} na jeklu z čela profilu`, [[mt, [s * 110, 0, 0]], [pu.parent, [s * -30, 0, -50]]]);
      explodable(tg, `napínací kladka Y${s < 0 ? 1 : 2}`, [[id.parent, [s * -30, 0, 50]]]);
      explodable(cl, `unášeč řemene Y${s < 0 ? 1 : 2}`, cl.children.slice(1, 3).map((ch, i) => [ch, [0, i ? 40 : -25, 0]]));
      if (s > 0) {
        lab(mt, s * (half + 110), yC + 50, -yE, "Y2 motor NEMA23", "C-bracket on tube at side profile end, Ø30 pulley", 6);
        lab(tg, bx, yC + 40, yE, "Y tensioner idler", "tube at side profile end, M6 tensioning screw", 6);
        lab(D6r, bx, yU + 8, p.deckL / 4, "Y belt GT2 10 mm", "loop on outer side", 6);
        lab(cl, bx, yU + 26, 0, "Y belt clamp", "welded to carriage bridge", 6);
      }
    }
    // ---- osa X: smyčka MEZI oběma příčnými jekly, za plexisklem; motor vlevo mezi jekly, kladka vpravo ----
    const xZ = frontZ - 22, xE = half + ps / 2 + 33, xY = c.plexiCY, xU = xY + PRr, xL = xY - PRr;
    const pIn = half - ps / 2 + 2, pOut = xE + 36, pW = pOut - pIn, pC = (pIn + pOut) / 2;   // deska od vnitřní hrany stojky ven za řemenici
    const xm = grp(D6g, 0, 0, 0);
    B(pW, 80, 6, MAT.alu, -pC, xY, frontZ - 3, xm);                                       // deska motoru na čele stojky
    for (const a2 of [-1, 1]) for (const b2 of [-1, 1]) Cy(4.5, 4, MAT.steel, -(half + a2 * 10), xY + b2 * 28, frontZ - 7, "z", xm, 6);
    const xmt = grp(xm, 0, 0, 0); nema23(xmt, -xE, xY, frontZ, "z-"); ins(xmt, 0, 0, 140, .3);                      // tělo motoru za deskou, vedle stojky
    const xpu = spinner(xm, -xE, xY, xZ, "z+"); pulley(xpu, PRr - 2, BW + 2); pul.push({o: xpu, a: "x", k: 1 / PRr});
    wrap(xm, -xE, xY, xZ, "z", Math.PI);
    const xt = grp(D6g, 0, 0, 0);
    B(pW, 80, 6, MAT.alu, pC, xY, frontZ - 3, xt);                                        // deska kladky na čele stojky
    for (const a2 of [-1, 1]) for (const b2 of [-1, 1]) Cy(4.5, 4, MAT.steel, half + a2 * 10, xY + b2 * 28, frontZ - 7, "z", xt, 6);
    B(34, 8, 1, MAT.aluB, xE, xY, frontZ - 6.5, xt);                                      // drážka pro napínání
    Cy(3, frontZ - 6 - xZ + 12, MAT.steel, xE, xY, (xZ + frontZ - 6) / 2 - 4, "z", xt, 8);
    const xid = spinner(xt, xE, xY, xZ, "z+"); idler(xid, PRr - 2, BW + 2); pul.push({o: xid, a: "x", k: 1 / PRr});
    B(6, 16, 14, MAT.aluD, pOut - 3, xY, frontZ - 13, xt);                                // oko napínacího šroubu
    Cy(3, pOut - xE - 4, MAT.steel, (pOut + xE) / 2, xY, frontZ - 13, "x", xt, 8); Cy(5.5, 4, MAT.steel, pOut + 2, xY, frontZ - 13, "x", xt, 6);
    wrap(xt, xE, xY, xZ, "z", 0);
    const xlow = strip(D6g, "x", BW, BT, [0, xL, xZ], MAT.belt, 6); xlow.setSpan(-xE, xE);
    const xu1 = strip(D6g, "x", BW, BT, [0, xU, xZ], MAT.belt, 6), xu2 = strip(D6g, "x", BW, BT, [0, xU, xZ], MAT.belt, 6);
    DYN.push(() => { const cx = C.position.x * 1000; xu1.setSpan(-xE, cx - 16); xu2.setSpan(cx + 16, xE); });
    // unášeč na plexiskle: blok přišroubovaný zezadu skrz plexi, svírá horní větev
    const xc = grp(D6c, 0, 0, 0), plB = plFront + p.plexiT;
    B(40, 30, xZ - plB + 8, MAT.aluD, 0, xU + 2, (plB + xZ + 8) / 2, xc);
    B(40, 6, 14, MAT.aluD, 0, xU - 9, xZ + 1, xc);
    for (const b of [-1, 1]) { Cy(2.5, p.plexiT + 30, MAT.steel, b * 13, xU + 6, plB + 6, "z", xc, 8); Cy(4.6, 4, MAT.black, b * 13, xU + 6, plFront - 2, "z", xc, 6); }
    explodable(xm, "motor X s deskou", [[xmt, [0, 0, 110]], [xpu.parent, [0, 0, -60]]]);
    explodable(xt, "napínací kladka X", [[xid.parent, [0, 0, -60]]]);
    explodable(xc, "unášeč řemene X", [[xc.children[0], [0, 0, 40]]]);
    lab(xmt, -xE, xY + 45, frontZ + 60, "X motor NEMA23", "plate on upright face, body beside upright", 6);
    lab(xt, xE, xY + 30, xZ, "X tensioner idler", "plate on upright face, M6 screw", 6);
    lab(D6g, -xE / 2, xU + 6, xZ, "X belt GT2 10 mm", "loop in front of frame, between beams, behind plexiglass", 6);
    lab(xc, 0, xU + 22, xZ, "X belt clamp", "bolted through plexi", 6);
    let lG = G.position.z, lC = C.position.x;
    DYN.push(() => { const dG = (G.position.z - lG) * 1000, dC = (C.position.x - lC) * 1000; lG = G.position.z; lC = C.position.x; for (const q of pul) q.o.rotation.y += (q.a === "x" ? dC : dG) * q.k; });
    // mechanický koncový spínač s kladičkou: tělo leží na nosné ploše, páčka míří proti narážce, narážka jede VEDLE těla a stiskne jen kladičku
    const limitSw = (par, x, y, z, rot, ox, name, sub) => {
      const g = grp(par, x, y, z); g.rotation.y = rot;
      B(10, 20, 28, MAT.black, 0, 0, 0, g); for (const zz of [-7, 7]) Cy(1.6, 11, MAT.steel, 0, 0, zz, "x", g, 6);
      const arm = B(2, 3, 26, MAT.steel, ox / 2, 5, -24, g); arm.rotation.y = Math.atan2(ox, 26) * .9;
      Cy(4, 4, MAT.steel, ox, 5, -36, "y", g, 12);
      const led = Cy(2, 1.5, MAT.ledOff, 0, 10.5, 8, "y", g, 10);
      if (name) lab(g, 0, 16, 0, name, sub, 7);
      return {g, led};
    };
    const nar = (par, x, y0, y1, z, w = 10) => B(w, y1 - y0, 3, MAT.steel, x, (y0 + y1) / 2, z, par);
    // Y: spínač na malém úhelníku na vnitřním boku profilu, kladička ve výšce vozíku → stiskne ho přímo čelo vozíku (žádná narážka)
    const sideYc = c.sideTop - PR / 2, ySwZ = p.railY / 2 - 6, ySwR = ySwZ - 36, swY = c.sideTop + 8;
    for (const s of [-1, 1]) for (const sz of [-1, 1]) {
      const sw = limitSw(E, s * (half - 36), swY, sz * ySwZ, sz > 0 ? 0 : Math.PI, s * 14 * sz, s < 0 ? `Y limit switch ${sz > 0 ? "max" : "min = home"}` : "", "actuated by carriage face", 7);
      M.sensors.push({name: "Y" + sz, led: sw.led, active: () => sz * (G.position.z * 1000) + bs / 2 + 25 > ySwR - 4});
      const zb = sz * (ySwZ - 4);
      B(3, c.sideTop - 2 - (sideYc - 14), 24, MAT.aluD, s * (half - 21.5), (c.sideTop - 2 + sideYc - 14) / 2, zb, E);   // úhelník: svislá část na boku profilu
      B(28, 3, 24, MAT.aluD, s * (half - 21.5 - 14), c.sideTop - 3.5, zb, E);                                         // vodorovná část pod spínačem
      Cy(3.5, 3, MAT.steel, s * (half - 23.5), sideYc - 4, zb, "x", E, 6);
    }
    const xTz = plBack + 2, xSwY = c.lowBeamY - bsz / 2 - 26, xSwR = half - 36, tOff = Math.max(20, xSwR + 3 - c.toolX);   // kladička 36 mm od středu stojky
    for (const s of [-1, 1]) {
      const bxw = s * half, bz = xTz + 15;
      const sw = limitSw(Eg, bxw, xSwY, bz, s > 0 ? Math.PI / 2 : -Math.PI / 2, s * 15, `X limit switch ${s > 0 ? "max" : "min = home"}`, "mechanical NC, on upright face");
      M.sensors.push({name: "X" + s, led: sw.led, active: () => s * (C.position.x * 1000) + tOff > xSwR - 4});
      const br = grp(Eg, 0, 0, 0);                                                         // distanční držák na čele stojky
      B(30, 30, frontZ - (bz + 5), MAT.aluD, bxw, xSwY, (frontZ + bz + 5) / 2, br);
      for (const a2 of [-1, 1]) Cy(3.5, 3, MAT.steel, bxw + a2 * 9, xSwY + 12, (frontZ + bz + 5) / 2, "y", br, 6);
      nar(plexG, s * tOff, xSwY - 10, c.plexiCY - p.plexiH / 2 + 22, xTz, 10);             // narážka zezadu na plexi
      Cy(4, 3, MAT.black, s * tOff, c.plexiCY - p.plexiH / 2 + 8, plFront - 1.5, "z", plexG, 6);
    }
    // tenké datové dráty (signál čidel) – vedené po hranách profilů a jeklů do skříňky / do řetězů
    const WR = 1.1, wY = MAT.yellow, wG = MAT.green, wB = MAT.cabBlue;
    const eZ = -p.deckL / 2 + PR / 2, eY = p.frameH - 6, eZo = eZ - PR / 2 - 2;     // koncový spodní profil (−Z), jeho vnější čelo
    const gat = [-(half - 21.5), eY, eZo], slv = [[-(half - 21.5), eY, eZo - 2], [-(half - 21.5), eY, -p.deckL / 2 - 20], [-(half + 90), eY, -p.deckL / 2 - 20], [-(tW / 2 + 16), eY, -p.deckL / 2 - 20], [-(tW / 2 + 16), boxY + 70, boxZ - 190], [boxX - 20, boxY + 70, boxZ - 168]];
    cable(E, slv, 4.2, MAT.black, 7, {conduit: true});                                      // svazek datových drátů v bužírce (husí krk)
    Cy(7, 10, MAT.black, boxX - 20, boxY + 70, boxZ - 163, "z", E, 12);                            // vývodka na boku skříňky
    for (const t of [-p.deckL / 2 - 20]) tie(E, -(half - 6), eY, t, "x", 6);
    let wi = 0;
    for (const s of [-1, 1]) for (const sz of [-1, 1]) {
      const o = wi++ * 1.8, xi = s * (half - 21.5), yS = sideYc - 14 - o, yB = eY - 2 + o * .3;
      const pts = [[s * (half - 36), swY - 12, sz * (ySwZ + 15)], [s * (half - 36), c.sideTop - 6, sz * (ySwZ + 16)], [xi, c.sideTop - 6, sz * (ySwZ + 14)], [xi, yS, sz * (ySwZ + 10)], [xi, yS, -p.deckL / 2 + 4], [xi, yS, eZo - o * .4], [xi, yB, eZo - o * .4]];
      if (s > 0) pts.push([-(half - 21.5) + 30, yB, eZo - o * .4]);
      pts.push([gat[0], gat[1], gat[2] - o * .4]);
      cable(E, pts, WR, sz > 0 ? wY : wG, 7);
    }
    for (const s of [-1, 1]) for (const zz of [-p.deckL * .3, 0, p.deckL * .3]) tie(E, s * (half - 21.5), sideYc - 10, zz, "z", 5);
    for (const xx of [-half * .5, half * .5]) tie(E, xx, eY - 1, eZo - 1, "x", 4);
    // na portálu: po spodní hraně spodního příčníku → po svislém jeklu → spojka → konec řetězu Y
    const bY = c.lowBeamY - bsz / 2 - 2, pX = -half + ps / 2 + 2, yE2 = [yEnd[0] + 6, yEnd[1] - 4, 6];
    const portal = (x0, y0, z0, mat) => cable(Eg, [[x0, y0, z0], [x0, bY, beamZ - 10], [pX + 30, bY, beamZ - 10], [pX, bY - 10, postZ - ps / 2 - 2], [pX, c.conTop + 6, postZ - ps / 2 - 2], [-half - 14, c.conTop + 6, postZ - ps / 2 - 2], [-half - 14, yEnd[1] - 10, 20], yE2], WR, mat, 7);
    const pI = half - ps / 2 - 3;
    for (const s of [-1, 1]) cable(Eg, [[s * half, xSwY - 12, frontZ - 6], [s * pI, xSwY - 12, frontZ - 4], [s * pI, bY, beamZ], [-pI, bY, beamZ], [-pI, c.conTop + 30, beamZ], [-pI, c.conTop + 30, frontZ - 3], [-(half + ps / 2 + 3), c.conTop + 30, frontZ - 3], [-half - 14, yEnd[1] - 10, 20], yE2], WR, s > 0 ? wY : wG, 7);
    for (const xx of [-half + 60, 0, half - 120]) tie(Eg, xx, bY, beamZ - 10, "x", 4);
    // ===== vysavač + hadice =====
    // šibenice hadice: svislý jekl 20×20 odsazený za příčníky dvěma přivařenými jekly 20×20 délky 40 mm
    // (k hornímu i dolnímu příčníku), nahoře rameno dopředu nad vřeteno, na konci oko
    const hTopY = c.topBeamY + 470, stub = 40, hBackZ = beamZ + bsz / 2 + stub + 10, hArmZ = frontZ - 190, hX = 0;
    const hg = grp(Eg, 0, 0, 0);
    for (const by of [c.topBeamY, c.lowBeamY]) B(20, 20, stub, MAT.frame, hX, by, beamZ + bsz / 2 + stub / 2, hg);   // přivařené odsazení 40 mm
    B(20, hTopY - (c.lowBeamY - 10), 20, MAT.frame, hX, (hTopY + c.lowBeamY - 10) / 2, hBackZ, hg);
    B(20, 20, hBackZ - hArmZ + 10, MAT.frame, hX, hTopY + 10, (hBackZ + hArmZ) / 2, hg);
    tubeBetween(hg, [hX, hTopY - 120, hBackZ], [hX, hTopY, hBackZ - 120], 15, MAT.frame);
    const ring = new THREE.Mesh(new THREE.TorusGeometry(mm(26), mm(3), 8, 24), MAT.steel); ring.rotation.x = Math.PI / 2; ring.position.set(mm(hX), mm(hTopY - 6), mm(hArmZ + 10)); hg.add(ring);
    const hRing = new THREE.Object3D(); hRing.position.set(mm(hX), mm(hTopY - 6), mm(hArmZ + 10)); hg.add(hRing);
    const hBack = new THREE.Object3D(); hBack.position.set(mm(hX), mm(hTopY + 26), mm(hBackZ)); hg.add(hBack);
    for (let k = 1; k <= 3; k++) tie(hg, hX, hTopY + 31, hBackZ - k * (hBackZ - hArmZ) / 4, "z", 24);
    lab(hg, hX, hTopY + 60, hBackZ, "Hose holder (gallows)", "20×20 tube welded to both cross tubes via 40 mm stand-offs, eyelet above spindle", 7);
    // vysavač na zemi vedle stolu (strana −X, u konce +Z)
    const vX = -(tW / 2 - 260), vZ = tL / 2 - 330, vg = grp(Ev, vX, 0, vZ), vR = 175, vH = 420;   // pod stolem u konce +Z
    const vYel = new THREE.MeshStandardMaterial({color: 0xd9a21b, roughness: .55}), vGr = new THREE.MeshStandardMaterial({color: 0x30343a, roughness: .7});
    B(300, 22, 300, vGr, 0, 34, 0, vg);
    for (const a of [-1, 1]) for (const b of [-1, 1]) { Cy(17, 14, MAT.black, a * 120, 17, b * 120, "x", vg, 16); B(14, 20, 14, MAT.aluD, a * 120, 32, b * 120, vg); }
    Cy(vR, vH, vYel, 0, 45 + vH / 2, 0, "y", vg, 40);
    for (const yy of [60, 45 + vH - 20]) Cy(vR + 3, 10, vGr, 0, yy, 0, "y", vg, 40);
    Cy(vR - 5, 110, vGr, 0, 45 + vH + 55, 0, "y", vg, 40);
    B(40, 30, 180, vGr, 0, 45 + vH + 125, 0, vg); B(40, 12, 120, MAT.black, 0, 45 + vH + 146, 0, vg);
    for (const a of [-1, 1]) B(30, 60, 26, vGr, a * (vR - 10), 45 + vH - 30, 0, vg);
    B(26, 18, 10, MAT.red, 70, 45 + vH + 90, -vR + 12, vg);
    const vIn = [vX - vR - 40, 45 + vH * .62, vZ];                                       // sání ven ke hraně stolu (−X)
    Cy(26, 50, vGr, -(vR + 15), 45 + vH * .62, 0, "x", vg, 24);
    const bxW = -boxX;                                                                    // skříňka je zrcadlená → skutečné x = −boxX
    cable(Ev, [[vX + 40, 60, vZ - vR + 10], [vX + 90, 6, vZ - 240], [0, 6, (vZ + boxZ) / 2], [bxW - 30, 6, boxZ + 90], [bxW - 30, boxY - 60, boxZ + 90], [bxW - 30, boxY - 122, boxZ + 70]], 3, MAT.black, 7, {ties: 0});
    lab(vg, 0, 45 + vH + 60, 0, "Shop vacuum", "under the table · switched by relay together with spindle", 7);
    // hadice Ø40: vroubkovaná, přestavuje se podle polohy vřetena a portálu
    const hCan = document.createElement("canvas"); hCan.width = 8; hCan.height = 64;
    { const g3 = hCan.getContext("2d"); g3.fillStyle = "#3c4048"; g3.fillRect(0, 0, 8, 64); g3.fillStyle = "#1c1f24"; g3.fillRect(0, 0, 3, 64); g3.fillStyle = "#5a606b"; g3.fillRect(4, 0, 2, 64); }
    const hTex = new THREE.CanvasTexture(hCan); hTex.wrapS = hTex.wrapT = THREE.RepeatWrapping;
    const hoseMat = new THREE.MeshStandardMaterial({map: hTex, roughness: .55, metalness: .1});
    const mkHose = () => { const m2 = new THREE.Mesh(new THREE.BufferGeometry(), hoseMat.clone()); m2.material.map = hTex.clone(); m2.material.map.needsUpdate = true; m2.castShadow = true; Ev.add(m2); return {m: m2, key: ""}; };
    const hoseA = mkHose(), hoseB = mkHose(), wv = new THREE.Vector3();
    const toR = o => { o.getWorldPosition(wv); root.worldToLocal(wv); return [wv.x * 1000, wv.y * 1000, wv.z * 1000]; };
    const setHose = (h, pts, r) => {
      const key = pts.map(v => v.map(n => Math.round(n)).join(",")).join(";"); if (key === h.key) return; h.key = key;
      const curve = new THREE.CatmullRomCurve3(pts.map(v => new THREE.Vector3(mm(v[0]), mm(v[1]), mm(v[2]))), false, "centripetal");
      h.m.geometry.dispose(); h.m.geometry = new THREE.TubeGeometry(curve, 70, mm(r), 12, false);
      h.m.material.map.repeat.set(curve.getLength() * 1000 / 7, 1);
    };
    DYN.push(() => {
      const P = toR(S_hosePort), R = toR(hRing), Bk = toR(hBack), dx = P[0] - R[0];
      setHose(hoseA, [P, [P[0], P[1] + 70, P[2]], [P[0] * .7 + R[0] * .3, P[1] + (R[1] - P[1]) * .55, P[2] - 25], [R[0] + dx * .15, R[1] - 70, R[2]], R, [R[0], R[1] + 34, R[2] + 30], [Bk[0], Bk[1], Bk[2] - 60], Bk], 20);
      // ze šibenice dozadu a na stranu −X (dál od obsluhy), vně hrany stolu dolů a plynule pod stůl k vysavači
      const gz = Bk[2], ex = -(tW / 2 + 120), zm = (gz + vIn[2]) / 2;             // ex: vně dlouhé hrany stolu na straně vysavače
      setHose(hoseB, [Bk, [Bk[0], Bk[1] + 30, Bk[2] + 90], [Bk[0] - 200, Bk[1] - 20, gz + 170], [ex + 60, Bk[1] - 220, gz + 150], [ex, tTop + 160, zm + 40], [ex - 10, tTop - 60, zm + 60],
        [ex - 20, legH - 160, (zm + vIn[2]) / 2], [ex - 10, vIn[1] + 110, vIn[2] - 10], [vIn[0] - 70, vIn[1] + 8, vIn[2]], vIn], 20);
    });
    lab(Ev, -(tW / 2 + 90), tTop + 200, 0, "Vacuum hose Ø40", "shoe → holder eyelet → over gantry to side −X → outside table edge → under the table", 7);
    // senzory
    B(4, 34, 44, MAT.aluD, -42, zL / 2 - 30, -28, zBody); B(18, 4, 22, MAT.aluD, -52, zL / 2 - 30, -40, zBody);   // L držák čidla Z na boku modulu
    const sZ = sensor(zBody, -52, zL / 2 - 30, -40, "y", "Z sensor (home at top)", "inductive M12", 7);
    cable(zAsm, [[-52, zL / 2 - 52, -40], [-60, zL / 2 - 20, -20], [-20, brY - c.modCY - 10, brB - plFront + 4], [-4, brY - c.modCY + 2, xChZ - plFront]], 1.1, MAT.cabBlue, 7);
    M.sensors.push({name: "Z", led: sZ.led, active: () => Z.position.y * 1000 > -15});
    // ===== kóty =====
    const W = 1;
    dim(root, [-p.deckW / 2, p.frameH + deckT, -p.deckL / 2], [-p.deckW / 2, p.frameH + deckT, p.deckL / 2], [-120, 0, 0], `${p.deckL} mm`, {sub: "table top – length", param: "deckL", val: p.deckL, step: 1, major: 1});
    dim(root, [-p.deckW / 2, p.frameH + deckT, -p.deckL / 2], [p.deckW / 2, p.frameH + deckT, -p.deckL / 2], [0, 0, -260], `${p.deckW} mm`, {sub: "table top – width", param: "deckW", val: p.deckW, step: 1, major: 1});
    dim(root, [-half, c.sideTop, p.deckL / 2], [half, c.sideTop, p.deckL / 2], [0, 0, 220], `${p.sideSpan} mm`, {sub: "side profile spacing", param: "sideSpan", val: p.sideSpan, step: 1});
    if (!p.flat) dim(root, [half, p.frameH, -p.deckL / 2 + 20], [half, p.frameH + p.rodGap, -p.deckL / 2 + 20], [140, 0, -60], `${p.rodGap} mm`, {sub: "spacer (0–100)", param: "rodGap", val: p.rodGap, step: 1});
    dim(root, [-half - 260, 0, -p.deckL / 2], [-half - 260, p.frameH, -p.deckL / 2], [0, 0, -40], `${p.frameH} mm`, {sub: "base frame height", param: "frameH", val: p.frameH, step: 1});
    dim(root, [half, c.sideTop + 40, -p.railY / 2], [half, c.sideTop + 40, p.railY / 2], [160, 0, 0], `${p.railY} mm`, {sub: "Y rail SBR20", param: "railY", val: p.railY, step: 2});
    dim(root, [-half - 30, c.sideTop, -c.travelY / 2], [-half - 30, c.sideTop, c.travelY / 2], [-200, 0, 0], `${Math.round(c.travelY)} mm`, {sub: c.travelY < c.needY ? `Y travel – too short! need ${c.needY}` : "Y travel", warn: c.travelY < c.needY, step: 2});
    dim(G, [half + 20, c.blockTop, -bs / 2], [half + 20, c.blockTop, bs / 2], [60, 0, 0], `${bs} mm`, {sub: "Y carriage spacing", param: "blockSpacing", val: bs, step: 3});
    dim(G, [half + 30, c.conTop, postZ], [half + 30, c.conTop + p.postH, postZ], [70, 0, 0], `${p.postH} mm`, {sub: "upright tube", param: "postH", val: p.postH, step: 3, major: 1});
    dim(G, [-inL / 2, c.topBeamY + bsz / 2, beamZ], [inL / 2, c.topBeamY + bsz / 2, beamZ], [0, 120, 0], `${inL} mm`, {sub: "cross tubes between uprights (= side profile spacing − upright)", step: 4, major: 1});
    dim(G, [-half - ps / 2 - 10, c.lowBeamY, beamZ], [-half - ps / 2 - 10, c.topBeamY, beamZ], [-90, 0, 0], `${p.beamGap} mm`, {sub: "beam spacing", param: "beamGap", val: p.beamGap, step: 4});
    dim(G, [-c.travelX / 2, c.lowBeamY - bsz / 2 - 20, frontZ], [c.travelX / 2, c.lowBeamY - bsz / 2 - 20, frontZ], [0, -70, 0], `${Math.round(c.travelX)} mm`, {sub: c.travelX < c.needX ? `X travel – too short! need ${c.needX}` : "X travel", warn: c.travelX < c.needX, step: 4});
    dim(C, [-p.plexiW / 2, c.plexiCY + p.plexiH / 2, plFront], [p.plexiW / 2, c.plexiCY + p.plexiH / 2, plFront], [0, 60, 0], `${p.plexiW} mm`, {sub: "plexi width", param: "plexiW", val: p.plexiW, step: 4});
    dim(C, [p.plexiW / 2, c.plexiCY - p.plexiH / 2, plFront], [p.plexiW / 2, c.plexiCY + p.plexiH / 2, plFront], [70, 0, 0], `${p.plexiH} mm`, {sub: "plexi height", param: "plexiH", val: p.plexiH, step: 4});
    dim(C, [-c.bx - 16, c.plexiCY + p.plexiH / 2, plFront], [c.bx + 16, c.plexiCY + p.plexiH / 2, plFront], [0, 120, 0], `${Math.round(2 * c.bx + 32)} mm`, {sub: "outer carriage holes", step: 4});
    dim(C, [-p.plexiW / 2 - 15, c.topBeamY + 24, plFront], [-p.plexiW / 2 - 15, c.plexiCY + p.plexiH / 2, plFront], [-60, 0, 0], `${Math.round(c.edgeV)} mm`, {sub: c.edgeV < 8 ? "plexi margin above carriage – too small!" : "plexi margin above carriage", warn: c.edgeV < 8, step: 4});
    dim(zAsm, [-40, -zL / 2, -60], [-40, zL / 2, -60], [-80, 0, 0], `${zL} mm`, {sub: `Z module (stroke ${p.zStroke})`, param: "zStroke", val: p.zStroke, step: 5});
    dim(root, [p.deckW / 2 - 60, c.deckTop, -p.deckL / 2 + 10], [p.deckW / 2 - 60, c.deckTop + Math.max(Math.abs(c.reach), 1), -p.deckL / 2 + 10], [0, 0, -60], c.reach > 0 ? `short by ${Math.round(c.reach)} mm` : `plunge ${Math.round(-c.reach)} mm below table top`, {sub: c.reach > 0 ? `bit can't reach table top – upright tube ~${c.idealPost} mm` : "bit reaches table top (zero point)", warn: c.reach > 0, step: 6});
    // ===== pracovní oblast nástroje (laser) =====
    // X: vřeteno ±toolX (pojezd vozíku X, omezený odsávacím nástavcem mezi vozíky Y); Y: pojezd portálu ± travelY/2,
    // posunutý o vyložení vřetena před portál (toolOffZ). K dráze osy nástroje se přičte poloměr frézy Ø39.
    {
      const L8 = part(8), R39 = 19.5, offZ = plFront + spZ;
      const ax = c.toolX, z0 = -c.travelY / 2 + offZ, z1 = c.travelY / 2 + offZ;
      const wX = 2 * (ax + R39), wZ = z1 - z0 + 2 * R39, cz = (z0 + z1) / 2, ly = c.slabTop + 1.5;
      const lm = (op, col = 0xff2d2d) => new THREE.MeshBasicMaterial({color: col, transparent: true, opacity: op, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false});
      const fill = lm(.07), core = lm(.95, 0xff5050), glow = lm(.28), path = lm(.55, 0xff7070);
      const flat = (w, l, m, x, z, y = ly) => { const o = new THREE.Mesh(new THREE.PlaneGeometry(mm(w), mm(l)), m); o.rotation.x = -Math.PI / 2; o.position.set(mm(x), mm(y), mm(z)); o.renderOrder = 5; L8.add(o); return o; };
      flat(wX, wZ, fill, 0, cz);
      for (const s of [-1, 1]) {                                              // obrys: ostrá linka + záře
        flat(2, wZ, core, s * wX / 2, cz, ly + .2); flat(14, wZ, glow, s * wX / 2, cz);
        flat(wX, 2, core, 0, cz + s * wZ / 2, ly + .2); flat(wX, 14, glow, 0, cz + s * wZ / 2);
        flat(1, wZ - 2 * R39, path, s * ax, cz, ly + .1); flat(2 * ax, 1, path, 0, cz + s * (wZ / 2 - R39), ly + .1);   // dráha osy nástroje
      }
      for (const sx of [-1, 1]) for (const sz of [-1, 1]) {                     // rohové značky
        flat(60, 5, core, sx * (wX / 2 - 30), cz + sz * (wZ / 2 + 9), ly + .3); flat(5, 60, core, sx * (wX / 2 + 9), cz + sz * (wZ / 2 - 30), ly + .3);
      }
      const scan = flat(wX, 4, lm(.9, 0xff4040), 0, cz, ly + .3), scanG = flat(wX, 26, lm(.22), 0, cz, ly + .25);
      DYN.push(() => { const k = (Math.sin(performance.now() / 1400) + 1) / 2, z = mm(cz - wZ / 2 + k * wZ); scan.position.z = z; scanG.position.z = z; glow.opacity = .2 + .12 * Math.sin(performance.now() / 300); });
      M.work = {w: Math.round(wX), l: Math.round(wZ), x0: -wX / 2, z0: cz - wZ / 2};
      lab(L8, wX / 2, ly + 10, cz + wZ / 2, `Work area ${Math.round(wX)} × ${Math.round(wZ)} mm`, `tool reach incl. Ø39 cutter · axis travel ${Math.round(2 * ax)} × ${Math.round(c.travelY)} mm`, 8, true);
      dim(root, [-wX / 2, ly, cz + wZ / 2 + 40], [wX / 2, ly, cz + wZ / 2 + 40], [0, 0, 80], `${Math.round(wX)} mm`, {sub: "work area – X", step: 8, major: 1});
      dim(root, [wX / 2 + 40, ly, cz - wZ / 2], [wX / 2 + 40, ly, cz + wZ / 2], [90, 0, 0], `${Math.round(wZ)} mm`, {sub: "work area – Y", step: 8, major: 1});
    }
    // ===== dráhy a dynamika =====
    M.lim = {x: c.toolX, zMax: c.travelY / 2 + spZ + 0};
    M.beamY = c.topBeamY; M.FL = p.deckL + 700; M.FW = p.sideSpan + 700;
    M.spBot = c.modCY + spBot; M.toolLen = 108;
    M.toolOffZ = plFront + spZ; M.zStroke = p.zStroke; M.zTop = 0;
    M.slab = {w: slabW, l: slabL, top: slabTop, z: slabZ};
    G.position.z = mm(0); C.position.x = 0; Z.position.y = 0;
    st.path = makePath(); st.seg = 0; st.segT = 0; st.cutDone = 0;
    // dráhu omezit na skutečný pojezd
    const zMin = -c.travelY / 2 + M.toolOffZ, zMax = c.travelY / 2 + M.toolOffZ;
    st.path.forEach(q => { q.x = clamp(q.x, -c.toolX, c.toolX); q.z = clamp(q.z, zMin, zMax); });
    chain({parent: Ey, O: [chX, chLow, 0], A: [0, 0, 1], U: [0, 1, 0], sF: -30, sMax: c.travelY / 2 + 20, R: RY, w: 30, h: 15, pitch: 20, getS: () => G.position.z * 1000, step: 7});
    chain({parent: Ex, O: [0, xLow, xChZ], A: [1, 0, 0], U: [0, 1, 0], sF: -20, sMax: c.travelX / 2 + 20, R: RX, w: 30, h: 15, pitch: 20, getS: () => C.position.x * 1000, step: 7});
    let lastZ = Z.position.y;
    DYN.push(() => { const dZ = (Z.position.y - lastZ) * 1000; lastZ = Z.position.y; zScrew.rotation.y += dZ / 5 * 2 * Math.PI; zCoup.rotation.y += dZ / 5 * 2 * Math.PI; });
    DYN.push(() => { for (const s of M.sensors) { const a = s.active(); if (a !== s.on) { s.on = a; s.led.material = a ? MAT.ledOn : MAT.ledOff; } } });
    M.xFront = true; M.dispOff = [.65, .32, .05]; M.yOff = [-.42, .3, -.5];
    M.anchors = {z: (() => { const o = new THREE.Object3D(); o.position.set(0, mm(carC0 - 60), mm(spZ)); Z.add(o); return o; })(),
      y: (() => { const o = new THREE.Object3D(); o.position.set(mm(half), mm(c.blockTop), 0); G.add(o); return o; })(),
      x: (() => { const o = new THREE.Object3D(); o.position.set(0, mm(c.plexiCY), mm(plFront)); C.add(o); return o; })(), el: anchorEl, disp: anchorDisp};
    setStep(st.step, true);
    DYN.forEach(f => f());
    if (!keep) fitView("iso", true);
    updateHUD();
  }

  // ---------- dráha nástroje (srovnávání desky) ----------
  // jednotahové písmo pro gravírování (jednotky = výška písmene, x doprava, y nahoru)
  const arc = (cx, cy, rx, ry, a0, a1, n = 14) => Array.from({length: n + 1}, (_, i) => { const a = a0 + (a1 - a0) * i / n; return [cx + rx * Math.cos(a), cy + ry * Math.sin(a)]; });
  const FONT = {
    N: {w: .66, s: [[[0, 0], [0, 1], [.66, 0], [.66, 1]]]},
    E: {w: .56, s: [[[.56, 1], [0, 1], [0, 0], [.56, 0]], [[0, .52], [.44, .52]]]},
    C: {w: .66, s: [arc(.36, .5, .36, .5, Math.PI * .27, Math.PI * 1.73, 18)]},
    "Č": {w: .66, s: [arc(.36, .5, .36, .5, Math.PI * .27, Math.PI * 1.73, 18), [[.16, 1.24], [.34, 1.1], [.52, 1.24]]]},
    U: {w: .6, s: [[[0, 1], [0, .3], ...arc(.3, .3, .3, .3, Math.PI, Math.PI * 2, 12).slice(1), [.6, 1]]]},
    M: {w: .8, s: [[[0, 0], [0, 1], [.4, .42], [.8, 1], [.8, 0]]]},
  };
  function textPath(txt, tipAtZ0, hi) {
    const Hh = Math.min(260, M.slab.w * .38), gap = .26, depth = 12, pts = [];
    const tw = [...txt].reduce((a, ch) => a + (FONT[ch] ? FONT[ch].w : .5) + gap, -gap) * Hh;
    let u0 = M.slab.z - tw / 2;
    const safeY = M.slab.top + 12 - tipAtZ0;
    const P = (u, v) => ({x: -Hh * .6 + v * Hh, z: u0 + u * Hh});          // čte se zleva doprava z výchozího pohledu (od skříňky)
    for (const ch of txt) {
      const f = FONT[ch]; if (!f) { u0 += (.5 + gap) * Hh; continue; }
      for (const st0 of f.s) {
        const dense = [];
        st0.forEach((q, i) => { if (i) { const a = st0[i - 1], n = Math.max(1, Math.ceil(Math.hypot(q[0] - a[0], q[1] - a[1]) * Hh / 6)); for (let k = 1; k <= n; k++) dense.push([a[0] + (q[0] - a[0]) * k / n, a[1] + (q[1] - a[1]) * k / n]); } else dense.push(q); });
        const w = dense.map(q => P(q[0], q[1]));
        pts.push({x: w[0].x, z: w[0].z, y: safeY});
        for (const q of w) pts.push({x: q.x, z: q.z, y: Math.max(skinH(q.x, q.z), M.skin ? M.skin.cut + 2 : -1e9) - depth - tipAtZ0, e: 1});
        pts.push({x: w[w.length - 1].x, z: w[w.length - 1].z, y: safeY});
      }
      u0 += (f.w + gap) * Hh;
    }
    return pts;
  }
  function makePath() {
    const s = M.slab, r = 19.5, so = 27;
    const tipAtZ0 = M.spBot - M.toolLen;
    const cutY = Math.max(s.top - (M.skin ? M.skin.top - M.skin.cut : 1.5) - tipAtZ0, -(M.zStroke ?? 1e9)), safe = Math.min(M.zTop ?? 1e9, cutY + 40);
    const x0 = -s.w / 2 - r * .3, x1 = s.w / 2 + r * .3;
    const zs = s.z - s.l / 2 + r * .6, ze = s.z + s.l / 2 - r * .6;
    const park = M.lim.zMax * .6;
    const hi = Math.min(M.zTop ?? 1e9, safe + 60);
    const pts = [{x: 0, z: park, y: hi}];
    if (st.prog !== "flat") { pts.push(...textPath("NEČUM", tipAtZ0, hi)); pts.push({x: pts[pts.length - 1].x, z: pts[pts.length - 1].z, y: hi}); }
    st.textEnd = pts.length;                                                  // hranice gravírování / srovnání (popisek fáze)
    if (st.prog === "text") { pts.push({x: 0, z: park, y: hi}); M.cutY = cutY; return pts; }
    pts.push({x: x0, z: zs, y: safe}, {x: x0, z: zs, y: cutY});
    let dir = 1, z = zs;
    while (z <= ze + .1) {
      pts.push({x: dir > 0 ? x1 : x0, z, y: cutY});
      z += so; if (z > ze + .1) break;
      pts.push({x: dir > 0 ? x1 : x0, z, y: cutY}); dir *= -1;
    }
    pts.push({x: pts[pts.length - 1].x, z: pts[pts.length - 1].z, y: hi});
    pts.push({x: 0, z: park, y: hi});
    M.cutY = cutY;
    return pts;
  }
  function setPose(x, z, y) { M.car.position.x = mm(x); M.gantry.position.z = mm(z - M.toolOffZ); M.z.position.y = mm(y); }
  function tickCut(dt) {
    const pts = st.path; if (!pts) return;
    let remain = dt * st.speed * 60; st.cutting = false;
    while (remain > 0) {
      const a = pts[st.seg], b = pts[st.seg + 1];
      const L = Math.hypot(b.x - a.x, b.z - a.z, (b.y - a.y) * 3) || 1;
      const stepLen = Math.min(remain, 10, L * (1 - st.segT));
      st.segT += stepLen / L; remain -= stepLen;
      if (st.segT >= .9999) { st.segT = 0; st.seg++; if (st.seg >= pts.length - 1) { st.seg = 0; drawSlab(); slabTex.needsUpdate = true; skinReset(); } }
      const A = pts[st.seg], Bp = pts[st.seg + 1], t = st.segT;
      const x = A.x + (Bp.x - A.x) * t, z = A.z + (Bp.z - A.z) * t, y = A.y + (Bp.y - A.y) * t;
      setPose(x, z, y);
      const tip = M.spBot - M.toolLen + y;
      if (tip <= M.slab.top + .5) {
        const s = M.slab, u = (x + s.w / 2) / s.w, v = (z - (s.z - s.l / 2)) / s.l;
        if (u > -.02 && u < 1.02 && v > -.02 && v < 1.02) { st.cutting = true; st.tip = [x, tip, z, Bp.x - A.x, Bp.z - A.z]; if (Bp.e) { paintCut(clamp(u, 0, 1), clamp(v, 0, 1), Math.max(2, Math.round(5 / s.w * slabCan.width)), 1); carveE(x, z, 5, 12); }
          else { paintCut(clamp(u, 0, 1), clamp(v, 0, 1), Math.max(3, Math.round(19.5 / s.w * slabCan.width))); carve(x, z, 19.5); } }
      }
      if (stepLen <= 0) break;
    }
    st.cutDone = st.seg / (pts.length - 1);
  }
  // ---------- montážní kroky ----------
  function setStep(n, instant) {
    const prev = st.step; st.step = n;
    root.traverse(o => {
      if (o.userData.step == null) return;
      const s = o.userData.step;
      o.visible = s <= n;
      if (o.userData.ins) return;                                 // pohyb řeší druhý průchod (směr vložení)
      if (!instant && s === n && n > prev) { o.position.y = o.userData.base.y + .45; st.anim.push({o, t: 0}); }
      else if (s <= n && !o.setSpan) o.position.copy(o.userData.base);
    });
    root.traverse(o => {                                         // díly se směrem vložení (šrouby, vozíky, desky, motory)
      const I = o.userData.ins; if (!I) return;
      let a = o; while (a && a.userData.step == null) a = a.parent;
      const s = a ? a.userData.step : 0;
      if (!instant && s === n && n > prev) { o.position.copy(I.base).add(I.v); st.anim.push({o, t: -I.delay, ins: I}); }
      else o.position.copy(I.base);
    });
  }
  function tickAnim(dt) {
    st.anim = st.anim.filter(a => {
      a.t += dt * 1.6; const e = 1 - Math.pow(1 - clamp(a.t, 0, 1), 3);
      if (a.ins) a.o.position.copy(a.ins.base).addScaledVector(a.ins.v, 1 - e);
      else a.o.position.y = a.o.userData.base.y + .45 * (1 - e);
      return a.t < 1;
    });
  }
  // ---------- kamera ----------
  const DETAIL = {dZ: {a: "z", off: [.45, .14, -.68]}, dY: {a: "y", off: [.62, .22, .5]}, dX: {a: "x", off: [.38, .42, .62]}, dEl: {a: "el", off: [.25, .12, -1.05]}, dDisp: {a: "disp", off: [.06, .1, -.55]}};
  function fitView(kind, instant) {
    if (!M.FL) return;
    let dest;
    if (DETAIL[kind] && M.anchors && M.anchors[DETAIL[kind].a]) {
      const an = M.anchors[DETAIL[kind].a], off = kind === "dY" && M.yOff ? M.yOff : kind === "dX" && M.xFront ? [.45, .2, -.7] : kind === "dDisp" && M.dispOff ? M.dispOff : DETAIL[kind].off;
      dest = () => { an.getWorldPosition(tmpV2); return [tmpV2.clone().add(new THREE.Vector3(...off)), tmpV2.clone()]; };
      follow = {o: an, last: new THREE.Vector3()};
    } else {
      const L = mm(M.FL), W = mm(M.FW), c = new THREE.Vector3(-W * .18, mm(M.beamY) * .55, 0), D = Math.max(L, W);
      const pos = {iso: [-D * .95, D * .8, -D * 1.15], front: [0, D * .45, -D * 1.55], top: [0, D * 1.9, D * .03], side: [D * 1.6, D * .4, 0]}[kind] || [D, D, D];
      const kf = Math.max(1, .95 / camera.aspect);
      dest = () => [new THREE.Vector3(...pos).sub(c).multiplyScalar(kf).add(c), c.clone()];
      follow = null;
    }
    if (instant) { const [pp, tt] = dest(); camera.position.copy(pp); controls.target.copy(tt); controls.update(); if (follow) follow.o.getWorldPosition(follow.last); tween = null; return; }
    tween = {p0: camera.position.clone(), t0: controls.target.clone(), dest, k: 0};
  }
  function tickCam(dt) {
    if (tween) {
      tween.k = Math.min(1, tween.k + dt * 1.6); const e = 1 - Math.pow(1 - tween.k, 3), [pp, tt] = tween.dest();
      camera.position.lerpVectors(tween.p0, pp, e); controls.target.lerpVectors(tween.t0, tt, e);
      if (tween.k >= 1) { tween = null; if (follow) follow.o.getWorldPosition(follow.last); }
    } else if (follow) {
      follow.o.getWorldPosition(tmpV); tmpV2.subVectors(tmpV, follow.last); camera.position.add(tmpV2); controls.target.add(tmpV2); follow.last.copy(tmpV);
    }
  }
  function updateHUD() {
    if (!M.car) return;
    const x = M.car.position.x * 1000, z = M.gantry.position.z * 1000, y = M.z.position.y * 1000, run = st.play && st.step >= STEPS_N;
    const el = $("#hudc"); if (el) el.innerHTML = `<span>X</span><b>${num(x, 1)}</b><span>Y</span><b>${num(-z, 1)}</b><span>Z</span><b>${num(y, 1)}</b><span>S</span><b>${run ? "14,000" : "0"} rpm</b><span>VFD</span><b>${run ? "233 Hz · 4.1 A" : "stop"}</b>`;
    const pr = $("#hudp"); if (pr) pr.textContent = Math.round(st.cutDone * 100) + " %";
    const hs = $("#hudsens"); if (hs) hs.innerHTML = "Sensors: " + M.sensors.map(s => `<span class="sdot ${s.on ? "on" : ""}">${s.name}</span>`).join("");
  }
  function loop() {
    requestAnimationFrame(loop);
    if (paused) return;
    const dt = Math.min(clock.getDelta(), .05);
    if (st.play && st.step >= STEPS_N && M.cut) { tickCut(dt); M.cut.rotation.y += dt * 40; if (M.fan) M.fan.rotation.y += dt * 30; }
    skinTick(dt);
    { const t = st.tip, L2 = t ? Math.hypot(t[3], t[4]) || 1 : 1; chipsTick(dt, st.play && st.cutting && st.step >= STEPS_N && !paused, t ? t[0] : 0, t ? t[1] : 0, t ? t[2] : 0, t ? t[3] / L2 : 0, t ? t[4] / L2 : 0); }
    DYN.forEach(f => f());
    tickAnim(dt); tickCam(dt); tickExplode(dt); soundTick();
    controls.update(); renderer.render(scene, camera);
    updLabels(); updDims();
    if ((st.t += dt) > .1) { st.t = 0; updateHUD(); }
    if ((st.tPend += dt) > .25) { st.tPend = 0; drawPendant(); }
  }
  const api = {
    init, build, fitView, setStep, get state() { return st; },
    pause(p) { paused = p; if (!p && clock) clock.getDelta(); if (SND.ctx) SND.master.gain.setTargetAtTime(p || !SND.on ? 0 : .5, SND.ctx.currentTime, .1); },
    cam(p, t) { follow = null; tween = null; camera.position.set(...p); controls.target.set(...t); controls.update(); },
    toggleDims() { dimsOn = !dimsOn; return dimsOn; },
    toggleSound() { if (!SND.ctx) soundInit(); SND.on = !SND.on; SND.ctx.resume(); if (!SND.on) SND.master.gain.cancelScheduledValues(SND.ctx.currentTime); SND.master.gain.setTargetAtTime(SND.on ? .5 : 0, SND.ctx.currentTime, .1); return SND.on; },
    collapseAll() { EXPL.forEach(g => toggleExplode(g, false)); },
    explodeAll() { EXPL.forEach(g => toggleExplode(g, true)); },
    togglePlay() { st.play = !st.play; return st.play; },
    toggleLabels() { labelsOn = !labelsOn; return labelsOn; },
    setSpeed(s) { st.speed = s; },
    setProg(pr) { st.prog = pr; if (st.path) { st.path = makePath(); st.seg = 0; st.segT = 0; drawSlab(); slabTex.needsUpdate = true; skinReset(); } },
    reset() { if (st.path) { drawSlab(); slabTex.needsUpdate = true; skinReset(); st.seg = 0; st.segT = 0; } },
    get ready() { return ready; }, get cur() { return curV; }, get parts() { return M; },
  };
  return api;
})();
