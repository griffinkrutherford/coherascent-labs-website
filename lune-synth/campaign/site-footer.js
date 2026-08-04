(function () {
  "use strict";

  function footerMarkup(notes) {
    return `
      <footer class="site-footer" aria-label="Lune Synth footer">
        <div class="site-footer__directory">
        <section class="site-footer__section" aria-labelledby="site-subject-links-title">
          <h2 id="site-subject-links-title">Study by subject</h2>
          <div class="site-footer__link-groups site-footer__link-groups--subjects">
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
        <section class="site-footer__section" aria-labelledby="site-test-prep-links-title">
          <h2 id="site-test-prep-links-title">Test preparation</h2>
          <div class="site-footer__link-groups site-footer__link-groups--tests">
            <nav aria-label="School and college entrance tests">
              <h3>School &amp; college</h3>
              <a href="/test-prep/sat/">SAT</a>
              <a href="/test-prep/act/">ACT</a>
              <a href="/test-prep/psat/">PSAT</a>
              <a href="/test-prep/ap-exams/">AP Exams</a>
              <a href="/test-prep/ib-exams/">IB Exams</a>
              <a href="/test-prep/ged/">GED</a>
              <a href="/test-prep/state-assessments/">State Assessments</a>
            </nav>
            <nav aria-label="Graduate and professional tests">
              <h3>Graduate &amp; professional</h3>
              <a href="/test-prep/gre/">GRE</a>
              <a href="/test-prep/gmat/">GMAT</a>
              <a href="/test-prep/lsat/">LSAT</a>
              <a href="/test-prep/mcat/">MCAT</a>
              <a href="/test-prep/usmle/">USMLE</a>
              <a href="/test-prep/phd-qualifying-exams/">PhD Qualifying Exams</a>
            </nav>
          </div>
        </section>
        <section class="site-footer__section" aria-labelledby="site-audience-links-title">
          <h2 id="site-audience-links-title">Find your path</h2>
          <div class="site-footer__link-groups site-footer__link-groups--audiences">
            <nav aria-label="Resources for students">
              <h3>For students</h3>
              <a href="/for-students/behind-in-math/">Behind in Math</a>
              <a href="/for-students/study-consistency/">Study Consistency</a>
              <a href="/for-students/college-study/">College Study</a>
              <a href="/for-students/adult-learners/">Adult Learners</a>
            </nav>
            <nav aria-label="Resources for parents and families">
              <h3>For parents &amp; families</h3>
              <a href="/for-parents/math-help/">Math Help</a>
              <a href="/for-parents/homework-help/">Homework Help</a>
              <a href="/for-parents/ai-and-homework/">AI &amp; Homework</a>
              <a href="/for-parents/middle-school-math/">Middle School Math</a>
              <a href="/for-parents/high-school-math/">High School Math</a>
              <a href="/for-families/homeschool/">Homeschool</a>
            </nav>
          </div>
        </section>
        </div>
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
