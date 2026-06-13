/* editor.js — teacher level editor: paint a maze, pick blocks,
   auto-solve for the target block count, save / export / import. */
(function () {
  const DIRS = [[0, -1], [1, 0], [0, 1], [-1, 0]];

  const Editor = {
    canvas: null,
    ctx: null,
    tool: "wall",
    state: null,
    cell: 80, ox: 0, oy: 0,
    onTest: null, // app sets this to launch a test play

    init(canvas) {
      this.canvas = canvas;
      this.ctx = canvas.getContext("2d");
      canvas.addEventListener("click", (e) => this._onClick(e));
    },

    blank() {
      return {
        id: "c" + Date.now(),
        cols: 5, rows: 5,
        start: null, goal: null, walls: [],
        allowed: ["forward", "left", "right"],
        optimal: 3,
        name: { en: "", "zh-tw": "" },
        goal_text: { en: "", "zh-tw": "" },
        isCustom: true,
      };
    },

    open(level) {
      this.state = level ? JSON.parse(JSON.stringify(level)) : this.blank();
      this.setTool("wall");
      this._stateToForm();
      this._computeLayout();
      this.render();
    },

    setTool(t) {
      this.tool = t;
      document.querySelectorAll(".tool-btn").forEach((b) =>
        b.classList.toggle("active", b.dataset.tool === t));
    },

    /* ---- form <-> state ---- */
    _el(id) { return document.getElementById(id); },

    _stateToForm() {
      const s = this.state;
      this._el("colsInput").value = s.cols;
      this._el("rowsInput").value = s.rows;
      this._el("facingSelect").value = s.start ? s.start.dir : 1;
      this._el("optimalInput").value = s.optimal;
      this._el("allowLeft").checked = s.allowed.includes("left");
      this._el("allowRight").checked = s.allowed.includes("right");
      this._el("allowRepeat").checked = s.allowed.includes("repeat");
      this._el("nameEnInput").value = s.name.en || "";
      this._el("nameZhInput").value = s.name["zh-tw"] || "";
      this._el("goalEnInput").value = s.goal_text.en || "";
      this._el("goalZhInput").value = s.goal_text["zh-tw"] || "";
    },

    _formToState() {
      const s = this.state;
      s.allowed = ["forward"];
      if (this._el("allowLeft").checked) s.allowed.push("left");
      if (this._el("allowRight").checked) s.allowed.push("right");
      if (this._el("allowRepeat").checked) s.allowed.push("repeat");
      s.optimal = Math.max(1, parseInt(this._el("optimalInput").value, 10) || 1);
      s.name.en = this._el("nameEnInput").value.trim();
      s.name["zh-tw"] = this._el("nameZhInput").value.trim();
      s.goal_text.en = this._el("goalEnInput").value.trim();
      s.goal_text["zh-tw"] = this._el("goalZhInput").value.trim();
    },

    setSize(cols, rows) {
      const s = this.state;
      s.cols = Math.max(3, Math.min(8, cols));
      s.rows = Math.max(3, Math.min(8, rows));
      // drop anything now out of bounds
      s.walls = s.walls.filter((w) => w.x < s.cols && w.y < s.rows);
      if (s.start && (s.start.x >= s.cols || s.start.y >= s.rows)) s.start = null;
      if (s.goal && (s.goal.x >= s.cols || s.goal.y >= s.rows)) s.goal = null;
      this._computeLayout();
      this.render();
    },

    setFacing(dir) {
      if (this.state.start) this.state.start.dir = dir;
      this.render();
    },

    /* ---- grid interaction ---- */
    _onClick(e) {
      const rect = this.canvas.getBoundingClientRect();
      const scale = this.canvas.width / rect.width;
      const px = (e.clientX - rect.left) * scale;
      const py = (e.clientY - rect.top) * scale;
      const x = Math.floor((px - this.ox) / this.cell);
      const y = Math.floor((py - this.oy) / this.cell);
      if (x < 0 || y < 0 || x >= this.state.cols || y >= this.state.rows) return;
      this._apply(x, y);
      this.render();
    },

    _isStart(x, y) { const s = this.state.start; return s && s.x === x && s.y === y; },
    _isGoal(x, y) { const g = this.state.goal; return g && g.x === x && g.y === y; },
    _wallIdx(x, y) { return this.state.walls.findIndex((w) => w.x === x && w.y === y); },

    _apply(x, y) {
      const s = this.state;
      const removeWall = () => { const i = this._wallIdx(x, y); if (i > -1) s.walls.splice(i, 1); };
      switch (this.tool) {
        case "start":
          if (this._isGoal(x, y)) s.goal = null;
          removeWall();
          s.start = { x, y, dir: parseInt(this._el("facingSelect").value, 10) };
          break;
        case "goal":
          if (this._isStart(x, y)) s.start = null;
          removeWall();
          s.goal = { x, y };
          break;
        case "wall":
          if (this._isStart(x, y) || this._isGoal(x, y)) return;
          if (this._wallIdx(x, y) > -1) removeWall();
          else s.walls.push({ x, y });
          break;
        case "erase":
          if (this._isStart(x, y)) { s.start = null; break; }
          if (this._isGoal(x, y)) { s.goal = null; break; }
          removeWall();
          break;
      }
    },

    /* ---- auto solver: fewest primitive commands (BFS over x,y,dir) ---- */
    autoSolve() {
      const s = this.state;
      if (!s.start || !s.goal) return null;
      const blocked = (x, y) =>
        x < 0 || y < 0 || x >= s.cols || y >= s.rows || s.walls.some((w) => w.x === x && w.y === y);
      const key = (x, y, d) => `${x},${y},${d}`;
      const startK = key(s.start.x, s.start.y, s.start.dir);
      const seen = new Set([startK]);
      let frontier = [{ x: s.start.x, y: s.start.y, d: s.start.dir, n: 0 }];
      while (frontier.length) {
        const cur = frontier.shift();
        if (cur.x === s.goal.x && cur.y === s.goal.y) return cur.n;
        const nexts = [];
        // turns
        nexts.push({ x: cur.x, y: cur.y, d: (cur.d + 3) % 4, n: cur.n + 1 });
        nexts.push({ x: cur.x, y: cur.y, d: (cur.d + 1) % 4, n: cur.n + 1 });
        // forward
        const [dx, dy] = DIRS[cur.d];
        if (!blocked(cur.x + dx, cur.y + dy))
          nexts.push({ x: cur.x + dx, y: cur.y + dy, d: cur.d, n: cur.n + 1 });
        for (const nx of nexts) {
          const k = key(nx.x, nx.y, nx.d);
          if (!seen.has(k)) { seen.add(k); frontier.push(nx); }
        }
      }
      return null; // unreachable
    },

    /* ---- export the editable level (validated) ---- */
    toLevel() {
      this._formToState();
      const s = this.state;
      if (!s.start || !s.goal) return { error: "needStartGoal" };
      if (!s.name.en && !s.name["zh-tw"]) return { error: "needName" };
      // fill missing language with the other one
      const nm = s.name.en || s.name["zh-tw"];
      const nz = s.name["zh-tw"] || s.name.en;
      const ge = s.goal_text.en || s.goal_text["zh-tw"] || nm;
      const gz = s.goal_text["zh-tw"] || s.goal_text.en || nz;
      return {
        level: {
          id: s.id, isCustom: true,
          cols: s.cols, rows: s.rows,
          start: { ...s.start }, goal: { ...s.goal },
          walls: s.walls.map((w) => ({ x: w.x, y: w.y })),
          allowed: s.allowed.slice(),
          optimal: s.optimal,
          name: { en: nm, "zh-tw": nz },
          goal_text: { en: ge, "zh-tw": gz },
        },
      };
    },

    /* ---- rendering ---- */
    _computeLayout() {
      const s = this.state, size = this.canvas.width;
      this.cell = Math.floor(Math.min(size / s.cols, size / s.rows));
      this.ox = Math.floor((size - this.cell * s.cols) / 2);
      this.oy = Math.floor((size - this.cell * s.rows) / 2);
    },
    _cx(x) { return this.ox + x * this.cell; },
    _cy(y) { return this.oy + y * this.cell; },

    render() {
      const ctx = this.ctx, s = this.state, c = this.cell;
      ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      for (let y = 0; y < s.rows; y++)
        for (let x = 0; x < s.cols; x++) {
          ctx.fillStyle = (x + y) % 2 === 0 ? "#eaf6ff" : "#d8eefc";
          ctx.fillRect(this._cx(x), this._cy(y), c, c);
        }
      ctx.strokeStyle = "#bfe0f5"; ctx.lineWidth = 2;
      for (let x = 0; x <= s.cols; x++) { ctx.beginPath(); ctx.moveTo(this._cx(x), this._cy(0)); ctx.lineTo(this._cx(x), this._cy(s.rows)); ctx.stroke(); }
      for (let y = 0; y <= s.rows; y++) { ctx.beginPath(); ctx.moveTo(this._cx(0), this._cy(y)); ctx.lineTo(this._cx(s.cols), this._cy(y)); ctx.stroke(); }

      ctx.textAlign = "center"; ctx.textBaseline = "middle";
      s.walls.forEach((w) => {
        ctx.fillStyle = "#8d6e63";
        rr(ctx, this._cx(w.x) + 4, this._cy(w.y) + 4, c - 8, c - 8, 8); ctx.fill();
        ctx.font = `${Math.floor(c * 0.5)}px serif`;
        ctx.fillText("🧱", this._cx(w.x) + c / 2, this._cy(w.y) + c / 2 + 2);
      });
      if (s.goal) {
        ctx.font = `${Math.floor(c * 0.6)}px serif`;
        ctx.fillText("🚩", this._cx(s.goal.x) + c / 2, this._cy(s.goal.y) + c / 2 + 2);
      }
      if (s.start) {
        const px = this._cx(s.start.x) + c / 2, py = this._cy(s.start.y) + c / 2;
        const [dx, dy] = DIRS[s.start.dir];
        ctx.fillStyle = "#ff7043"; ctx.beginPath();
        const a = c * 0.34, ang = Math.atan2(dy, dx), bw = c * 0.16;
        ctx.moveTo(px + dx * a, py + dy * a);
        ctx.lineTo(px + Math.cos(ang + Math.PI / 2) * bw - dx * a * 0.4, py + Math.sin(ang + Math.PI / 2) * bw - dy * a * 0.4);
        ctx.lineTo(px + Math.cos(ang - Math.PI / 2) * bw - dx * a * 0.4, py + Math.sin(ang - Math.PI / 2) * bw - dy * a * 0.4);
        ctx.closePath(); ctx.fill();
        ctx.font = `${Math.floor(c * 0.55)}px serif`;
        ctx.fillText("🤖", px, py + 2);
      }
    },
  };

  function rr(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }

  window.Editor = Editor;
})();
