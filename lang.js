(function () {
  "use strict";

  var STORAGE_KEY = "lang";
  var DEFAULT_LANG = "en";

  function getLang() {
    try {
      return localStorage.getItem(STORAGE_KEY) || DEFAULT_LANG;
    } catch (e) {
      return DEFAULT_LANG;
    }
  }

  function setLang(lang) {
    try { localStorage.setItem(STORAGE_KEY, lang); } catch (e) {}
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
      toggle.textContent = lang === "en" ? "中文" : "English";
      toggle.setAttribute("aria-label", lang === "en" ? "切換為中文" : "Switch to English");
    }
  }

  window.getLang = getLang;
  window.applyLang = applyLang;

  // Highlight the section currently in view in the sidebar nav.
  function trackSections() {
    if (!("IntersectionObserver" in window)) return;
    var links = {};
    document.querySelectorAll(".toc a").forEach(function (a) {
      links[a.getAttribute("href").slice(1)] = a;
    });

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        Object.keys(links).forEach(function (id) {
          links[id].classList.toggle("is-active", id === entry.target.id);
        });
      });
    }, { rootMargin: "-20% 0px -70% 0px" });

    Object.keys(links).forEach(function (id) {
      var section = document.getElementById(id);
      if (section) observer.observe(section);
    });
  }

  function init() {
    applyLang(getLang());
    trackSections();

    var toggle = document.querySelector(".lang-toggle");
    if (toggle) {
      toggle.addEventListener("click", function () {
        var next = getLang() === "en" ? "zh" : "en";
        setLang(next);
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
