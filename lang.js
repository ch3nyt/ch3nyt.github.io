(function () {
  "use strict";

  var STORAGE_KEY = "lang";
  var DEFAULT_LANG = "en";

  function getLang() {
    return localStorage.getItem(STORAGE_KEY) || DEFAULT_LANG;
  }

  function applyLang(lang) {
    document.documentElement.lang = lang === "zh" ? "zh-TW" : "en";

    document.querySelectorAll("[data-en], [data-zh]").forEach(function (el) {
      var text = el.getAttribute("data-" + lang);
      if (text !== null) {
        el.textContent = text;
      }
    });

    var toggle = document.querySelector(".lang-toggle");
    if (toggle) {
      toggle.textContent = lang === "en" ? "中文" : "EN";
    }
  }

  function init() {
    var lang = getLang();
    applyLang(lang);

    var toggle = document.querySelector(".lang-toggle");
    if (toggle) {
      toggle.addEventListener("click", function () {
        var next = getLang() === "en" ? "zh" : "en";
        localStorage.setItem(STORAGE_KEY, next);
        applyLang(next);
      });
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
}());
