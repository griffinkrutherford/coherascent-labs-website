import { createScene } from "./scene.js";
import { computeSlices } from "./timeline.js";
import { renderFallback } from "./fallback.js";
import { prefersReducedMotion, hasWebGL2 } from "./hooks/reduced-motion.js";

const DEFAULTS = {
  problemKey: "grade4",
  driver: "autoplay",
  loop: true,
  audio: true,
  durationMs: 9000,
};

export function mountLuneEngine(root, opts = {}) {
  const cfg = { ...DEFAULTS, ...opts };

  if (prefersReducedMotion() || !hasWebGL2()) {
    renderFallback(root);
    return { destroy() { root.innerHTML = ""; } };
  }

  let sceneAPI;
  try {
    const canvas = document.createElement("canvas");
    canvas.setAttribute("role", "img");
    canvas.setAttribute(
      "aria-label",
      "Animated illustration of the Lune Synth grading engine reading handwriting and verifying each step.",
    );
    canvas.style.display = "block";
    canvas.style.width = "100%";
    canvas.style.height = "100%";
    root.appendChild(canvas);
    sceneAPI = createScene(canvas);
  } catch (e) {
    console.warn("[lune-engine] WebGL init failed, rendering fallback", e);
    root.innerHTML = "";
    renderFallback(root);
    return { destroy() { root.innerHTML = ""; } };
  }

  let rafId = 0;
  let running = false;
  let startedAt = 0;
  let pausedAt = 0;

  function tick(now) {
    if (!running) return;
    const elapsed = now - startedAt;
    const norm = (elapsed % cfg.durationMs) / cfg.durationMs;
    const t = cfg.loop ? norm : Math.min(elapsed / cfg.durationMs, 1);
    sceneAPI.update(t, computeSlices(t));
    sceneAPI.render();
    rafId = requestAnimationFrame(tick);
  }

  function start() {
    if (running) return;
    running = true;
    const now = performance.now();
    startedAt = pausedAt > 0 ? now - (pausedAt - startedAt) : now;
    rafId = requestAnimationFrame(tick);
  }

  function stop() {
    if (!running) return;
    running = false;
    pausedAt = performance.now();
    cancelAnimationFrame(rafId);
  }

  const io = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (e.isIntersecting) start();
        else stop();
      }
    },
    { threshold: 0.05 },
  );
  io.observe(root);

  const ro = new ResizeObserver(() => sceneAPI.resize());
  ro.observe(root);

  if (cfg.driver === "autoplay") {
    const rect = root.getBoundingClientRect();
    if (rect.top < window.innerHeight && rect.bottom > 0) start();
  }

  return {
    destroy() {
      io.disconnect();
      ro.disconnect();
      stop();
      sceneAPI.dispose();
      root.innerHTML = "";
    },
  };
}

function autoMount() {
  document.querySelectorAll("[data-lune-engine]").forEach((el) => {
    if (el.dataset.luneMounted === "1") return;
    el.dataset.luneMounted = "1";
    mountLuneEngine(el);
  });
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", autoMount, { once: true });
} else {
  autoMount();
}
