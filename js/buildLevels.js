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
  ];

  window.BUILD_LEVELS = BUILD_LEVELS;
})();
