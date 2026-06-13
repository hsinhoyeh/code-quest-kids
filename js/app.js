/* app.js — wires screens, levels, scoring, modals & leaderboard together. */
(function () {
  let currentLevel = null;
  let currentPack = null;  // the array the current level belongs to (for "next")
  let nextLevelRef = null; // resolved on win
  let playOrigin = "menu"; // "menu" | "editor" — where Back returns to

  // A level is unlocked if it's first in its pack or the previous one was cleared.
  function unlockedIn(pack, lvl) {
    const i = pack.indexOf(lvl);
    if (i <= 0) return true;
    return !!Store.levelResult(pack[i - 1].id);
  }

  const $ = (id) => document.getElementById(id);

  // Resolve a quest's name/goal text for built-in (i18n key) or custom (object).
  function levelName(l) {
    return l.nameKey ? I18N.t(l.nameKey) : (l.name[I18N.lang] || l.name.en || "Quest");
  }
  function levelGoal(l) {
    return l.goalKey ? I18N.t(l.goalKey) : (l.goal_text[I18N.lang] || l.goal_text.en || "");
  }

  function show(screenId) {
    document.querySelectorAll(".screen").forEach((s) => s.classList.remove("active"));
    $(screenId).classList.add("active");
  }

  function openModal(id) { $(id).classList.add("open"); }
  function closeModal(id) { $(id).classList.remove("open"); }

  /* ---------- scoring ---------- */
  function starsFor(used, optimal) {
    if (used <= optimal) return 3;
    if (used <= optimal + 2) return 2;
    return 1;
  }
  function scoreFor(stars) { return stars * 100; }

  /* ---------- menu ---------- */
  function renderMenu() {
    $("playerNameDisplay").textContent = Store.getPlayer() || "—";
    renderLevelGrid();
    renderBusGrid();
    renderCustomGrid();
    renderLeaderboard();
  }

  function renderLevelGrid() {
    const grid = $("levelGrid");
    grid.innerHTML = "";
    LEVELS.forEach((lvl) => {
      const unlocked = unlockedIn(LEVELS, lvl);
      const res = Store.levelResult(lvl.id);
      const card = document.createElement("button");
      card.className = "level-card" + (unlocked ? "" : " locked");
      const stars = res ? "⭐".repeat(res.stars) + "☆".repeat(3 - res.stars) : "☆☆☆";
      card.innerHTML = `
        <div class="level-num">${lvl.id}</div>
        <div class="level-name">${I18N.markup(levelName(lvl))}</div>
        <div class="level-stars">${unlocked ? stars : "🔒"}</div>`;
      if (unlocked) {
        card.addEventListener("click", () => startLevel(lvl, "menu", LEVELS));
      } else {
        card.title = I18N.t("locked");
      }
      grid.appendChild(card);
    });
  }

  function renderBusGrid() {
    const grid = $("busGrid");
    if (!grid || typeof BUS_LEVELS === "undefined") return;
    grid.innerHTML = "";
    BUS_LEVELS.forEach((lvl, idx) => {
      const unlocked = unlockedIn(BUS_LEVELS, lvl);
      const res = Store.levelResult(lvl.id);
      const card = document.createElement("button");
      card.className = "level-card" + (unlocked ? "" : " locked");
      const stars = res ? "⭐".repeat(res.stars) + "☆".repeat(3 - res.stars) : "☆☆☆";
      card.innerHTML = `
        <div class="level-num">🚌${idx + 1}</div>
        <div class="level-name">${I18N.markup(levelName(lvl))}</div>
        <div class="level-stars">${unlocked ? stars : "🔒"}</div>`;
      if (unlocked) card.addEventListener("click", () => startLevel(lvl, "menu", BUS_LEVELS));
      else card.title = I18N.t("locked");
      grid.appendChild(card);
    });
  }

  function renderCustomGrid() {
    const grid = $("customGrid");
    const empty = $("customEmpty");
    const list = Store.getCustom();
    grid.innerHTML = "";
    empty.style.display = list.length ? "none" : "block";
    list.forEach((lvl) => {
      const res = Store.levelResult(lvl.id);
      const stars = res ? "⭐".repeat(res.stars) + "☆".repeat(3 - res.stars) : "☆☆☆";
      const card = document.createElement("div");
      card.className = "level-card custom";
      card.innerHTML = `
        <div class="level-num">🎓</div>
        <div class="level-name">${I18N.markup(levelName(lvl))}</div>
        <div class="level-stars">${stars}</div>
        <div class="card-tools">
          <button class="link-btn" data-act="edit">${I18N.markup(I18N.t("edit"))}</button>
          <button class="link-btn danger" data-act="del">${I18N.markup(I18N.t("deleteQuest"))}</button>
        </div>`;
      card.querySelector(".level-name").addEventListener("click", () => startLevel(lvl));
      card.querySelector(".level-stars").addEventListener("click", () => startLevel(lvl));
      card.querySelector('[data-act="edit"]').addEventListener("click", (e) => {
        e.stopPropagation(); openEditor(lvl);
      });
      card.querySelector('[data-act="del"]').addEventListener("click", (e) => {
        e.stopPropagation();
        if (confirm(I18N.t("confirmDelete"))) { Store.deleteCustom(lvl.id); renderMenu(); }
      });
      grid.appendChild(card);
    });
  }

  function renderLeaderboard() {
    const list = $("leaderboardList");
    const empty = $("leaderboardEmpty");
    const rows = Store.leaderboard();
    list.innerHTML = "";
    if (rows.length === 0) {
      empty.style.display = "block";
      list.style.display = "none";
      return;
    }
    empty.style.display = "none";
    list.style.display = "block";
    const medals = ["🥇", "🥈", "🥉"];
    rows.forEach((r, i) => {
      const li = document.createElement("li");
      const me = r.name === Store.getPlayer() ? " me" : "";
      li.className = "lb-row" + me;
      li.innerHTML = `
        <span class="lb-rank">${medals[i] || i + 1}</span>
        <span class="lb-name">${I18N.markup(r.name)}</span>
        <span class="lb-stars">${r.stars}⭐</span>
        <span class="lb-score">${r.score}</span>`;
      list.appendChild(li);
    });
  }

  /* ---------- play ---------- */
  function startLevel(lvl, origin, pack) {
    currentLevel = lvl;
    currentPack = pack || null;
    playOrigin = origin || "menu";
    const num = lvl.isCustom ? "🎓" : lvl.id + ".";
    I18N.setText($("levelTitle"), `${num} ${levelName(lvl)}`);
    I18N.setText($("levelGoal"), levelGoal(lvl));
    Blocks.setAllowed(lvl.allowed);
    Engine.load(lvl);
    updateCounter(0);
    show("screen-play");
  }

  function updateCounter(n) {
    I18N.setText($("blockCounter"), `${I18N.t("blocksUsed")}: ${n}`);
  }

  function runProgram() {
    const program = Blocks.getProgram();
    if (Blocks.count() === 0) {
      toast(I18N.t("programEmpty"));
      return;
    }
    setRunEnabled(false);
    Engine.run(program, (result) => {
      if (result.win) {
        onWin();
      } else {
        setRunEnabled(true);
        toast(I18N.t(result.reason));
      }
    });
  }

  function onWin() {
    const used = Blocks.count();
    const stars = starsFor(used, currentLevel.optimal);
    const score = scoreFor(stars);
    Store.record(currentLevel.id, stars, score);

    $("winStars").textContent = "⭐".repeat(stars) + "☆".repeat(3 - stars);
    $("winScore").textContent = score;
    nextLevelRef = null;
    if (currentPack) {
      const i = currentPack.indexOf(currentLevel);
      if (i > -1 && i + 1 < currentPack.length) nextLevelRef = currentPack[i + 1];
    }
    $("nextLevelBtn").style.display = nextLevelRef ? "inline-block" : "none";
    openModal("winModal");
    setRunEnabled(true);
  }

  function setRunEnabled(on) {
    $("runBtn").disabled = !on;
  }

  /* ---------- toast ---------- */
  let toastTimer = null;
  function toast(msg) {
    let t = $("toast");
    if (!t) {
      t = document.createElement("div");
      t.id = "toast";
      t.className = "toast";
      document.body.appendChild(t);
    }
    I18N.setText(t, msg);
    t.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => t.classList.remove("show"), 2200);
  }

  function escapeHtml(s) {
    return s.replace(/[&<>"']/g, (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  }

  /* ---------- wiring ---------- */
  function wire() {
    document.querySelectorAll(".lang-btn").forEach((b) =>
      b.addEventListener("click", () => I18N.setLang(b.dataset.lang)));

    $("howToBtn").addEventListener("click", () => openModal("howToModal"));
    $("closeHowToBtn").addEventListener("click", () => closeModal("howToModal"));

    $("changeNameBtn").addEventListener("click", () => {
      $("nameInput").value = Store.getPlayer();
      openModal("nameModal");
      $("nameInput").focus();
    });
    $("saveNameBtn").addEventListener("click", saveName);
    $("nameInput").addEventListener("keydown", (e) => { if (e.key === "Enter") saveName(); });

    $("backBtn").addEventListener("click", () => {
      if (playOrigin === "editor") { show("screen-editor"); Editor.render(); }
      else { show("screen-menu"); renderMenu(); }
    });
    $("runBtn").addEventListener("click", runProgram);
    $("resetBtn").addEventListener("click", () => Engine.reset());
    $("clearBtn").addEventListener("click", () => { Blocks.clear(); Engine.reset(); });

    $("replayBtn").addEventListener("click", () => { closeModal("winModal"); Engine.reset(); });
    $("toMenuBtn").addEventListener("click", () => { closeModal("winModal"); show("screen-menu"); renderMenu(); });
    $("nextLevelBtn").addEventListener("click", () => {
      closeModal("winModal");
      if (nextLevelRef) startLevel(nextLevelRef, "menu", currentPack);
    });

    // close modals by clicking backdrop
    document.querySelectorAll(".modal-backdrop").forEach((bd) => {
      bd.addEventListener("click", (e) => {
        if (e.target === bd && bd.id !== "nameModal") closeModal(bd.id);
      });
    });

    Blocks.init($("palette"), $("program"), updateCounter);
    wireEditor();

    I18N.onChange(() => {
      if ($("screen-menu").classList.contains("active")) {
        renderMenu();
      } else if ($("screen-play").classList.contains("active")) {
        const num = currentLevel.isCustom ? "🎓" : currentLevel.id + ".";
        I18N.setText($("levelTitle"), `${num} ${levelName(currentLevel)}`);
        I18N.setText($("levelGoal"), levelGoal(currentLevel));
        Blocks.relabel();
        updateCounter(Blocks.count());
      }
    });
  }

  /* ---------- editor ---------- */
  function openEditor(level) {
    Editor.open(level);
    show("screen-editor");
  }

  function wireEditor() {
    $("teacherBtn").addEventListener("click", () => openEditor(null));
    $("editorBackBtn").addEventListener("click", () => { show("screen-menu"); renderMenu(); });

    $("toolRow").querySelectorAll(".tool-btn").forEach((b) =>
      b.addEventListener("click", () => Editor.setTool(b.dataset.tool)));

    $("colsInput").addEventListener("change", () =>
      Editor.setSize(parseInt($("colsInput").value, 10), parseInt($("rowsInput").value, 10)));
    $("rowsInput").addEventListener("change", () =>
      Editor.setSize(parseInt($("colsInput").value, 10), parseInt($("rowsInput").value, 10)));
    $("facingSelect").addEventListener("change", () =>
      Editor.setFacing(parseInt($("facingSelect").value, 10)));

    $("autoSolveBtn").addEventListener("click", () => {
      Editor._formToState();
      const n = Editor.autoSolve();
      if (n == null) { toast(I18N.t(Editor.state.start && Editor.state.goal ? "unreachable" : "needStartGoal")); return; }
      $("optimalInput").value = n;
      toast(`${I18N.t("autoDone")} ${n}`);
    });

    $("testQuestBtn").addEventListener("click", () => {
      const out = Editor.toLevel();
      if (out.error) { toast(I18N.t(out.error)); return; }
      startLevel(out.level, "editor");
    });

    $("saveQuestBtn").addEventListener("click", () => {
      const out = Editor.toLevel();
      if (out.error) { toast(I18N.t(out.error)); return; }
      Store.saveCustom(out.level);
      toast(I18N.t("questSaved"));
    });

    $("exportQuestBtn").addEventListener("click", () => {
      const out = Editor.toLevel();
      if (out.error) { toast(I18N.t(out.error)); return; }
      const blob = new Blob([JSON.stringify(out.level, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      const slug = (out.level.name.en || "quest").replace(/[^a-z0-9]+/gi, "-").toLowerCase();
      a.href = url; a.download = `quest-${slug}.json`;
      document.body.appendChild(a); a.click(); a.remove();
      URL.revokeObjectURL(url);
    });

    $("importQuestBtn").addEventListener("click", () => {
      const raw = prompt(I18N.t("importPrompt"));
      if (!raw) return;
      try {
        const lvl = JSON.parse(raw);
        if (!lvl.start || !lvl.goal || !lvl.cols || !lvl.name) throw new Error("bad");
        lvl.id = "c" + Date.now();
        lvl.isCustom = true;
        Store.saveCustom(lvl);
        openEditor(lvl);
        toast(I18N.t("questSaved"));
      } catch (e) {
        toast(I18N.t("importBad"));
      }
    });
  }

  function saveName() {
    const name = Store.setPlayer($("nameInput").value);
    closeModal("nameModal");
    $("playerNameDisplay").textContent = name;
    renderMenu();
  }

  /* ---------- boot ---------- */
  window.addEventListener("DOMContentLoaded", () => {
    I18N.init();
    Engine.init($("stage"));
    Editor.init($("editorStage"));
    wire();
    if (!Store.getPlayer()) {
      $("nameInput").value = "";
      openModal("nameModal");
      setTimeout(() => $("nameInput").focus(), 100);
    }
    renderMenu();
  });
})();
