(function () {
  "use strict";

  // Static elements with CSS-only motion keep scrolling free of JS work.
  var kinds = [
    "meteor--one", "meteor--two", "meteor--three",
    "pulse--one", "pulse--two", "pulse--three"
  ];
  var fragment = document.createDocumentFragment();
  kinds.forEach(function (kind) {
    var node = document.createElement("span");
    node.className = "lune-sky-" + kind.split("--")[0] + " lune-sky-" + kind;
    node.setAttribute("aria-hidden", "true");
    fragment.appendChild(node);
  });
  document.body.prepend(fragment);
})();
