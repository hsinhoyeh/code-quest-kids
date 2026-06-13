/* leaderboard.js — local (per-device) scores & progress via localStorage.
   No accounts, no network — kid-safe by default.
   To make it global, swap these functions for fetch() calls to a tiny
   key-value backend (see README "Going global"). */
(function () {
  const KEY_PLAYER = "cqk_player";
  const KEY_DATA = "cqk_data"; // { players: { name: { levels: {id:{stars,score}} } } }
  const KEY_CUSTOM = "cqk_custom"; // [ levelObject, ... ] — teacher-made quests

  function load() {
    try {
      return JSON.parse(localStorage.getItem(KEY_DATA)) || { players: {} };
    } catch (e) {
      return { players: {} };
    }
  }
  function save(data) {
    localStorage.setItem(KEY_DATA, JSON.stringify(data));
  }

  const Store = {
    getPlayer() {
      return localStorage.getItem(KEY_PLAYER) || "";
    },
    setPlayer(name) {
      const clean = (name || "").trim().slice(0, 14) || "Hero";
      localStorage.setItem(KEY_PLAYER, clean);
      const data = load();
      if (!data.players[clean]) data.players[clean] = { levels: {} };
      save(data);
      return clean;
    },

    // Record a result; keeps the BEST score/stars per level.
    record(levelId, stars, score) {
      const name = this.getPlayer();
      if (!name) return;
      const data = load();
      if (!data.players[name]) data.players[name] = { levels: {} };
      const prev = data.players[name].levels[levelId];
      if (!prev || score > prev.score) {
        data.players[name].levels[levelId] = { stars, score };
      }
      save(data);
    },

    levelResult(levelId) {
      const name = this.getPlayer();
      const data = load();
      return (data.players[name] && data.players[name].levels[levelId]) || null;
    },

    // A level is unlocked if it's #1 or the previous one was cleared.
    isUnlocked(levelId) {
      if (levelId <= 1) return true;
      return !!this.levelResult(levelId - 1);
    },

    totalFor(name) {
      const data = load();
      const p = data.players[name];
      if (!p) return 0;
      return Object.values(p.levels).reduce((s, l) => s + l.score, 0);
    },

    starsFor(name) {
      const data = load();
      const p = data.players[name];
      if (!p) return 0;
      return Object.values(p.levels).reduce((s, l) => s + l.stars, 0);
    },

    /* ---- player management ---- */
    getPlayers() {
      return Object.keys(load().players);
    },
    deletePlayer(name) {
      const data = load();
      delete data.players[name];
      save(data);
      if (this.getPlayer() === name) {
        const rest = Object.keys(data.players);
        localStorage.setItem(KEY_PLAYER, rest[0] || "");
      }
    },

    /* ---- teacher-made custom quests ---- */
    getCustom() {
      try {
        return JSON.parse(localStorage.getItem(KEY_CUSTOM)) || [];
      } catch (e) {
        return [];
      }
    },
    saveCustom(level) {
      const list = this.getCustom();
      const i = list.findIndex((l) => l.id === level.id);
      if (i > -1) list[i] = level;
      else list.push(level);
      localStorage.setItem(KEY_CUSTOM, JSON.stringify(list));
    },
    deleteCustom(id) {
      const list = this.getCustom().filter((l) => l.id !== id);
      localStorage.setItem(KEY_CUSTOM, JSON.stringify(list));
    },

    // Ranked list of all players on this device.
    leaderboard() {
      const data = load();
      return Object.keys(data.players)
        .map((name) => ({
          name,
          score: this.totalFor(name),
          stars: this.starsFor(name),
        }))
        .filter((p) => p.score > 0)
        .sort((a, b) => b.score - a.score || b.stars - a.stars)
        .slice(0, 10);
    },
  };

  window.Store = Store;
})();
