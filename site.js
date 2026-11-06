// Site behaviour: image enlargement, looping-video playback, and homepage filters.

(() => {
  // Only standalone content images are enlargeable. Images inside links or buttons keep
  // their own behaviour (logo, linked banners), and card thumbnails belong to their card link.
  const images = [...document.querySelectorAll("main img")].filter((image) => !image.closest("a, button, .card__media"));
  if (!images.length) return;

  const dialog = document.createElement("dialog");
  dialog.className = "lightbox";
  dialog.setAttribute("aria-label", "Enlarged image");
  dialog.innerHTML = `
    <div class="lightbox__bar">
      <p class="lightbox__caption"></p>
      <div class="lightbox__actions">
        <button type="button" class="lightbox__button" data-action="size" aria-pressed="false">Actual size</button>
        <a class="lightbox__button" data-action="open" target="_blank" rel="noreferrer">Open original<span class="visually-hidden"> (opens in a new tab)</span></a>
        <button type="button" class="lightbox__button lightbox__button--close" data-action="close">Close<span aria-hidden="true"> ✕</span></button>
      </div>
    </div>
    <div class="lightbox__stage"><img alt="" /></div>`;
  document.body.append(dialog);

  const stage = dialog.querySelector(".lightbox__stage");
  const enlarged = stage.querySelector("img");
  const caption = dialog.querySelector(".lightbox__caption");
  const sizeButton = dialog.querySelector('[data-action="size"]');
  const openLink = dialog.querySelector('[data-action="open"]');
  let opener;

  function setActualSize(on) {
    stage.classList.toggle("is-actual", on);
    sizeButton.setAttribute("aria-pressed", String(on));
    sizeButton.textContent = on ? "Fit to screen" : "Actual size";
  }

  function open(image, trigger) {
    opener = trigger;
    const src = image.currentSrc || image.src;
    enlarged.src = src;
    enlarged.alt = image.alt;
    caption.textContent = image.alt;
    openLink.href = src;
    setActualSize(false);
    dialog.showModal();
    // On narrow screens, wide images (dense screenshots) start at actual size so the detail is legible.
    const fitWidth = stage.clientWidth;
    const naturalWidth = image.naturalWidth || 0;
    if (window.matchMedia("(max-width: 760px)").matches && naturalWidth > fitWidth * 1.6) setActualSize(true);
  }

  for (const image of images) {
    const trigger = document.createElement("button");
    trigger.type = "button";
    trigger.className = "zoom-trigger";
    trigger.setAttribute("aria-haspopup", "dialog");
    trigger.setAttribute("aria-label", `Enlarge image${image.alt ? `: ${image.alt}` : ""}`);
    image.replaceWith(trigger);
    trigger.append(image);
    const badge = document.createElement("span");
    badge.className = "zoom-trigger__badge";
    badge.setAttribute("aria-hidden", "true");
    badge.innerHTML = '<svg viewBox="0 0 16 16" width="14" height="14"><path fill="currentColor" d="M1.5 1h4v1.5H3.56l3.22 3.22-1.06 1.06L2.5 3.56V5.5H1v-4a.5.5 0 0 1 .5-.5zm13 0a.5.5 0 0 1 .5.5v4h-1.5V3.56l-3.22 3.22-1.06-1.06 3.22-3.22H10.5V1h4zM1 10.5h1.5v1.94l3.22-3.22 1.06 1.06-3.22 3.22H5.5V15h-4a.5.5 0 0 1-.5-.5v-4zm13.5 0H15v4a.5.5 0 0 1-.5.5h-4v-1.5h1.94l-3.22-3.22 1.06-1.06 3.22 3.22V10.5z"/></svg>Enlarge';
    trigger.append(badge);
    trigger.addEventListener("click", () => open(image, trigger));
  }

  sizeButton.addEventListener("click", () => setActualSize(!stage.classList.contains("is-actual")));
  dialog.querySelector('[data-action="close"]').addEventListener("click", () => dialog.close());
  dialog.addEventListener("click", (event) => {
    if (event.target === dialog || event.target === stage) dialog.close();
  });
  dialog.addEventListener("close", () => {
    enlarged.removeAttribute("src");
    opener?.focus();
  });
})();

