(function () {
  'use strict';
  var selector = '[data-phone-mock], .phone-mock__frame, .feature-phone, .feature-ipad, .ipad-mockup, .voice-scene__ipad, .about-luna-phone, .hero-highlight-reel__phone, .capture-scene__phone, .processing-scene__phone, .feedback-scene__phone, .voice-scene__phone, .luna-phone--tab, .quick-missions__phone, .response-carousel__question-phone';
  var states = new WeakMap();
  var active = null;
  var rotatingTouch = false;
  var suppressUntil = 0;
  var rotated = new Set();
  var help = document.createElement('span');
  help.id = 'device-rotation-help';
  help.className = 'device-rotation-help';
  help.textContent = 'Drag to rotate, or use two fingers on a touchscreen. Alt plus arrow keys rotates; Escape resets the view.';
  document.body.appendChild(help);

  function reset(el) {
    var s = states.get(el);
    if (!s || !s.base) return;
    ['transform', 'rotate', 'transition'].forEach(function (name) {
      var original = s.original[name];
      if (original.value) el.style.setProperty(name, original.value, original.priority);
      else el.style.removeProperty(name);
    });
    el.classList.remove('is-device-dragging');
    s.base = null; s.x = s.y = 0;
    rotated.delete(el);
  }
  function prepare(el) {
    var s = states.get(el);
    if (s.base) return s;
    var c = getComputedStyle(el);
    s.original = {};
    ['transform', 'rotate', 'transition'].forEach(function (name) {
      s.original[name] = { value: el.style.getPropertyValue(name), priority: el.style.getPropertyPriority(name) };
    });
    var rotation = c.rotate;
    var matrix = new DOMMatrix();
    if (rotation !== 'none') {
      var parts = rotation.split(/\s+/);
      var angle = parseFloat(parts[parts.length - 1]);
      if (parts[parts.length - 1].endsWith('rad')) angle *= 180 / Math.PI;
      if (parts[parts.length - 1].endsWith('turn')) angle *= 360;
      if (parts.length === 4) matrix.rotateAxisAngleSelf(+parts[0], +parts[1], +parts[2], angle);
      else if (parts.length === 2) matrix.rotateAxisAngleSelf(parts[0] === 'x' ? 1 : 0, parts[0] === 'y' ? 1 : 0, parts[0] === 'z' ? 1 : 0, angle);
      else matrix.rotateSelf(0, 0, angle);
    }
    if (c.transform !== 'none') matrix.multiplySelf(new DOMMatrix(c.transform));
    s.translation = 'translate3d(' + matrix.m41 + 'px, ' + matrix.m42 + 'px, ' + matrix.m43 + 'px) ';
    matrix.m41 = matrix.m42 = matrix.m43 = 0;
    s.base = matrix.toString();
    el.style.setProperty('transition', 'none', 'important');
    el.style.setProperty('rotate', 'none', 'important');
    rotated.add(el);
    return s;
  }
  function render(el, x, y) {
    var s = prepare(el);
    s.x = Math.max(-35, Math.min(35, x));
    s.y = Math.max(-55, Math.min(55, y));
    el.style.setProperty('transform', s.translation + 'rotateX(' + s.x + 'deg) rotateY(' + s.y + 'deg) ' + s.base, 'important');
  }
  function begin(el, x, y, kind, id) {
    var s = states.get(el);
    active = { el: el, x: x, y: y, pitch: s.x, yaw: s.y, moved: false, kind: kind, id: id };
  }
  function move(x, y) {
    if (!active) return;
    var dx = x - active.x, dy = y - active.y;
    if (!active.moved && Math.hypot(dx, dy) < 5) return;
    active.moved = true;
    active.el.classList.add('is-device-dragging');
    render(active.el, active.pitch - dy * 0.28, active.yaw + dx * 0.35);
  }
  function finish() {
    if (!active) return;
    if (active.moved) suppressUntil = performance.now() + 450;
    active.el.classList.remove('is-device-dragging');
    active = null;
  }
  function point(touches) {
    return { x: (touches[0].clientX + touches[1].clientX) / 2, y: (touches[0].clientY + touches[1].clientY) / 2 };
  }
  function control(target, y) {
    if (target.closest('button, a, input, select, textarea, [contenteditable="true"]')) return true;
    var video = target.closest('video[controls]');
    return video && y > video.getBoundingClientRect().bottom - 60;
  }
  function attach(el) {
    if (states.has(el) || el.parentElement.closest(selector)) return;
    states.set(el, { x: 0, y: 0, base: null });
    // A fullscreen clone may inherit a rotation; start it from its own layout.
    el.classList.remove('is-device-dragging');
    el.classList.add('rotatable-device');
    el.parentElement.classList.add('rotatable-device-scene');
    if (!el.hasAttribute('tabindex')) el.tabIndex = 0;
    var described = el.getAttribute('aria-describedby') || '';
    if (!described.includes(help.id)) el.setAttribute('aria-describedby', (described + ' ' + help.id).trim());
    if (!el.hasAttribute('title')) el.title = 'Drag to rotate · Two fingers on touch · Escape to reset';
    if (!el.querySelector(':scope > .dev-slice, :scope > .device-tilt__slice, :scope > .rotation-depth-slice')) {
      for (var i = 1; i <= 20; i++) {
        var slice = document.createElement('span');
        slice.className = 'rotation-depth-slice';
        slice.setAttribute('aria-hidden', 'true');
        slice.style.setProperty('--rotation-slice', i);
        el.appendChild(slice);
      }
    }
    el.addEventListener('dragstart', function (e) { e.preventDefault(); });
    el.addEventListener('pointerdown', function (e) {
      if (e.pointerType === 'touch' || e.button !== 0 || control(e.target, e.clientY)) return;
      begin(el, e.clientX, e.clientY, 'pointer', e.pointerId);
    });
    el.addEventListener('touchstart', function (e) {
      if (e.touches.length !== 2 || !Array.from(e.touches).every(function (t) { return el.contains(t.target); })) return;
      var p = point(e.touches);
      begin(el, p.x, p.y, 'touch');
      rotatingTouch = true;
      e.preventDefault(); e.stopPropagation();
    }, { passive: false });
    el.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') { reset(el); return; }
      if (!e.altKey || !['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(e.key)) return;
      e.preventDefault(); e.stopPropagation();
      var s = states.get(el);
      render(el, s.x + (e.key === 'ArrowUp' ? 5 : e.key === 'ArrowDown' ? -5 : 0), s.y + (e.key === 'ArrowRight' ? 5 : e.key === 'ArrowLeft' ? -5 : 0));
    });
  }
  document.addEventListener('pointerdown', function () {
    // A fresh press is a new click, not the synthetic click after a drag.
    if (!active) suppressUntil = 0;
  }, true);
  document.addEventListener('pointermove', function (e) {
    if (!active || active.kind !== 'pointer' || active.id !== e.pointerId) return;
    move(e.clientX, e.clientY);
    if (active.moved) e.preventDefault();
  }, { passive: false });
  document.addEventListener('pointerup', function (e) { if (active && active.kind === 'pointer' && active.id === e.pointerId) finish(); });
  document.addEventListener('pointercancel', function () { if (active && active.kind === 'pointer') finish(); });
  document.addEventListener('touchmove', function (e) {
    if (!rotatingTouch) return;
    if (active && e.touches.length === 2) { var p = point(e.touches); move(p.x, p.y); }
    e.preventDefault(); e.stopImmediatePropagation();
  }, { passive: false, capture: true });
  function endTouch(e) {
    if (!rotatingTouch) return;
    e.preventDefault(); e.stopImmediatePropagation();
    if (e.touches.length < 2) { suppressUntil = performance.now() + 450; finish(); }
    if (e.touches.length === 0 || e.type === 'touchcancel') rotatingTouch = false;
  }
  document.addEventListener('touchend', endTouch, { passive: false, capture: true });
  document.addEventListener('touchcancel', endTouch, { passive: false, capture: true });
  document.addEventListener('click', function (e) {
    if (performance.now() < suppressUntil && e.target.closest(selector)) { e.preventDefault(); e.stopImmediatePropagation(); }
  }, true);
  window.addEventListener('blur', finish);
  window.addEventListener('resize', function () { finish(); rotated.forEach(reset); });
  function scan(root) {
    if (root.matches && root.matches(selector)) attach(root);
    if (root.querySelectorAll) root.querySelectorAll(selector).forEach(attach);
  }
  scan(document);
  new MutationObserver(function (records) {
    if (records.some(function (record) { return record.removedNodes.length; })) {
      rotated.forEach(function (el) { if (!el.isConnected) reset(el); });
      if (active && !active.el.isConnected) finish();
    }
    records.forEach(function (record) { record.addedNodes.forEach(function (node) { if (node.nodeType === 1) scan(node); }); });
  }).observe(document.body, { childList: true, subtree: true });
})();
