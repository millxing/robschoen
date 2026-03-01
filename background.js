(() => {
  const layer = document.querySelector(".floating-squares");
  if (!layer) {
    return;
  }

  const defaults = {
    density: 14,
    minObjects: 8,
    maxObjects: 90,
    shape: "square",
    size: { min: 110, max: 260 },
    speed: { min: 26, max: 62 }, // px/sec
    opacity: { min: 0.22, max: 0.5 },
    rotation: { min: -22, max: 22 },
    edgePadding: 220,
    respawnDelayMs: { min: 120, max: 1000 },
    palette: [
      "rgba(246, 48, 73, 0.35)",
      "rgba(208, 39, 82, 0.33)",
      "rgba(138, 36, 75, 0.3)",
      "rgba(17, 31, 53, 0.24)",
    ],
  };

  const userConfig = window.floatingBackgroundConfig || {};
  const config = {
    ...defaults,
    ...userConfig,
    size: { ...defaults.size, ...(userConfig.size || {}) },
    speed: { ...defaults.speed, ...(userConfig.speed || {}) },
    opacity: { ...defaults.opacity, ...(userConfig.opacity || {}) },
    rotation: { ...defaults.rotation, ...(userConfig.rotation || {}) },
    respawnDelayMs: {
      ...defaults.respawnDelayMs,
      ...(userConfig.respawnDelayMs || {}),
    },
    palette:
      Array.isArray(userConfig.palette) && userConfig.palette.length > 0
        ? userConfig.palette
        : defaults.palette,
  };

  const reduceMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
  const particles = [];
  let resizeTimer = null;
  let startupRampTimer = null;
  let running = !reduceMotionQuery.matches;
  let startupPhase = true;

  const startupObjectRatio = clamp(Number(userConfig.startupObjectRatio ?? 0.4), 0.2, 1);
  const startupRampDelayMs = Math.max(0, Number(userConfig.startupRampDelayMs ?? 1200));

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  function randomFloat(min, max) {
    return min + Math.random() * (max - min);
  }

  function randomInt(min, max) {
    return Math.floor(randomFloat(min, max + 1));
  }

  function pick(list) {
    return list[Math.floor(Math.random() * list.length)];
  }

  function getShape() {
    return String(config.shape || "square").toLowerCase();
  }

  function objectCount() {
    const megapixels = (window.innerWidth * window.innerHeight) / 1000000;
    const desired = Math.round(megapixels * Number(config.density || defaults.density));
    return clamp(desired, Number(config.minObjects), Number(config.maxObjects));
  }

  function targetObjectCount() {
    const full = objectCount();
    if (!startupPhase) {
      return full;
    }
    return clamp(Math.round(full * startupObjectRatio), Number(config.minObjects), full);
  }

  function pointOnEdge(edge, margin) {
    const width = window.innerWidth;
    const height = window.innerHeight;

    if (edge === "top") {
      return { x: randomFloat(-margin, width + margin), y: -margin, edge };
    }
    if (edge === "right") {
      return { x: width + margin, y: randomFloat(-margin, height + margin), edge };
    }
    if (edge === "bottom") {
      return { x: randomFloat(-margin, width + margin), y: height + margin, edge };
    }
    return { x: -margin, y: randomFloat(-margin, height + margin), edge: "left" };
  }

  function randomStartPoint(margin) {
    return pointOnEdge(pick(["top", "right", "bottom", "left"]), margin);
  }

  function randomViewportPoint(padding = 0) {
    const width = window.innerWidth;
    const height = window.innerHeight;
    return {
      x: randomFloat(padding, Math.max(padding, width - padding)),
      y: randomFloat(padding, Math.max(padding, height - padding)),
    };
  }

  function randomEndPoint(startEdge, margin) {
    const opposite = {
      top: ["bottom", "left", "right"],
      right: ["left", "top", "bottom"],
      bottom: ["top", "left", "right"],
      left: ["right", "top", "bottom"],
    };
    return pointOnEdge(pick(opposite[startEdge]), margin);
  }

  function applyShape(element, size) {
    const shape = getShape();
    if (shape === "circle") {
      element.style.borderRadius = "50%";
      return 0;
    }
    if (shape === "rounded") {
      element.style.borderRadius = `${Math.round(size * 0.3)}px`;
      return 0;
    }
    if (shape === "diamond") {
      element.style.borderRadius = `${Math.round(size * 0.08)}px`;
      return 45;
    }
    element.style.borderRadius = `${Math.round(size * 0.06)}px`;
    return 0;
  }

  function stopParticle(particle) {
    if (particle.animation) {
      particle.animation.cancel();
      particle.animation = null;
    }
  }

  function spawn(particle, delayMs = 0, options = {}) {
    if (!running) {
      return;
    }

    const minSize = Number(config.size.min);
    const maxSize = Number(config.size.max);
    const size = randomFloat(Math.min(minSize, maxSize), Math.max(minSize, maxSize));

    const margin = size + Number(config.edgePadding);
    const startInside = Boolean(options.startInside);
    const start = startInside ? randomViewportPoint(size * 0.5) : randomStartPoint(margin);
    const end = startInside
      ? pointOnEdge(pick(["top", "right", "bottom", "left"]), margin)
      : randomEndPoint(start.edge, margin);
    const mid = {
      x: (start.x + end.x) / 2 + randomFloat(-120, 120),
      y: (start.y + end.y) / 2 + randomFloat(-90, 90),
    };

    const minSpeed = Number(config.speed.min);
    const maxSpeed = Number(config.speed.max);
    const speed = randomFloat(Math.min(minSpeed, maxSpeed), Math.max(minSpeed, maxSpeed));
    const distance = Math.hypot(end.x - start.x, end.y - start.y);
    const durationMs = Math.max(8000, Math.round((distance / speed) * 1000));

    const baseRotate = applyShape(particle.element, size);
    const minRotate = Number(config.rotation.min);
    const maxRotate = Number(config.rotation.max);
    const startRotate = randomFloat(Math.min(minRotate, maxRotate), Math.max(minRotate, maxRotate)) + baseRotate;
    const midRotate = startRotate + randomFloat(-16, 16);
    const endRotate = startRotate + randomFloat(-24, 24);

    const minOpacity = Number(config.opacity.min);
    const maxOpacity = Number(config.opacity.max);
    const oStart = randomFloat(minOpacity * 0.8, maxOpacity * 0.9);
    const oMid = randomFloat(minOpacity, maxOpacity);
    const oEnd = randomFloat(minOpacity * 0.82, maxOpacity * 0.92);

    particle.element.style.width = `${size}px`;
    particle.element.style.height = `${size}px`;
    particle.element.style.background = pick(config.palette);

    stopParticle(particle);
    particle.animation = particle.element.animate(
      [
        {
          transform: `translate3d(${start.x}px, ${start.y}px, 0) rotate(${startRotate}deg)`,
          opacity: oStart,
        },
        {
          transform: `translate3d(${mid.x}px, ${mid.y}px, 0) rotate(${midRotate}deg)`,
          opacity: oMid,
          offset: 0.5,
        },
        {
          transform: `translate3d(${end.x}px, ${end.y}px, 0) rotate(${endRotate}deg)`,
          opacity: oEnd,
        },
      ],
      {
        duration: durationMs,
        easing: "linear",
        fill: "both",
        delay: delayMs,
      }
    );

    particle.animation.onfinish = () => {
      if (!running) {
        return;
      }
      spawn(
        particle,
        randomInt(Number(config.respawnDelayMs.min), Number(config.respawnDelayMs.max))
      );
    };
  }

  function createParticle() {
    const element = document.createElement("span");
    element.className = "floating-shape";
    layer.appendChild(element);
    return { element, animation: null };
  }

  function removeParticle(particle) {
    stopParticle(particle);
    particle.element.remove();
  }

  function syncParticleCount() {
    if (!running) {
      return;
    }

    const desired = targetObjectCount();
    while (particles.length < desired) {
      const particle = createParticle();
      particles.push(particle);
      if (startupPhase) {
        // Start with on-screen particles so refresh feels instantly alive.
        spawn(particle, 0, { startInside: true });
      } else {
        // After startup, let new particles drift in naturally.
        spawn(particle, randomInt(0, 1600));
      }
    }

    while (particles.length > desired) {
      const particle = particles.pop();
      removeParticle(particle);
    }

    if (startupPhase && startupRampTimer === null) {
      startupRampTimer = setTimeout(() => {
        startupRampTimer = null;
        startupPhase = false;
        syncParticleCount();
      }, startupRampDelayMs);
    }
  }

  function clearAllParticles() {
    while (particles.length > 0) {
      removeParticle(particles.pop());
    }
  }

  function handleMotionPreferenceChange(event) {
    running = !event.matches;
    if (running) {
      startupPhase = true;
      if (startupRampTimer !== null) {
        clearTimeout(startupRampTimer);
        startupRampTimer = null;
      }
      syncParticleCount();
      return;
    }
    if (startupRampTimer !== null) {
      clearTimeout(startupRampTimer);
      startupRampTimer = null;
    }
    clearAllParticles();
  }

  if (typeof reduceMotionQuery.addEventListener === "function") {
    reduceMotionQuery.addEventListener("change", handleMotionPreferenceChange);
  } else if (typeof reduceMotionQuery.addListener === "function") {
    reduceMotionQuery.addListener(handleMotionPreferenceChange);
  }

  window.addEventListener("resize", () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(syncParticleCount, 180);
  });

  if (running) {
    syncParticleCount();
  }
})();
