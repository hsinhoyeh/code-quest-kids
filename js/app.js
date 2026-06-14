/* app.js — wires screens, levels, scoring, modals & leaderboard together. */
(function () {
  let currentLevel = null;
  let currentPack = null;  // the array the current level belongs to (for "next")
  let nextLevelRef = null; // resolved on win
  let playOrigin = "menu"; // "menu" | "editor" — where Back returns to
  let viewMode = localStorage.getItem("cqk_view") || "map"; // "map" | "grid"

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
    updateViewToggle();
    const render = viewMode === "grid" ? renderPackGrid : renderPackMap;
    render(LEVELS,       "mazeMap");
    if (typeof BUS_LEVELS   !== "undefined") render(BUS_LEVELS,   "busMap");
    if (typeof BUILD_LEVELS !== "undefined") render(BUILD_LEVELS,  "buildMap");
    if (typeof OCEAN_LEVELS !== "undefined") render(OCEAN_LEVELS,  "oceanMap");
    if (typeof CARGO_LEVELS !== "undefined") render(CARGO_LEVELS,  "cargoMap");
    renderCustomGrid();
    renderLeaderboard();
  }

  function updateViewToggle() {
    $("viewGridBtn").classList.toggle("active", viewMode === "grid");
    $("viewMapBtn").classList.toggle("active",  viewMode === "map");
  }

  // Flat card grid (original style) rendered into a quest-map-wrap container.
  function renderPackGrid(pack, containerId) {
    const wrap = $(containerId);
    if (!wrap || !pack || !pack.length) return;
    wrap.innerHTML = "";
    const grid = document.createElement("div");
    grid.className = "level-grid";
    pack.forEach((lvl, idx) => {
      const unlocked = unlockedIn(pack, lvl);
      const res = Store.levelResult(lvl.id);
      const card = document.createElement("button");
      card.className = "level-card" + (unlocked ? "" : " locked");
      const stars = res ? "⭐".repeat(res.stars) + "☆".repeat(3 - res.stars) : "☆☆☆";
      card.innerHTML = `
        <div class="level-num">${idx + 1}</div>
        <div class="level-name">${I18N.markup(levelName(lvl))}</div>
        <div class="level-stars">${unlocked ? stars : "🔒"}</div>`;
      if (unlocked) card.addEventListener("click", () => startLevel(lvl, "menu", pack));
      else card.title = I18N.t("locked");
      grid.appendChild(card);
    });
    wrap.appendChild(grid);
  }

  // Zigzag adventure map for a pack of levels.
  function renderPackMap(pack, containerId) {
    const wrap = $(containerId);
    if (!wrap || !pack || !pack.length) return;
    wrap.innerHTML = "";

    const MN = 72; // node diameter px
    const COLS = 3; // nodes per row

    // Determine state for each level in pack order.
    let foundCurrent = false;
    const stateOf = pack.map((lvl) => {
      const done = !!Store.levelResult(lvl.id);
      if (done) return "done";
      if (unlockedIn(pack, lvl) && !foundCurrent) { foundCurrent = true; return "current"; }
      return "locked";
    });

    const allDone = stateOf.every((s) => s === "done");

    // Split into rows.
    const rows = [];
    for (let i = 0; i < pack.length; i += COLS) rows.push(pack.slice(i, i + COLS));

    const map = document.createElement("div");
    map.className = "quest-map";

    rows.forEach((row, rowIdx) => {
      const reversed = rowIdx % 2 === 1;
      const dispLvls   = reversed ? [...row].reverse() : row;
      const dispStates = dispLvls.map((lvl) => stateOf[pack.indexOf(lvl)]);

      // "72px 1fr 72px 1fr 72px" for N nodes
      const n = dispLvls.length;
      const cols = Array.from({ length: n }, (_, i) =>
        i < n - 1 ? `${MN}px 1fr` : `${MN}px`).join(" ");

      const rowEl = document.createElement("div");
      rowEl.className = "map-row";
      rowEl.style.gridTemplateColumns = cols;

      dispLvls.forEach((lvl, i) => {
        const state = dispStates[i];
        const packIdx = pack.indexOf(lvl);
        const res = Store.levelResult(lvl.id);

        const slot = document.createElement("div");
        slot.className = "map-slot";

        const node = document.createElement("button");
        node.className = `map-node ${state}`;
        node.textContent = packIdx + 1;
        if (state === "locked") {
          node.disabled = true;
          node.title = I18N.t("locked");
        } else {
          node.addEventListener("click", () => startLevel(lvl, "menu", pack));
        }
        slot.appendChild(node);

        const nameEl = document.createElement("div");
        nameEl.className = "mn-name";
        I18N.setText(nameEl, levelName(lvl));
        slot.appendChild(nameEl);

        const starsEl = document.createElement("div");
        starsEl.className = "mn-stars";
        if (state === "locked") {
          starsEl.textContent = "🔒";
        } else {
          const s = res ? res.stars : 0;
          starsEl.textContent = "⭐".repeat(s) + "☆".repeat(3 - s);
        }
        slot.appendChild(starsEl);
        rowEl.appendChild(slot);

        // Horizontal connector (not after last node in row).
        if (i < dispLvls.length - 1) {
          // Green if the flow-predecessor is done.
          const predDone = reversed ? dispStates[i + 1] === "done" : dispStates[i] === "done";
          const conn = document.createElement("div");
          conn.className = "map-hconn" + (predDone ? " done" : "");
          rowEl.appendChild(conn);
        }
      });

      map.appendChild(rowEl);

      // Vertical turn connector between rows.
      if (rowIdx < rows.length - 1) {
        const dir = reversed ? "turn-left" : "turn-right";
        // Done when the flow endpoint of this row is done.
        const endDone = reversed
          ? dispStates[0] === "done"
          : dispStates[dispLvls.length - 1] === "done";
        const turn = document.createElement("div");
        turn.className = `map-turn ${dir}` + (endDone ? " done" : "");
        map.appendChild(turn);
      }
    });

    // Final short connector from last row exit to trophy.
    const lastRowIdx   = rows.length - 1;
    const lastReversed = lastRowIdx % 2 === 1;
    const posClass     = lastReversed ? "pos-left" : "pos-right";

    const lastRow      = rows[lastRowIdx];
    const lastDisp     = lastReversed ? [...lastRow].reverse() : lastRow;
    const lastDispSt   = lastDisp.map((lvl) => stateOf[pack.indexOf(lvl)]);
    const exitDone     = lastReversed
      ? lastDispSt[0] === "done"
      : lastDispSt[lastDispSt.length - 1] === "done";

    const vconn = document.createElement("div");
    vconn.className = `map-vconn-final ${posClass}` + (exitDone ? " done" : "");
    map.appendChild(vconn);

    // Trophy.
    const trophy = document.createElement("div");
    trophy.className = `map-trophy ${posClass}` + (allDone ? " achieved" : "");
    const trophyIcon = document.createElement("span");
    trophyIcon.className = "trophy-icon";
    trophyIcon.textContent = allDone ? "🏆" : "🏁";
    const trophyLabel = document.createElement("div");
    trophyLabel.className = "trophy-label";
    I18N.setText(trophyLabel, I18N.t(allDone ? "packComplete" : "reachEnd"));
    trophy.append(trophyIcon, trophyLabel);
    map.appendChild(trophy);

    wrap.appendChild(map);
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

  /* ---------- how to play (per topic) ---------- */
  const GOAL_KEY = {
    maze: "howtoGoalMaze", bus: "howtoGoalBus", build: "howtoGoalBuild",
    ocean: "howtoGoalOcean", cargo: "howtoGoalCargo",
  };
  function renderHowTo() {
    const ul = $("howToList");
    ul.innerHTML = "";
    let goalKey = "howtoGoalMenu";
    if ($("screen-play").classList.contains("active") && currentLevel) {
      goalKey = GOAL_KEY[currentLevel.kind || "maze"] || "howtoGoalMaze";
    }
    [I18N.t("howto1"), I18N.t("howto2"), I18N.t(goalKey), I18N.t("howto4")].forEach((s, i) => {
      const li = document.createElement("li");
      I18N.setText(li, `${i + 1}. ${s}`);
      ul.appendChild(li);
    });
  }

  // Crystal-clear objective + limitation banner for the current level.
  function renderObjective(lvl) {
    const bar = $("objectiveBar");
    if (!bar) return;
    const k = lvl.kind || "maze";
    let limit;
    if (k === "cargo") limit = `⚖ ≤ ${lvl.capacity} · 💰 ≥ ${lvl.target}`;
    else if (k === "bus") limit = `🚏 × ${lvl.stops.length} · 🔴🟢🟡`;
    else if (k === "ocean") limit = `🐟 × ${lvl.fish.length}`;
    else if (k === "build") limit = `🎯 × ${lvl.target.length}`;
    else limit = `🚩 × 1`;
    const goal = `🎯 ${I18N.markup(levelGoal(lvl))}`;
    const stars = `${I18N.markup(I18N.t("forStars"))}: ≤ ${lvl.optimal} 🧩`;
    bar.innerHTML =
      `<span class="obj-goal">${goal}</span>` +
      `<span class="obj-limit">${escapeHtml(limit)}</span>` +
      `<span class="obj-stars">${stars}</span>`;
  }

  /* ---------- players ---------- */
  function openPlayersModal() {
    renderPlayers();
    $("newPlayerInput").value = "";
    openModal("playersModal");
  }

  function renderPlayers() {
    const ul = $("playersList");
    ul.innerHTML = "";
    const cur = Store.getPlayer();
    Store.getPlayers().forEach((name) => {
      const li = document.createElement("li");
      li.className = "player-row" + (name === cur ? " current" : "");
      const tag = name === cur ? ` <span class="now-tag">(${I18N.markup(I18N.t("nowTag"))})</span>` : "";
      const pick = document.createElement("button");
      pick.className = "player-pick";
      pick.innerHTML = `<span class="p-name">${I18N.markup(name)}</span><span class="p-stars">${Store.starsFor(name)}⭐</span>${tag}`;
      pick.addEventListener("click", () => {
        Store.setPlayer(name);
        updateTopbarPlayer();
        closeModal("playersModal");
        renderMenu();
      });
      const del = document.createElement("button");
      del.className = "chip-x";
      del.textContent = "×";
      del.addEventListener("click", (e) => {
        e.stopPropagation();
        if (confirm(I18N.t("confirmDeletePlayer"))) {
          Store.deletePlayer(name);
          updateTopbarPlayer();
          renderPlayers();
          renderMenu();
        }
      });
      li.append(pick, del);
      ul.appendChild(li);
    });
  }

  function addPlayer() {
    const name = $("newPlayerInput").value.trim();
    if (!name) return;
    Store.setPlayer(name);
    updateTopbarPlayer();
    closeModal("playersModal");
    renderMenu();
  }

  /* ---------- play ---------- */
  function startLevel(lvl, origin, pack) {
    if (Timer.isCoolingDown()) { openTimeUpModal(); return; }
    currentLevel = lvl;
    currentPack = pack || null;
    playOrigin = origin || "menu";
    const num = lvl.isCustom ? "🎓" : lvl.id + ".";
    I18N.setText($("levelTitle"), `${num} ${levelName(lvl)}`);
    renderObjective(lvl);
    Blocks.setAllowed(lvl.allowed);
    Engine.load(lvl);
    updateCounter(0);
    show("screen-play");
  }

  function updateCounter(n) {
    I18N.setText($("blockCounter"), `${I18N.t("blocksUsed")}: ${n}`);
  }

  function runProgram() {
    if (Timer.isCoolingDown()) { onTimerExpire(); return; }
    const program = Blocks.getProgram();
    if (Blocks.count() === 0) {
      toast(I18N.t("programEmpty"));
      return;
    }
    Sound.unlock();
    setRunEnabled(false);
    Engine.run(program, (result) => {
      if (result.win) {
        onWin();
      } else {
        setRunEnabled(true);
        Sound.oops();
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
    Sound.win();
    openModal("winModal");
    setRunEnabled(true);
  }

  function setRunEnabled(on) {
    $("runBtn").disabled = !on;
  }

  /* ---------- play timer ---------- */
  // Fired when the active player's budget runs out (or they act while cooling).
  function onTimerExpire() {
    Engine.reset();
    closeModal("winModal");
    if ($("screen-play").classList.contains("active")) { show("screen-menu"); renderMenu(); }
    Sound.oops();
    openTimeUpModal();
  }

  function openTimeUpModal() {
    const cd = Timer.getConfig().cooldownMinutes;
    const body = cd > 0
      ? `${I18N.t("timeUpBody")} (🛑 ${Timer.cooldownLabel()})`
      : I18N.t("timeUpBody");
    I18N.setText($("timeUpMsg"), body);
    openModal("timeUpModal");
  }

  function openTimerSettings() {
    const c = Timer.getConfig();
    $("timerEnabledInput").checked = c.enabled;
    $("playMinutesInput").value = c.playMinutes;
    $("cooldownMinutesInput").value = c.cooldownMinutes;
    openModal("timerModal");
  }

  function saveTimerSettings() {
    Timer.setConfig({
      enabled: $("timerEnabledInput").checked,
      playMinutes: $("playMinutesInput").value,
      cooldownMinutes: $("cooldownMinutesInput").value,
    });
    Timer.setActivePlayer(Store.getPlayer());
    closeModal("timerModal");
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

    $("viewGridBtn").addEventListener("click", () => { viewMode = "grid"; localStorage.setItem("cqk_view", "grid"); renderMenu(); });
    $("viewMapBtn").addEventListener("click",  () => { viewMode = "map";  localStorage.setItem("cqk_view", "map");  renderMenu(); });

    $("howToBtn").addEventListener("click", () => { renderHowTo(); openModal("howToModal"); });

    $("timerPill").addEventListener("click", openTimerSettings);
    $("timerSaveBtn").addEventListener("click", saveTimerSettings);
    $("timerCloseBtn").addEventListener("click", () => closeModal("timerModal"));
    $("timeUpSwitchBtn").addEventListener("click", () => { closeModal("timeUpModal"); openPlayersModal(); });
    $("timeUpOkBtn").addEventListener("click", () => { closeModal("timeUpModal"); show("screen-menu"); renderMenu(); });
    $("muteBtn").addEventListener("click", () => { Sound.unlock(); Sound.toggleMute(); updateMuteBtn(); });
    $("closeHowToBtn").addEventListener("click", () => closeModal("howToModal"));

    $("switchPlayerBtn").addEventListener("click", openPlayersModal);
    $("changeNameBtn").addEventListener("click", openPlayersModal);
    $("saveNameBtn").addEventListener("click", saveName);
    $("nameInput").addEventListener("keydown", (e) => { if (e.key === "Enter") saveName(); });
    $("addPlayerBtn").addEventListener("click", addPlayer);
    $("newPlayerInput").addEventListener("keydown", (e) => { if (e.key === "Enter") addPlayer(); });
    $("closePlayersBtn").addEventListener("click", () => closeModal("playersModal"));
    $("passToFriendBtn").addEventListener("click", () => { closeModal("winModal"); openPlayersModal(); });

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
      updateTopbarPlayer();
      if ($("screen-menu").classList.contains("active")) {
        renderMenu();
      } else if ($("screen-play").classList.contains("active")) {
        const num = currentLevel.isCustom ? "🎓" : currentLevel.id + ".";
        I18N.setText($("levelTitle"), `${num} ${levelName(currentLevel)}`);
        renderObjective(currentLevel);
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

  function updateMuteBtn() {
    $("muteBtn").textContent = Sound.muted ? "🔇" : "🔊";
  }

  function updateTopbarPlayer() {
    const name = Store.getPlayer();
    $("topbarPlayer").textContent = name || "—";
    $("switchPlayerBtn").title = I18N.t("switchPlayer");
    Timer.setActivePlayer(name);
  }

  function saveName() {
    const name = Store.setPlayer($("nameInput").value);
    closeModal("nameModal");
    $("playerNameDisplay").textContent = name;
    updateTopbarPlayer();
    renderMenu();
  }

  /* ---------- boot ---------- */
  window.addEventListener("DOMContentLoaded", () => {
    I18N.init();
    Sound.init();
    Engine.init($("stage"));
    Editor.init($("editorStage"));
    wire();
    Timer.init({ onExpire: onTimerExpire });
    Timer.setActivePlayer(Store.getPlayer());
    updateMuteBtn();
    updateTopbarPlayer();
    if (!Store.getPlayer()) {
      $("nameInput").value = "";
      openModal("nameModal");
      setTimeout(() => $("nameInput").focus(), 100);
    }
    renderMenu();
  });
})();
