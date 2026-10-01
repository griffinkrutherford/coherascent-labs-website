/* Progressive enhancement: all content and prices remain visible without JS. */
(function () {
  'use strict';
  var page = document.querySelector('.pro-page');
  if (!page) return;
  var header = page.querySelector('.site-header');
  var nav = page.querySelector('#primary-nav');
  var toggle = page.querySelector('[data-nav-toggle]');
  var main = page.querySelector('main');
  var footer = page.querySelector('.pro-footer');
  var savedOverflow = '';
  function setMenu(open) {
    if (open) savedOverflow = page.style.overflow;
    header.classList.toggle('nav-open', open);
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    page.style.overflow = open ? 'hidden' : savedOverflow;
    main.inert = open;
    footer.inert = open;
    if (open) nav.querySelector('a').focus();
    else toggle.focus();
  }
  toggle.addEventListener('click', function () { setMenu(!header.classList.contains('nav-open')); });
  nav.addEventListener('click', function (event) { if (event.target.closest('a')) setMenu(false); });
  document.addEventListener('keydown', function (event) {
    if (!header.classList.contains('nav-open')) return;
    if (event.key === 'Escape') { event.preventDefault(); setMenu(false); return; }
    if (event.key !== 'Tab') return;
    var links = Array.from(nav.querySelectorAll('a'));
    var first = links[0];
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); toggle.focus(); }
    else if (!event.shiftKey && document.activeElement === toggle) { event.preventDefault(); first.focus(); }
  });
  var scrollFrame = 0;
  function updateHeader() { header.classList.toggle('is-scrolled', window.scrollY > 16); }
  window.addEventListener('scroll', function () {
    if (scrollFrame) return;
    scrollFrame = requestAnimationFrame(function () { scrollFrame = 0; updateHeader(); });
  }, { passive: true });
  updateHeader();

  var motion = window.matchMedia('(prefers-reduced-motion: reduce)');
  var finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');
  var reveals = Array.from(page.querySelectorAll('[data-pro-reveal]'));
  var observer;

  function syncMotion() {
    if (observer) observer.disconnect();
    page.classList.remove('pro-motion');
    if (motion.matches || !('IntersectionObserver' in window)) {
      reveals.forEach(function (element) { element.classList.add('is-visible'); });
      return;
    }
    observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.08, rootMargin: '0px 0px 24px 0px' });
    page.classList.add('pro-motion');
    reveals.forEach(function (element) { observer.observe(element); });
  }
  syncMotion();
  motion.addEventListener('change', syncMotion);

  // At most one pointer update per frame; no permanent JavaScript animation loop.
  page.querySelectorAll('.pro-card').forEach(function (card) {
    var frame = 0;
    var pointer;
    card.addEventListener('pointermove', function (event) {
      if (motion.matches || !finePointer.matches) return;
      pointer = { x: event.clientX, y: event.clientY };
      if (frame) return;
      frame = requestAnimationFrame(function () {
        frame = 0;
        if (motion.matches || document.hidden) return;
        var rect = card.getBoundingClientRect();
        card.style.setProperty('--mx', (pointer.x - rect.left) + 'px');
        card.style.setProperty('--my', (pointer.y - rect.top) + 'px');
      });
    }, { passive: true });
    card.addEventListener('pointerleave', function () {
      cancelAnimationFrame(frame);
      frame = 0;
      card.style.removeProperty('--mx');
      card.style.removeProperty('--my');
    });
  });
  function syncVisibility() { page.classList.toggle('pro-paused', document.hidden); }
  document.addEventListener('visibilitychange', syncVisibility);
  syncVisibility();
})();
