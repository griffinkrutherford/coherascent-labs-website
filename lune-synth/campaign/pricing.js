/* Landing-page pricing: pointer-following glow and a one-time count-up of each
   price when the cards first scroll into view. The real price is always in the
   markup; this only animates toward it, and does nothing under reduced motion. */
(function () {
  var section = document.querySelector('[data-pricing]');
  if (!section) return;

  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var cards = Array.prototype.slice.call(section.querySelectorAll('.pricing-card'));

  if (!reduceMotion && window.matchMedia('(hover: hover)').matches) {
    cards.forEach(function (card) {
      card.addEventListener('pointermove', function (event) {
        var rect = card.getBoundingClientRect();
        card.style.setProperty('--mx', (event.clientX - rect.left) + 'px');
        card.style.setProperty('--my', (event.clientY - rect.top) + 'px');
      });
    });
  }

  if (reduceMotion || !('IntersectionObserver' in window)) return;

  var amounts = Array.prototype.slice.call(section.querySelectorAll('[data-pricing-amount]'));

  function countUp(el) {
    var target = parseFloat(el.getAttribute('data-pricing-amount'));
    if (!isFinite(target) || target <= 0) return;
    var decimals = (el.getAttribute('data-pricing-amount').split('.')[1] || '').length;
    var duration = 1100;
    var start = null;
    function frame(now) {
      if (start === null) start = now;
      var t = Math.min(1, (now - start) / duration);
      var eased = 1 - Math.pow(1 - t, 3);
      el.textContent = '$' + (target * eased).toFixed(decimals);
      if (t < 1) {
        requestAnimationFrame(frame);
      } else {
        el.textContent = '$' + target.toFixed(decimals);
      }
    }
    requestAnimationFrame(frame);
  }

  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (!entry.isIntersecting) return;
      observer.disconnect();
      // Starts with the cards' staggered entrance so each number lands as its
      // card settles.
      amounts.forEach(function (el, index) {
        setTimeout(function () { countUp(el); }, 260 + index * 140);
      });
    });
  }, { threshold: 0.25 });

  observer.observe(section);
})();
