# MAP_003 — Bioluminescent Caverns — Per-Map Delivery Verification

> Commit: `feat: complete MAP_003 — Bioluminescent Caverns` · Date: 2026-09-18 · Repo: APservice-application/A_Survival · Branch: main

## Checklist (เกณฑ์ส่งมอบต่อแผนที่)

- [x] `MAP_REGISTRY` entry — playable, radius 500, routeId direct, keyArt `manus-storage`
- [x] `client/src/game/data/maps.ts` — resource + monsters (`content.monsters` 3 roles) + eventBoss
- [x] `client/src/game/data/biomeProfiles.ts` — terrain + decorations + treatment (fogColor/skyColor)
- [x] `client/src/game/map3/encounter.ts` — initial/resolve + elite/boss + damage + shelter
- [x] `client/src/game/scene.ts` — branching `isMap003` + elite/boss VFX
- [x] `client/src/game/treatments/*` — map-specific visual treatment if applicable
- [x] `server/mapModules.test.ts` / `server/mapSceneTreatments.test.ts` / `server/map003Encounter.test.ts` — PASS
- [x] `client/public/assets/packs/arcane-frontier-voxel-pixel` — art status tracked (MAP_001 Pollinations provenance, 002–010 starter fallback pending)
- [x] Performance tier — `(2 + tier) suppressed when >4` + `effectiveParticleCount` respected

## Routing & Cache

- `RUNTIME_MAP_IDS` includes `MAP_003` — `GenerationService.isEntryAllowed` gates playable maps only
- PWA: `mapCache.ts` + `sw.js` MAP_CACHE + `manifest.packSha256` for offline

## Commit Message Requirement (todo 70)

This file is added in a dedicated commit whose message contains `MAP_003` — satisfies “commit และ push หลังแผนที่หนึ่งเสร็จตามเกณฑ์ พร้อมข้อความ commit ที่ระบุชื่อแผนที่”

## References

- `GEMINI_MAP_003_GAMEPLAY_ADOPTED.md`
- `client/src/game/data/maps.ts` :: `MAP_003`
- `docs/evidence/10-maps-complete.md`
