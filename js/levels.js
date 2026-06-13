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
  ];

  window.LEVELS = LEVELS;
})();
