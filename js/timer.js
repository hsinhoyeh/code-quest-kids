/* timer.js — per-player play-time limiter with cooldown.
   Each active player gets a configurable budget (default 10 min) that counts
   down only while their turn is active. When it runs out the player goes into a
   cooldown — they take a break, or another player takes over. Switching players
   pauses the previous player's clock, so every hero gets their own slice of time.
   All state is local (localStorage) — no accounts, no network. */
(function () {
  const KEY_CFG = "cqk_timer_cfg";
  const KEY_STATE = "cqk_timer_state"; // { [name]: { remainingMs, cooldownUntil } }
  const DEFAULTS = { enabled: true, playMinutes: 10, cooldownMinutes: 5 };
  const TICK_MS = 1000;
  const MAX_STEP = 2000; // cap per-tick subtraction so backgrounding pauses, not penalizes

  let cfg = loadCfg();
  let state = loadState();
  let active = "";      // current player name
  let lastTs = 0;       // Date.now() of previous tick
  let expired = false;  // guard so onExpire fires once per used-up budget
  let intervalId = null;
  let cbExpire = null;

  function now() { return Date.now(); }
  function clampInt(v, lo, hi, dflt) {
    v = parseInt(v, 10);
    if (isNaN(v)) return dflt;
    return Math.max(lo, Math.min(hi, v));
  }

  function loadCfg() {
    try { return Object.assign({}, DEFAULTS, JSON.parse(localStorage.getItem(KEY_CFG)) || {}); }
    catch (e) { return Object.assign({}, DEFAULTS); }
  }
  function loadState() {
    try { return JSON.parse(localStorage.getItem(KEY_STATE)) || {}; }
    catch (e) { return {}; }
  }
  function saveCfg() { localStorage.setItem(KEY_CFG, JSON.stringify(cfg)); }
  function saveState() { localStorage.setItem(KEY_STATE, JSON.stringify(state)); }

  function playMs() { return cfg.playMinutes * 60000; }
  function cooldownMs() { return cfg.cooldownMinutes * 60000; }

  function ensure(name) {
    if (!state[name]) state[name] = { remainingMs: playMs(), cooldownUntil: 0 };
    return state[name];
  }

  function fmt(ms) {
    const total = Math.max(0, Math.ceil(ms / 1000));
    const m = Math.floor(total / 60);
    const s = total % 60;
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  }

  /* ---------- core tick ---------- */
  function tick() {
    const t = now();
    const prev = lastTs;
    lastTs = t;
    if (!cfg.enabled || !active) { render(); return; }

    const s = ensure(active);

    // Still serving a cooldown — just show the countdown.
    if (s.cooldownUntil > t) { render(); return; }

    // Cooldown just finished (or was zero) — start a fresh budget.
    if (s.cooldownUntil > 0) {
      s.cooldownUntil = 0;
      s.remainingMs = playMs();
      expired = false;
      saveState();
      render();
      return;
    }

    // Normal countdown for the active player.
    const dt = Math.min(Math.max(t - prev, 0), MAX_STEP);
    s.remainingMs -= dt;
    if (s.remainingMs <= 0) {
      s.remainingMs = 0;
      if (!expired) {
        expired = true;
        s.cooldownUntil = t + cooldownMs(); // 0 cooldown -> refills next tick
        saveState();
        render();
        if (cbExpire) cbExpire(active);
        return;
      }
    }
    saveState();
    render();
  }

  /* ---------- display ---------- */
  function setIcon(ch) {
    const ic = document.getElementById("timerIcon");
    if (ic) ic.textContent = ch;
  }
  function render() {
    const pill = document.getElementById("timerPill");
    const disp = document.getElementById("timerDisplay");
    if (!pill || !disp) return;
    pill.classList.remove("warn", "cooldown", "off");

    if (!cfg.enabled) {
      pill.classList.add("off");
      setIcon("⏱");
      disp.textContent = "∞";
      return;
    }
    const s = active ? ensure(active) : null;
    if (!s) { setIcon("⏱"); disp.textContent = fmt(playMs()); return; }

    if (s.cooldownUntil > now()) {
      pill.classList.add("cooldown");
      setIcon("🛑");
      disp.textContent = fmt(s.cooldownUntil - now());
      return;
    }
    const r = Math.max(0, s.remainingMs);
    if (r <= 60000) pill.classList.add("warn");
    setIcon("⏱");
    disp.textContent = fmt(r);
  }

  /* ---------- public API ---------- */
  const Timer = {
    init(opts) {
      cbExpire = (opts && opts.onExpire) || null;
      lastTs = now();
      if (intervalId) clearInterval(intervalId);
      intervalId = setInterval(tick, TICK_MS);
      render();
    },

    // Switch the active clock. The previous player's remaining time is paused
    // and kept; the new player resumes (or starts) their own budget.
    setActivePlayer(name) {
      active = name || "";
      lastTs = now();
      const s = active ? ensure(active) : null;
      expired = !!(s && s.remainingMs <= 0 && s.cooldownUntil > now());
      if (s) saveState();
      render();
    },

    isEnabled() { return !!cfg.enabled; },

    isCoolingDown(name) {
      if (!cfg.enabled) return false;
      const s = state[name || active];
      return !!(s && s.cooldownUntil > now());
    },

    cooldownRemainingMs(name) {
      const s = state[name || active];
      return s ? Math.max(0, s.cooldownUntil - now()) : 0;
    },

    cooldownLabel(name) { return fmt(this.cooldownRemainingMs(name)); },

    getConfig() { return Object.assign({}, cfg); },

    setConfig(next) {
      cfg.enabled = !!next.enabled;
      cfg.playMinutes = clampInt(next.playMinutes, 1, 120, DEFAULTS.playMinutes);
      cfg.cooldownMinutes = clampInt(next.cooldownMinutes, 0, 120, DEFAULTS.cooldownMinutes);
      saveCfg();
      // Clamp any running budgets down to the new maximum.
      Object.keys(state).forEach((n) => {
        if (state[n].remainingMs > playMs()) state[n].remainingMs = playMs();
      });
      // Re-evaluate expiry for the active player under the new settings.
      const s = active ? ensure(active) : null;
      expired = !!(s && s.remainingMs <= 0 && s.cooldownUntil > now());
      lastTs = now();
      saveState();
      render();
    },
  };

  window.Timer = Timer;
})();
