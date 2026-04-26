(function () {
  var root = document.querySelector("[data-response-slideshow]");
  if (!root) return;

  var slides = Array.prototype.slice.call(root.querySelectorAll(".response-carousel__paper"));
  var dots = Array.prototype.slice.call(root.querySelectorAll(".response-carousel__dot"));
  var prevButton = root.querySelector("[data-response-prev]");
  var nextButton = root.querySelector("[data-response-next]");
  var toggleButton = root.querySelector("[data-response-toggle]");
  if (!slides.length) return;

  var reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var activeIndex = 0;
  var isPaused = false;
  var lineTimers = [];
  var autoTimer = 0;
  var measurers = [];
  var typeInterval = 34;
  var linePause = 180;
  var postWritePause = 1800;
  var calculusFinished = false;

  function clearLineTimers() {
    while (lineTimers.length) {
      window.clearTimeout(lineTimers.pop());
    }
  }

  function clearAutoTimer() {
    if (autoTimer) {
      window.clearTimeout(autoTimer);
      autoTimer = 0;
    }
  }

  function getLineMeasurer(line) {
    if (line._coherascentMeasurer) return line._coherascentMeasurer;

    var measurer = document.createElement("span");
    measurer.setAttribute("aria-hidden", "true");
    measurer.style.position = "fixed";
    measurer.style.left = "-9999px";
    measurer.style.top = "-9999px";
    measurer.style.visibility = "hidden";
    measurer.style.pointerEvents = "none";
    measurer.style.whiteSpace = "pre";
    measurer.style.padding = "0";
    measurer.style.margin = "0";
    document.body.appendChild(measurer);
    measurers.push(measurer);
    line._coherascentMeasurer = measurer;
    return measurer;
  }

  function syncMeasurerStyle(line, measurer) {
    var computed = window.getComputedStyle(line);
    measurer.style.font = computed.font;
    measurer.style.fontFamily = computed.fontFamily;
    measurer.style.fontSize = computed.fontSize;
    measurer.style.fontStyle = computed.fontStyle;
    measurer.style.fontWeight = computed.fontWeight;
    measurer.style.letterSpacing = computed.letterSpacing;
    measurer.style.textTransform = computed.textTransform;
  }

  function measureTextWidth(line, text) {
    var measurer = getLineMeasurer(line);
    syncMeasurerStyle(line, measurer);
    measurer.textContent = text || "";
    return measurer.getBoundingClientRect().width;
  }

  function buildWrappedLayout(line, fullText) {
    if (!fullText) {
      return { lines: [], maps: [] };
    }

    var tokens = fullText.match(/\S+|\s+/g) || [];
    var availableWidth = line.getBoundingClientRect().width;
    var currentLine = "";
    var renderedLines = [];

    tokens.forEach(function (token) {
      if (/^\s+$/.test(token)) {
        if (currentLine) currentLine += token;
        return;
      }

      var candidate = currentLine + token;
      if (currentLine.trim() && measureTextWidth(line, candidate) > availableWidth) {
        renderedLines.push(currentLine.replace(/\s+$/, ""));
        currentLine = token.replace(/^\s+/, "");
        return;
      }

      currentLine = candidate;
    });

    if (currentLine) {
      renderedLines.push(currentLine.replace(/\s+$/, ""));
    }

    var sourceText = fullText;
    var sourceCursor = 0;
    var sourceMaps = renderedLines.map(function (renderedLine) {
      var sourceIndexes = [];

      for (var i = 0; i < renderedLine.length; i += 1) {
        var character = renderedLine.charAt(i);

        while (sourceCursor < sourceText.length && sourceText.charAt(sourceCursor) !== character) {
          sourceCursor += 1;
        }

        if (sourceCursor >= sourceText.length) break;
        sourceIndexes.push(sourceCursor);
        sourceCursor += 1;
      }

      while (sourceCursor < sourceText.length && /\s/.test(sourceText.charAt(sourceCursor))) {
        sourceCursor += 1;
      }

      return sourceIndexes;
    });

    return {
      lines: renderedLines,
      maps: sourceMaps
    };
  }

  function getWrappedLayout(line, fullText) {
    var availableWidth = Math.round(line.getBoundingClientRect().width);
    var cacheKey = [availableWidth, line.className, fullText].join("::");

    if (line._coherascentWrapLayout && line._coherascentWrapLayout.key === cacheKey) {
      return line._coherascentWrapLayout.value;
    }

    var layout = buildWrappedLayout(line, fullText);
    line._coherascentWrapLayout = {
      key: cacheKey,
      value: layout
    };
    return layout;
  }

  function renderTypedLayout(layout, sourceCharacterCount) {
    if (!layout || !layout.lines.length || !sourceCharacterCount) return "";

    var rendered = [];

    layout.lines.forEach(function (lineText, lineIndex) {
      var sourceIndexes = layout.maps[lineIndex] || [];
      var visibleCharacterCount = 0;

      while (
        visibleCharacterCount < sourceIndexes.length &&
        sourceIndexes[visibleCharacterCount] < sourceCharacterCount
      ) {
        visibleCharacterCount += 1;
      }

      if (!visibleCharacterCount) return;
      rendered.push(lineText.slice(0, visibleCharacterCount));
    });

    return rendered.join("\n");
  }

  function scheduleAutoAdvance(delay) {
    clearAutoTimer();
    if (reducedMotion || isPaused) return;
    autoTimer = window.setTimeout(function () {
      showSlide(activeIndex + 1);
    }, delay);
  }

  function estimateWriteDuration(slide) {
    var lines = Array.prototype.slice.call(slide.querySelectorAll(".response-carousel__line"));
    var totalDuration = 80;

    lines.forEach(function (line, index) {
      var fullText = line.getAttribute("data-full-text") || "";
      totalDuration += 120 + Math.max(0, fullText.length - 1) * typeInterval;
      if (index < lines.length - 1) {
        totalDuration += linePause;
      }
    });

    return totalDuration;
  }

  function finishLines(slide) {
    Array.prototype.slice.call(slide.querySelectorAll(".response-carousel__line")).forEach(function (line) {
      var fullText = line.getAttribute("data-full-text") || "";
      var layout = getWrappedLayout(line, fullText);
      line.textContent = layout.lines.length ? layout.lines.join("\n") : fullText;
      line.classList.add("is-visible");
    });
  }

  function revealLines(slide) {
    var lines = Array.prototype.slice.call(slide.querySelectorAll(".response-carousel__line"));
    lines.forEach(function (line) {
      line.classList.remove("is-visible");
      line.textContent = "";
    });

    if (reducedMotion || isPaused) {
      finishLines(slide);
      return 0;
    }

    if (!lines.length) return 0;

    function typeLine(index) {
      if (index >= lines.length) return;

      var line = lines[index];
      var fullText = line.getAttribute("data-full-text") || "";
      var charIndex = 0;

      line.classList.add("is-visible");
      line.textContent = "";

      function tick() {
        charIndex += 1;
        line.textContent = renderTypedLayout(getWrappedLayout(line, fullText), charIndex);

        if (charIndex < fullText.length) {
          lineTimers.push(window.setTimeout(tick, typeInterval));
          return;
        }

        lineTimers.push(window.setTimeout(function () {
          typeLine(index + 1);
        }, linePause));
      }

      lineTimers.push(window.setTimeout(tick, 120));
    }

    lineTimers.push(window.setTimeout(function () {
      typeLine(0);
    }, 80));

    return estimateWriteDuration(slide);
  }

  function showSlide(nextIndex) {
    clearLineTimers();
    clearAutoTimer();

    activeIndex = (nextIndex + slides.length) % slides.length;
    calculusFinished = activeIndex !== 0;

    slides.forEach(function (slide, index) {
      var isActive = index === activeIndex;
      slide.classList.toggle("is-active", isActive);
      slide.hidden = !isActive;
      if (!isActive) {
        Array.prototype.slice.call(slide.querySelectorAll(".response-carousel__line")).forEach(function (line) {
          line.classList.remove("is-visible");
          line.textContent = "";
        });
      }
    });

    dots.forEach(function (dot, index) {
      var isActive = index === activeIndex;
      dot.classList.toggle("is-active", isActive);
      dot.setAttribute("aria-pressed", isActive ? "true" : "false");
    });

    var writeDuration = revealLines(slides[activeIndex]);
    document.dispatchEvent(new CustomEvent("coherascent:response-slide-change", {
      detail: { index: activeIndex }
    }));

    if (reducedMotion || isPaused) return;

    if (activeIndex === 0) {
      clearAutoTimer();
      return;
    }

    scheduleAutoAdvance(writeDuration + postWritePause);
  }

  dots.forEach(function (dot) {
    dot.addEventListener("click", function () {
      showSlide(Number(dot.getAttribute("data-response-target") || 0));
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

  function updateToggleButton() {
    if (!toggleButton) return;

    var pauseIcon = toggleButton.querySelector("[data-response-pause-icon]");
    var playIcon = toggleButton.querySelector("[data-response-play-icon]");

    if (pauseIcon) pauseIcon.hidden = isPaused;
    if (playIcon) playIcon.hidden = !isPaused;
    toggleButton.setAttribute("aria-pressed", isPaused ? "true" : "false");
    toggleButton.setAttribute(
      "aria-label",
      isPaused ? "Play handwritten response animation" : "Pause handwritten response animation"
    );
  }

  function pauseSlideshow() {
    if (isPaused) return;

    isPaused = true;
    clearLineTimers();
    clearAutoTimer();
    finishLines(slides[activeIndex]);
    updateToggleButton();
    document.dispatchEvent(new CustomEvent("coherascent:response-pause", {
      detail: { index: activeIndex }
    }));
  }

  function playSlideshow() {
    if (!isPaused) return;

    isPaused = false;
    updateToggleButton();
    showSlide(activeIndex);
  }

  if (toggleButton) {
    updateToggleButton();
    toggleButton.addEventListener("click", function () {
      if (isPaused) {
        playSlideshow();
        return;
      }
      pauseSlideshow();
    });
  }

  root.addEventListener("mouseenter", clearAutoTimer);
  root.addEventListener("mouseleave", function () {
    if (reducedMotion || isPaused) return;
    if (activeIndex === 0) {
      if (calculusFinished) scheduleAutoAdvance(postWritePause);
      return;
    }
    scheduleAutoAdvance(estimateWriteDuration(slides[activeIndex]) + postWritePause);
  });
  root.addEventListener("focusin", clearAutoTimer);
  root.addEventListener("focusout", function (event) {
    if (!root.contains(event.relatedTarget)) {
      if (reducedMotion || isPaused) return;
      if (activeIndex === 0) {
        if (calculusFinished) scheduleAutoAdvance(postWritePause);
        return;
      }
      scheduleAutoAdvance(estimateWriteDuration(slides[activeIndex]) + postWritePause);
    }
  });

  document.addEventListener("coherascent:calculus-finished", function () {
    if (activeIndex === 0 && !reducedMotion && !isPaused) {
      calculusFinished = true;
      scheduleAutoAdvance(postWritePause);
    }
  });

  slides.forEach(function (slide) {
    Array.prototype.slice.call(slide.querySelectorAll(".response-carousel__line")).forEach(function (line) {
      if (!line.hasAttribute("data-full-text")) {
        line.setAttribute("data-full-text", line.textContent);
      }
      line.textContent = "";
    });
  });

  window.addEventListener("beforeunload", function () {
    clearLineTimers();
    clearAutoTimer();
    while (measurers.length) {
      var measurer = measurers.pop();
      if (measurer && measurer.parentNode) {
        measurer.parentNode.removeChild(measurer);
      }
    }
  });

  showSlide(0);
})();
