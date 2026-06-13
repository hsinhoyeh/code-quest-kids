/* oceanLevels.js — the "Ocean" quest pack.
   The whale shark 🐋 swims the sea and must eat every fish 🐟 by swimming over
   it. Coral 🪸 blocks the way. Teaches navigation + planning a route that
   visits all targets. kind: "ocean".
   Direction: 0=up, 1=right, 2=down, 3=left. */
(function () {
  const OCEAN_LEVELS = [
    {
      id: "o1", kind: "ocean", nameKey: "o1", goalKey: "o1goal",
      cols: 5, rows: 3,
      start: { x: 0, y: 1, dir: 1 },
      walls: [],
      fish: [{ x: 3, y: 1 }],
      allowed: ["forward"],
      optimal: 3,
    },
    {
      id: "o2", kind: "ocean", nameKey: "o2", goalKey: "o2goal",
      cols: 5, rows: 3,
      start: { x: 0, y: 1, dir: 1 },
      walls: [],
      fish: [{ x: 2, y: 1 }, { x: 4, y: 1 }],
      allowed: ["forward"],
      optimal: 4,
    },
    {
      id: "o3", kind: "ocean", nameKey: "o3", goalKey: "o3goal",
      cols: 5, rows: 5,
      start: { x: 0, y: 4, dir: 0 },
      walls: [{ x: 1, y: 4 }, { x: 1, y: 3 }, { x: 1, y: 2 }],
      fish: [{ x: 0, y: 1 }, { x: 3, y: 1 }],
      allowed: ["forward", "left", "right"],
      optimal: 7,
    },
    {
      id: "o4", kind: "ocean", nameKey: "o4", goalKey: "o4goal",
      cols: 6, rows: 3,
      start: { x: 0, y: 1, dir: 1 },
      walls: [],
      fish: [{ x: 1, y: 1 }, { x: 2, y: 1 }, { x: 3, y: 1 }, { x: 4, y: 1 }, { x: 5, y: 1 }],
      allowed: ["forward", "left", "right", "repeat"],
      optimal: 2, // Repeat 5 [ forward ]
    },
    {
      id: "o5", kind: "ocean", nameKey: "o5", goalKey: "o5goal",
      cols: 5, rows: 5,
      start: { x: 0, y: 4, dir: 0 },
      walls: [],
      fish: [{ x: 0, y: 2 }, { x: 2, y: 2 }, { x: 2, y: 0 }],
      allowed: ["forward", "left", "right"],
      optimal: 8, // f,f, right, f,f, left, f,f
    },
  ];

  window.OCEAN_LEVELS = OCEAN_LEVELS;
})();
