(function () {
  'use strict';

  const demo = document.querySelector('[data-constellation-upload]');
  if (!demo) return;
  const toggle = document.querySelector('[data-upload-toggle]');
  const group = demo.querySelector('.constellation-upload__sources');
  const cards = Array.from(group.querySelectorAll('.constellation-upload__source'));
  const trails = group.querySelector('.constellation-upload__trails');
  const previews = [document.getElementById('previewStep-1'), document.getElementById('previewStep-2')];
  const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const patterns = ['swoop', 'orbit', 'lift'];
  let inView = false;
  let paused = false;
  let cycle = 0;
  let animations = [];
  let generation = 0;
  let size = '';

  function clear() {
    generation++;
    animations.forEach(animation => animation.cancel());
    animations = [];
    trails.replaceChildren();
    group.querySelectorAll('.constellation-upload__spark').forEach(spark => spark.remove());
  }

  function animate(element, frames, options) {
    const animation = element.animate(frames, options);
    animation.pause();
    animations.push(animation);
    // Cancelling an offscreen or resized cycle rejects finished promises.
    animation.finished.catch(function () {});
    return animation;
  }

  function frame(x, y, rotation, scale, opacity, offset) {
    return {
      transform: 'translate(-50%, -50%) translate(' + x + 'px, ' + y + 'px) rotate(' + rotation + 'deg) scale(' + scale + ')',
      opacity: opacity,
      offset: offset
    };
  }

  function nextCycle() {
    clear();
    const token = generation;
    const width = demo.clientWidth;
    const height = demo.clientHeight;
    const cardWidth = cards[0].offsetWidth;
    const tabletWidth = demo.querySelector('.ipad-mockup').offsetWidth;
    const spread = Math.max(32, Math.min(width / 2 - cardWidth / 2 - 8, tabletWidth * .64));
    const pattern = patterns[cycle % patterns.length];
    // Advancing by three rotates through all seven sources and changes the grouping.
    const batch = Array.from({ length: cycle % 2 ? 4 : 3 }, (_, index) => cards[(cycle * 3 + index) % cards.length]);
    const flip = cycle % 2 ? -1 : 1;
    trails.setAttribute('viewBox', '0 0 ' + width + ' ' + height);
    group.dataset.uploadPattern = pattern;

    batch.forEach(function (card, index) {
      const side = (index % 2 ? 1 : -1) * flip;
      const x = side * spread;
      const y = pattern === 'lift'
        ? height * (.08 + index * .055)
        : [-.25, -.07, .17, -.29][index] * height;
      const bend = pattern === 'orbit'
        ? { x: -side * spread * .32, y: y + (y > 0 ? 75 : -75) }
        : pattern === 'lift'
          ? { x: side * spread * 1.05, y: -height * .17 }
          : { x: side * spread * .15, y: y * .5 - 55 };
      function curve(t) {
        const rest = 1 - t;
        return { x: rest * rest * x + 2 * rest * t * bend.x, y: rest * rest * y + 2 * rest * t * bend.y };
      }
      const first = curve(.28);
      const second = curve(.65);
      const third = curve(.9);
      const rotation = side * (pattern === 'orbit' ? 10 : 5);
      const duration = 4400 + ((cycle + index) % 3) * 320;
      const delay = index * (pattern === 'lift' ? 760 : 1000);
      const timing = { duration: duration, delay: delay, fill: 'none', easing: 'linear' };
      const color = getComputedStyle(card).getPropertyValue('--source-color').trim();
      animate(card, [
        frame(x, y + 16, rotation * 2, .8, 0, 0),
        frame(x, y, rotation, 1, 1, .12),
        frame(x - side * 4, y - 5, rotation / 2, 1, 1, .38),
        frame(x, y, rotation, 1, 1, .46),
        frame(first.x, first.y, -rotation, .85, 1, .6),
        frame(second.x, second.y, -rotation / 2, .55, .9, .76),
        frame(third.x, third.y, 0, .22, .6, .9),
        frame(0, 0, 0, .08, 0, 1)
      ], timing);

      const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      const cx = width / 2, cy = height * .56;
      path.setAttribute('d', 'M' + (cx + x) + ' ' + (cy + y) + ' Q' + (cx + bend.x) + ' ' + (cy + bend.y) + ' ' + cx + ' ' + cy);
      path.setAttribute('pathLength', '1');
      path.style.setProperty('--source-color', color);
      trails.appendChild(path);
      animate(path, [
        { strokeDashoffset: 1, opacity: 0, offset: 0 },
        { strokeDashoffset: 1, opacity: 0, offset: .44 },
        { strokeDashoffset: .6, opacity: .55, offset: .6 },
        { strokeDashoffset: 0, opacity: .4, offset: .9 },
        { strokeDashoffset: 0, opacity: 0, offset: 1 }
      ], timing);

      const spark = document.createElement('span');
      spark.className = 'constellation-upload__spark';
      spark.style.setProperty('--source-color', color);
      group.appendChild(spark);
      animate(spark, [
        frame(x, y, 0, 1, 0, 0),
        frame(x, y, 0, 1, 0, .46),
        frame(first.x, first.y, 0, 1, 1, .6),
        frame(second.x, second.y, 0, 1, 1, .76),
        frame(third.x, third.y, 0, .7, .8, .9),
        frame(0, 0, 0, .1, 0, 1)
      ], timing);
    });

    // This idle interval leaves the app recording fully visible between batches.
    const clock = animate(group, [{ opacity: 1 }, { opacity: 1 }], { duration: (batch.length - 1) * 1000 + 6700 });
    clock.id = 'constellation-upload-cycle';
    clock.finished.then(function () {
      if (generation !== token) return;
      cycle++;
      nextCycle();
      sync();
    }).catch(function () {});
  }

  function sync() {
    const active = previews.some(preview => preview && preview.classList.contains('is-active'));
    const playing = active && inView && !paused && !document.hidden && !motion.matches;
    demo.dataset.uploadActive = String(active);
    demo.dataset.uploadPlaying = String(playing);
    toggle.hidden = !active || motion.matches;
    toggle.setAttribute('aria-pressed', String(paused));
    toggle.textContent = paused ? 'Play animation' : 'Pause animation';
    if (!active || motion.matches) {
      if (animations.length) clear();
      return;
    }
    if (!animations.length) nextCycle();
    animations.forEach(function (animation) {
      if (animation.playState === 'finished') return;
      if (playing) animation.play();
      else animation.pause();
    });
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
    }, { threshold: .15 }).observe(demo);
  } else {
    inView = true;
  }
  if ('ResizeObserver' in window) {
    new ResizeObserver(function () {
      const nextSize = demo.clientWidth + ':' + demo.clientHeight;
      if (nextSize === size) return;
      size = nextSize;
      clear();
      sync();
    }).observe(demo);
  }
  motion.addEventListener('change', sync);
  document.addEventListener('visibilitychange', sync);
  sync();
})();
