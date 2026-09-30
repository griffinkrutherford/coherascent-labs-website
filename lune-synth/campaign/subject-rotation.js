(function () {
  "use strict";

  var card = document.querySelector("[data-subject-card]");
  if (!card) return;
  var text = card.querySelector("[data-subject-text]");
  if (!text) return;

  // Interleave subjects, practical skills, and exams so every pass shows the range.
  // Each entry gets its own hue, gradient direction, and animation tempo.
  var subjects = [
    ["any subject", 210], ["algebra", 150], ["the SAT", 28],
    ["biology", 125], ["Python", 198], ["the ACT", 340],
    ["calculus", 268], ["chemistry", 180], ["the MCAT", 5],
    ["world history", 38], ["computer science", 225], ["the GRE", 285],
    ["physics", 48], ["psychology", 325], ["the LSAT", 248],
    ["economics", 170], ["Spanish", 15], ["the GMAT", 195],
    ["statistics", 305], ["anatomy & physiology", 135], ["AP exams", 355],
    ["engineering", 215], ["creative writing", 275], ["the GED", 58],
    ["nursing", 165], ["organic chemistry", 90], ["the PSAT", 315],
    ["finance", 45], ["French", 235], ["the USMLE", 350],
    ["geometry", 185], ["accounting", 110], ["IB exams", 295],
    ["philosophy", 255], ["data science", 155], ["state assessments", 20],
    ["music theory", 330], ["JavaScript", 65], ["PhD qualifying exams", 205],
    ["whatever comes next", 280]
  ];
  var reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  var visible = !("IntersectionObserver" in window);
  var timer = null;
  var index = 0;
  var phase = "hold";
  var nextDelay = 2400;

  function setPalette(subjectIndex) {
    var hue = subjects[subjectIndex][1];
    card.style.setProperty("--subject-a", "hsl(" + hue + " 95% 76%)");
    card.style.setProperty("--subject-b", "hsl(" + ((hue + 48) % 360) + " 95% 80%)");
    card.style.setProperty("--subject-c", "hsl(" + ((hue + 100) % 360) + " 90% 74%)");
    card.style.setProperty("--subject-angle", (110 + subjectIndex * 29) % 360 + "deg");
    card.style.setProperty("--subject-speed", (4.5 + subjectIndex % 7 * 0.45) + "s");
  }

  function isActive() {
    return visible && !document.hidden && !reducedMotion.matches;
  }

  function schedule(delay) {
    nextDelay = delay;
    if (isActive()) timer = window.setTimeout(step, delay);
  }

  function step() {
    timer = null;
    if (!isActive()) return;

    if (phase === "hold") {
      phase = "erase";
      schedule(32);
    } else if (phase === "erase") {
      text.textContent = text.textContent.slice(0, -1);
      if (text.textContent.length) {
        schedule(32);
      } else {
        index = (index + 1) % subjects.length;
        setPalette(index);
        phase = "type";
        schedule(280);
      }
    } else {
      var phrase = "for " + subjects[index][0];
      text.textContent = phrase.slice(0, text.textContent.length + 1);
      if (text.textContent === phrase) {
        phase = "hold";
        schedule(2100);
      } else {
        schedule(65);
      }
    }
  }

  function sync() {
    window.clearTimeout(timer);
    timer = null;
    if (reducedMotion.matches) {
      index = 0;
      phase = "hold";
      nextDelay = 2400;
      text.textContent = "for any subject";
      setPalette(0);
    }
    card.classList.toggle("is-subject-animating", isActive());
    if (isActive()) schedule(nextDelay);
  }

  setPalette(0);
  if ("IntersectionObserver" in window) {
    new IntersectionObserver(function (entries) {
      visible = entries[0].isIntersecting;
      sync();
    }, { threshold: 0.15 }).observe(card);
  }
  document.addEventListener("visibilitychange", sync);
  reducedMotion.addEventListener("change", sync);
  sync();
})();
