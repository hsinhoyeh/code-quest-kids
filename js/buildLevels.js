/* buildLevels.js — the "Build It!" assemble pack.
   Kids sequence part-blocks to assemble a vehicle. The built sequence must
   match the target recipe in the right order. Teaches sequencing + loops.
   kind: "build". Parts: frame/wheel/body/window/wing/engine/nose/booster. */
(function () {
  const BUILD_LEVELS = [
    {
      id: "v1", kind: "build", nameKey: "v1", goalKey: "v1goal",
      target: ["wheel", "wheel"],
      allowed: ["wheel"],
      optimal: 2,
    },
    {
      id: "v2", kind: "build", nameKey: "v2", goalKey: "v2goal",
      target: ["frame", "wheel", "wheel", "body"],
      allowed: ["frame", "wheel", "body"],
      optimal: 4,
    },
    {
      id: "v3", kind: "build", nameKey: "v3", goalKey: "v3goal",
      target: ["wheel", "wheel", "wheel", "wheel"],
      allowed: ["wheel", "repeat"],
      optimal: 2, // Repeat 4 [ wheel ]
    },
    {
      id: "v4", kind: "build", nameKey: "v4", goalKey: "v4goal",
      target: ["frame", "wing", "wing", "body", "window"],
      allowed: ["frame", "wing", "body", "window"],
      optimal: 5,
    },
    {
      id: "v5", kind: "build", nameKey: "v5", goalKey: "v5goal",
      target: ["frame", "booster", "booster", "body", "nose"],
      allowed: ["frame", "booster", "body", "nose", "repeat"],
      optimal: 5, // frame, Repeat 2 [ booster ], body, nose
    },
    {
      id: "v6", kind: "build", nameKey: "v6", goalKey: "v6goal",
      target: ["frame", "wheel", "wheel", "wheel", "wheel", "body"],
      allowed: ["frame", "wheel", "body", "repeat"],
      optimal: 4, // frame, Repeat 4 [ wheel ], body
    },
    {
      id: "v7", kind: "build", nameKey: "v7", goalKey: "v7goal",
      target: ["body", "body", "body", "body", "body", "body"],
      allowed: ["body", "repeat"],
      optimal: 2, // Repeat 6 [ body ]
    },
    {
      id: "v8", kind: "build", nameKey: "v8", goalKey: "v8goal",
      target: ["frame", "wheel", "wheel", "body", "window", "window"],
      allowed: ["frame", "wheel", "body", "window", "repeat"],
      optimal: 6, // frame, Repeat 2 [ wheel ], body, Repeat 2 [ window ]
    },
    {
      id: "v9", kind: "build", nameKey: "v9", goalKey: "v9goal",
      target: ["frame", "wing", "wing", "wing", "wing", "body", "window", "nose"],
      allowed: ["frame", "wing", "body", "window", "nose", "repeat"],
      optimal: 6, // frame, Repeat 4 [ wing ], body, window, nose
    },
    {
      id: "v10", kind: "build", nameKey: "v10", goalKey: "v10goal",
      target: ["frame", "booster", "booster", "booster", "body", "nose"],
      allowed: ["frame", "booster", "body", "nose", "repeat"],
      optimal: 5, // frame, Repeat 3 [ booster ], body, nose
    },
    {
      id: "v11", kind: "build", nameKey: "v11", goalKey: "v11goal",
      target: ["frame", "wheel", "wheel", "wheel", "wheel", "wheel", "wheel", "body", "window"],
      allowed: ["frame", "wheel", "body", "window", "repeat"],
      optimal: 5, // frame, Repeat 6 [ wheel ], body, window
    },
    {
      id: "v12", kind: "build", nameKey: "v12", goalKey: "v12goal",
      target: ["frame", "booster", "booster", "body", "window", "window", "window", "wing", "wing", "nose"],
      allowed: ["frame", "booster", "body", "window", "wing", "nose", "repeat"],
      optimal: 9, // frame, R2[booster], body, R3[window], R2[wing], nose
    },
  ];

  window.BUILD_LEVELS = BUILD_LEVELS;
})();
