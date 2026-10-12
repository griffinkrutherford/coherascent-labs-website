/* Home page "Focus with Tock" section: a four-screen phone carousel driven by
   the Tock clock. Each screen sits on a quarter of the clock (12, 3, 6, 9);
   the minute hand sweeps round to the next one on every turn, looping, and
   dragging the hand turns the carousel. The tabs and the side phones work
   too. Works without JS: the Focus phone and panel are the static default. */
(function () {
  var root = document.querySelector('[data-tock]');
  if (!root) return;
  var section = root.closest('.section--tock') || root;

  var NAMES = ['Focus', 'Timer', '3D Tock', 'Wardrobe'];
  var DWELL_MS = 4800;
  var IDLE_RESUME_MS = 9000;

  var tabs = Array.prototype.slice.call(root.querySelectorAll('[data-tock-shot-tab]'));
  var shots = Array.prototype.slice.call(root.querySelectorAll('[data-tock-shot]'));
  var panels = Array.prototype.slice.call(root.querySelectorAll('[data-tock-panel]'));
  var marks = Array.prototype.slice.call(root.querySelectorAll('[data-tock-mark]'));
  var clock = root.querySelector('[data-tock-clock]');
  var count = shots.length;
  var current = 0;
  var handDeg = 0; // cumulative, so the hands keep going round instead of rewinding

  function mod(n, m) { return ((n % m) + m) % m; }

  function setHand(deg, sweepMs) {
    handDeg = deg;
    section.style.setProperty('--tock-sweep', (sweepMs == null ? 900 : sweepMs) + 'ms');
    section.style.setProperty('--tock-hand', deg + 'deg');
  }

  function showShot(index) {
    current = index;
    shots.forEach(function (shot) {
      var i = Number(shot.getAttribute('data-tock-shot'));
      var offset = mod(i - index, count);
      var pos = offset === 0 ? 'center' : offset === 1 ? 'right' : offset === count - 1 ? 'left' : 'hidden';
      shot.setAttribute('data-pos', pos);
      if (pos === 'center') shot.removeAttribute('aria-hidden');
      else shot.setAttribute('aria-hidden', 'true');
    });
    tabs.forEach(function (tab) {
      var active = Number(tab.getAttribute('data-tock-shot-tab')) === index;
      tab.classList.toggle('is-active', active);
      tab.setAttribute('aria-pressed', active ? 'true' : 'false');
    });
    panels.forEach(function (panel) {
      panel.hidden = Number(panel.getAttribute('data-tock-panel')) !== index;
    });
    marks.forEach(function (mark) {
      mark.classList.toggle('is-active', Number(mark.getAttribute('data-tock-mark')) === index);
    });
    if (clock) {
      clock.setAttribute('aria-valuenow', String(index + 1));
      clock.setAttribute('aria-valuetext', NAMES[index] || '');
    }
  }

  // Turn to a screen. 'forward' always sweeps clockwise (the autoplay loop);
  // otherwise take the shorter way round, clockwise on a tie.
  function goTo(index, direction) {
    index = mod(index, count);
    var step = 360 / count;
    var delta = mod(index * step - handDeg, 360);
    if (direction !== 'forward' && delta > 180) delta -= 360;
    if (direction === 'backward' && delta > 0) delta -= 360;
    var sweep = Math.min(1400, 500 + Math.abs(delta) * 3.2);
    setHand(handDeg + delta, sweep);
    showShot(index);
  }

  /* ---------- Autoplay: the hands go round, one screen per quarter ---------- */

  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var inView = false;
  var dragging = false;
  var lastInteraction = 0;
  var timer = null;

  function canPlay() {
    return !reduceMotion && inView && !dragging &&
      !document.hidden && Date.now() - lastInteraction >= IDLE_RESUME_MS;
  }

  function schedule() {
    clearTimeout(timer);
    var wait = Math.max(DWELL_MS, IDLE_RESUME_MS - (Date.now() - lastInteraction));
    timer = setTimeout(function () {
      if (canPlay()) goTo(current + 1, 'forward');
      schedule();
    }, wait);
  }

  function touched() { lastInteraction = Date.now(); schedule(); }

  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (entries) {
      inView = entries[0].isIntersecting;
      schedule();
    }, { threshold: 0.35 }).observe(root);
  } else {
    inView = true;
  }
  document.addEventListener('visibilitychange', schedule);

  /* ---------- Tabs and side phones ---------- */

  tabs.forEach(function (tab) {
    tab.addEventListener('click', function () {
      goTo(Number(tab.getAttribute('data-tock-shot-tab')));
      touched();
    });
  });

  shots.forEach(function (shot) {
    shot.addEventListener('click', function () {
      var pos = shot.getAttribute('data-pos');
      if (pos === 'right') goTo(current + 1, 'forward');
      else if (pos === 'left') goTo(current - 1, 'backward');
      else return;
      touched();
    });
  });

  /* ---------- Drag the clock hands ---------- */

  if (clock) {
    var pointerId = null;
    var lastAngle = 0;

    function angleAt(e) {
      var r = clock.getBoundingClientRect();
      var dx = e.clientX - (r.left + r.width / 2);
      var dy = e.clientY - (r.top + r.height / 2);
      return mod(Math.atan2(dx, -dy) * 180 / Math.PI, 360); // 0 at 12 o'clock, clockwise
    }

    function follow(angle) {
      var diff = mod(angle - lastAngle + 180, 360) - 180; // unwrap across 12 o'clock
      lastAngle = angle;
      setHand(handDeg + diff, 0);
      var nearest = mod(Math.round(handDeg / (360 / count)), count);
      if (nearest !== current) showShot(nearest);
    }

    clock.addEventListener('pointerdown', function (e) {
      if (e.button != null && e.button !== 0) return;
      e.preventDefault();
      pointerId = e.pointerId;
      clock.setPointerCapture(pointerId);
      dragging = true;
      clock.classList.add('is-dragging');
      section.classList.add('is-dragging');
      lastAngle = mod(handDeg, 360);
      follow(angleAt(e)); // the hand jumps to where you grabbed
      clearTimeout(timer);
    });

    clock.addEventListener('pointermove', function (e) {
      if (e.pointerId === pointerId) follow(angleAt(e));
    });

    function release(e) {
      if (e.pointerId !== pointerId) return;
      pointerId = null;
      dragging = false;
      clock.classList.remove('is-dragging');
      section.classList.remove('is-dragging');
      var step = 360 / count;
      setHand(Math.round(handDeg / step) * step, 380); // settle on the screen's quarter
      showShot(mod(Math.round(handDeg / step), count));
      touched();
    }
    clock.addEventListener('pointerup', release);
    clock.addEventListener('pointercancel', release);

    clock.addEventListener('keydown', function (e) {
      var key = e.key;
      if (key === 'ArrowRight' || key === 'ArrowUp') goTo(current + 1, 'forward');
      else if (key === 'ArrowLeft' || key === 'ArrowDown') goTo(current - 1, 'backward');
      else if (key === 'Home') goTo(0);
      else if (key === 'End') goTo(count - 1);
      else return;
      e.preventDefault();
      touched();
    });
  }

  setHand(0, 0);
  showShot(0);
  schedule();
})();
