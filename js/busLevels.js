/* busLevels.js — the "Bus & Lights" quest pack.
   The bus drives the road; at each stop 🚏 its LED sign must already show the
   stop's colour (🔴🟢🟡) or passengers won't board. Teaches managing state
   (the light) over time, on top of navigation.
   kind: "bus" switches the engine into bus mode.
   Direction: 0=up, 1=right, 2=down, 3=left. Colours: "red"|"green"|"yellow". */
(function () {
  const BUS_LEVELS = [
    {
      id: "b1", kind: "bus", nameKey: "b1", goalKey: "b1goal",
      cols: 5, rows: 3,
      start: { x: 0, y: 1, dir: 1 },
      walls: [],
      stops: [{ x: 4, y: 1, color: "red" }],
      allowed: ["forward", "red", "green", "yellow"],
      optimal: 5, // red, forward ×4
    },
    {
      id: "b2", kind: "bus", nameKey: "b2", goalKey: "b2goal",
      cols: 6, rows: 3,
      start: { x: 0, y: 1, dir: 1 },
      walls: [],
      stops: [
        { x: 2, y: 1, color: "green" },
        { x: 5, y: 1, color: "red" },
      ],
      allowed: ["forward", "red", "green", "yellow"],
      optimal: 7, // green, f, f, red, f, f, f
    },
    {
      id: "b3", kind: "bus", nameKey: "b3", goalKey: "b3goal",
      cols: 5, rows: 5,
      start: { x: 0, y: 4, dir: 0 },
      walls: [],
      stops: [
        { x: 0, y: 1, color: "red" },
        { x: 3, y: 1, color: "green" },
      ],
      allowed: ["forward", "left", "right", "red", "green", "yellow"],
      optimal: 9, // red, f,f,f, right, green, f,f,f
    },
    {
      id: "b4", kind: "bus", nameKey: "b4", goalKey: "b4goal",
      cols: 7, rows: 3,
      start: { x: 0, y: 1, dir: 1 },
      walls: [],
      stops: [
        { x: 2, y: 1, color: "green" },
        { x: 4, y: 1, color: "green" },
        { x: 6, y: 1, color: "green" },
      ],
      allowed: ["forward", "left", "right", "repeat", "red", "green", "yellow"],
      optimal: 4, // green, Repeat 3 [ forward, forward ]
    },
    {
      id: "b5", kind: "bus", nameKey: "b5", goalKey: "b5goal",
      cols: 5, rows: 5,
      start: { x: 0, y: 4, dir: 0 },
      walls: [],
      stops: [
        { x: 0, y: 2, color: "red" },
        { x: 2, y: 2, color: "green" },
        { x: 2, y: 0, color: "yellow" },
      ],
      allowed: ["forward", "left", "right", "red", "green", "yellow"],
      optimal: 11, // red,f,f, right, green,f,f, left, yellow,f,f
    },
    {
      id: "b6", kind: "bus", nameKey: "b6", goalKey: "b6goal",
      cols: 7, rows: 3,
      start: { x: 0, y: 1, dir: 1 },
      walls: [],
      stops: [
        { x: 2, y: 1, color: "red" },
        { x: 4, y: 1, color: "yellow" },
        { x: 6, y: 1, color: "green" },
      ],
      allowed: ["forward", "repeat", "red", "green", "yellow"],
      optimal: 9, // red,f,f, yellow,f,f, green,f,f
    },
    {
      id: "b7", kind: "bus", nameKey: "b7", goalKey: "b7goal",
      cols: 5, rows: 5,
      start: { x: 0, y: 4, dir: 0 },
      walls: [],
      stops: [
        { x: 0, y: 2, color: "red" },
        { x: 2, y: 0, color: "green" },
      ],
      allowed: ["forward", "left", "right", "red", "green", "yellow"],
      optimal: 9, // red,f,f,f,f, right, green,f,f
    },
    {
      id: "b8", kind: "bus", nameKey: "b8", goalKey: "b8goal",
      cols: 8, rows: 3,
      start: { x: 0, y: 1, dir: 1 },
      walls: [],
      stops: [
        { x: 1, y: 1, color: "green" },
        { x: 3, y: 1, color: "green" },
        { x: 5, y: 1, color: "green" },
        { x: 7, y: 1, color: "green" },
      ],
      allowed: ["forward", "repeat", "red", "green", "yellow"],
      optimal: 5, // green, Repeat 3 [ f, f ], f
    },
    {
      id: "b9", kind: "bus", nameKey: "b9", goalKey: "b9goal",
      cols: 5, rows: 5,
      start: { x: 0, y: 4, dir: 1 },
      walls: [],
      stops: [
        { x: 2, y: 4, color: "red" },
        { x: 2, y: 2, color: "green" },
        { x: 4, y: 2, color: "yellow" },
      ],
      allowed: ["forward", "left", "right", "red", "green", "yellow"],
      optimal: 11, // red,f,f, left, green,f,f, right, yellow,f,f
    },
    {
      id: "b10", kind: "bus", nameKey: "b10", goalKey: "b10goal",
      cols: 7, rows: 3,
      start: { x: 0, y: 1, dir: 1 },
      walls: [],
      stops: [
        { x: 2, y: 1, color: "red" },
        { x: 4, y: 1, color: "red" },
        { x: 6, y: 1, color: "green" },
      ],
      allowed: ["forward", "repeat", "red", "green", "yellow"],
      optimal: 7, // red, Repeat 2 [ f, f ], green, f, f
    },
    {
      id: "b11", kind: "bus", nameKey: "b11", goalKey: "b11goal",
      cols: 5, rows: 5,
      start: { x: 0, y: 4, dir: 0 },
      walls: [],
      stops: [
        { x: 0, y: 2, color: "green" },
        { x: 0, y: 0, color: "green" },
        { x: 2, y: 0, color: "red" },
        { x: 4, y: 0, color: "yellow" },
      ],
      allowed: ["forward", "left", "right", "repeat", "red", "green", "yellow"],
      optimal: 11, // green, Repeat 2 [ f, f ], right, red, f, f, yellow, f, f
    },
    {
      id: "b12", kind: "bus", nameKey: "b12", goalKey: "b12goal",
      cols: 5, rows: 5,
      start: { x: 0, y: 4, dir: 1 },
      walls: [],
      stops: [
        { x: 4, y: 4, color: "red" },
        { x: 4, y: 0, color: "green" },
        { x: 0, y: 0, color: "yellow" },
      ],
      allowed: ["forward", "left", "right", "repeat", "red", "green", "yellow"],
      optimal: 11, // red, R4[f], left, green, R4[f], left, yellow, R4[f]
    },
  ];

  window.BUS_LEVELS = BUS_LEVELS;
})();
