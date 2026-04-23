(function () {
  var roots = document.querySelectorAll("[data-knowledge-carousel]");
  if (!roots.length) return;

  var reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  Array.prototype.forEach.call(roots, function (root) {
    var slides = Array.prototype.slice.call(root.querySelectorAll(".knowledge-carousel__slide"));
    var dots = Array.prototype.slice.call(root.querySelectorAll(".knowledge-carousel__dot"));
    var prevButton = root.querySelector("[data-knowledge-prev]");
    var nextButton = root.querySelector("[data-knowledge-next]");
    var count = root.querySelector("[data-knowledge-count]");
    var progress = root.querySelector("[data-knowledge-progress]");
    var activeIndex = 0;
    var autoTimer = 0;
    var autoDelay = 5600;

    if (!slides.length) return;

    function clearAutoTimer() {
      if (!autoTimer) return;
      window.clearTimeout(autoTimer);
      autoTimer = 0;
    }

    function scheduleAutoAdvance() {
      clearAutoTimer();
      if (reducedMotion) return;
      autoTimer = window.setTimeout(function () {
        showSlide(activeIndex + 1);
      }, autoDelay);
    }

    function updateIndicators() {
      var current = String(activeIndex + 1).padStart(2, "0");
      var total = String(slides.length).padStart(2, "0");

      if (count) {
        count.textContent = current + " / " + total;
      }

      if (progress) {
        progress.style.transform = "scaleX(" + ((activeIndex + 1) / slides.length) + ")";
      }
    }

    function showSlide(nextIndex) {
      activeIndex = (nextIndex + slides.length) % slides.length;

      slides.forEach(function (slide, index) {
        var isActive = index === activeIndex;
        slide.classList.toggle("is-active", isActive);
        slide.setAttribute("aria-hidden", isActive ? "false" : "true");
      });

      dots.forEach(function (dot, index) {
        var isActive = index === activeIndex;
        dot.classList.toggle("is-active", isActive);
        dot.setAttribute("aria-pressed", isActive ? "true" : "false");
      });

      updateIndicators();
      scheduleAutoAdvance();
    }

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        showSlide(Number(dot.getAttribute("data-knowledge-target") || 0));
      });
    });

    if (prevButton) {
      prevButton.addEventListener("click", function () {
        showSlide(activeIndex - 1);
      });
    }

    if (nextButton) {
      nextButton.addEventListener("click", function () {
        showSlide(activeIndex + 1);
      });
    }

    root.addEventListener("mouseenter", clearAutoTimer);
    root.addEventListener("mouseleave", scheduleAutoAdvance);
    root.addEventListener("focusin", clearAutoTimer);
    root.addEventListener("focusout", function (event) {
      if (!root.contains(event.relatedTarget)) {
        scheduleAutoAdvance();
      }
    });

    showSlide(0);
  });
})();
