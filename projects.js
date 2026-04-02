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

    var fragment = document.createDocumentFragment();
    repos.forEach(function (repo) {
      var card = document.createElement("article");
      card.className = "project-card";

      var titleLink = document.createElement("a");
      titleLink.href = repo.html_url;
      titleLink.target = "_blank";
      titleLink.rel = "noopener";
      titleLink.textContent = repo.name;
      titleLink.className = "project-name";

      var desc = document.createElement("p");
      desc.className = "project-desc";
      desc.textContent = repo.description || "";

      var meta = document.createElement("div");
      meta.className = "project-meta";

      if (repo.language) {
        var langBadge = document.createElement("span");
        langBadge.className = "project-lang";
        langBadge.textContent = repo.language;
        meta.appendChild(langBadge);
      }

      var stars = document.createElement("span");
      stars.className = "project-stars";
      stars.textContent = "\u2605 " + (repo.stargazers_count || 0);
      meta.appendChild(stars);

      card.appendChild(titleLink);
      if (repo.description) card.appendChild(desc);
      card.appendChild(meta);
      fragment.appendChild(card);
    });

    grid.innerHTML = "";
    grid.appendChild(fragment);
  }

  function renderFallback(grid) {
    var lang = getCurrentLang();
    var p = document.createElement("p");
    p.className = "projects-fallback";
    p.setAttribute("data-en", "GitHub projects could not be loaded. Please visit github.com/ch3nyt directly.");
    p.setAttribute("data-zh", "無法載入 GitHub 專案，請直接造訪 github.com/ch3nyt。");
    p.textContent = lang === "zh"
      ? "無法載入 GitHub 專案，請直接造訪 github.com/ch3nyt。"
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
      (lang === "zh" ? "載入專案中…" : "Loading projects\u2026") + "</p>";

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
