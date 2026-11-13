/* ==========================================================================
   ENZO GEROLA // MINIMALIST PORTFOLIO ENGINE
   ========================================================================== */

(function () {
  "use strict";

  const DATA = window.PORTFOLIO_DATA;
  let currentLang = localStorage.getItem("eg_lang") || "en";
  if (!["en", "it", "pt"].includes(currentLang)) currentLang = "en";

  let currentTheme = localStorage.getItem("eg_theme") || "dark";
  if (!["dark", "light"].includes(currentTheme)) currentTheme = "dark";

  document.addEventListener("DOMContentLoaded", () => {
    applyTheme(currentTheme);
    applyLanguage(currentLang);
    initThemeToggle();
    initLangButtons();
    initMiniTerminal();
    initVideoModal();
    initCommandPalette();
    initCopyButtons();
  });

  // ==========================================================================
  // 0. THEME SWITCHER (BLACK / WHITE MODE)
  // ==========================================================================
  function applyTheme(theme) {
    currentTheme = theme === "light" ? "light" : "dark";
    localStorage.setItem("eg_theme", currentTheme);
    document.documentElement.setAttribute("data-theme", currentTheme);

    const toggleBtn = document.getElementById("theme-toggle");
    if (toggleBtn) {
      const nextLabel = currentTheme === "dark" ? "Switch to White Mode" : "Switch to Black Mode";
      toggleBtn.setAttribute("aria-label", nextLabel);
      toggleBtn.setAttribute("title", nextLabel);
    }

    renderCommandItems(document.getElementById("cmd-input")?.value || "");
  }

  function toggleTheme() {
    applyTheme(currentTheme === "dark" ? "light" : "dark");
  }

  function initThemeToggle() {
    const toggleBtn = document.getElementById("theme-toggle");
    if (toggleBtn) {
      toggleBtn.addEventListener("click", toggleTheme);
    }
  }

  // ==========================================================================
  // 1. TRILINGUAL SWITCHER (EN / IT / PT-BR)
  // ==========================================================================
  function applyLanguage(lang) {
    if (!DATA.i18n[lang]) return;
    currentLang = lang;
    localStorage.setItem("eg_lang", lang);
    document.documentElement.lang = lang === "pt" ? "pt-BR" : lang;

    const dict = DATA.i18n[lang];

    document.querySelectorAll("[data-i18n]").forEach((el) => {
      const key = el.getAttribute("data-i18n");
      if (dict[key]) el.innerHTML = dict[key];
    });

    document.querySelectorAll("[data-i18n-placeholder]").forEach((el) => {
      const key = el.getAttribute("data-i18n-placeholder");
      if (dict[key]) el.setAttribute("placeholder", dict[key]);
    });

    document.querySelectorAll(".lang-btn").forEach((btn) => {
      btn.classList.toggle("active", btn.dataset.lang === lang);
    });

    renderStack();
    renderExperience();
    renderWork();
    renderCommandItems("");
  }

  function initLangButtons() {
    document.querySelectorAll(".lang-btn").forEach((btn) => {
      btn.addEventListener("click", () => applyLanguage(btn.dataset.lang));
    });
  }

  // ==========================================================================
  // 2. RENDER STACK, EXPERIENCE & WORK
  // ==========================================================================
  function renderStack() {
    const el = document.getElementById("stack-groups");
    if (!el) return;

    const dict = DATA.i18n[currentLang];
    el.innerHTML = DATA.stackGroups
      .map((g) => {
        const pills = g.items
          .map((item) => `<span class="stack-pill">${item}</span>`)
          .join("");
        return `
        <div class="stack-card">
          <div class="stack-card-title">${dict[g.titleKey]}</div>
          <div class="stack-pills">${pills}</div>
        </div>
      `;
      })
      .join("");
  }

  function renderExperience() {
    const el = document.getElementById("exp-list");
    if (!el) return;

    el.innerHTML = DATA.career
      .map((c, idx) => {
        const tags = c.tags.map((t) => `<span class="exp-tag">${t}</span>`).join("");
        return `
        <div class="exp-item ${idx === 0 ? "open" : ""}">
          <button type="button" class="exp-summary">
            <div class="exp-left">
              <span class="exp-role">${c.role[currentLang]}</span>
              <span class="exp-company">· ${c.company}</span>
            </div>
            <div class="exp-right">
              <span class="exp-date">${c.date[currentLang]}</span>
              <span class="exp-chevron">+</span>
            </div>
          </button>
          <div class="exp-details">
            <p>${c.desc[currentLang]}</p>
            <div class="exp-tags">${tags}</div>
          </div>
        </div>
      `;
      })
      .join("");

    el.querySelectorAll(".exp-summary").forEach((btn) => {
      btn.addEventListener("click", () => {
        btn.parentElement.classList.toggle("open");
      });
    });
  }

  function renderWork() {
    const el = document.getElementById("work-grid");
    if (!el) return;

    const demoLabel = DATA.i18n[currentLang].watch_demo;

    el.innerHTML = DATA.projects
      .map(
        (p, idx) => `
      <article class="work-card" data-project-idx="${idx}" tabindex="0" role="button" aria-label="${p.title}">
        <div>
          <div class="work-top">
            <span class="work-stack">${p.stack}</span>
            <span class="work-play-icon">${demoLabel}</span>
          </div>
          <h3 class="work-title">${p.title}</h3>
          <p class="work-desc">${p.desc[currentLang]}</p>
        </div>
      </article>
    `
      )
      .join("");

    el.querySelectorAll(".work-card").forEach((card) => {
      const open = () => {
        const idx = parseInt(card.getAttribute("data-project-idx"), 10);
        openVideoModal(idx);
      };
      card.addEventListener("click", open);
      card.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          open();
        }
      });
    });
  }

  // ==========================================================================
  // 3. SLEEK ONE-LINE MINI TERMINAL
  // ==========================================================================
  function initMiniTerminal() {
    const form = document.getElementById("mini-term-form");
    const input = document.getElementById("mini-term-input");
    const out = document.getElementById("mini-term-output");
    if (!form || !input || !out) return;

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const raw = input.value.trim().toLowerCase();
      input.value = "";
      if (!raw) return;

      out.classList.add("visible");

      switch (raw) {
        case "help":
          out.innerHTML = `Commands: <b>stack</b> · <b>exp</b> · <b>work</b> · <b>theme</b> · <b>cv</b> · <b>email</b> · <b>lang en|it|pt</b> · <b>clear</b>`;
          break;
        case "stack":
          out.innerHTML = `Node.js · TypeScript · Python · PHP/Laravel · AWS · Docker · SQL/NoSQL · Angular/Vue/React`;
          break;
        case "exp":
          out.innerHTML = `Backend Specialist @ INFORM Software (2023–Present) · Full-Stack @ Arbo · Qualicorp · Tech Lead @ FlipFlop Lab`;
          break;
        case "work":
          document.getElementById("work")?.scrollIntoView({ behavior: "smooth" });
          out.innerHTML = `Scrolled to Selected Work.`;
          break;
        case "theme":
          toggleTheme();
          out.innerHTML = `Theme switched to <b>${currentTheme === "light" ? "White" : "Black"}</b> mode.`;
          break;
        case "theme light":
        case "theme white":
          applyTheme("light");
          out.innerHTML = `Theme set to <b>White</b> mode.`;
          break;
        case "theme dark":
        case "theme black":
          applyTheme("dark");
          out.innerHTML = `Theme set to <b>Black</b> mode.`;
          break;
        case "cv":
          window.open(DATA.profile.cvPath, "_blank");
          out.innerHTML = `Opened CV.pdf in a new tab.`;
          break;
        case "email":
          copyEmail();
          out.innerHTML = `Copied <b>${DATA.profile.email}</b> to clipboard.`;
          break;
        case "lang en":
        case "lang it":
        case "lang pt":
          applyLanguage(raw.split(" ")[1]);
          out.innerHTML = `Language updated.`;
          break;
        case "clear":
          out.classList.remove("visible");
          out.innerHTML = "";
          break;
        default:
          out.innerHTML = `Unknown command. Try: <b>help</b>, <b>stack</b>, <b>exp</b>, <b>theme</b>, <b>cv</b>, <b>email</b>, or <b>clear</b>.`;
      }
    });
  }

  // ==========================================================================
  // 4. VIDEO MODAL
  // ==========================================================================
  function initVideoModal() {
    const modal = document.getElementById("video-modal");
    const closeBtn = document.getElementById("video-modal-close");
    const player = document.getElementById("modal-video-player");

    function close() {
      if (!modal) return;
      modal.classList.remove("open");
      if (player) {
        player.pause();
        player.removeAttribute("src");
      }
    }

    if (closeBtn) closeBtn.addEventListener("click", close);
    if (modal) {
      modal.addEventListener("click", (e) => {
        if (e.target === modal) close();
      });
    }

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        close();
        closeCmdModal();
      }
    });
  }

  function openVideoModal(projectIdx) {
    const project = DATA.projects[projectIdx];
    if (!project) return;

    const modal = document.getElementById("video-modal");
    const title = document.getElementById("modal-project-title");
    const tabs = document.getElementById("video-tabs");
    const player = document.getElementById("modal-video-player");

    if (!modal || !player || !tabs) return;

    title.textContent = project.title;

    if (project.videos.length > 1) {
      tabs.style.display = "flex";
      tabs.innerHTML = project.videos
        .map(
          (v, i) => `
        <button type="button" class="video-tab ${i === 0 ? "active" : ""}" data-src="${v.src}">
          ${v.label}
        </button>
      `
        )
        .join("");

      tabs.querySelectorAll(".video-tab").forEach((btn) => {
        btn.addEventListener("click", () => {
          tabs.querySelectorAll(".video-tab").forEach((b) => b.classList.remove("active"));
          btn.classList.add("active");
          player.src = btn.getAttribute("data-src");
          player.load();
          player.play().catch(() => {});
        });
      });
    } else {
      tabs.style.display = "none";
      tabs.innerHTML = "";
    }

    modal.classList.add("open");
    player.src = project.videos[0].src;
    player.load();
    player.play().catch(() => {});
  }

  // ==========================================================================
  // 5. COMMAND PALETTE (CMD+K)
  // ==========================================================================
  let cmdItems = [];
  let cmdIndex = 0;

  function getCommands() {
    const dict = DATA.i18n[currentLang];
    return [
      {
        title: currentTheme === "dark" ? dict.cmd_theme_light : dict.cmd_theme_dark,
        cat: "Theme",
        run: () => toggleTheme()
      },
      { title: "Download Resume / CV (PDF)", cat: "Action", run: () => window.open(DATA.profile.cvPath, "_blank") },
      { title: "Copy Email Address", cat: "Action", run: () => copyEmail() },
      { title: "Language: English", cat: "Language", run: () => applyLanguage("en") },
      { title: "Lingua: Italiano", cat: "Language", run: () => applyLanguage("it") },
      { title: "Idioma: Português", cat: "Language", run: () => applyLanguage("pt") },
      { title: "Go to Experience", cat: "Navigate", run: () => document.getElementById("experience")?.scrollIntoView({ behavior: "smooth" }) },
      { title: "Go to Selected Work", cat: "Navigate", run: () => document.getElementById("work")?.scrollIntoView({ behavior: "smooth" }) },
      ...DATA.projects.map((p, idx) => ({
        title: `Demo: ${p.title}`,
        cat: "Video",
        run: () => openVideoModal(idx)
      }))
    ];
  }

  function renderCommandItems(query) {
    const list = document.getElementById("cmd-list");
    if (!list) return;

    const q = (query || "").toLowerCase().trim();
    const all = getCommands();
    cmdItems = q
      ? all.filter((i) => i.title.toLowerCase().includes(q) || i.cat.toLowerCase().includes(q))
      : all;
    cmdIndex = 0;

    list.innerHTML = cmdItems
      .map(
        (item, i) => `
      <li class="cmd-item ${i === 0 ? "selected" : ""}" data-idx="${i}">
        <span>${item.title}</span>
        <span class="cmd-cat">${item.cat}</span>
      </li>
    `
      )
      .join("");

    list.querySelectorAll(".cmd-item").forEach((li) => {
      li.addEventListener("click", () => {
        const idx = parseInt(li.getAttribute("data-idx"), 10);
        if (cmdItems[idx]) {
          closeCmdModal();
          cmdItems[idx].run();
        }
      });
    });
  }

  function openCmdModal() {
    const modal = document.getElementById("cmd-modal");
    const input = document.getElementById("cmd-input");
    if (!modal || !input) return;
    modal.classList.add("open");
    input.value = "";
    renderCommandItems("");
    setTimeout(() => input.focus(), 20);
  }

  function closeCmdModal() {
    const modal = document.getElementById("cmd-modal");
    if (modal) modal.classList.remove("open");
  }

  function initCommandPalette() {
    const btn = document.getElementById("cmd-btn");
    const modal = document.getElementById("cmd-modal");
    const input = document.getElementById("cmd-input");

    if (btn) btn.addEventListener("click", openCmdModal);
    if (modal) {
      modal.addEventListener("click", (e) => {
        if (e.target === modal) closeCmdModal();
      });
    }

    if (input) {
      input.addEventListener("input", () => renderCommandItems(input.value));
      input.addEventListener("keydown", (e) => {
        const els = document.querySelectorAll("#cmd-list .cmd-item");
        if (!els.length) return;
        if (e.key === "ArrowDown") {
          e.preventDefault();
          cmdIndex = (cmdIndex + 1) % els.length;
          els.forEach((el, i) => el.classList.toggle("selected", i === cmdIndex));
          els[cmdIndex].scrollIntoView({ block: "nearest" });
        } else if (e.key === "ArrowUp") {
          e.preventDefault();
          cmdIndex = (cmdIndex - 1 + els.length) % els.length;
          els.forEach((el, i) => el.classList.toggle("selected", i === cmdIndex));
          els[cmdIndex].scrollIntoView({ block: "nearest" });
        } else if (e.key === "Enter" && cmdItems[cmdIndex]) {
          e.preventDefault();
          const item = cmdItems[cmdIndex];
          closeCmdModal();
          item.run();
        }
      });
    }

    document.addEventListener("keydown", (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        if (modal?.classList.contains("open")) closeCmdModal();
        else openCmdModal();
      }
    });
  }

  // ==========================================================================
  // 6. CLIPBOARD & TOAST
  // ==========================================================================
  function copyEmail() {
    navigator.clipboard?.writeText(DATA.profile.email).catch(() => {});
    const toast = document.getElementById("toast");
    if (!toast) return;
    toast.textContent = DATA.i18n[currentLang].toast_copied;
    toast.classList.add("show");
    setTimeout(() => toast.classList.remove("show"), 3000);
  }

  function initCopyButtons() {
    document.querySelectorAll(".js-copy-email").forEach((btn) => {
      btn.addEventListener("click", copyEmail);
    });
  }
})();
