/* engine.js — renders the board on a canvas and runs the robot program. */
(function () {
  const DIRS = [
    [0, -1], // up
    [1, 0],  // right
    [0, 1],  // down
    [-1, 0], // left
  ];

  const COLORS = { red: "#e53935", green: "#43c463", yellow: "#fdd835" };

  const PART_ICON = {
    frame: "🟧", wheel: "🛞", body: "🚙", window: "🪟",
    wing: "🪽", engine: "🔧", nose: "🔺", booster: "🔥",
  };
  const PARTS = new Set(Object.keys(PART_ICON));

  const Engine = {
    canvas: null,
    ctx: null,
    level: null,
    robot: null,
    running: false,
    cell: 80,
    ox: 0,
    oy: 0,

    init(canvas) {
      this.canvas = canvas;
      this.ctx = canvas.getContext("2d");
    },

    load(level) {
      this.level = level;
      this.mode = level.kind || "maze";
      const s = level.start || { x: 0, y: 0, dir: 0 };
      this.robot = { x: s.x, y: s.y, dir: s.dir };
      this.led = null;
      this.served = new Set();
      this.built = [];
      this.cargoW = 0;
      this.cargoV = 0;
      if (this.mode !== "build") this._computeLayout();
      this.draw();
    },

    reset() {
      if (!this.level) return;
      const s = this.level.start || { x: 0, y: 0, dir: 0 };
      this.robot = { x: s.x, y: s.y, dir: s.dir };
      this.led = null;
      this.served = new Set();
      this.built = [];
      this.cargoW = 0;
      this.cargoV = 0;
      this.draw();
    },

    _stopKey(s) { return `${s.x},${s.y}`; },

    _computeLayout() {
      const L = this.level;
      const size = this.canvas.width; // square canvas
      this.cell = Math.floor(Math.min(size / L.cols, size / L.rows));
      this.ox = Math.floor((size - this.cell * L.cols) / 2);
      this.oy = Math.floor((size - this.cell * L.rows) / 2);
    },

    _cx(x) { return this.ox + x * this.cell; },
    _cy(y) { return this.oy + y * this.cell; },

    draw() {
      const ctx = this.ctx, L = this.level, c = this.cell;
      ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

      if (this.mode === "build") { this._drawBuild(); return; }

      const bus = this.mode === "bus";
      const ocean = this.mode === "ocean";
      const cargo = this.mode === "cargo";
      // cells
      for (let y = 0; y < L.rows; y++) {
        for (let x = 0; x < L.cols; x++) {
          if (bus) ctx.fillStyle = (x + y) % 2 === 0 ? "#d7d7d7" : "#cccccc";
          else if (ocean) ctx.fillStyle = (x + y) % 2 === 0 ? "#81d4fa" : "#4fc3f7";
          else if (cargo) ctx.fillStyle = (x + y) % 2 === 0 ? "#e0d3c4" : "#d2c2ae";
          else ctx.fillStyle = (x + y) % 2 === 0 ? "#eaf6ff" : "#d8eefc";
          ctx.fillRect(this._cx(x), this._cy(y), c, c);
        }
      }
      // grid lines
      ctx.strokeStyle = "#bfe0f5";
      ctx.lineWidth = 2;
      for (let x = 0; x <= L.cols; x++) {
        ctx.beginPath();
        ctx.moveTo(this._cx(x), this._cy(0));
        ctx.lineTo(this._cx(x), this._cy(L.rows));
        ctx.stroke();
      }
      for (let y = 0; y <= L.rows; y++) {
        ctx.beginPath();
        ctx.moveTo(this._cx(0), this._cy(y));
        ctx.lineTo(this._cx(L.cols), this._cy(y));
        ctx.stroke();
      }

      // walls (buildings in bus mode)
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      L.walls.forEach((w) => {
        ctx.fillStyle = ocean ? "#ef9a9a" : bus || cargo ? "#90a4ae" : "#8d6e63";
        roundRect(ctx, this._cx(w.x) + 4, this._cy(w.y) + 4, c - 8, c - 8, 8);
        ctx.fill();
        ctx.font = `${Math.floor(c * 0.5)}px serif`;
        ctx.fillText(ocean ? "🪸" : cargo ? "🚧" : bus ? "🏢" : "🧱", this._cx(w.x) + c / 2, this._cy(w.y) + c / 2 + 2);
      });

      if (cargo) {
        // pickup sites with weight/value
        (L.sites || []).forEach((s) => {
          const loaded = this.served.has(this._stopKey(s));
          ctx.fillStyle = loaded ? "#c8e6c9" : "#fff9c4";
          ctx.strokeStyle = loaded ? "#43c463" : "#fbc02d";
          ctx.lineWidth = 4;
          roundRect(ctx, this._cx(s.x) + 5, this._cy(s.y) + 5, c - 10, c - 10, 10);
          ctx.fill(); ctx.stroke();
          const cx = this._cx(s.x) + c / 2;
          ctx.fillStyle = "#000";
          ctx.font = `${Math.floor(c * 0.3)}px serif`;
          ctx.fillText(loaded ? "✅" : "📦", cx, this._cy(s.y) + c * 0.32);
          ctx.font = `${Math.floor(c * 0.2)}px sans-serif`;
          ctx.fillText(`💰${s.value}`, cx, this._cy(s.y) + c * 0.6);
          ctx.fillText(`⚖${s.weight}`, cx, this._cy(s.y) + c * 0.82);
        });
        // destination
        ctx.font = `${Math.floor(c * 0.55)}px serif`;
        ctx.fillStyle = "#000";
        ctx.fillText("🏁", this._cx(L.dest.x) + c / 2, this._cy(L.dest.y) + c / 2 + 2);
        this._drawActor("🚚", "#5d4037");
        this._drawCargoHud();
      } else if (ocean) {
        (L.fish || []).forEach((f) => {
          if (this.served.has(this._stopKey(f))) return; // eaten
          ctx.font = `${Math.floor(c * 0.6)}px serif`;
          ctx.fillText("🐟", this._cx(f.x) + c / 2, this._cy(f.y) + c / 2 + 2);
        });
        this._drawActor("🐋", "#0277bd");
      } else if (bus) {
        // bus stops with required colour
        (L.stops || []).forEach((s) => {
          const served = this.served.has(this._stopKey(s));
          ctx.fillStyle = served ? COLORS[s.color] : "#ffffff";
          ctx.strokeStyle = COLORS[s.color];
          ctx.lineWidth = 5;
          roundRect(ctx, this._cx(s.x) + 6, this._cy(s.y) + 6, c - 12, c - 12, 10);
          ctx.fill(); ctx.stroke();
          ctx.font = `${Math.floor(c * 0.45)}px serif`;
          ctx.fillText(served ? "✅" : "🚏", this._cx(s.x) + c / 2, this._cy(s.y) + c / 2 + 2);
        });
        this._drawBus();
      } else {
        // goal flag
        ctx.font = `${Math.floor(c * 0.6)}px serif`;
        ctx.fillText("🚩", this._cx(L.goal.x) + c / 2, this._cy(L.goal.y) + c / 2 + 2);
        this._drawRobot();
      }
    },

    _drawCargoHud() {
      const ctx = this.ctx, W = this.canvas.width, L = this.level;
      ctx.fillStyle = "rgba(0,0,0,0.55)";
      roundRect(ctx, 8, 8, W - 16, 38, 10);
      ctx.fill();
      ctx.fillStyle = "#fff";
      ctx.font = "bold 22px sans-serif";
      ctx.textAlign = "left"; ctx.textBaseline = "middle";
      ctx.fillText(`⚖ ${this.cargoW}/${L.capacity}`, 20, 28);
      ctx.textAlign = "right";
      const enough = this.cargoV >= L.target;
      ctx.fillStyle = enough ? "#9cffb0" : "#fff";
      ctx.fillText(`💰 ${this.cargoV}/${L.target}`, W - 20, 28);
    },

    _drawActor(emoji, color) {
      const ctx = this.ctx, c = this.cell, r = this.robot;
      const px = this._cx(r.x) + c / 2, py = this._cy(r.y) + c / 2;
      const [dx, dy] = DIRS[r.dir];
      ctx.fillStyle = color; ctx.beginPath();
      const a = c * 0.34, ang = Math.atan2(dy, dx), bw = c * 0.15;
      ctx.moveTo(px + dx * a, py + dy * a);
      ctx.lineTo(px + Math.cos(ang + Math.PI / 2) * bw - dx * a * 0.4, py + Math.sin(ang + Math.PI / 2) * bw - dy * a * 0.4);
      ctx.lineTo(px + Math.cos(ang - Math.PI / 2) * bw - dx * a * 0.4, py + Math.sin(ang - Math.PI / 2) * bw - dy * a * 0.4);
      ctx.closePath(); ctx.fill();
      ctx.font = `${Math.floor(c * 0.55)}px serif`;
      ctx.textAlign = "center"; ctx.textBaseline = "middle";
      ctx.fillText(emoji, px, py + 2);
    },

    _drawBus() {
      const ctx = this.ctx, c = this.cell, r = this.robot;
      const px = this._cx(r.x) + c / 2, py = this._cy(r.y) + c / 2;
      // LED sign on top: filled with current colour (grey if off)
      const led = this.led ? COLORS[this.led] : "#9e9e9e";
      ctx.fillStyle = led;
      ctx.beginPath();
      ctx.arc(px, py - c * 0.3, c * 0.12, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "#333"; ctx.lineWidth = 2; ctx.stroke();
      // bus + direction
      const [dx, dy] = DIRS[r.dir];
      ctx.fillStyle = "#ff7043"; ctx.beginPath();
      const a = c * 0.34, ang = Math.atan2(dy, dx), bw = c * 0.14;
      ctx.moveTo(px + dx * a, py + dy * a);
      ctx.lineTo(px + Math.cos(ang + Math.PI / 2) * bw - dx * a * 0.4, py + Math.sin(ang + Math.PI / 2) * bw - dy * a * 0.4);
      ctx.lineTo(px + Math.cos(ang - Math.PI / 2) * bw - dx * a * 0.4, py + Math.sin(ang - Math.PI / 2) * bw - dy * a * 0.4);
      ctx.closePath(); ctx.fill();
      ctx.font = `${Math.floor(c * 0.55)}px serif`;
      ctx.textAlign = "center"; ctx.textBaseline = "middle";
      ctx.fillText("🚌", px, py + 2);
    },

    _drawRobot() {
      const ctx = this.ctx, c = this.cell, r = this.robot;
      const px = this._cx(r.x) + c / 2;
      const py = this._cy(r.y) + c / 2;

      // direction arrow
      const [dx, dy] = DIRS[r.dir];
      ctx.fillStyle = "#ff7043";
      ctx.beginPath();
      const a = c * 0.34;
      const tipx = px + dx * a, tipy = py + dy * a;
      const baseAng = Math.atan2(dy, dx);
      const left = baseAng + Math.PI * 0.5;
      const right = baseAng - Math.PI * 0.5;
      const bw = c * 0.16;
      ctx.moveTo(tipx, tipy);
      ctx.lineTo(px + Math.cos(left) * bw - dx * a * 0.4, py + Math.sin(left) * bw - dy * a * 0.4);
      ctx.lineTo(px + Math.cos(right) * bw - dx * a * 0.4, py + Math.sin(right) * bw - dy * a * 0.4);
      ctx.closePath();
      ctx.fill();

      // robot face
      ctx.font = `${Math.floor(c * 0.55)}px serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("🤖", px, py + 2);
    },

    _drawBuild() {
      const ctx = this.ctx, W = this.canvas.width;
      const t = this.level.target, b = this.built;
      ctx.fillStyle = "#fff8e1";
      ctx.fillRect(0, 0, W, this.canvas.height);
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      const maxN = Math.max(t.length, b.length, 1);
      const pad = 24;
      const box = Math.min(86, Math.floor((W - 2 * pad) / maxN));
      const gap = Math.floor(box * 0.12);

      const drawRow = (arr, cy, colorize) => {
        const totalW = arr.length * box;
        const startX = (W - totalW) / 2;
        for (let i = 0; i < arr.length; i++) {
          const x = startX + i * box;
          let fill = "#ffffff", stroke = "#bdbdbd";
          if (colorize) {
            const ok = i < t.length && arr[i] === t[i];
            fill = ok ? "#c8e6c9" : "#ffcdd2";
            stroke = ok ? "#43c463" : "#e53935";
          }
          ctx.fillStyle = fill; ctx.strokeStyle = stroke; ctx.lineWidth = 4;
          roundRect(ctx, x + gap / 2, cy, box - gap, box - gap, 12);
          ctx.fill(); ctx.stroke();
          ctx.font = `${Math.floor(box * 0.5)}px serif`;
          ctx.fillStyle = "#000";
          ctx.fillText(PART_ICON[arr[i]] || "?", x + box / 2, cy + (box - gap) / 2 + 2);
        }
      };

      // target (goal) row
      ctx.font = `${Math.floor(box * 0.42)}px serif`;
      ctx.fillStyle = "#000";
      ctx.fillText("🎯", W / 2, 36);
      drawRow(t, 56, false);

      // built row
      ctx.font = `${Math.floor(box * 0.42)}px serif`;
      ctx.fillText("🛠️", W / 2, this.canvas.height / 2 + 26);
      drawRow(b, this.canvas.height / 2 + 46, true);
    },

    // Safely evaluate a math expression containing only digits and + - * ( ) spaces.
    _evalExpr(str) {
      if (typeof str !== "string" || !/^[\d\s\+\-\*\(\)]+$/.test(str)) return 1;
      try {
        // eslint-disable-next-line no-new-func
        const result = new Function('"use strict"; return (' + str + ")")();
        if (typeof result !== "number" || !isFinite(result)) return 1;
        return Math.max(1, Math.min(20, Math.floor(result)));
      } catch (e) {
        return 1;
      }
    },

    // program = tree of nodes; expand into primitive commands.
    _flatten(nodes) {
      const out = [];
      const MAX = 500;
      const walk = (list) => {
        for (const n of list) {
          if (out.length > MAX) return;
          if (n.type === "repeat") {
            const count = n.countExpr
              ? this._evalExpr(n.countExpr)
              : Math.max(1, Math.min(20, n.count || 1));
            for (let i = 0; i < count; i++) walk(n.children || []);
          } else {
            out.push(n.type);
          }
        }
      };
      walk(nodes);
      return out;
    },

    run(program, onDone) {
      if (this.running) return;
      const cmds = this._flatten(program);
      this.reset();
      this.running = true;
      let i = 0;

      const bus = this.mode === "bus";
      const build = this.mode === "build";
      const ocean = this.mode === "ocean";
      const cargo = this.mode === "cargo";
      const won = () =>
        build ? this.built.length === this.level.target.length
        : bus ? this.served.size === this.level.stops.length
        : ocean ? this.served.size === this.level.fish.length
        : cargo ? this.robot.x === this.level.dest.x && this.robot.y === this.level.dest.y && this.cargoV >= this.level.target
        : this.robot.x === this.level.goal.x && this.robot.y === this.level.goal.y;
      const endReason = build ? "buildMissed" : bus ? "busMissed" : ocean ? "oceanMissed" : cargo ? "cargoMissed" : "missedGoal";

      const step = () => {
        if (i >= cmds.length) {
          this.running = false;
          onDone(won() ? { win: true } : { win: false, reason: endReason });
          return;
        }
        const cmd = cmds[i++];
        let moved = false;

        if (build && PARTS.has(cmd)) {
          this.built.push(cmd);
        } else if (cargo && cmd === "load") {
          const site = this.level.sites.find(
            (s) => s.x === this.robot.x && s.y === this.robot.y && !this.served.has(this._stopKey(s)));
          if (site) {
            if (this.cargoW + site.weight > this.level.capacity) {
              this.draw();
              this.running = false;
              this._flash("#ff5252");
              onDone({ win: false, reason: "tooHeavy" });
              return;
            }
            this.served.add(this._stopKey(site));
            this.cargoW += site.weight;
            this.cargoV += site.value;
          }
        } else if (cmd === "left") {
          this.robot.dir = (this.robot.dir + 3) % 4;
        } else if (cmd === "right") {
          this.robot.dir = (this.robot.dir + 1) % 4;
        } else if (cmd === "red" || cmd === "green" || cmd === "yellow") {
          this.led = cmd;
        } else if (cmd === "forward") {
          const [dx, dy] = DIRS[this.robot.dir];
          const nx = this.robot.x + dx, ny = this.robot.y + dy;
          if (this._blocked(nx, ny)) {
            this.draw();
            this.running = false;
            this._flash("#ff5252");
            onDone({ win: false, reason: "bumped" });
            return;
          }
          this.robot.x = nx; this.robot.y = ny;
          moved = true;
        }
        this.draw();

        // build: each part must match the target recipe in order
        if (build && PARTS.has(cmd)) {
          const idx = this.built.length - 1;
          if (idx >= this.level.target.length || this.built[idx] !== this.level.target[idx]) {
            this.running = false;
            this._flash("#ff5252");
            onDone({ win: false, reason: "wrongPart" });
            return;
          }
        }

        // ocean: swimming over a fish eats it
        if (ocean && moved) {
          const fish = this.level.fish.find(
            (f) => f.x === this.robot.x && f.y === this.robot.y && !this.served.has(this._stopKey(f)));
          if (fish) { this.served.add(this._stopKey(fish)); this.draw(); }
        }

        // bus: arriving at a stop requires the matching LED colour
        if (bus && moved) {
          const stop = this.level.stops.find(
            (s) => s.x === this.robot.x && s.y === this.robot.y && !this.served.has(this._stopKey(s)));
          if (stop) {
            if (this.led === stop.color) {
              this.served.add(this._stopKey(stop));
              this.draw();
            } else {
              this.running = false;
              this._flash("#ff5252");
              onDone({ win: false, reason: "wrongColor" });
              return;
            }
          }
        }

        if (won()) {
          this.running = false;
          onDone({ win: true });
          return;
        }
        setTimeout(step, 360);
      };

      setTimeout(step, 200);
    },

    _blocked(x, y) {
      const L = this.level;
      if (x < 0 || y < 0 || x >= L.cols || y >= L.rows) return true;
      return L.walls.some((w) => w.x === x && w.y === y);
    },

    _flash(color) {
      const ctx = this.ctx;
      ctx.save();
      ctx.globalAlpha = 0.25;
      ctx.fillStyle = color;
      ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
      ctx.restore();
    },
  };

  function roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }

  window.Engine = Engine;
})();
