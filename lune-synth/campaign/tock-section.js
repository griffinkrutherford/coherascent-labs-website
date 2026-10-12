/* Home page "Focus with Tock" section: the risk-tier dial and the phone deck.
   Copy for each tier mirrors the app (FLOW_RISK_TIER_HEADINGS and the Tock's
   Risk Tiers card). Works without JS: the first tier and the Focus phone are
   the static default. */
(function () {
  var root = document.querySelector('[data-tock]');
  if (!root) return;
  var section = root.closest('.section--tock') || root;

  var TIERS = [
    { name: 'No risk', short: 'No risk', color: '#6fe7ff', quote: "Tock's just warming up.", locked: false,
      detail: 'Free to start, nothing to lose. Answer questions during the session and Tock still pays out a few Moon Rocks.' },
    { name: 'Medium risk', short: 'Medium', color: '#74e6a6', quote: "Tock's paying attention.", locked: false,
      detail: 'Stake a few Moon Rocks. Finish the session and you get them back, plus a bigger bonus for the work you do.' },
    { name: 'High risk', short: 'High', color: '#f4cf6b', quote: "Tock's locked in.", locked: false,
      detail: "Stake up to half of a session's limit, on sessions up to 2 hours. Leave early and the stake is gone." },
    { name: 'Extreme risk', short: 'Extreme', color: '#ff9c5e', quote: "Tock's going extreme.", locked: true,
      detail: "Stake up to three quarters of a session's limit and focus up to 3 hours. Unlock for 2,500 Moon Rocks, or by finishing 10 focus sessions." },
    { name: 'Insane risk', short: 'Insane', color: '#ff5d87', quote: "Tock's gone insane.", locked: true,
      detail: 'Stake everything a session allows and focus up to 4 hours. Unlock for 5,000 Moon Rocks, or with 10 sessions at Extreme.' }
  ];

  var tierButtons = Array.prototype.slice.call(root.querySelectorAll('[data-tock-tier]'));
  var arc = root.querySelector('[data-tock-arc]');
  var nameEl = root.querySelector('[data-tock-tier-name]');
  var lockEl = root.querySelector('[data-tock-tier-lock]');
  var quoteEl = root.querySelector('[data-tock-tier-quote]');
  var detailEl = root.querySelector('[data-tock-tier-detail]');

  function setTier(index) {
    var tier = TIERS[index];
    if (!tier) return;
    section.style.setProperty('--tock-tier-color', tier.color);
    if (arc) arc.style.strokeDasharray = (index * 25) + ' 100';
    if (nameEl) nameEl.textContent = tier.short;
    if (lockEl) lockEl.hidden = !tier.locked;
    if (quoteEl) quoteEl.textContent = '“' + tier.quote + '”';
    if (detailEl) detailEl.textContent = tier.detail;
    tierButtons.forEach(function (button) {
      var active = Number(button.getAttribute('data-tock-tier')) === index;
      button.classList.toggle('is-active', active);
      button.setAttribute('aria-pressed', active ? 'true' : 'false');
    });
  }

  tierButtons.forEach(function (button) {
    button.addEventListener('click', function () {
      setTier(Number(button.getAttribute('data-tock-tier')));
    });
  });

  var tabs = Array.prototype.slice.call(root.querySelectorAll('[data-tock-shot-tab]'));
  var shots = Array.prototype.slice.call(root.querySelectorAll('[data-tock-shot]'));
  var count = shots.length;

  function setShot(index) {
    shots.forEach(function (shot) {
      var i = Number(shot.getAttribute('data-tock-shot'));
      var offset = (i - index + count) % count;
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
  }

  tabs.forEach(function (tab) {
    tab.addEventListener('click', function () {
      setShot(Number(tab.getAttribute('data-tock-shot-tab')));
    });
  });

  shots.forEach(function (shot) {
    shot.addEventListener('click', function () {
      var pos = shot.getAttribute('data-pos');
      if (pos === 'left' || pos === 'right') setShot(Number(shot.getAttribute('data-tock-shot')));
    });
  });

  setTier(0);
})();
