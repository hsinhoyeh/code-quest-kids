# 🤖 Code Quest Kids

A Scratch-style **visual programming game** for young coders (age 6–10). Tap
colourful blocks to build a program, guide your robot, earn ⭐ for clever
solutions, and climb the 🏆 leaderboard.

Bilingual out of the box: **English** + **繁體中文 (zh-TW)** with 注音 (zhuyin /
bopomofo) annotations on every Chinese character. 100% static — no build step,
no backend — deploys straight to **GitHub Pages**.

> 程式冒險小高手 — 給 6–10 歲小朋友的視覺化程式遊戲。點積木、組程式、帶機器人
> 闖五大主題關卡，拿星星、上排行榜！支援中英雙語加注音，純靜態網頁。

**Live site:** https://hsinhoyeh.github.io/code-quest-kids/

---

## 🎮 Game packs

### 🤖 Maze Quest (12 levels · age 6–10)
Tap `Move forward`, `Turn left`, `Turn right`, and `Repeat` blocks to guide the
robot to the 🚩 flag. Fewer blocks = more ⭐. Levels 1–6 (~age 6–8) introduce
sequencing, turning, and loops. Levels 7–10 (~age 8–10) add longer paths and
multi-step planning. Levels 11–12 introduce **math expressions** inside the
Repeat block (`2+3`, `2×3`) — tap the `fx` button to switch from a plain number
to a mini expression pad.

| Level | Concept |
|-------|---------|
| 1 First Steps | Sequencing |
| 2 Turn Around | Directions & turning |
| 3 The Corner | Combining moves + turns |
| 4 Zig Zag | Longer sequences |
| 5 Loop Power | **Repeat** block |
| 6 The Spiral | Loops + turns (decomposition) |
| 7 Crossroads | 6×6 grid, multi-turn planning |
| 8 The Wall | Navigating around barriers |
| 9 Staircase | Diagonal path with loops |
| 10 Big U-Turn | 7×7 grid, full-path planning |
| 11 Math Gateway | Double barrier — use `1+2` and `3+3` in Repeat |
| 12 Multiply Express | Long corridors — use `2×3` in Repeat |

### 🚌 Bus & Lights (5 levels)
Drive the bus to pick up passengers and match the LED light color at each stop.
Introduces **conditional-style** thinking: red / green / yellow commands
alongside movement.

### 🛠️ Build It! (5 levels)
Assemble a **car → airplane → rocket** by placing parts in the correct order.
Teaches sequencing in a construction context: body before windows, wings before
nose, etc.

### 🐋 Ocean (5 levels)
Guide a whale shark through the ocean, collecting fish. Combines movement with
resource-gathering — eat all the fish to win.

### 🚚 Cargo Run (5 levels)
Visit sites to pick up goods, each with a **weight** and a **value**. Deliver to
the destination without exceeding the weight limit while maximising total value —
an age-appropriate introduction to the **knapsack problem**.

---

## ⭐ Scoring

Stars are awarded per level based on how efficiently you solved it:

- **⭐⭐⭐** — matched (or beat) the optimal block count
- **⭐⭐** — within +2 blocks of optimal
- **⭐** — solved it! (any number of blocks)

Every level shows an **objective banner** before you start so the goal and
constraints are crystal clear.

---

## 👥 Multi-player

Multiple kids can play on the same device, each with their own progress and
leaderboard entry.

- **👤 Player pill in the top bar** — always visible. Tap it at any time (menu,
  mid-level, editor) to see all players and switch instantly.
- **"Pass to friend 👤" on the win screen** — appears after every win; one tap
  closes the win modal and opens the player switcher for a smooth handoff.
- **Add a player** — type a name and press "Add & start fresh"; each new player
  starts from level 1 with zero scores.
- **Delete a player** — tap × next to any name in the players panel.
- All progress is stored in `localStorage` per device — no accounts, no network,
  completely kid-safe.

---

## 🎓 Teacher features

- **Level editor** — draw a custom maze, set allowed blocks, name it in both
  languages, test it, save it, and export/import as JSON.
- Levels are localStorage-persisted per device; no accounts, no data collection —
  kid-safe by design.

---

## 🚀 Run locally

```bash
python3 -m http.server 8000
# open http://localhost:8000
```

Any static web server works. Opening `index.html` directly also works in most
browsers.

---

## 🌐 Deploy to GitHub Pages

**Included GitHub Actions workflow** pushes the site on every commit to `master`:

```
.github/workflows/deploy.yml
```

In your repo: **Settings → Pages → Build and deployment → Source: GitHub
Actions**. The site goes live at `https://<username>.github.io/code-quest-kids/`.

---

## 🧩 Project structure

```
index.html              # markup, screens, modals
css/style.css           # playful, big-tap-target styling
js/zhuyin.js            # bopomofo dictionary + annotation engine
js/i18n.js              # EN / 繁中 strings + language switch
js/sound.js             # Web Audio synth (win fanfare, error tone)
js/levels.js            # Maze pack (12 levels, incl. math expression levels)
js/busLevels.js         # Bus & Lights pack (5 levels)
js/buildLevels.js       # Build It! pack (5 levels)
js/oceanLevels.js       # Ocean pack (5 levels)
js/cargoLevels.js       # Cargo Run pack (5 levels)
js/engine.js            # canvas rendering + program execution
js/blocks.js            # block palette + click-to-add program builder
js/leaderboard.js       # localStorage scores & progress
js/app.js               # screens, scoring, modals, leaderboard glue
js/editor.js            # teacher level editor
```

---

## 🌍 Going global (shared leaderboard)

The leaderboard is **per-device** by design. To share scores across players,
replace the read/write functions in `js/leaderboard.js` with `fetch()` calls to
a key-value backend (Cloudflare Workers + KV, Supabase, jsonbin, etc.). The
`record()` / `leaderboard()` interface stays the same — nothing else changes.

---

Made with ❤️ for young coders.
