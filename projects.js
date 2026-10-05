(function () {
  "use strict";

  var CACHE_KEY = "gh_repos_ch3nyt_v2";
  var API_URL = "https://api.github.com/users/ch3nyt/repos?type=owner&per_page=100&sort=pushed";
  var EXCLUDE = ["ch3nyt.github.io"];

  function lang() {
    return typeof window.getLang === "function" ? window.getLang() : "en";
  }

  function statusLine(list, en, zh) {
    var li = document.createElement("li");
    li.className = "projects-status";
    li.setAttribute("data-en", en);
    li.setAttribute("data-zh", zh);
    li.textContent = lang() === "zh" ? zh : en;
    list.innerHTML = "";
    list.appendChild(li);
  }

  function render(repos) {
    var list = document.getElementById("projects-list");
    if (!list) return;

    var shown = (repos || []).filter(function (r) {
      return !r.fork && r.description && EXCLUDE.indexOf(r.name) === -1;
    });

    if (shown.length === 0) {
      statusLine(list,
        "Projects could not be loaded. See github.com/ch3nyt.",
        "無法載入專案，請直接前往 github.com/ch3nyt。");
      return;
    }

    var fragment = document.createDocumentFragment();

    shown.forEach(function (repo) {
      var item = document.createElement("li");
      item.className = "project";

      var name = document.createElement("a");
      name.className = "project-name";
      name.href = repo.html_url;
      name.target = "_blank";
      name.rel = "noopener";
      name.textContent = repo.name;
      item.appendChild(name);

      var meta = document.createElement("span");
      meta.className = "project-meta";
      var year = (repo.pushed_at || "").slice(0, 4);
      meta.textContent = [repo.language, year].filter(Boolean).join(" · ");
      item.appendChild(meta);

      var desc = document.createElement("p");
      desc.className = "project-desc";
      desc.textContent = repo.description;
      item.appendChild(desc);

      fragment.appendChild(item);
    });

    list.innerHTML = "";
    list.appendChild(fragment);
  }

  function load() {
    var list = document.getElementById("projects-list");
    if (!list) return;

    try {
      var cached = sessionStorage.getItem(CACHE_KEY);
      if (cached) {
        render(JSON.parse(cached));
        return;
      }
    } catch (e) {}

    statusLine(list, "Loading projects…", "載入專案中…");

    fetch(API_URL)
      .then(function (res) {
        if (!res.ok) throw new Error("GitHub API " + res.status);
        return res.json();
      })
      .then(function (data) {
        try { sessionStorage.setItem(CACHE_KEY, JSON.stringify(data)); } catch (e) {}
        render(data);
      })
      .catch(function () {
        render([]);
      });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", load);
  } else {
    load();
  }
}());
