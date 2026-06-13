/* sound.js — tiny Web Audio sound effects (no asset files).
   A cheerful win jingle on level clear, plus a soft "oops" on failure.
   Respects a persisted mute toggle. */
(function () {
  const Sound = {
    ctx: null,
    muted: false,

    init() {
      this.muted = localStorage.getItem("cqk_muted") === "1";
    },

    _ac() {
      if (!this.ctx) {
        const AC = window.AudioContext || window.webkitAudioContext;
        if (AC) this.ctx = new AC();
      }
      return this.ctx;
    },

    // Resume the audio context within a user gesture (browsers require it).
    unlock() {
      const ac = this._ac();
      if (ac && ac.state === "suspended") ac.resume();
    },

    toggleMute() {
      this.muted = !this.muted;
      localStorage.setItem("cqk_muted", this.muted ? "1" : "0");
      return this.muted;
    },

    _tone(freq, start, dur, gain, type) {
      const ac = this.ctx;
      const o = ac.createOscillator();
      const g = ac.createGain();
      o.type = type || "triangle";
      o.frequency.value = freq;
      o.connect(g); g.connect(ac.destination);
      g.gain.setValueAtTime(0.0001, start);
      g.gain.exponentialRampToValueAtTime(gain, start + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, start + dur);
      o.start(start);
      o.stop(start + dur + 0.02);
    },

    win() {
      if (this.muted) return;
      const ac = this._ac();
      if (!ac) return;
      if (ac.state === "suspended") ac.resume();
      const notes = [523.25, 659.25, 783.99, 1046.5]; // C5 E5 G5 C6
      const t = ac.currentTime;
      notes.forEach((f, i) => this._tone(f, t + i * 0.11, 0.18, 0.3));
      // final sparkle
      this._tone(1318.5, t + notes.length * 0.11, 0.25, 0.22, "sine");
    },

    oops() {
      if (this.muted) return;
      const ac = this._ac();
      if (!ac) return;
      if (ac.state === "suspended") ac.resume();
      const t = ac.currentTime;
      this._tone(311.13, t, 0.16, 0.22, "sawtooth");
      this._tone(233.08, t + 0.12, 0.22, 0.2, "sawtooth");
    },
  };

  window.Sound = Sound;
})();
