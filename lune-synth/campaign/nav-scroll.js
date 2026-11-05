(function () {
  'use strict';
  var header = document.querySelector('.site-header');
  var nav = document.getElementById('primary-nav');
  if (!header || !nav) return;
  var cancel = function () {};
  var interacted = false;
  var motion = window.matchMedia('(prefers-reduced-motion: reduce)');

  function targetFor(hash) {
    try { return hash ? document.getElementById(decodeURIComponent(hash.slice(1))) : null; }
    catch (_) { return null; }
  }
  function destination(target) {
    var gap = header.getBoundingClientRect().height + 12;
    return Math.max(0, Math.min(
      target.getBoundingClientRect().top + window.scrollY - gap,
      document.documentElement.scrollHeight - window.innerHeight
    ));
  }
  function navigate(target, animate) {
    cancel();
    var stopped = false;
    var frame;
    var observer;
    var timer;
    cancel = function () {
      stopped = true;
      cancelAnimationFrame(frame);
      clearTimeout(timer);
      if (observer) observer.disconnect();
    };
    // Measure after the overlay releases its scroll lock and the viewport settles.
    frame = requestAnimationFrame(function () {
      frame = requestAnimationFrame(function () {
        var start = performance.now();
        var from = window.scrollY;
        var duration = animate && !motion.matches ? 450 : 0;
        function tick(now) {
          if (stopped || !target.isConnected) return;
          var progress = duration ? Math.min(1, (now - start) / duration) : 1;
          var eased = 1 - Math.pow(1 - progress, 3);
          window.scrollTo({ top: from + (destination(target) - from) * eased, behavior: 'instant' });
          if (progress < 1) { frame = requestAnimationFrame(tick); return; }
          // Briefly follow late font/media/header size changes, then release control.
          function correct() {
            if (stopped) return;
            cancelAnimationFrame(frame);
            frame = requestAnimationFrame(function () {
              if (!stopped) window.scrollTo({ top: destination(target), behavior: 'instant' });
            });
          }
          if ('ResizeObserver' in window) {
            observer = new ResizeObserver(correct);
            observer.observe(document.body);
            observer.observe(header);
            document.querySelectorAll('main > section, main > article').forEach(function (el) { observer.observe(el); });
          }
          if (document.fonts) document.fonts.ready.then(correct);
          timer = setTimeout(cancel, 2000);
        }
        tick(start);
      });
    });
  }
  function stopForUser() { interacted = true; cancel(); }
  ['wheel', 'touchstart', 'pointerdown'].forEach(function (event) {
    window.addEventListener(event, stopForUser, { passive: true });
  });
  window.addEventListener('keydown', function (event) {
    if (['ArrowDown', 'ArrowUp', 'PageDown', 'PageUp', 'Home', 'End', ' ', 'Escape', 'Tab'].includes(event.key)) stopForUser();
  });
  nav.addEventListener('click', function (event) {
    var link = event.target.closest('a');
    if (!link || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    var url = new URL(link.href, location.href);
    if (url.origin !== location.origin || url.pathname !== location.pathname || url.search !== location.search) return;
    var target = targetFor(url.hash);
    if (!target) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    header.classList.remove('nav-open');
    document.documentElement.style.overflow = '';
    var toggle = header.querySelector('[data-nav-toggle]');
    if (toggle) {
      toggle.setAttribute('aria-expanded', 'false');
      toggle.setAttribute('aria-label', 'Open menu');
    }
    if (location.hash !== url.hash) history.pushState(null, '', url.hash);
    navigate(target, true);
  }, true);
  window.addEventListener('hashchange', function () {
    var target = targetFor(location.hash);
    if (target) navigate(target, false);
  });
  function initialAnchor() {
    var target = targetFor(location.hash);
    if (target && !interacted) navigate(target, false);
  }
  initialAnchor();
  if (document.readyState !== 'complete') window.addEventListener('load', initialAnchor, { once: true });
})();

// Scroll cue for the full-screen menus. When a menu overflows the viewport,
// show a bottom fade while more links sit below and a "Scroll for more" chip
// until the reader scrolls. Decoration only: aria-hidden, no pointer events.
(function () {
  'use strict';
  var header = document.querySelector('.site-header');
  if (!header) return;

  function attach(list, openClass) {
    if (!list || !list.parentNode) return;
    var cue = document.createElement('div');
    cue.className = 'menu-scroll-cue';
    cue.setAttribute('aria-hidden', 'true');
    cue.setAttribute('data-menu', openClass);
    cue.innerHTML = '<span class="menu-scroll-cue__label">Scroll for more<span class="menu-scroll-cue__chevron"></span></span>';
    list.parentNode.insertBefore(cue, list.nextSibling);

    var wasOpen = false;
    var hinting = false;
    var frame = 0;
    function update() {
      frame = 0;
      var open = header.classList.contains(openClass);
      if (open && !wasOpen) {
        list.scrollTop = 0;
        hinting = true;
      }
      wasOpen = open;
      var more = open && list.scrollHeight - list.clientHeight - list.scrollTop > 4;
      if (!more || list.scrollTop > 8) hinting = false;
      cue.classList.toggle('has-more', more);
      cue.classList.toggle('is-hinting', more && hinting);
    }
    function schedule() {
      if (!frame) frame = requestAnimationFrame(update);
    }
    list.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    new MutationObserver(schedule).observe(header, { attributes: true, attributeFilter: ['class'] });
    update();
  }

  attach(document.getElementById('primary-nav'), 'nav-open');
  attach(header.querySelector('.brand-dropdown-content'), 'brand-open');
})();
