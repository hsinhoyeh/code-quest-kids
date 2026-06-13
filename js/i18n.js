/* i18n.js — bilingual strings (English + 繁體中文) and helpers. */
(function () {
  const STRINGS = {
    en: {
      appTitle: "Code Quest Kids",
      howTo: "How to play",
      pickLevel: "Pick a Quest!",
      playerLabel: "Player:",
      changeName: "change",
      leaderboard: "Leaderboard",
      noScores: "No scores yet — be the first hero!",
      back: "Back",
      run: "Run",
      reset: "Reset",
      blocks: "Blocks",
      paletteHint: "Tap a block to add it to your program ↓",
      myProgram: "My Program",
      clearAll: "clear all",
      whatsYourName: "What's your hero name?",
      letsGo: "Let's go!",
      youDidIt: "You did it! 🎉",
      scoreEarned: "Score earned:",
      nextQuest: "Next Quest ➡",
      playAgain: "Play again",
      backToMenu: "Back to menu",
      howto1: "1. Tap blocks to build a program.",
      howto2: "2. Press ▶ Run to move your robot.",
      howto3: "3. Reach the 🎯 goal to win!",
      howto4: "4. Use fewer blocks to earn more ⭐.",
      gotIt: "Got it!",
      madeWith: "Made with",
      forYoungCoders: "for young coders",
      // Blocks
      blockForward: "Move forward",
      blockLeft: "Turn left",
      blockRight: "Turn right",
      blockRepeat: "Repeat",
      blockTimes: "times",
      dropHere: "Add blocks here…",
      // Play feedback
      programEmpty: "Add some blocks first!",
      bumped: "Oops! The robot bumped a wall. Try again 💪",
      missedGoal: "So close! You didn't reach the 🎯. Try again 💪",
      blocksUsed: "Blocks used",
      // Levels
      lvl1: "First Steps",
      lvl1goal: "Walk to the flag",
      lvl2: "Turn Around",
      lvl2goal: "Turn and reach the flag",
      lvl3: "The Corner",
      lvl3goal: "Go around the corner",
      lvl4: "Zig Zag",
      lvl4goal: "Wind through the path",
      lvl5: "Loop Power",
      lvl5goal: "Use Repeat to go far",
      lvl6: "The Spiral",
      lvl6goal: "Master loops and turns",
      locked: "Locked — finish the quest before!",
      // Editor / teacher mode
      teacher: "Teacher",
      editorTitle: "Level Editor",
      teacherQuests: "Teacher's Quests",
      newQuest: "＋ New Quest",
      editorHint: "Pick a tool, then tap the grid to build your maze.",
      toolStart: "Start 🤖",
      toolGoal: "Goal 🚩",
      toolWall: "Wall 🧱",
      toolErase: "Erase 🧽",
      facing: "Robot faces",
      dirUp: "Up ⬆",
      dirRight: "Right ➡",
      dirDown: "Down ⬇",
      dirLeft: "Left ⬅",
      gridSize: "Grid size",
      colsLabel: "Columns",
      rowsLabel: "Rows",
      allowedBlocks: "Blocks kids can use",
      optimalBlocks: "Target blocks (for ⭐⭐⭐)",
      autoSolve: "Auto",
      nameEn: "Quest name (English)",
      nameZh: "Quest name (中文)",
      goalEnLabel: "Hint (English)",
      goalZhLabel: "Hint (中文)",
      testQuest: "▶ Test",
      saveQuest: "💾 Save",
      exportQuest: "⬇ Export",
      importQuest: "⬆ Import",
      deleteQuest: "Delete",
      edit: "Edit",
      questSaved: "Quest saved! 🎉",
      needStartGoal: "Please place both a Start 🤖 and a Goal 🚩.",
      needName: "Please give your quest a name.",
      unreachable: "The robot can't reach the goal — check your walls!",
      autoDone: "Best solution needs",
      confirmDelete: "Delete this quest?",
      noCustom: "No teacher quests yet. Tap “＋ New Quest” to make one!",
      backToEditor: "Back to editor",
      importPrompt: "Paste quest JSON:",
      importBad: "That doesn't look like a valid quest.",
      // Bus & Lights pack
      busPack: "Bus & Lights",
      b1: "First Bus", b1goal: "Drive to the bus stop",
      b2: "Two Stops", b2goal: "Serve both stops",
      b3: "Drive & Turn", b3goal: "Turn to reach the stops",
      b4: "Loop Route", b4goal: "Use Repeat to serve every stop",
      b5: "Rainbow Route", b5goal: "Switch colours along the way",
      lightRed: "Light: Red", lightGreen: "Light: Green", lightYellow: "Light: Yellow",
      wrongColor: "Wrong light! Set the right colour before the stop 💪",
      busMissed: "Some stops still need the bus! Try again 💪",
    },
    "zh-tw": {
      appTitle: "程式冒險小高手",
      howTo: "怎麼玩",
      pickLevel: "選一個任務！",
      playerLabel: "玩家：",
      changeName: "更改",
      leaderboard: "排行榜",
      noScores: "還沒有分數 — 當第一位小英雄吧！",
      back: "返回",
      run: "執行",
      reset: "重來",
      blocks: "積木",
      paletteHint: "點一下積木，把它加到程式裡 ↓",
      myProgram: "我的程式",
      clearAll: "全部清除",
      whatsYourName: "你的英雄名字是？",
      letsGo: "出發！",
      youDidIt: "你成功了！🎉",
      scoreEarned: "得到分數：",
      nextQuest: "下一個任務 ➡",
      playAgain: "再玩一次",
      backToMenu: "回到選單",
      howto1: "1. 點積木來組合你的程式。",
      howto2: "2. 按 ▶ 執行，讓機器人動起來。",
      howto3: "3. 抵達 🎯 終點就贏了！",
      howto4: "4. 用越少積木，得到越多 ⭐。",
      gotIt: "我懂了！",
      madeWith: "用",
      forYoungCoders: "為小小程式員打造",
      blockForward: "向前走",
      blockLeft: "向左轉",
      blockRight: "向右轉",
      blockRepeat: "重複",
      blockTimes: "次",
      dropHere: "在這裡加積木…",
      programEmpty: "先加一些積木吧！",
      bumped: "哎呀！機器人撞牆了，再試一次 💪",
      missedGoal: "好可惜！還沒到 🎯，再試一次 💪",
      blocksUsed: "使用積木數",
      lvl1: "第一步",
      lvl1goal: "走到旗子那裡",
      lvl2: "轉個彎",
      lvl2goal: "轉身走到旗子",
      lvl3: "轉角",
      lvl3goal: "繞過轉角",
      lvl4: "彎彎曲曲",
      lvl4goal: "沿著路走",
      lvl5: "迴圈的力量",
      lvl5goal: "用重複走更遠",
      lvl6: "螺旋路",
      lvl6goal: "精通迴圈與轉彎",
      locked: "鎖住了 — 先完成前一個任務！",
      // Editor / teacher mode
      teacher: "老師",
      editorTitle: "關卡編輯器",
      teacherQuests: "老師出的任務",
      newQuest: "＋ 新增任務",
      editorHint: "選一個工具，然後點格子來蓋你的迷宮。",
      toolStart: "起點 🤖",
      toolGoal: "終點 🚩",
      toolWall: "牆壁 🧱",
      toolErase: "擦掉 🧽",
      facing: "機器人面向",
      dirUp: "上 ⬆",
      dirRight: "右 ➡",
      dirDown: "下 ⬇",
      dirLeft: "左 ⬅",
      gridSize: "格子大小",
      colsLabel: "欄",
      rowsLabel: "列",
      allowedBlocks: "小朋友能用的積木",
      optimalBlocks: "目標積木數（拿 ⭐⭐⭐）",
      autoSolve: "自動",
      nameEn: "任務名稱（English）",
      nameZh: "任務名稱（中文）",
      goalEnLabel: "提示（English）",
      goalZhLabel: "提示（中文）",
      testQuest: "▶ 測試",
      saveQuest: "💾 儲存",
      exportQuest: "⬇ 匯出",
      importQuest: "⬆ 匯入",
      deleteQuest: "刪除",
      edit: "編輯",
      questSaved: "任務已儲存！🎉",
      needStartGoal: "請放上起點 🤖 和終點 🚩。",
      needName: "請幫任務取個名字。",
      unreachable: "機器人到不了終點 — 檢查一下牆壁！",
      autoDone: "最佳解需要",
      confirmDelete: "要刪除這個任務嗎？",
      noCustom: "還沒有老師任務。點「＋ 新增任務」來做一個！",
      backToEditor: "回到編輯器",
      importPrompt: "貼上任務 JSON：",
      importBad: "這看起來不是有效的任務。",
      // Bus & Lights pack
      busPack: "公車與燈光",
      b1: "第一班公車", b1goal: "開到公車站",
      b2: "兩個站牌", b2goal: "載客到兩個站",
      b3: "開車轉彎", b3goal: "轉彎開到站牌",
      b4: "迴圈路線", b4goal: "用重複開過每一站",
      b5: "彩虹路線", b5goal: "一路上換顏色",
      lightRed: "紅燈", lightGreen: "綠燈", lightYellow: "黃燈",
      wrongColor: "燈號不對！到站前先換對顏色 💪",
      busMissed: "還有站沒載到客人！再試一次 💪",
    },
  };

  const I18N = {
    lang: "en",
    listeners: [],

    init() {
      const saved = localStorage.getItem("cqk_lang");
      const browser = (navigator.language || "en").toLowerCase();
      this.lang = saved || (browser.startsWith("zh") ? "zh-tw" : "en");
      this.apply();
    },

    setLang(lang) {
      if (!STRINGS[lang]) return;
      this.lang = lang;
      localStorage.setItem("cqk_lang", lang);
      this.apply();
      this.listeners.forEach((fn) => fn(lang));
    },

    onChange(fn) {
      this.listeners.push(fn);
    },

    t(key) {
      return (STRINGS[this.lang] && STRINGS[this.lang][key]) || STRINGS.en[key] || key;
    },

    // Set an element's text, adding zhuyin <ruby> in zh-TW. <option>/<select>
    // can't render HTML, so they always get plain text.
    setText(el, str) {
      const plain = el.tagName === "OPTION" || el.tagName === "SELECT";
      if (this.lang === "zh-tw" && window.ZH && !plain) el.innerHTML = window.ZH.annotate(str);
      else el.textContent = str;
    },
    setKey(el, key) { this.setText(el, this.t(key)); },

    // Return HTML for embedding inside a template string (annotated in zh-TW).
    markup(str) {
      return this.lang === "zh-tw" && window.ZH ? window.ZH.annotate(str) : (window.ZH ? window.ZH.esc(str) : str);
    },

    apply() {
      document.documentElement.lang = this.lang;
      document.body && document.body.classList.toggle("zh", this.lang === "zh-tw");
      document.querySelectorAll("[data-i18n]").forEach((el) => {
        this.setText(el, this.t(el.getAttribute("data-i18n")));
      });
      document.querySelectorAll(".lang-btn").forEach((b) => {
        b.classList.toggle("active", b.dataset.lang === this.lang);
      });
    },
  };

  window.I18N = I18N;
})();
