/* blocks.js — the block palette + the program builder (click-to-add).
   Program is a small tree: movement blocks + one level of Repeat. */
(function () {
  const META = {
    forward: { icon: "⬆️", labelKey: "blockForward", cls: "blk-move" },
    left: { icon: "↩️", labelKey: "blockLeft", cls: "blk-turn" },
    right: { icon: "↪️", labelKey: "blockRight", cls: "blk-turn" },
    repeat: { icon: "🔁", labelKey: "blockRepeat", cls: "blk-repeat" },
  };

  const Blocks = {
    program: [],
    activeRepeat: null,
    paletteEl: null,
    programEl: null,
    onChange: null,

    init(paletteEl, programEl, onChange) {
      this.paletteEl = paletteEl;
      this.programEl = programEl;
      this.onChange = onChange || function () {};
    },

    setAllowed(allowed) {
      this.clear();
      this.paletteEl.innerHTML = "";
      allowed.forEach((type) => {
        const m = META[type];
        const btn = document.createElement("button");
        btn.className = `block ${m.cls}`;
        btn.dataset.type = type;
        btn.innerHTML = `<span class="blk-icon">${m.icon}</span><span class="blk-label">${I18N.t(m.labelKey)}</span>`;
        btn.addEventListener("click", () => this.add(type));
        this.paletteEl.appendChild(btn);
      });
    },

    // Re-apply current language without clearing the program.
    relabel() {
      this.paletteEl.querySelectorAll(".block").forEach((btn) => {
        const m = META[btn.dataset.type];
        if (m) btn.querySelector(".blk-label").textContent = I18N.t(m.labelKey);
      });
      this.render();
    },

    add(type) {
      if (type === "repeat") {
        const node = { type: "repeat", count: 2, children: [] };
        this.program.push(node);
        this.activeRepeat = node;
      } else {
        const node = { type };
        if (this.activeRepeat) this.activeRepeat.children.push(node);
        else this.program.push(node);
      }
      this.render();
    },

    clear() {
      this.program = [];
      this.activeRepeat = null;
      this.render();
    },

    getProgram() {
      return this.program;
    },

    count(nodes) {
      nodes = nodes || this.program;
      let n = 0;
      for (const x of nodes) {
        n++;
        if (x.type === "repeat") n += this.count(x.children);
      }
      return n;
    },

    _chip(node, parentList) {
      const m = META[node.type];
      const el = document.createElement("div");
      el.className = `chip ${m.cls}`;
      el.innerHTML = `<span class="blk-icon">${m.icon}</span><span>${I18N.t(m.labelKey)}</span>`;
      const del = document.createElement("button");
      del.className = "chip-x";
      del.textContent = "×";
      del.title = "remove";
      del.addEventListener("click", (e) => {
        e.stopPropagation();
        const i = parentList.indexOf(node);
        if (i > -1) parentList.splice(i, 1);
        this.render();
      });
      el.appendChild(del);
      return el;
    },

    _repeatChip(node) {
      const wrap = document.createElement("div");
      wrap.className = "repeat-block" + (this.activeRepeat === node ? " active" : "");

      const head = document.createElement("div");
      head.className = "repeat-head";
      head.innerHTML = `<span class="blk-icon">🔁</span><span>${I18N.t("blockRepeat")}</span>`;

      const stepper = document.createElement("div");
      stepper.className = "stepper";
      const minus = mkBtn("−", () => { node.count = Math.max(1, node.count - 1); this.render(); });
      const num = document.createElement("span");
      num.className = "step-num";
      num.textContent = node.count;
      const plus = mkBtn("+", () => { node.count = Math.min(10, node.count + 1); this.render(); });
      stepper.append(minus, num, plus);

      const times = document.createElement("span");
      times.className = "times-label";
      times.textContent = I18N.t("blockTimes");

      const del = document.createElement("button");
      del.className = "chip-x";
      del.textContent = "×";
      del.addEventListener("click", (e) => {
        e.stopPropagation();
        const i = this.program.indexOf(node);
        if (i > -1) this.program.splice(i, 1);
        if (this.activeRepeat === node) this.activeRepeat = null;
        this.render();
      });

      head.append(stepper, times, del);
      head.addEventListener("click", () => {
        this.activeRepeat = this.activeRepeat === node ? null : node;
        this.render();
      });

      const body = document.createElement("div");
      body.className = "repeat-body";
      if (node.children.length === 0) {
        const ph = document.createElement("div");
        ph.className = "drop-ph";
        ph.textContent = I18N.t("dropHere");
        body.appendChild(ph);
      } else {
        node.children.forEach((c) => body.appendChild(this._chip(c, node.children)));
      }

      wrap.append(head, body);
      return wrap;
    },

    render() {
      const el = this.programEl;
      el.innerHTML = "";
      if (this.program.length === 0) {
        const ph = document.createElement("div");
        ph.className = "drop-ph big";
        ph.textContent = I18N.t("dropHere");
        el.appendChild(ph);
      } else {
        this.program.forEach((node) => {
          if (node.type === "repeat") el.appendChild(this._repeatChip(node));
          else el.appendChild(this._chip(node, this.program));
        });
      }
      this.onChange(this.count());
    },
  };

  function mkBtn(txt, fn) {
    const b = document.createElement("button");
    b.className = "step-btn";
    b.textContent = txt;
    b.addEventListener("click", (e) => { e.stopPropagation(); fn(); });
    return b;
  }

  window.Blocks = Blocks;
})();
