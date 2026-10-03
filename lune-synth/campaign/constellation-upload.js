(function () {
  'use strict';

  const demo = document.querySelector('[data-constellation-upload]');
  if (!demo) return;
  const toggle = document.querySelector('[data-upload-toggle]');
  const previews = [document.getElementById('previewStep-1'), document.getElementById('previewStep-2')];
  const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let inView = false;
  let paused = false;

  function sync() {
    const active = previews.some(preview => preview && preview.classList.contains('is-active'));
    demo.dataset.uploadActive = String(active);
    demo.dataset.uploadPlaying = String(active && inView && !paused && !document.hidden && !motion.matches);
    toggle.hidden = !active || motion.matches;
    toggle.setAttribute('aria-pressed', String(paused));
    toggle.textContent = paused ? 'Play animation' : 'Pause animation';
  }

  toggle.addEventListener('click', function () {
    paused = !paused;
    sync();
  });

  const steps = new MutationObserver(sync);
  previews.forEach(preview => steps.observe(preview, { attributes: true, attributeFilter: ['class'] }));
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(entries => {
      inView = entries.some(entry => entry.isIntersecting);
      sync();
    }, { threshold: 0.15 }).observe(demo);
  } else {
    inView = true;
  }
  motion.addEventListener('change', sync);
  document.addEventListener('visibilitychange', sync);
  sync();
})();