(() => {
  // Looping clips play only when visible, only if the visitor allows motion, and never after
  // the visitor pauses them. Within an image grid only the most visible clip plays.
  const videos = [...document.querySelectorAll("video[data-autoplay]")];
  if (!videos.length) return;
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const ratios = new Map();

  const canAutoplay = (video) => !reduceMotion.matches && !video.dataset.userPaused;

  function choose() {
    const groups = new Map();
    for (const video of videos) {
      const group = video.closest(".image-grid") || video;
      if (!groups.has(group)) groups.set(group, []);
      groups.get(group).push(video);
    }
    for (const members of groups.values()) {
      const best = members.reduce((a, b) => ((ratios.get(b) || 0) > (ratios.get(a) || 0) ? b : a));
      for (const video of members) {
        const shouldPlay = video === best && (ratios.get(video) || 0) >= 0.25 && canAutoplay(video);
        if (shouldPlay && video.paused) {
          video.dataset.autoAction = "1";
          video.play().catch(() => {}).finally(() => delete video.dataset.autoAction);
        } else if (!shouldPlay && !video.paused) {
          video.dataset.autoAction = "1";
          video.pause();
          setTimeout(() => delete video.dataset.autoAction, 300);
        }
      }
    }
  }

  // Clips without native controls (e.g. a linked preview) get an explicit pause/play button.
  for (const video of videos) {
    if (video.controls) {
      video.addEventListener("pause", () => { if (!video.dataset.autoAction) video.dataset.userPaused = "1"; });
      video.addEventListener("play", () => { if (!video.dataset.autoAction) delete video.dataset.userPaused; });
      continue;
    }
    const holder = video.closest("figure") || video.parentElement;
    const toggle = document.createElement("button");
    toggle.type = "button";
    toggle.className = "video-toggle";
    const sync = () => {
      const paused = video.paused;
      toggle.setAttribute("aria-label", paused ? "Play preview animation" : "Pause preview animation");
      toggle.innerHTML = paused
        ? '<svg viewBox="0 0 16 16" aria-hidden="true"><path fill="currentColor" d="M4 2.5v11l9-5.5z"/></svg>'
        : '<svg viewBox="0 0 16 16" aria-hidden="true"><path fill="currentColor" d="M4 2h3v12H4zM9 2h3v12H9z"/></svg>';
    };
    toggle.addEventListener("click", () => {
      if (video.paused) {
        delete video.dataset.userPaused;
        video.play().catch(() => {});
      } else {
        video.dataset.userPaused = "1";
        video.pause();
      }
    });
    video.addEventListener("play", sync);
    video.addEventListener("pause", sync);
    sync();
    holder.classList.add("has-video-toggle");
    holder.append(toggle);
  }

  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) ratios.set(entry.target, entry.isIntersecting ? entry.intersectionRatio : 0);
      choose();
    }, { threshold: [0, 0.25, 0.5, 0.75, 1] });
    videos.forEach((video) => observer.observe(video));
  } else if (!reduceMotion.matches) {
    videos.forEach((video) => video.play().catch(() => {}));
  }

  reduceMotion.addEventListener?.("change", () => {
    if (reduceMotion.matches) videos.forEach((video) => video.pause());
    else choose();
  });
})();

(() => {
  // Interactive embeds load on request.
  for (const frame of document.querySelectorAll(".embed-frame--deferred[data-embed]")) {
    const button = frame.querySelector(".embed-load");
    button?.addEventListener("click", () => {
      frame.innerHTML = frame.dataset.embed;
      frame.classList.remove("embed-frame--deferred");
      frame.classList.add("is-loaded");
      frame.querySelector("iframe")?.focus();
    });
  }
})();

(() => {
  // Homepage filter: All / Projects / Interests. Mirrors the choice in the URL hash.
  const controls = document.querySelector(".feed-controls");
  if (!controls) return;
  const buttons = [...controls.querySelectorAll("[data-filter]")];
  const cards = [...document.querySelectorAll(".card-grid > .card")];
  const status = controls.querySelector(".filter__status");
  const hashToFilter = { "#projects": "project", "#interests": "interest" };
  const filterToHash = { project: "#projects", interest: "#interests" };

  function apply(filter, { announce = true, updateHash = true } = {}) {
    let shown = 0;
    for (const card of cards) {
      const visible = filter === "all" || card.dataset.kind === filter;
      card.hidden = !visible;
      if (visible) shown += 1;
    }
    for (const button of buttons) {
      button.setAttribute("aria-pressed", String(button.dataset.filter === filter));
    }
    if (announce) status.textContent = `Showing ${shown} ${filter === "all" ? "posts" : filter === "project" ? "projects" : "interests"}`;
    if (updateHash) {
      const hash = filterToHash[filter] || "";
      history.replaceState(null, "", hash || window.location.pathname + window.location.search);
    }
  }

  controls.hidden = false;
  buttons.forEach((button) => button.addEventListener("click", () => apply(button.dataset.filter)));
  const fromHash = () => apply(hashToFilter[window.location.hash] || "all", { announce: false, updateHash: false });
  window.addEventListener("hashchange", fromHash);
  if (hashToFilter[window.location.hash]) fromHash();
})();
