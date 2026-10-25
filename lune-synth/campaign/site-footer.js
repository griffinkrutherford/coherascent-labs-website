(function () {
  "use strict";

  function footerMarkup(notes, compactCopy) {
    return `
      <footer class="site-footer" aria-label="Lune Synth footer">
        <div class="site-footer__directory">
        <h2 class="site-footer__directory-title">All landing pages</h2>
        <section class="site-footer__section" aria-labelledby="site-subject-links-title">
          <h2 id="site-subject-links-title">Study by subject</h2>
          <div class="site-footer__link-groups site-footer__link-groups--subjects">
            <nav aria-label="Math subjects">
              <h3>Mathematics</h3>
              <a href="/study/arithmetic/">Arithmetic</a>
              <a href="/study/pre-algebra/">Pre-Algebra</a>
              <a href="/study/algebra/">Algebra</a>
              <a href="/study/algebra-2/">Algebra II</a>
              <a href="/study/geometry/">Geometry</a>
              <a href="/study/trigonometry/">Trigonometry</a>
              <a href="/study/precalculus/">Precalculus</a>
              <a href="/study/calculus/">Calculus</a>
              <a href="/study/multivariable-calculus/">Multivariable Calculus</a>
              <a href="/study/differential-equations/">Differential Equations</a>
              <a href="/study/linear-algebra/">Linear Algebra</a>
              <a href="/study/statistics/">Statistics</a>
              <a href="/study/probability/">Probability</a>
              <a href="/study/discrete-math/">Discrete Math</a>
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
              <a href="/study/biochemistry/">Biochemistry</a>
              <a href="/study/microbiology/">Microbiology</a>
              <a href="/study/environmental-science/">Environmental Science</a>
              <a href="/study/astronomy/">Astronomy</a>
              <a href="/study/pharmacology/">Pharmacology</a>
              <a href="/study/data-science/">Data Science</a>
              <a href="/study/electrical-engineering/">Electrical Engineering</a>
            </nav>
            <nav aria-label="Business and humanities subjects">
              <h3>Business &amp; humanities</h3>
              <a href="/study/accounting/">Accounting</a>
              <a href="/study/economics/">Economics</a>
              <a href="/study/finance/">Finance</a>
              <a href="/study/history/">History</a>
              <a href="/study/psychology/">Psychology</a>
              <a href="/study/writing/">Writing</a>
              <a href="/study/marketing/">Marketing</a>
              <a href="/study/management/">Management</a>
              <a href="/study/business-statistics/">Business Statistics</a>
              <a href="/study/business-law/">Business Law</a>
              <a href="/study/sociology/">Sociology</a>
              <a href="/study/political-science/">Political Science</a>
              <a href="/study/literature/">Literature</a>
              <a href="/study/geography/">Geography</a>
              <a href="/study/art-history/">Art History</a>
            </nav>
            <nav aria-label="Language subjects">
              <h3>Languages</h3>
              <a href="/study/spanish/">Spanish</a>
              <a href="/study/french/">French</a>
              <a href="/study/german/">German</a>
              <a href="/study/italian/">Italian</a>
              <a href="/study/portuguese/">Portuguese</a>
              <a href="/study/japanese/">Japanese</a>
              <a href="/study/chinese/">Chinese (Mandarin)</a>
              <a href="/study/korean/">Korean</a>
              <a href="/study/latin/">Latin</a>
              <a href="/study/arabic/">Arabic</a>
              <a href="/study/russian/">Russian</a>
              <a href="/study/hindi/">Hindi</a>
              <a href="/study/dutch/">Dutch</a>
              <a href="/study/greek/">Greek</a>
              <a href="/study/esl/">English (ESL)</a>
              <a href="/study/languages/">All languages</a>
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
              <a href="/test-prep/clep/">CLEP</a>
              <a href="/test-prep/accuplacer/">ACCUPLACER</a>
              <a href="/test-prep/toefl/">TOEFL</a>
              <a href="/test-prep/ielts/">IELTS</a>
              <a href="/test-prep/duolingo-english-test/">Duolingo English Test</a>
              <a href="/test-prep/ssat/">SSAT</a>
              <a href="/test-prep/isee/">ISEE</a>
              <a href="/test-prep/ny-regents/">NY Regents</a>
            </nav>
            <nav aria-label="Graduate and professional tests">
              <h3>Graduate &amp; professional</h3>
              <a href="/test-prep/gre/">GRE</a>
              <a href="/test-prep/gmat/">GMAT</a>
              <a href="/test-prep/lsat/">LSAT</a>
              <a href="/test-prep/mcat/">MCAT</a>
              <a href="/test-prep/usmle/">USMLE</a>
              <a href="/test-prep/phd-qualifying-exams/">PhD Qualifying Exams</a>
              <a href="/test-prep/nclex/">NCLEX</a>
              <a href="/test-prep/bar-exam/">Bar Exam</a>
              <a href="/test-prep/cpa/">CPA</a>
              <a href="/test-prep/cfa/">CFA</a>
              <a href="/test-prep/dat/">DAT</a>
              <a href="/test-prep/oat/">OAT</a>
              <a href="/test-prep/comlex/">COMLEX</a>
              <a href="/test-prep/fe-exam/">FE Exam</a>
              <a href="/test-prep/praxis/">Praxis</a>
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
              <a href="/for-students/test-anxiety/">Test Anxiety</a>
              <a href="/for-students/adhd-friendly-studying/">ADHD-Friendly Studying</a>
              <a href="/for-students/first-generation-college/">First-Generation College</a>
              <a href="/for-students/community-college/">Community College</a>
              <a href="/for-students/career-changers/">Career Changers</a>
              <a href="/for-students/international-students/">International Students</a>
              <a href="/for-students/stem-majors/">STEM Majors</a>
              <a href="/for-students/pre-med/">Pre-Med</a>
              <a href="/for-students/homeschooled-teens/">Homeschooled Teens</a>
              <a href="/for-students/self-taught-learners/">Self-Taught Learners</a>
              <a href="/for-students/note-taking/">Note-Taking</a>
            </nav>
            <nav aria-label="Resources for parents and families">
              <h3>For parents &amp; families</h3>
              <a href="/for-parents/math-help/">Math Help</a>
              <a href="/for-parents/homework-help/">Homework Help</a>
              <a href="/for-parents/ai-and-homework/">AI &amp; Homework</a>
              <a href="/for-parents/middle-school-math/">Middle School Math</a>
              <a href="/for-parents/high-school-math/">High School Math</a>
              <a href="/for-families/homeschool/">Homeschool</a>
              <a href="/for-parents/reading-and-writing/">Reading &amp; Writing</a>
              <a href="/for-parents/science-homework/">Science Homework</a>
              <a href="/for-parents/test-prep/">Test Prep for Teens</a>
              <a href="/for-families/summer-learning/">Summer Learning</a>
              <a href="/for-parents/study-habits/">Study Habits &amp; Screen Time</a>
              <a href="/for-parents/catching-up/">Catching Up</a>
              <a href="/for-parents/tutoring-alternatives/">Tutoring Alternatives</a>
              <a href="/for-parents/advanced-learners/">Advanced Learners</a>
              <a href="/for-parents/learning-differences/">Learning Differences</a>
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
          <a href="https://coherascentlabs.com/" style="display: inline-flex; align-items: center; gap: 8px"><img src="/coherascent-labs-logo-march-16-2026.webp" alt="" width="36" height="36" loading="lazy" decoding="async" style="object-fit: contain; border-radius: 8px" />Coherascent Labs</a>
          <a href="/">Home</a>
          <a href="/blog/">Blog</a>
          <a href="/about/">Our Story</a>
          <a href="/support/">Support</a>
          <a href="/privacy/">Privacy</a>
          <a href="/terms/">Terms</a>
          <a href="mailto:griffin@lunesynth.com">Contact</a>
        </nav>
        <p class="site-footer__powered-by">
          ${compactCopy
            ? 'Powered by <strong>GPT-6-Luna</strong>. The name was a coincidence.'
            : "Powered by <strong>GPT-6-Luna</strong>, yes, really. We named the app Lune Synth, named the tutor Luna, and then the model showed up wearing the same name. Nobody planned it, so we're just calling it fate."}
        </p>
        <p class="site-footer__note" id="waitlist-offer-note" tabindex="-1">*Joining the waitlist is free and charges nothing. Founding 40 members keep their original offer under Terms §6.</p>
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
      this.innerHTML = footerMarkup(notes, this.hasAttribute("data-compact-copy"));
    }
  }

  if (!customElements.get("lune-site-footer")) {
    customElements.define("lune-site-footer", LuneSiteFooter);
  }

  document.querySelectorAll("footer.campaign-footer").forEach(function (legacyFooter) {
    var component = document.createElement("lune-site-footer");
    component.id = "site-footer";
    legacyFooter.querySelectorAll(".campaign-footer__disclaimer").forEach(function (disclaimer) {
      var note = document.createElement("span");
      note.setAttribute("data-footer-note", "");
      note.innerHTML = disclaimer.innerHTML;
      component.appendChild(note);
    });
    legacyFooter.replaceWith(component);
  });
})();
