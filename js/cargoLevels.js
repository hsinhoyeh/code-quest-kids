/* cargoLevels.js — the "Cargo Run" quest pack (the hardest!).
   The truck 🚚 visits sites to pick up goods, each with a WEIGHT and a VALUE.
   The truck has a weight LIMIT, so kids must choose the most valuable load that
   fits, then deliver it to the destination 🏁. An intro to the knapsack problem
   + route planning. kind: "cargo". Direction: 0=up,1=right,2=down,3=left.
   target = the maximum value achievable within the weight limit. */
(function () {
  const CARGO_LEVELS = [
    {
      id: "g1", kind: "cargo", nameKey: "g1", goalKey: "g1goal",
      cols: 5, rows: 3,
      start: { x: 0, y: 1, dir: 1 },
      walls: [],
      sites: [{ x: 2, y: 1, weight: 2, value: 5 }],
      dest: { x: 4, y: 1 },
      capacity: 10, target: 5,
      allowed: ["forward", "load"],
      optimal: 5, // f, f, load, f, f
    },
    {
      id: "g2", kind: "cargo", nameKey: "g2", goalKey: "g2goal",
      cols: 5, rows: 3,
      start: { x: 0, y: 1, dir: 1 },
      walls: [],
      sites: [
        { x: 1, y: 1, weight: 3, value: 4 },
        { x: 3, y: 1, weight: 3, value: 6 },
      ],
      dest: { x: 4, y: 1 },
      capacity: 3, target: 6, // can only carry one — pick the richer good
      allowed: ["forward", "load"],
      optimal: 5, // f, f, f, load, f
    },
    {
      id: "g3", kind: "cargo", nameKey: "g3", goalKey: "g3goal",
      cols: 5, rows: 3,
      start: { x: 0, y: 1, dir: 1 },
      walls: [],
      sites: [
        { x: 1, y: 1, weight: 2, value: 3 },
        { x: 2, y: 1, weight: 2, value: 3 },
        { x: 3, y: 1, weight: 2, value: 4 },
      ],
      dest: { x: 4, y: 1 },
      capacity: 5, target: 7, // two fit; take the 4 + a 3
      allowed: ["forward", "load"],
      optimal: 6,
    },
    {
      id: "g4", kind: "cargo", nameKey: "g4", goalKey: "g4goal",
      cols: 5, rows: 3,
      start: { x: 0, y: 1, dir: 1 },
      walls: [],
      sites: [
        { x: 1, y: 1, weight: 4, value: 5 },
        { x: 2, y: 1, weight: 2, value: 3 },
        { x: 3, y: 1, weight: 2, value: 3 },
      ],
      dest: { x: 4, y: 1 },
      capacity: 4, target: 6, // two light (6) beat one heavy (5)!
      allowed: ["forward", "load"],
      optimal: 6,
    },
    {
      id: "g5", kind: "cargo", nameKey: "g5", goalKey: "g5goal",
      cols: 5, rows: 5,
      start: { x: 0, y: 4, dir: 0 },
      walls: [],
      sites: [
        { x: 0, y: 3, weight: 5, value: 1 }, // heavy decoy — skip it!
        { x: 0, y: 2, weight: 2, value: 4 },
        { x: 2, y: 2, weight: 3, value: 5 },
      ],
      dest: { x: 2, y: 0 },
      capacity: 6, target: 9, // grab the two good ones (w5, v9), skip the decoy
      allowed: ["forward", "left", "right", "load"],
      optimal: 10, // f,f,load, R,f,f,load, L,f,f
    },
    {
      id: "g6", kind: "cargo", nameKey: "g6", goalKey: "g6goal",
      cols: 6, rows: 3,
      start: { x: 0, y: 1, dir: 1 },
      walls: [],
      sites: [
        { x: 1, y: 1, weight: 2, value: 3 },
        { x: 3, y: 1, weight: 2, value: 3 },
      ],
      dest: { x: 5, y: 1 },
      capacity: 4, target: 6, // load both
      allowed: ["forward", "load"],
      optimal: 7, // f,load, f,f,load, f,f
    },
    {
      id: "g7", kind: "cargo", nameKey: "g7", goalKey: "g7goal",
      cols: 5, rows: 3,
      start: { x: 0, y: 1, dir: 1 },
      walls: [],
      sites: [
        { x: 1, y: 1, weight: 3, value: 3 },
        { x: 2, y: 1, weight: 2, value: 5 },
        { x: 3, y: 1, weight: 2, value: 5 },
      ],
      dest: { x: 4, y: 1 },
      capacity: 4, target: 10, // skip the w3 box; take the two v5 boxes
      allowed: ["forward", "load"],
      optimal: 6, // f,f,load, f,load, f
    },
    {
      id: "g8", kind: "cargo", nameKey: "g8", goalKey: "g8goal",
      cols: 5, rows: 3,
      start: { x: 0, y: 1, dir: 1 },
      walls: [],
      sites: [
        { x: 1, y: 1, weight: 5, value: 8 }, // too heavy to ever load
        { x: 2, y: 1, weight: 2, value: 4 },
        { x: 3, y: 1, weight: 2, value: 4 },
      ],
      dest: { x: 4, y: 1 },
      capacity: 4, target: 8, // two light boxes (w4, v8) — the heavy one won't fit
      allowed: ["forward", "load"],
      optimal: 6, // f,f,load, f,load, f
    },
    {
      id: "g9", kind: "cargo", nameKey: "g9", goalKey: "g9goal",
      cols: 5, rows: 5,
      start: { x: 0, y: 4, dir: 1 },
      walls: [],
      sites: [
        { x: 2, y: 4, weight: 2, value: 5 },
        { x: 2, y: 2, weight: 3, value: 6 },
      ],
      dest: { x: 4, y: 2 },
      capacity: 6, target: 11, // both fit (w5)
      allowed: ["forward", "left", "right", "load"],
      optimal: 10, // f,f,load, left, f,f,load, right, f,f
    },
    {
      id: "g10", kind: "cargo", nameKey: "g10", goalKey: "g10goal",
      cols: 6, rows: 3,
      start: { x: 0, y: 1, dir: 1 },
      walls: [],
      sites: [
        { x: 1, y: 1, weight: 3, value: 4 },
        { x: 2, y: 1, weight: 2, value: 5 },
        { x: 3, y: 1, weight: 2, value: 5 },
        { x: 4, y: 1, weight: 3, value: 4 },
      ],
      dest: { x: 5, y: 1 },
      capacity: 4, target: 10, // the two middle v5 boxes
      allowed: ["forward", "load"],
      optimal: 7, // f,f,load, f,load, f,f
    },
    {
      id: "g11", kind: "cargo", nameKey: "g11", goalKey: "g11goal",
      cols: 5, rows: 5,
      start: { x: 0, y: 4, dir: 1 },
      walls: [],
      sites: [
        { x: 2, y: 4, weight: 2, value: 3 }, // tempting but too cheap
        { x: 2, y: 2, weight: 2, value: 5 },
        { x: 2, y: 0, weight: 2, value: 5 },
      ],
      dest: { x: 4, y: 0 },
      capacity: 4, target: 10, // the two v5 boxes up the aisle
      allowed: ["forward", "left", "right", "load"],
      optimal: 12, // f,f, left, f,f,load, f,f,load, right, f,f
    },
    {
      id: "g12", kind: "cargo", nameKey: "g12", goalKey: "g12goal",
      cols: 5, rows: 5,
      start: { x: 0, y: 4, dir: 1 },
      walls: [],
      sites: [
        { x: 2, y: 4, weight: 2, value: 4 },
        { x: 4, y: 2, weight: 2, value: 5 },
        { x: 2, y: 2, weight: 2, value: 5 },
        { x: 0, y: 0, weight: 5, value: 9 }, // heavy decoy — won't fit with the rest
      ],
      dest: { x: 0, y: 2 },
      capacity: 6, target: 14, // the three light boxes (w6, v14)
      allowed: ["forward", "left", "right", "load"],
      optimal: 15, // f,f,load, f,f, left, f,f,load, left, f,f,load, f,f
    },
  ];

  window.CARGO_LEVELS = CARGO_LEVELS;
})();
