(function () {
  var deck = document.querySelector("[data-response-slideshow]");
  if (!deck || deck.dataset.extendedSlides === "true") return;
  deck.dataset.extendedSlides = "true";

  var slides = [
    {
      image: "14", label: "Physics · Forces and friction", subject: "Physics",
      question: "A 10 kg box is pulled right across a rough floor by a 50 N force at 37 degrees above horizontal. Draw or describe its free-body diagram and determine the normal force.",
      lines: ["Vertical forces: N + 50 sin(37°) - mg = 0", "N = (10)(9.8) - 50 sin(37°)", "N = 98 - 30.1", "N ≈ 67.9 N", "FBD: weight down, normal up, pull up-right, friction left."]
    },
    {
      image: "15", label: "Chemistry · Stoichiometry", subject: "Chemistry",
      question: "For 2H₂ + O₂ → 2H₂O, how many moles of H₂O form from 3.00 mol H₂ when O₂ is excess?",
      lines: ["3.00 mol H₂ × (2 mol H₂O / 2 mol H₂)", "The 2:2 ratio simplifies to 1:1.", "= 3.00 mol H₂O", "O₂ is excess, so H₂ determines the yield."]
    },
    {
      image: "16", label: "Economics · Market analysis", subject: "Economics",
      question: "A coffee shop raises its price from 3 to 4, and fewer cups are bought. Is this a change in demand or quantity demanded? Explain why.",
      lines: ["This is a decrease in quantity demanded.", "The product's own price changed,", "so buyers move upward along the same demand curve.", "Demand itself would shift only if a non-price determinant changed."]
    },
    {
      image: "17", label: "Organic chemistry · Reaction mechanisms", subject: "Organic Chemistry",
      question: "In a curved-arrow mechanism, where must an electron-pushing arrow start, and where may it end? Give one valid example using a lone pair.",
      lines: ["The arrow starts at an electron source:", "a lone pair or a bond.", "It ends at an electron-poor atom or where a new bond forms.", "Example: an OH⁻ lone pair attacks a carbonyl carbon."]
    },
    {
      image: "18", label: "Physiology · Baroreflex", subject: "Physiology",
      question: "What variable do arterial baroreceptors detect, and where are the two main baroreceptor regions located?",
      lines: ["Arterial baroreceptors detect stretch", "caused by changes in arterial blood pressure.", "The two main regions are the carotid sinus", "and the aortic arch."]
    },
    {
      image: "19-stats", label: "Statistics · Confidence intervals", subject: "Statistics",
      question: "A sample has n = 25, x̄ = 72.4, and s = 8.6. For a 95% confidence interval, t* = 2.064. Find the interval for the population mean.",
      lines: ["SE = 8.6 / √25 = 1.72", "Margin = 2.064(1.72) ≈ 3.55", "72.4 ± 3.55", "95% CI ≈ (68.85, 75.95)"]
    },
    {
      image: "20", label: "Engineering · Support reactions", subject: "Engineering",
      question: "A 6 m simply supported beam has a 12 kN downward point load at its midpoint. Find the vertical reactions at pin A and roller B.",
      lines: ["ΣM_A = 0: 6Bᵧ - 12(3) = 0", "Bᵧ = 6 kN upward", "ΣFᵧ = 0: Aᵧ + 6 - 12 = 0", "Aᵧ = 6 kN upward", "The centered load splits equally by symmetry."]
    },
    {
      image: "21", label: "Accounting · Accrual adjustments", subject: "Accounting",
      question: "On December 31, a company has earned $1,200 of service revenue but has not billed the customer. What adjusting entry is needed, and which accounts increase?",
      lines: ["Dec. 31", "Debit Accounts Receivable ........ $1,200", "Credit Service Revenue ............ $1,200", "Assets increase, revenue increases,", "and retained earnings increase through net income."]
    },
    {
      image: "22", label: "Finance · Present value", subject: "Finance",
      question: "You will receive $1,210 in 2 years. If the annual discount rate is 10%, what is its present value? Round to the nearest dollar.",
      lines: ["PV = FV / (1 + r)ᵗ", "PV = 1,210 / (1.10)²", "PV = 1,210 / 1.21", "PV = $1,000"]
    },
    {
      image: "23", label: "Writing · Argument structure", subject: "Writing",
      question: "Turn this topic into a defensible thesis: Should schools replace some traditional homework with supervised study time? Include a clear position and two reasons.",
      lines: ["Schools should replace some traditional homework", "with supervised study time because immediate support", "can stop misconceptions before they stick,", "and protected practice time can improve completion", "without taking authorship away from students."]
    },
    {
      image: "24", label: "GED Math · Percent ratios", subject: "GED Math",
      question: "A jacket costs $45 and is 18% off. What is the sale price?",
      lines: ["Discount = 0.18($45) = $8.10", "Sale price = $45.00 - $8.10", "= $36.90"]
    },
    {
      image: "25", label: "GMAT Math · Data sufficiency", subject: "GMAT",
      question: "If x is a positive integer, is x divisible by 6? (1) x is divisible by 2. (2) x is divisible by 3. State whether each statement alone is sufficient and give the correct GMAT Data Sufficiency choice.",
      lines: ["(1) alone: divisible by 2, but maybe not 3 → insufficient.", "(2) alone: divisible by 3, but maybe not 2 → insufficient.", "Together x has factors 2 and 3, so x is divisible by 6.", "Choice C: both together are sufficient."]
    },
    {
      image: "26", label: "Nursing · Dosage prioritization", subject: "Nursing",
      question: "A patient is prescribed 500 mg of a medication. Tablets contain 250 mg each. How many tablets should the nurse administer?",
      lines: ["Ordered dose / dose per tablet", "= 500 mg / 250 mg per tablet", "= 2 tablets", "Check: 2 × 250 mg = 500 mg."]
    }
  ];

  var controls = deck.querySelector(".response-carousel__controls");
  var dots = controls && controls.querySelector(".response-carousel__dots");
  if (!controls || !dots) return;

  function escapeHtml(value) {
    return String(value).replace(/[&<>'"]/g, function (character) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" }[character];
    });
  }

  slides.forEach(function (slide, offset) {
    var index = 13 + offset;
    var lineClass = slide.lines.some(function (line) { return line.length > 52; }) ? " response-carousel__line--small" : "";
    var lines = slide.lines.map(function (line) {
      return '<p class="response-carousel__line' + lineClass + '">' + escapeHtml(line) + "</p>";
    }).join("");
    var base = "../mobile-app-assets/screenshots/applied/question-prompts/" + slide.image;
    var section = document.createElement("section");
    section.className = "response-carousel__paper";
    section.dataset.responseSlide = String(index);
    section.setAttribute("aria-label", slide.label + " response");
    section.hidden = true;
    section.innerHTML =
      '<div class="response-carousel__meta"><span class="response-carousel__status">' + escapeHtml(slide.label) + "</span></div>" +
      '<div class="response-carousel__body">' + lines + "</div>" +
      '<div class="response-carousel__question-phone" data-phone-mock="question">' +
        '<div class="response-carousel__question-screen phone-screenshot-host" data-screenshot-src="' + base + '-mid.webp?v=1" data-screenshot-high="' + base + '.webp?v=1" data-screenshot-low="' + base + '-low.webp?v=1">' +
          '<span class="response-carousel__question-label">Question</span>' +
          '<span class="response-carousel__question-type">' + escapeHtml(slide.subject) + "</span>" +
          '<span class="response-carousel__question-text">' + escapeHtml(slide.question) + "</span>" +
          '<span class="response-carousel__question-action">Upload Answer</span>' +
        "</div>" +
      "</div>";
    deck.insertBefore(section, controls);

    var dot = document.createElement("button");
    dot.className = "response-carousel__dot";
    dot.type = "button";
    dot.dataset.responseTarget = String(index);
    dot.setAttribute("aria-label", "Show " + slide.label + " response");
    dots.appendChild(dot);
  });
})();
