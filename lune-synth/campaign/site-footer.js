(function () {
  "use strict";

  function footerMarkup(notes) {
    return `
      <footer class="site-footer" aria-label="Lune Synth footer">
        <section class="site-footer__subjects" aria-labelledby="site-subject-links-title">
          <h2 id="site-subject-links-title">Study by subject</h2>
          <div class="site-footer__subject-groups">
            <nav aria-label="Math subjects">
              <h3>Mathematics</h3>
              <a href="/study/arithmetic/">Arithmetic</a>
              <a href="/study/algebra/">Algebra</a>
              <a href="/study/geometry/">Geometry</a>
              <a href="/study/calculus/">Calculus</a>
              <a href="/study/statistics/">Statistics</a>
              <a href="/study/math/">Mathematics</a>
            </nav>
            <nav aria-label="Science and technology subjects">
              <h3>Science &amp; technology</h3>
              <a href="/study/anatomy-physiology/">Anatomy &amp; Physiology</a>
              <a href="/study/biology/">Biology</a>
              <a href="/study/chemistry/">Chemistry</a>
              <a href="/study/organic-chemistry/">Organic Chemistry</a>
              <a href="/study/physics/">Physics</a>
              <a href="/study/nursing/">Nursing</a>
              <a href="/study/computer-science/">Computer Science</a>
              <a href="/study/engineering/">Engineering</a>
            </nav>
            <nav aria-label="Business and humanities subjects">
              <h3>Business &amp; humanities</h3>
              <a href="/study/accounting/">Accounting</a>
              <a href="/study/economics/">Economics</a>
              <a href="/study/finance/">Finance</a>
              <a href="/study/history/">History</a>
              <a href="/study/psychology/">Psychology</a>
              <a href="/study/writing/">Writing</a>
            </nav>
          </div>
        </section>
        <a class="site-footer__identity" href="/" aria-label="Lune Synth home">
          <img class="site-footer__mark" src="/images/lune-synth-icon-120.png" alt="" width="36" height="36" />
          <span class="site-footer__copy">
            <strong>Lune Synth&trade;</strong>
            <span>The anti-slop learning app</span>
          </span>
        </a>
        <nav aria-label="Footer">
          <a href="/">Home</a>
          <a href="/blog/">Blog</a>
          <a href="/privacy/">Privacy</a>
          <a href="/terms/">Terms</a>
          <a href="mailto:griffin@lunesynth.com">Contact</a>
        </nav>
        <p class="site-footer__powered-by">
          Powered by <strong>GPT-5.6-Luna</strong> &mdash; yes, really. We named the app Lune Synth, named the tutor Luna, and then the model showed up wearing the same name. Nobody planned it, so we're just calling it fate.
        </p>
        ${notes.map(function (note) { return `<p class="site-footer__note">${note}</p>`; }).join("")}
      </footer>`;
  }

  class LuneSiteFooter extends HTMLElement {
    connectedCallback() {
      if (this.dataset.rendered === "true") return;
      var notes = Array.prototype.map.call(this.querySelectorAll("[data-footer-note]"), function (note) {
        return note.innerHTML;
      });
      this.dataset.rendered = "true";
      this.innerHTML = footerMarkup(notes);
    }
  }

  if (!customElements.get("lune-site-footer")) {
    customElements.define("lune-site-footer", LuneSiteFooter);
  }

  document.querySelectorAll("footer.campaign-footer").forEach(function (legacyFooter) {
    var component = document.createElement("lune-site-footer");
    legacyFooter.querySelectorAll(".campaign-footer__disclaimer").forEach(function (disclaimer) {
      var note = document.createElement("span");
      note.setAttribute("data-footer-note", "");
      note.innerHTML = disclaimer.innerHTML;
      component.appendChild(note);
    });
    legacyFooter.replaceWith(component);
  });
})();
