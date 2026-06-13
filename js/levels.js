/* levels.js — quest definitions.
   Grid coords: x = column (0 = left), y = row (0 = top).
   Direction: 0=up, 1=right, 2=down, 3=left.
   "optimal" = fewest blocks for 3 stars (a repeat block counts its
   children only once, so loops are rewarded). */
(function () {
  const LEVELS = [
    {
      id: 1, nameKey: "lvl1", goalKey: "lvl1goal",
      cols: 5, rows: 5,
      start: { x: 0, y: 2, dir: 1 },
      goal: { x: 3, y: 2 },
      walls: [],
      allowed: ["forward"],
      optimal: 3,
    },
    {
      id: 2, nameKey: "lvl2", goalKey: "lvl2goal",
      cols: 5, rows: 5,
      start: { x: 0, y: 0, dir: 2 },
      goal: { x: 3, y: 0 },
      walls: [],
      allowed: ["forward", "left", "right"],
      optimal: 4,
    },
    {
      id: 3, nameKey: "lvl3", goalKey: "lvl3goal",
      cols: 5, rows: 5,
      start: { x: 0, y: 4, dir: 0 },
      goal: { x: 3, y: 1 },
      walls: [{ x: 1, y: 4 }, { x: 1, y: 3 }, { x: 1, y: 2 }],
      allowed: ["forward", "left", "right"],
      optimal: 7,
    },
    {
      id: 4, nameKey: "lvl4", goalKey: "lvl4goal",
      cols: 5, rows: 5,
      start: { x: 0, y: 4, dir: 0 },
      goal: { x: 2, y: 1 },
      walls: [
        { x: 0, y: 2 }, { x: 0, y: 1 }, { x: 0, y: 0 },
        { x: 1, y: 4 }, { x: 1, y: 1 }, { x: 1, y: 0 },
        { x: 2, y: 3 }, { x: 3, y: 1 }, { x: 4, y: 1 },
      ],
      allowed: ["forward", "left", "right"],
      optimal: 9,
    },
    {
      id: 5, nameKey: "lvl5", goalKey: "lvl5goal",
      cols: 6, rows: 3,
      start: { x: 0, y: 1, dir: 1 },
      goal: { x: 5, y: 1 },
      walls: [],
      allowed: ["forward", "left", "right", "repeat"],
      optimal: 2, // Repeat 5 [ forward ]
    },
    {
      id: 6, nameKey: "lvl6", goalKey: "lvl6goal",
      cols: 5, rows: 5,
      start: { x: 0, y: 4, dir: 0 },
      goal: { x: 3, y: 1 },
      walls: [],
      allowed: ["forward", "left", "right", "repeat"],
      optimal: 5, // Repeat 3 [ forward, turnRight, forward, turnLeft ]
    },

    /* ---- Advanced (ages ~8–10) ---- */
    {
      id: 7, nameKey: "lvl7", goalKey: "lvl7goal",
      cols: 6, rows: 6,
      start: { x: 0, y: 5, dir: 0 },
      goal: { x: 5, y: 0 },
      walls: [],
      allowed: ["forward", "left", "right", "repeat"],
      optimal: 5, // Repeat5[fwd], right, Repeat5[fwd]
    },
    {
      id: 8, nameKey: "lvl8", goalKey: "lvl8goal",
      cols: 6, rows: 6,
      start: { x: 0, y: 5, dir: 0 },
      goal: { x: 4, y: 5 },
      walls: [{ x: 2, y: 5 }, { x: 2, y: 4 }, { x: 2, y: 3 }, { x: 2, y: 2 }],
      allowed: ["forward", "left", "right", "repeat"],
      optimal: 8, // Repeat4[fwd], right, Repeat4[fwd], right, Repeat4[fwd]
    },
    {
      id: 9, nameKey: "lvl9", goalKey: "lvl9goal",
      cols: 6, rows: 6,
      start: { x: 0, y: 0, dir: 2 },
      goal: { x: 5, y: 5 },
      walls: [],
      allowed: ["forward", "left", "right", "repeat"],
      optimal: 5, // Repeat5[ fwd, turnLeft, fwd, turnRight ]
    },
    {
      id: 10, nameKey: "lvl10", goalKey: "lvl10goal",
      cols: 7, rows: 7,
      start: { x: 0, y: 6, dir: 0 },
      goal: { x: 6, y: 6 },
      walls: [{ x: 1, y: 6 }, { x: 2, y: 6 }, { x: 3, y: 6 }, { x: 4, y: 6 }, { x: 5, y: 6 }],
      allowed: ["forward", "left", "right", "repeat"],
      optimal: 8, // Repeat6[fwd], right, Repeat6[fwd], right, Repeat6[fwd]
    },

    /* ---- Math levels (~age 8–10): introduces math expressions in Repeat ---- */
    {
      id: 11, nameKey: "lvl11", goalKey: "lvl11goal",
      cols: 7, rows: 7,
      start: { x: 0, y: 6, dir: 1 }, // bottom-left, facing right
      goal:  { x: 6, y: 0 },          // top-right
      // Two horizontal barriers (gap only at x=3) force path: right 3 → up 6 → right 3
      // Hint: 3 = 1+2  and  6 = 3+3
      walls: [
        {x:0,y:5},{x:1,y:5},{x:2,y:5},{x:4,y:5},{x:5,y:5},{x:6,y:5},
        {x:0,y:1},{x:1,y:1},{x:2,y:1},{x:4,y:1},{x:5,y:1},{x:6,y:1},
      ],
      allowed: ["forward", "left", "right", "repeat"],
      optimal: 8, // repeat(3)[fwd] + left + repeat(6)[fwd] + right + repeat(3)[fwd]
    },
    {
      id: 12, nameKey: "lvl12", goalKey: "lvl12goal",
      cols: 8, rows: 8,
      start: { x: 0, y: 7, dir: 1 }, // bottom-left, facing right
      goal:  { x: 7, y: 1 },          // near top-right
      // Horizontal barrier at y=4 (gap at x=6) + right-column wall force: right 6 → up 6 → right 1
      // Hint: 6 = 2×3
      walls: [
        {x:0,y:4},{x:1,y:4},{x:2,y:4},{x:3,y:4},{x:4,y:4},{x:5,y:4},
        {x:7,y:2},{x:7,y:3},{x:7,y:4},{x:7,y:5},{x:7,y:6},{x:7,y:7},
      ],
      allowed: ["forward", "left", "right", "repeat"],
      optimal: 7, // repeat(6)[fwd] + left + repeat(6)[fwd] + right + forward
    },
  ];

  window.LEVELS = LEVELS;
})();
