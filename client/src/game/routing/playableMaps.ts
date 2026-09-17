// Playable map set — 10 maps as requested by owner (2026-09-17)
// This is the single source of truth for which maps are runtime-allowed
export const PLAYABLE_MAP_IDS = [
  "obsidian-frontier",
  "map-002-ashen-obsidian-plains",
  "map-003-bioluminescent-caverns",
  "map-004-crystalline-spires",
  "map-005-corrosive-acid-swamps",
  "map-006-magnetic-dunes",
  "map-007-frozen-obsidian-crevasses",
  "map-008-ancient-obsidian-ruins",
  "map-009-overgrown-obsidian-jungle",
  "map-010-void-infused-rift",
] as const;

export type PlayableMapId = typeof PLAYABLE_MAP_IDS[number];
export const PLAYABLE_MAP_SET = new Set<string>(PLAYABLE_MAP_IDS as readonly string[]);
