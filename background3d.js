// Tumbling 3-D L-triomino (L-tricube) rep-tiles background.
// Each piece is a big L subdivided into 8 half-size L's (level 1) or 64 quarter-size L's (level 2);
// shades of pink mark the subdivision so the self-similar structure is visible.
// Loaded on demand by background.js when the "3d" background mode is active.
// Needs the global THREE build (three@0.147.0) to be loaded first.
// Returns false when it cannot start (no THREE, no WebGL), so the caller can fall back.

window.startTriominoBackground = function startTriominoBackground(layer, userConfig = {}) {
  const THREE = window.THREE;
  if (!THREE || !layer) {
    return false;
  }

  const config = {
    density: Number(userConfig.density ?? 14) * 0.5,
    minObjects: 6,
    maxObjects: 60,
    size: { min: 110, max: 260, ...(userConfig.size || {}) }, // px width at z = 0
    speed: { min: 26, max: 62, ...(userConfig.speed || {}) }, // px/sec at z = 0
    canvasOpacity: Number(userConfig.triominoOpacity ?? 0.34), // whole layer, keeps it in the background
    level2Share: 0.45, // fraction of pieces subdivided twice (64 tiles) instead of once (8 tiles)
    spin: { min: 0.12, max: 0.45 }, // rad/sec
    depth: { min: -14, max: 8 }, // world z range (camera at CAM_Z)
    respawnDelayMs: { min: 120, max: 1000 },
    // Light-to-dark pink ramp; the 8 sub-tile shades are sampled from it.
    ramp: ["#f9b4c3", "#f27a95", "#f63049", "#d02752", "#a8264f", "#8a244b"],
    background: 0xfbf4f7, // --bg, used for depth fog
  };

  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  } catch (error) {
    return false;
  }
  renderer.setClearColor(0x000000, 0);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  const canvas = renderer.domElement;
  Object.assign(canvas.style, {
    position: "absolute",
    inset: "0",
    width: "100%",
    height: "100%",
    opacity: "0",
    transition: "opacity 1.2s ease",
  });
  layer.appendChild(canvas);

  const FOV = 40;
  const CAM_Z = 30;
  const TAN = Math.tan((FOV * Math.PI) / 360);
  const scene = new THREE.Scene();
  scene.fog = new THREE.Fog(config.background, 18, 80); // far pieces wash toward the page colour
  const camera = new THREE.PerspectiveCamera(FOV, 1, 0.1, 200);
  camera.position.z = CAM_Z;
  scene.add(new THREE.HemisphereLight(0xffffff, 0xf2c9d6, 0.75));
  const sun = new THREE.DirectionalLight(0xffffff, 0.7);
  sun.position.set(-0.6, 1, 0.9);
  scene.add(sun);

  // ---- rep-tile geometry (rule from Rep-tile/rep3d.js) ----
  // Base L occupies unit cubes (0,0,0), (1,0,0), (0,1,0).
  // Child i in the parent's frame: x_parent = 0.5 * (m * x + t), m a signed permutation (row-major).
  const CHILDREN = [
    { m: [0, 1, 0, 1, 0, 0, 0, 0, -1], t: [0, 2, 1] },
    { m: [0, -1, 0, 0, 0, 1, -1, 0, 0], t: [2, 3, 2] },
    { m: [0, 1, 0, -1, 0, 0, 0, 0, 1], t: [0, 3, 1] },
    { m: [0, 1, 0, 1, 0, 0, 0, 0, -1], t: [0, 0, 1] },
    { m: [0, -1, 0, 1, 0, 0, 0, 0, 1], t: [2, 0, 1] },
    { m: [0, -1, 0, -1, 0, 0, 0, 0, -1], t: [3, 2, 1] },
    { m: [0, -1, 0, 0, 0, 1, -1, 0, 0], t: [4, 0, 2] },
    { m: [0, -1, 0, 0, 0, 1, -1, 0, 0], t: [4, 1, 2] },
  ];
  const CENTROID = [5 / 6, 5 / 6, 0.5];
  const RADIUS = 1.6; // bounding radius of the centred L in model units

  function mul3(A, B) {
    const C = new Array(9);
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        C[i * 3 + j] = A[i * 3] * B[j] + A[i * 3 + 1] * B[3 + j] + A[i * 3 + 2] * B[6 + j];
      }
    }
    return C;
  }
  function mulv(A, v) {
    return [0, 1, 2].map(i => A[i * 3] * v[0] + A[i * 3 + 1] * v[1] + A[i * 3 + 2] * v[2]);
  }
  function subdivide(tile) {
    return CHILDREN.map((c, index) => {
      const L = mul3(tile.L, c.m.map(x => x * 0.5));
      const off = mulv(tile.L, c.t.map(x => x * 0.5));
      return { L, T: [tile.T[0] + off[0], tile.T[1] + off[1], tile.T[2] + off[2]], path: [...tile.path, index] };
    });
  }

  const shape = new THREE.Shape();
  shape.moveTo(0, 0);
  shape.lineTo(2, 0);
  shape.lineTo(2, 1);
  shape.lineTo(1, 1);
  shape.lineTo(1, 2);
  shape.lineTo(0, 2);
  shape.closePath();
  let baseGeometry = new THREE.ExtrudeGeometry(shape, { depth: 1, bevelEnabled: false });
  if (baseGeometry.index) baseGeometry = baseGeometry.toNonIndexed();
  const basePos = baseGeometry.attributes.position.array;
  const baseNor = baseGeometry.attributes.normal.array;
  const baseEdge = new THREE.EdgesGeometry(baseGeometry).attributes.position.array;

  // 8 shades from the ramp, interleaved so neighbouring child indices contrast.
  const rampColors = config.ramp.map(hex => new THREE.Color(hex));
  function rampAt(u) {
    const x = u * (rampColors.length - 1);
    const i = Math.min(rampColors.length - 2, Math.floor(x));
    return rampColors[i].clone().lerp(rampColors[i + 1], x - i);
  }
  const SHADE_ORDER = [0, 4, 2, 6, 1, 5, 3, 7];
  const shades = SHADE_ORDER.map(k => rampAt(k / 7));

  function tileColor(path, variant) {
    const top = (path[0] + variant) % 8;
    const color = shades[top].clone();
    if (path.length > 1) {
      // Level 2: keep the parent's shade, nudge lightness per grandchild so the small tiles read too.
      const hsl = {};
      color.getHSL(hsl);
      const nudge = ((SHADE_ORDER[path[1]] / 7) - 0.5) * 0.14;
      color.setHSL(hsl.h, hsl.s, Math.min(0.9, Math.max(0.2, hsl.l + nudge)));
    }
    return color;
  }

  function buildPiece(depth, variant) {
    let tiles = [{ L: [1, 0, 0, 0, 1, 0, 0, 0, 1], T: [0, 0, 0], path: [] }];
    for (let d = 0; d < depth; d++) tiles = tiles.flatMap(subdivide);

    const np = basePos.length / 3;
    const ne = baseEdge.length / 3;
    const pos = new Float32Array(tiles.length * np * 3);
    const nor = new Float32Array(tiles.length * np * 3);
    const col = new Float32Array(tiles.length * np * 3);
    const epos = new Float32Array(tiles.length * ne * 3);
    const scale = Math.pow(2, depth); // linear part is rotation / scale; undo for normals

    tiles.forEach((tile, ti) => {
      const c = tileColor(tile.path, variant);
      for (let i = 0; i < np; i++) {
        const p = mulv(tile.L, [basePos[i * 3], basePos[i * 3 + 1], basePos[i * 3 + 2]]);
        const n = mulv(tile.L, [baseNor[i * 3], baseNor[i * 3 + 1], baseNor[i * 3 + 2]]);
        const o = (ti * np + i) * 3;
        pos[o] = p[0] + tile.T[0] - CENTROID[0];
        pos[o + 1] = p[1] + tile.T[1] - CENTROID[1];
        pos[o + 2] = p[2] + tile.T[2] - CENTROID[2];
        nor[o] = n[0] * scale;
        nor[o + 1] = n[1] * scale;
        nor[o + 2] = n[2] * scale;
        col[o] = c.r;
        col[o + 1] = c.g;
        col[o + 2] = c.b;
      }
      for (let i = 0; i < ne; i++) {
        const p = mulv(tile.L, [baseEdge[i * 3], baseEdge[i * 3 + 1], baseEdge[i * 3 + 2]]);
        const o = (ti * ne + i) * 3;
        epos[o] = p[0] + tile.T[0] - CENTROID[0];
        epos[o + 1] = p[1] + tile.T[1] - CENTROID[1];
        epos[o + 2] = p[2] + tile.T[2] - CENTROID[2];
      }
    });

    const faces = new THREE.BufferGeometry();
    faces.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    faces.setAttribute("normal", new THREE.BufferAttribute(nor, 3));
    faces.setAttribute("color", new THREE.BufferAttribute(col, 3));
    const edges = new THREE.BufferGeometry();
    edges.setAttribute("position", new THREE.BufferAttribute(epos, 3));
    return { faces, edges };
  }

  // A few colour variants per level so pieces do not all match.
  const VARIANTS = [0, 3, 5];
  const pieceGeometries = { 1: VARIANTS.map(v => buildPiece(1, v)), 2: VARIANTS.map(v => buildPiece(2, v)) };
  const faceMaterial = new THREE.MeshLambertMaterial({
    vertexColors: true,
    polygonOffset: true,
    polygonOffsetFactor: 1,
    polygonOffsetUnits: 1,
  });
  const edgeMaterial = new THREE.LineBasicMaterial({ color: 0x6e1a3a, transparent: true, opacity: 0.55 });

  // ---- motion ----
  const reduceMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
  // Phones and tablets: level-1 pieces only (level 2 is ~8x the triangles).
  const mobileQuery = window.matchMedia("(max-width: 768px), (pointer: coarse)");
  const items = [];
  let running = false;
  let rafId = null;
  let lastMs = 0;
  let startupPhase = true;
  let resizeTimer = null;

  const rand = (min, max) => min + Math.random() * (max - min);
  const pick = list => list[Math.floor(Math.random() * list.length)];
  const clamp = (v, min, max) => Math.max(min, Math.min(max, v));

  function worldPerPx() {
    return (2 * CAM_Z * TAN) / Math.max(1, window.innerHeight);
  }

  function halfExtents(z) {
    const halfH = (CAM_Z - z) * TAN;
    return { halfW: halfH * camera.aspect, halfH };
  }

  function edgePoint(edge, z, margin) {
    const { halfW, halfH } = halfExtents(z);
    const w = halfW + margin;
    const h = halfH + margin;
    if (edge === "top") return new THREE.Vector3(rand(-w, w), h, z);
    if (edge === "bottom") return new THREE.Vector3(rand(-w, w), -h, z);
    if (edge === "right") return new THREE.Vector3(w, rand(-h, h), z);
    return new THREE.Vector3(-w, rand(-h, h), z);
  }

  const OTHER_EDGES = {
    top: ["bottom", "left", "right"],
    bottom: ["top", "left", "right"],
    left: ["right", "top", "bottom"],
    right: ["left", "top", "bottom"],
  };

  function randomAxis() {
    return new THREE.Vector3(rand(-1, 1), rand(-1, 1), rand(-1, 1)).normalize();
  }

  function createItem() {
    const mesh = new THREE.Mesh(undefined, faceMaterial);
    const lines = new THREE.LineSegments(undefined, edgeMaterial);
    mesh.add(lines);
    mesh.visible = false;
    scene.add(mesh);
    return { mesh, lines, t: 0, duration: 1, delay: 0 };
  }

  function removeItem(item) {
    scene.remove(item.mesh);
  }

  function spawn(item, delayMs, startInside) {
    const level = !mobileQuery.matches && Math.random() < config.level2Share ? 2 : 1;
    const geo = pick(pieceGeometries[level]);
    item.mesh.geometry = geo.faces;
    item.lines.geometry = geo.edges;

    const wpp = worldPerPx();
    const lo = Math.min(config.size.min, config.size.max);
    const hi = Math.max(config.size.min, config.size.max);
    // Level-2 pieces skew larger so their small tiles stay readable.
    const sizePx = level === 2 ? rand((lo + hi) / 2, hi * 1.15) : rand(lo, hi);
    const scale = (sizePx * wpp) / 2; // L spans 2 model units
    const margin = RADIUS * scale * 1.15;

    const z0 = rand(config.depth.min, config.depth.max);
    const z1 = clamp(z0 + rand(-10, 10), config.depth.min - 6, config.depth.max + 2);

    let start;
    let end;
    if (startInside) {
      const { halfW, halfH } = halfExtents(z0);
      start = new THREE.Vector3(rand(-halfW, halfW) * 0.85, rand(-halfH, halfH) * 0.85, z0);
      end = edgePoint(pick(["top", "bottom", "left", "right"]), z1, margin);
    } else {
      const startEdge = pick(["top", "bottom", "left", "right"]);
      start = edgePoint(startEdge, z0, margin);
      end = edgePoint(pick(OTHER_EDGES[startEdge]), z1, margin);
    }
    const control = start.clone().lerp(end, 0.5);
    control.x += rand(-4, 4);
    control.y += rand(-3, 3);

    const speed = rand(config.speed.min, config.speed.max) * wpp;
    const length = start.distanceTo(control) + control.distanceTo(end);

    item.start = start;
    item.control = control;
    item.end = end;
    item.t = 0;
    item.duration = Math.max(8, length / speed);
    item.delay = delayMs / 1000;
    item.axis = randomAxis();
    item.axisDrift = randomAxis();
    item.spin = rand(config.spin.min, config.spin.max) * (Math.random() < 0.5 ? -1 : 1);
    item.mesh.scale.setScalar(scale);
    item.mesh.quaternion.setFromAxisAngle(randomAxis(), rand(0, Math.PI * 2));
    item.mesh.position.copy(start);
    item.mesh.visible = false;
  }

  function bezier(item, t, out) {
    const a = (1 - t) * (1 - t);
    const b = 2 * (1 - t) * t;
    const c = t * t;
    out.set(
      a * item.start.x + b * item.control.x + c * item.end.x,
      a * item.start.y + b * item.control.y + c * item.end.y,
      a * item.start.z + b * item.control.z + c * item.end.z
    );
  }

  function objectCount() {
    const megapixels = (window.innerWidth * window.innerHeight) / 1000000;
    const full = clamp(Math.round(megapixels * config.density), config.minObjects, config.maxObjects);
    return startupPhase ? clamp(Math.round(full * 0.5), config.minObjects, full) : full;
  }

  function syncCount() {
    const desired = objectCount();
    while (items.length < desired) {
      const item = createItem();
      items.push(item);
      spawn(item, startupPhase ? 0 : rand(0, 1600), startupPhase);
    }
    while (items.length > desired) {
      removeItem(items.pop());
    }
  }

  function resize() {
    const w = window.innerWidth;
    const h = window.innerHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / Math.max(1, h);
    camera.updateProjectionMatrix();
  }

  const tmpQ = new THREE.Quaternion();
  function frame(nowMs) {
    if (!running) return;
    const dt = Math.min(0.05, (nowMs - lastMs) / 1000);
    lastMs = nowMs;

    for (const item of items) {
      if (item.delay > 0) {
        item.delay -= dt;
        continue;
      }
      item.t += dt / item.duration;
      if (item.t >= 1) {
        spawn(item, rand(config.respawnDelayMs.min, config.respawnDelayMs.max), false);
        continue;
      }
      item.mesh.visible = true;
      bezier(item, item.t, item.mesh.position);
      // Tumble: spin about an axis that slowly wanders.
      item.axis.addScaledVector(item.axisDrift, dt * 0.15).normalize();
      tmpQ.setFromAxisAngle(item.axis, item.spin * dt);
      item.mesh.quaternion.premultiply(tmpQ);
    }

    renderer.render(scene, camera);
    rafId = requestAnimationFrame(frame);
  }

  function start() {
    if (running) return;
    running = true;
    canvas.style.display = "";
    startupPhase = true;
    syncCount();
    setTimeout(() => {
      startupPhase = false;
      if (running) syncCount();
    }, 1200);
    lastMs = performance.now();
    rafId = requestAnimationFrame(frame);
    requestAnimationFrame(() => {
      canvas.style.opacity = String(config.canvasOpacity);
    });
  }

  function stop() {
    running = false;
    if (rafId !== null) cancelAnimationFrame(rafId);
    rafId = null;
    while (items.length > 0) removeItem(items.pop());
    renderer.clear();
    canvas.style.opacity = "0";
    canvas.style.display = "none";
  }

  resize();
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      resize();
      if (running) syncCount();
    }, 180);
  });

  const onMotionChange = event => (event.matches ? stop() : start());
  if (typeof reduceMotionQuery.addEventListener === "function") {
    reduceMotionQuery.addEventListener("change", onMotionChange);
  } else if (typeof reduceMotionQuery.addListener === "function") {
    reduceMotionQuery.addListener(onMotionChange);
  }

  if (!reduceMotionQuery.matches) {
    start();
  } else {
    canvas.style.display = "none";
  }
  return true;
};
