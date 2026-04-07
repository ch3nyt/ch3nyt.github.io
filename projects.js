(function () {
  "use strict";

  var CACHE_KEY = "gh_repos_ch3nyt";
  var API_URL = "https://api.github.com/users/ch3nyt/repos?type=public&per_page=100&sort=updated";

  function getCurrentLang() {
    return localStorage.getItem("lang") || "en";
  }

  function renderCards(repos) {
    var grid = document.getElementById("projects-grid");
    if (!grid) return;

    if (!repos || repos.length === 0) {
      renderFallback(grid);
      return;
    }

    var lang = getCurrentLang();
    var fragment = document.createDocumentFragment();

    repos.forEach(function (repo) {
      var card = document.createElement("article");
      card.className = "project-card";

      // Title link
      var titleLink = document.createElement("a");
      titleLink.href = repo.html_url;
      titleLink.target = "_blank";
      titleLink.rel = "noopener";
      titleLink.textContent = repo.name.replace(/-/g, "\u2011");
      titleLink.className = "project-name";
      card.appendChild(titleLink);

      // Description
      if (repo.description) {
        var desc = document.createElement("p");
        desc.className = "project-desc";
        desc.textContent = repo.description;
        card.appendChild(desc);
      }

      // Footer with GitHub link
      var footer = document.createElement("div");
      footer.className = "project-footer";
      var ghLink = document.createElement("a");
      ghLink.href = repo.html_url;
      ghLink.target = "_blank";
      ghLink.rel = "noopener";
      ghLink.className = "project-footer-link";
      ghLink.setAttribute("data-en", "View on GitHub \u2192");
      ghLink.setAttribute("data-zh", "\u5728 GitHub \u67e5\u770b \u2192");
      ghLink.textContent = lang === "zh" ? "\u5728 GitHub \u67e5\u770b \u2192" : "View on GitHub \u2192";
      footer.appendChild(ghLink);
      card.appendChild(footer);

      fragment.appendChild(card);
    });

    grid.innerHTML = "";
    grid.appendChild(fragment);
    if (typeof window.applyLang === "function") {
      window.applyLang(getCurrentLang());
    }
  }

  function renderFallback(grid) {
    var lang = getCurrentLang();
    var p = document.createElement("p");
    p.className = "projects-fallback";
    p.setAttribute("data-en", "GitHub projects could not be loaded. Please visit github.com/ch3nyt directly.");
    p.setAttribute("data-zh", "\u7121\u6cd5\u8f09\u5165 GitHub \u5c08\u6848\uff0c\u8acb\u76f4\u63a5\u9020\u8a2a github.com/ch3nyt\u3002");
    p.textContent = lang === "zh"
      ? "\u7121\u6cd5\u8f09\u5165 GitHub \u5c08\u6848\uff0c\u8acb\u76f4\u63a5\u9020\u8a2a github.com/ch3nyt\u3002"
      : "GitHub projects could not be loaded. Please visit github.com/ch3nyt directly.";
    grid.innerHTML = "";
    grid.appendChild(p);
  }

  function fetchRepos() {
    var grid = document.getElementById("projects-grid");
    if (!grid) return;

    var cached = sessionStorage.getItem(CACHE_KEY);
    if (cached) {
      try {
        renderCards(JSON.parse(cached));
        return;
      } catch (e) {
        sessionStorage.removeItem(CACHE_KEY);
      }
    }

    var lang = getCurrentLang();
    grid.innerHTML = "<p class=\"projects-loading\">" +
      (lang === "zh" ? "\u8f09\u5165\u5c08\u6848\u4e2d\u2026" : "Loading projects\u2026") + "</p>";

    fetch(API_URL)
      .then(function (res) {
        if (!res.ok) throw new Error("API error " + res.status);
        return res.json();
      })
      .then(function (data) {
        var original = data.filter(function (r) { return !r.fork; });
        original.sort(function (a, b) { return b.stargazers_count - a.stargazers_count; });
        sessionStorage.setItem(CACHE_KEY, JSON.stringify(original));
        renderCards(original);
      })
      .catch(function () {
        renderFallback(grid);
      });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", fetchRepos);
  } else {
    fetchRepos();
  }
}());
