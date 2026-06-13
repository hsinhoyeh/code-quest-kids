# 🤖 Code Quest Kids

A Scratch-style **visual programming game** for young coders (~age 8). Kids tap
colourful blocks to build a program, run their robot through maze quests, earn
⭐ for clever solutions, and climb the 🏆 leaderboard.

Bilingual out of the box: **English** + **繁體中文 (zh-TW)**. 100% static — no
build step, no backend — so it deploys straight to **GitHub Pages**.

> 程式冒險小高手 — 一款給 8 歲小朋友的視覺化程式遊戲。點積木、組程式、帶機器人
> 闖關，拿星星、上排行榜！支援中英文，純靜態網頁，可直接放到 GitHub Pages。

---

## 🎮 How it plays

1. **Tap blocks** (`Move forward`, `Turn left`, `Turn right`, `Repeat`) to build a program.
2. Press **▶ Run** to send the robot through the maze.
3. Reach the **🚩 goal** to win the quest.
4. Solve it with **fewer blocks** to earn more ⭐ (this rewards *loops* and efficient thinking).

### Learning progression (designed as a teacher, not just a game)

| Quest | Concept introduced |
|------|--------------------|
| 1 First Steps | Sequencing — one command after another |
| 2 Turn Around | Direction & turning |
| 3 The Corner | Combining moves + turns into a plan |
| 4 Zig Zag | Longer sequences, reading a path |
| 5 Loop Power | **Repeat** — doing the same thing many times |
| 6 The Spiral | Loops **+** turns together (decomposition) |

Stars: `3⭐` if you match the optimal block count, `2⭐` within +2, otherwise `1⭐`.

---

## 🚀 Run locally

It's just static files — any web server works:

```bash
# from this folder
python3 -m http.server 8000
# then open http://localhost:8000
```

(Opening `index.html` directly also works, but a server avoids browser quirks.)

---

## 🌐 Deploy to GitHub Pages

**Option A — GitHub Actions (included).** Push to `main`; the workflow in
`.github/workflows/deploy.yml` publishes the site. In your repo: **Settings →
Pages → Build and deployment → Source: GitHub Actions**.

**Option B — Branch deploy.** **Settings → Pages → Source: Deploy from a branch
→ `main` / root**. Done.

Your game will be live at `https://<username>.github.io/<repo>/`.

---

## 🧩 Project structure

```
index.html          # markup + screens + modals
css/style.css       # playful, big-tap-target styling
js/i18n.js          # EN / 繁中 strings + language switch
js/levels.js        # quest definitions (grid, walls, goal, optimal blocks)
js/engine.js        # canvas rendering + program execution
js/blocks.js        # block palette + click-to-add program builder
js/leaderboard.js   # localStorage scores & progress (per device)
js/app.js           # glue: screens, scoring, modals, leaderboard
```

### Add your own quest

Append an entry to `js/levels.js` and a name/goal string to **both** languages in
`js/i18n.js` (`lvlN` / `lvlNgoal`). Directions: `0=up, 1=right, 2=down, 3=left`.

```js
{ id: 7, nameKey: "lvl7", goalKey: "lvl7goal",
  cols: 6, rows: 6,
  start: { x: 0, y: 5, dir: 0 },
  goal:  { x: 5, y: 0 },
  walls: [{ x: 2, y: 3 }],
  allowed: ["forward", "left", "right", "repeat"],
  optimal: 8 }
```

### Add another language

Add a key (e.g. `"ja"`) to the `STRINGS` object in `js/i18n.js` and a matching
`<button class="lang-btn" data-lang="ja">…</button>` in `index.html`.

---

## 🌍 Going global (shared leaderboard)

The leaderboard is **per-device** (`localStorage`) by design — no accounts, no
data collection, kid-safe. To make it shared across players, replace the read/
write functions in `js/leaderboard.js` with `fetch()` calls to a tiny free
key-value backend (e.g. a Cloudflare Worker + KV, Supabase, or jsonbin). Keep
the same `record()` / `leaderboard()` interface and the rest of the app is
unchanged.

---

Made with ❤️ for young coders.
