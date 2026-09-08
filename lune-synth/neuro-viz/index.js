import { createScene } from "./scene.js";
import { computePracticeComparison, computeTransfer, autoPracticeLevel } from "./timeline.js";
import { renderFallback } from "./fallback.js";
import { prefersReducedMotion, hasWebGL2 } from "../shared-hooks/reduced-motion.js";

const DURATION_MS = 7000;
const DRAG_CLAIM_PX = 8;
const KEY_STEP_DEG = 15;

// The neuron card retains a black surface in both page themes.
function currentTheme() { return "dark"; }

// Very low-power devices get the static route instead of a degraded 3D scene.
// Deliberately conservative: only genuinely weak hardware on a small screen,
// so ordinary phones still get the animation.
function isLowPowerDevice() {
  const cores = navigator.hardwareConcurrency || 8;
  const mem = navigator.deviceMemory || 8;
  return cores <= 4 && mem <= 4 && window.innerWidth <= 640;
}

export function mountNeuroViz(root) {
  if (prefersReducedMotion() || !hasWebGL2() || isLowPowerDevice()) {
    return renderFallback(root);
  }

  let sceneAPI;
  const canvas = document.createElement("canvas");
  canvas.className = "neuro-viz__canvas";
  canvas.setAttribute("tabindex", "0");
  canvas.setAttribute("role", "img");
  canvas.setAttribute(
    "aria-label",
    "Rotatable 3D comparison of two networks, each with four foreground neurons and eighteen distant background neuron sprites. Above, an amber dashed route zigzags and doubles back between bare neurons; its signal travels slowly. Above represents using AI to cheat on assignments. Below represents step-by-step practice with Lune Synth. The practice-time slider controls the lower myelin thickness and signal speed. Route uncertainty illustrates recall, not literal nerve anatomy. Use arrow keys to rotate.",
  );

  try {
    root.appendChild(canvas);
    sceneAPI = createScene(canvas, { theme: currentTheme() });
  } catch (e) {
    console.warn("[neuro-viz] WebGL init failed, rendering fallback", e);
    root.innerHTML = "";
    return renderFallback(root);
  }

  const section = root.closest(".section--neuro") || root;
  const practiceSlider = section.querySelector("[data-neuro-practice]");
  const transferEls = [...section.querySelectorAll("[data-neuro-transfer]")];
  const debug = new URLSearchParams(location.search).has("neuroDebug");

  let rafId = 0;
  let running = false;
  let startedAt = 0;
  let pausedAt = 0;
  let frozenT = null;
  let interacted = false;
  let idleSpin = 0;
  let lastFrame = 0;
  let lastRenderedT = 0;
  let practiceElapsed = 0;
  let practiceChanged = false;
  if (practiceSlider) practiceSlider.value = "0";

  function renderAt(t) {
    lastRenderedT = t;
    const level = Number(practiceSlider?.value ?? 50) / 100;
    const slices = computePracticeComparison(t, level);
    const transfer = computeTransfer(t, level);
    for (const el of transferEls) {
      const earned = el.dataset.neuroTransfer === "earned";
      const progress = transfer[el.dataset.neuroTransfer];
      el.querySelector("[data-neuro-fill]").style.transform = `scaleX(${progress})`;
      el.querySelector("[data-neuro-status]").textContent = progress < 1
        ? earned ? (level < 0.34 ? "Slow." : level < 0.67 ? "Faster." : "Fast.") : "Still travelling."
        : earned ? "Arrived." : "Arrived.";
    }
    sceneAPI.update(t, slices);
    sceneAPI.render();
  }

  function onPracticeInput() {
    practiceChanged = true;
    // Restart the comparison so both signals launch together at the new level.
    startedAt = performance.now();
    pausedAt = 0;
    if (frozenT !== null) frozenT = 0;
    renderAt(0);
  }
  practiceSlider?.addEventListener("input", onPracticeInput);

  function tick(now) {
    if (!running) return;
    const dt = lastFrame ? now - lastFrame : 16;
    lastFrame = now;

    if (!interacted) {
      // A sway rather than a spin: rotation is clamped, so a constant spin
      // would just pin against the limit and look frozen.
      idleSpin += dt;
      sceneAPI.setCamera(
        18 + Math.sin(idleSpin / 3200) * 14,
        4 + Math.sin(idleSpin / 3700) * 2,
      );
    }

    if (!practiceChanged && practiceSlider) {
      practiceElapsed += dt;
      practiceSlider.value = String(Math.round(autoPracticeLevel(practiceElapsed) * 100));
    }
    const elapsed = now - startedAt;
    renderAt((elapsed % DURATION_MS) / DURATION_MS);
    rafId = requestAnimationFrame(tick);
  }

  function start() {
    if (running || frozenT !== null) return;
    running = true;
    const now = performance.now();
    startedAt = pausedAt > 0 ? now - (pausedAt - startedAt) : now;
    lastFrame = 0;
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

  const ro = new ResizeObserver(() => {
    sceneAPI.resize();
    if (!running) sceneAPI.render();
  });
  ro.observe(root);

  // The lune-engine loop does not do this; a hidden tab should not burn GPU.
  function onVisibility() {
    if (document.hidden) stop();
    else if (isOnScreen()) start();
  }
  document.addEventListener("visibilitychange", onVisibility);

  function isOnScreen() {
    const r = root.getBoundingClientRect();
    return r.top < window.innerHeight && r.bottom > 0;
  }

  // Theme changes are driven by the page's own toggle.
  const themeObserver = new MutationObserver(() => {
    sceneAPI.setTheme(currentTheme());
    if (!running) sceneAPI.render();
  });
  themeObserver.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["data-theme"],
  });

  // --- rotation: horizontal drag rotates, vertical drag scrolls the page ---
  let pointerId = null;
  let startX = 0;
  let startY = 0;
  let lastX = 0;
  let lastY = 0;
  let claimed = false;
  let abandoned = false;

  function onPointerDown(e) {
    if (pointerId !== null) return;
    pointerId = e.pointerId;
    startX = lastX = e.clientX;
    startY = lastY = e.clientY;
    claimed = false;
    abandoned = false;
  }

  function onPointerMove(e) {
    if (e.pointerId !== pointerId || abandoned) return;
    const dx = e.clientX - startX;
    const dy = e.clientY - startY;

    if (!claimed) {
      if (Math.abs(dy) > DRAG_CLAIM_PX && Math.abs(dy) >= Math.abs(dx)) {
        // Predominantly vertical: let the page scroll, never preventDefault.
        abandoned = true;
        pointerId = null;
        return;
      }
      if (Math.abs(dx) > DRAG_CLAIM_PX) {
        claimed = true;
        interacted = true;
        try { canvas.setPointerCapture(e.pointerId); } catch (_) {}
      } else {
        return;
      }
    }

    e.preventDefault();
    sceneAPI.rotateBy((e.clientX - lastX) * 0.008, (e.clientY - lastY) * 0.004);
    lastX = e.clientX;
    lastY = e.clientY;
    if (!running) sceneAPI.render();
  }

  function onPointerUp(e) {
    if (e.pointerId !== pointerId) return;
    try { canvas.releasePointerCapture(e.pointerId); } catch (_) {}
    pointerId = null;
    claimed = false;
  }

  canvas.addEventListener("pointerdown", onPointerDown);
  canvas.addEventListener("pointermove", onPointerMove, { passive: false });
  canvas.addEventListener("pointerup", onPointerUp);
  canvas.addEventListener("pointercancel", onPointerUp);

  function onKeyDown(e) {
    let handled = false;
    if (e.key === "ArrowLeft") {
      sceneAPI.rotateBy(-KEY_STEP_DEG * (Math.PI / 180), 0);
      handled = true;
    } else if (e.key === "ArrowRight") {
      sceneAPI.rotateBy(KEY_STEP_DEG * (Math.PI / 180), 0);
      handled = true;
    } else if (e.key === "ArrowUp") {
      sceneAPI.rotateBy(0, -0.08);
      handled = true;
    } else if (e.key === "ArrowDown") {
      sceneAPI.rotateBy(0, 0.08);
      handled = true;
    } else if (e.key === "Home") {
      sceneAPI.setCamera(18, 4);
      handled = true;
    }
    if (handled) {
      interacted = true;
      // Only swallow the key while the canvas itself has focus.
      e.preventDefault();
      if (!running) sceneAPI.render();
    }
  }
  canvas.addEventListener("keydown", onKeyDown);

  if (isOnScreen()) start();
  else renderAt(0);

  // --- deterministic capture hooks (visual QA loop) ---------------------
  if (debug) {
    window.__neuroViz = {
      setTime(t) {
        frozenT = t;
        stop();
        renderAt(t);
      },
      setCamera(az, el) {
        interacted = true;
        sceneAPI.setCamera(az, el);
        renderAt(frozenT === null ? lastRenderedT : frozenT);
      },
      setTheme(name) {
        document.documentElement.setAttribute("data-theme", name);
        sceneAPI.setTheme(currentTheme());
        renderAt(frozenT === null ? lastRenderedT : frozenT);
      },
      getCamera: () => sceneAPI.getCamera(),
      getStats: () => sceneAPI.getStats(),
      resume() {
        frozenT = null;
        start();
      },
      // Resolves only once layout has settled and the GPU has actually drawn
      // frames. Resolving early makes the first capture differ from every
      // later one (shader compile + backing-store sizing), which would make
      // the whole grading loop chase phantom diffs.
      ready() {
        return new Promise((resolve) => {
          sceneAPI.resize();
          let frames = 0;
          const step = () => {
            sceneAPI.render();
            if (++frames >= 3) resolve(true);
            else requestAnimationFrame(step);
          };
          requestAnimationFrame(step);
        });
      },
    };
    root.dataset.neuroDebugReady = "1";
  }

  return {
    destroy() {
      practiceSlider?.removeEventListener("input", onPracticeInput);
      io.disconnect();
      ro.disconnect();
      themeObserver.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
      canvas.removeEventListener("pointerdown", onPointerDown);
      canvas.removeEventListener("pointermove", onPointerMove);
      canvas.removeEventListener("pointerup", onPointerUp);
      canvas.removeEventListener("pointercancel", onPointerUp);
      canvas.removeEventListener("keydown", onKeyDown);
      stop();
      sceneAPI.dispose();
      if (debug) delete window.__neuroViz;
      root.innerHTML = "";
    },
  };
}
