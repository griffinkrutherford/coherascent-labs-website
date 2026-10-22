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
  var secret = window.TockSecret;
  var rotation = secret ? secret.createRotationTracker() : null;
  var reward = root.querySelector('[data-tock-reward]');
  var goldenReward = root.querySelector('[data-tock-golden-reward]');

  var codeCards = [];
  function prepareCodeCard(card, set) {
    if (!card) return null;
    var combination = card.querySelector('[data-tock-code]');
    var duration = card.querySelector('[data-tock-code-duration]');
    var status = card.querySelector('[data-tock-code-status]');
    var expiry = card.querySelector('[data-tock-code-expiry]');
    var retry = card.querySelector('[data-tock-code-retry]');
    var timer = null, countdown = null, request = null;
    function stop() {
      clearTimeout(timer);
      clearInterval(countdown);
      if (request) request.abort();
      request = null;
      combination.hidden = true;
      expiry.textContent = '';
    }
    function load() {
      stop();
      status.textContent = 'Getting your current secret combination…';
      retry.hidden = true;
      var controller = new AbortController();
      request = controller;
      var startedAt = performance.now();
      var timeout = setTimeout(function () { controller.abort(); }, 8000);
      fetch('https://coherascent-labs-app-production.up.railway.app/v1/public/tock-wardrobe-code?set=' + set,
        { cache: 'no-store', credentials: 'omit', signal: controller.signal })
        .then(function (response) { if (!response.ok) throw new Error('Unavailable'); return response.json(); })
        .then(function (value) {
          if (request !== controller) return;
          var code = secret.parseWardrobeCode(value, set);
          var remaining = code ? code.remainingMs - (performance.now() - startedAt) : 0;
          if (remaining <= 0) throw new Error('Expired');
          var deadline = performance.now() + remaining;
          duration.textContent = code.duration;
          combination.hidden = false;
          status.textContent = 'Use this combination in the app before it changes.';
          function updateCountdown() {
            var seconds = Math.max(0, Math.ceil((deadline - performance.now()) / 1000));
            if (!seconds) { load(); return; }
            expiry.textContent = 'Changes in ' + Math.floor(seconds / 60) + ':' + String(seconds % 60).padStart(2, '0');
          }
          countdown = setInterval(updateCountdown, 1000);
          timer = setTimeout(load, remaining);
          updateCountdown();
        })
        .catch(function () {
          if (request !== controller) return;
          combination.hidden = true;
          expiry.textContent = '';
          status.textContent = 'The combination is unavailable. Check your connection and try again.';
          retry.hidden = false;
          timer = setTimeout(load, 30000);
        })
        .finally(function () { clearTimeout(timeout); });
    }
    retry.addEventListener('click', load);
    var entry = { stop: stop, load: load, card: card };
    codeCards.push(entry);
    return entry;
  }
  var standardCode = prepareCodeCard(reward, 'standard');
  var goldenCode = prepareCodeCard(goldenReward, 'golden');
  function reveal(entry) {
    if (!entry || !entry.card.hidden) return;
    entry.card.hidden = false;
    entry.load();
  }
  function recordTurn(delta) {
    if (!rotation) return;
    if (rotation.add(delta)) reveal(standardCode);
    if (rotation.isGoldenUnlocked()) reveal(goldenCode);
  }
  window.addEventListener('pagehide', function () { codeCards.forEach(function (entry) { entry.stop(); }); });
  document.addEventListener('visibilitychange', function () {
    codeCards.forEach(function (entry) {
      if (document.hidden) entry.stop();
      else if (!entry.card.hidden) entry.load();
    });
  });
  window.addEventListener('pageshow', function (event) {
    if (event.persisted) codeCards.forEach(function (entry) { if (!entry.card.hidden) entry.load(); });
  });

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
    return delta;
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
      if (Math.hypot(dx, dy) < r.width * 0.16) return null;
      return mod(Math.atan2(dx, -dy) * 180 / Math.PI, 360); // 0 at 12 o'clock, clockwise
    }

    function follow(angle, manual) {
      if (angle === null) { lastAngle = null; return; }
      if (lastAngle === null) { lastAngle = angle; return; }
      var diff = secret ? secret.angleDelta(lastAngle, angle) : mod(angle - lastAngle + 180, 360) - 180; // unwrap across 12 o'clock
      lastAngle = angle;
      if (manual !== false) recordTurn(diff);
      setHand(handDeg + diff, 0);
      var nearest = mod(Math.round(handDeg / (360 / count)), count);
      if (nearest !== current) showShot(nearest);
    }

    clock.addEventListener('pointerdown', function (e) {
      if (pointerId !== null || (e.button != null && e.button !== 0)) return;
      e.preventDefault();
      pointerId = e.pointerId;
      clock.setPointerCapture(pointerId);
      dragging = true;
      clock.classList.add('is-dragging');
      section.classList.add('is-dragging');
      lastAngle = mod(handDeg, 360);
      follow(angleAt(e), false); // Grabbing/jumping is never counted toward the secret.
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
    clock.addEventListener('lostpointercapture', release);

    clock.addEventListener('keydown', function (e) {
      var key = e.key;
      if (key === 'ArrowRight' || key === 'ArrowUp') recordTurn(goTo(current + 1, 'forward'));
      else if (key === 'ArrowLeft' || key === 'ArrowDown') recordTurn(goTo(current - 1, 'backward'));
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
