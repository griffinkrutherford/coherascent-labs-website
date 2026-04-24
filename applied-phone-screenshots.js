(function () {
  var hosts = document.querySelectorAll("[data-screenshot-src]");
  if (!hosts.length) return;

  Array.prototype.forEach.call(hosts, function (host) {
    var src = host.getAttribute("data-screenshot-src");
    if (!src) return;

    var probe = new Image();

    probe.onload = function () {
      if (host.querySelector(".phone-screenshot")) return;

      var screenshot = document.createElement("img");
      screenshot.className = "phone-screenshot";
      screenshot.src = src;
      screenshot.alt = "";
      screenshot.setAttribute("aria-hidden", "true");
      screenshot.loading = "lazy";
      screenshot.decoding = "async";
      host.insertBefore(screenshot, host.firstChild);
    };

    probe.src = src;
  });
})();
