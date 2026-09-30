(function () {
  "use strict";

  var card = document.querySelector("[data-subject-card]");
  if (!card) return;
  var text = card.querySelector("[data-subject-text]");
  if (!text) return;

  // Interleave subjects, practical skills, and exams so every pass shows the range.
  // Large hue jumps contrast consecutive subjects, including the end of the loop.
  // Keep each gradient within one color family so subjects have distinct identities.
  var subjects = [
    ["any subject", 195], ["algebra", 332], ["the SAT", 109],
    ["biology", 246], ["Python", 23], ["the ACT", 160],
    ["calculus", 297], ["chemistry", 74], ["the MCAT", 211],
    ["world history", 348], ["computer science", 125], ["the GRE", 262],
    ["physics", 39], ["psychology", 176], ["the LSAT", 313],
    ["economics", 90], ["Spanish", 227], ["the GMAT", 4],
    ["statistics", 141], ["anatomy & physiology", 278], ["AP exams", 55],
    ["engineering", 192], ["creative writing", 329], ["the GED", 106],
    ["nursing", 243], ["organic chemistry", 20], ["the PSAT", 157],
    ["finance", 294], ["French", 71], ["the USMLE", 208],
    ["geometry", 345], ["accounting", 122], ["IB exams", 259],
    ["philosophy", 36], ["data science", 173], ["state assessments", 310],
    ["music theory", 87], ["JavaScript", 224], ["PhD qualifying exams", 80],
    ["whatever comes next", 309]
  ];
  var reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  var visible = !("IntersectionObserver" in window);
  var timer = null;
  var index = 0;
  var phase = "hold";
  var nextDelay = 2400;

  function setPalette(subjectIndex) {
    var hue = subjects[subjectIndex][1];
    card.style.setProperty("--subject-a", "hsl(" + hue + " 100% 68%)");
    card.style.setProperty("--subject-b", "hsl(" + ((hue + 18) % 360) + " 100% 77%)");
    card.style.setProperty("--subject-c", "hsl(" + ((hue + 342) % 360) + " 96% 62%)");
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
      var phrase = subjects[index][0];
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
      text.textContent = "any subject";
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
