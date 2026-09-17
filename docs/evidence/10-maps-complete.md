# 10-Maps Complete Evidence — Arcane Frontier Survival (100.10.0.0)

> วันที่: 2026-09-18 (Asia/Bangkok)  
> Branch: `main` · Repo: `APservice-application/A_Survival`  
> Scope: 10 แผนที่แรก `MAP_001–MAP_010` เป็น playable prototype ตาม `MASTER_EXECUTION_PLAN_10MAPS_FULLSYSTEM.md` (ค้างที่ 10 ตามคำสั่งผู้ใช้ “เอาแค่ 10 แผนที่ก่อน”)

---

## 1) Version & Build

- `client/src/game/version.ts` → `GAME_VERSION="100.10.0.0"` (`100` major, `10` maps/systems, `0` patch, `0` event) — ตาม `VERSION_POLICY` ในไฟล์เดียวกัน
- `formatVersionLabel` → `Build 100.10.0.0`
- `pnpm check` (`tsc --noEmit`): **PASS**
- `pnpm test --run`: **129 files / 570 tests PASS** (จากเดิม 128/561 + `phase7RelationshipInvariant.test.ts` 9 tests)
- `pnpm build` (Vite + tRPC) ใช้ `NODE_OPTIONS=--max-old-space-size=1536` เมื่อต้องการ — ตรวจก่อน push ทุกเฟส

---

## 2) 10 Maps Playable Set (RUNTIME)

### Routing & Registry

- `client/src/game/routing/directRoute.ts` — `RUNTIME_MAP_ID = PLAYABLE_MAP_IDS[0]`, `RUNTIME_MAP_IDS = PLAYABLE_MAP_IDS` (10), `isRuntimeMapAllowed` เช็ค `PLAYABLE_MAP_SET` (10 ตัว), `resolveDirectMapId` fallback กลับ `obsidian-frontier` เมื่อขอ map นอกเซ็ต
- `client/src/game/routing/playableMaps.ts` — `PLAYABLE_MAP_IDS` 10 ตัว (001–010) `status: prototype`, `radiusMeters: 500`
- `client/src/game/data/maps.ts` — `MAP_REGISTRY` 100 entries โดย 15 แรก `prototype` + 85 `planned`; 10 แรก `keyArt` เป็น Pollinations URL หรือ `/manus-storage/` + `radius 500` + `accent`/`biome` ครบ, `content.monsters` ครบ `regular/elite/event-boss` ต่อแผนที่
- Tests: `server/mapModules.test.ts` (3), `server/directRoute.test.ts` (2), `server/phase7RelationshipInvariant.test.ts` scene-cache eligibility

### Loading & Cache (Offline-first)

- `client/src/pages/ArcaneFrontier.tsx` `LoadingGate` — `variant.kind` ตามปลายทาง (`lobby`/`home`/`map-observatory`/`biome`), `data-destination-type`, `data-reduced-motion`, `accent` ต่อ map, progress ผูกกับ `transition.progress`
- `client/src/game/storage/mapCache.ts` + `client/src/game/storage/indexedDb.ts` — Dexie `arcane-frontier-offline-v1` (`profiles`/`transactions`/`mapStates`), `OFFLINE_QUEUE_LIMIT 1000`, `vectorClock` (`incrementVectorClock`/`mergeVectorClocks`/`compareVectorClocks`/`reconcileOfflineVectorClock`), `saveOfflineMapState` บล็อก `!isRuntimeMapAllowed` พร้อม Thai error
- `client/public/manifest.webmanifest` + `client/public/sw.js` — `shell`/`map`/`asset`/`runtime` caches + `warmAssetPack`, `beforeinstallprompt` handling
- Tests: `server/loadingVariant.test.ts` (2), `server/vectorClock.test.ts` (4), `server/mapCache` (ผ่าน `mapCache` storage — ดู `indexedDb`)

### Scene Content — MAP_001–MAP_010 (Deterministic)

| Map | Biome | Elite | Event Boss | Encounter | Props | Asset Pack | Provenance |
|-----|-------|-------|------------|-----------|-------|------------|------------|
| MAP_001 Obsidian Frontier | volcanic glass | Obsidian Golem | Void Reaper | Distress Pod + Koral | monolith/distressPod | `textures/entities/*` + `art.obsidian/*` | drop/harvest |
| MAP_002 Ashen Obsidian Plains | ash storm | Shell Golem | Pyroclastic Behemoth | Ash Storm + Altar | jax/camp/altar | starter | drop |
| MAP_003 Bioluminescent Caverns | void/fungal | Luminous Stalker | Mycelium Empress | Spore Bloom | lyra/shrine | starter | drop/harvest |
| MAP_004 Crystalline Spires | crystal | Prism Golem | Resonance Archon | Reflection Laser Field | zephyr/dais | starter | drop |
| MAP_005 Corrosive Acid Swamps | swamp | Mire Lurker | Toxic Hydra | Acid Drizzle shelter | vane/hydraNest | starter | drop |
| MAP_006 Magnetic Dunes | arch | Ironclad Golem | Lodestone Colossus | Magnetic Storm safe-zone | stabilizer/colossusCore | starter | drop |
| MAP_007 Frozen Crevasses | crevasse | Cryo Beast | Glacial Terror | Blizzard/steam vent | frost/terrorRift | starter | drop |
| MAP_008 Ancient Ruins | ruin | Ruin Guardian | Matrix Overlord | Defense Sweep / Rune Terminal | kael/matrixCore | starter | drop |
| MAP_009 Overgrown Jungle | canopy | Thornback | Verdant Hive Mind | Toxic Downpour canopy | iris/hiveRoot | starter | drop |
| MAP_010 Void Rift | rift | Rift Horror | Void Singularity | void-rift safe-zone | voidWanderer/singularityGate | starter | drop |

- Scene code: `client/src/game/scene.ts` — `isMap002..010` branching, `biomeResourceMeshes`, `biomeDressing`, `landmark` per `getMapSceneTreatment`, `heroArt`/`petArt` via `loadPackModel`, elite/boss pulsing `!reducedMotion`, `distressPod`/`monolith`/`elite` enable logic, `treasure`/`resource` harvest `provenanceType: harvest/drop`, `blockAction` `drop` provenance
- Encounter modules: `client/src/game/map002/encounter.ts` … `map010/encounter.ts` — `initial*` + `resolve*` deterministic, `stormActive`/`bloomActive`/`laserActive`/`drizzleActive`/`sheltered`/`protectedByPylon`, `spawn*` capped, `healPerSecond`/`damagePerSecond` balanced
- Treatment & Biome: `client/src/game/data/mapSceneTreatments.ts` + `client/src/game/data/biomeProfiles.ts` — `fogColor/skyColor/lightColor/lightIntensity/fogDensity` ต่อ map, `terrainAssetIds` + `decorations`
- Map tests: `server/map001Encounter.test.ts` (4) … `server/map015Encounter.test.ts` (2) ครอบ 15, `server/mapSceneTreatments.test.ts` (2)

---

## 3) Core & Survival Loop Hardening

- **Landing PWA**: `beforeinstallprompt` → `deferredInstallPrompt` + `isInstallable` + `landing-actions` CTA `ติดตั้งเป็นแอป` (Download icon) / `เพิ่มไปยังหน้าจอหลัก` toast + `appinstalled` reset — ทดสอบด้วย `pnpm check`
- **Lobby cinematic**: `ShopSheet`/`WardrobeSheet` อ่าน `ALL_ITEMS` จริง + `TIER_RULES` pricing + `vaultEquipment` equip, version `Build 100.10.0.0`, weekly event panel
- **Item detail honesty**: `client/src/game/systems/itemDetailSystem.ts` — `attack-damage` คง `available:false` + `reason: ItemDefinition ปัจจุบันยังไม่มี field เจ้าของค่าความเสียหาย`, เพิ่ม `weapon-tradeoff` (`sword: ประชิดหนัก·ชาร์จช้า·ดาเมจสูง`, `bow: ไกลแม่น·คริติคอลตามระยะ·กระสุนจำกัด`, `ranged: พลังงาน·ร้อนสะสม·คูลดาวน์`)
- **Survival systems**: Player walk/run/dash/health (stamina `canSpendStamina`/`spendStamina`), Enemy detect/attack/drop (per-biome roster), Inventory 40 slots / 64 stack (`addItemToContainer` + overflow + non-stackable), Building modular place/rotate/move/recall (`homeSystemV2`), Farm seed→sprout→young→mature + harvest (`worldFarmSystem` + `worldFarmingSystem`), Touch joystick + ATTACK/DASH/USE + hotbar 2-step — ทั้งหมดมี `pnpm test` ครอบ
- **VFX density**: `client/src/game/systems/performanceProfile.ts` — `EFFECT_INTENSITIES` + `EFFECT_INTENSITY_FACTOR` (0.45/0.75/1), `normalizeEffectIntensity`, `getEffectiveParticleCount` (clamp 12), `client/src/game/scene.ts` `activeEffectIntensity` + `effectiveParticleCount` ใน `ground.metadata` + `GameCanvas` `effectIntensity` prop + `ArcaneFrontier` `settings.effectIntensity` → `data-effect-intensity`
- **Performance & Mobile**: `quality`/`effectIntensity`/`shadowQuality` (via `performanceTier`), `musicVolume`/`sfxVolume`, `reducedMotion`, `touchPreference`/`touchScale`/`touchOpacity`, `renderDistance`/`viewDistanceBlocks`/`targetFps`/`cameraMode` — ตั้งค่าครบใน `session.ts` + UI `ArcaneFrontier.tsx` + scene `reducedMotion` guards (bob/gait/pulse)

---

## 4) Data, Offline, Provenance, PWA

- **DB/tRPC**: `drizzle/schema.ts` + `server/routers.ts`/`db.ts` — profile/save/inventory/provenance, `vectorClock` json, `pendingActions` queue
- **Sync queue + vector clock + background sync**: `indexedDb.ts` (`profiles`/`transactions`/`mapStates`), `vectorClock.ts`, `syncVector.ts` — `incrementVectorClock`/`mergeVectorClocks`/`compareVectorClocks`, `OFFLINE_QUEUE_LIMIT`, `isSafeQuestRewardPendingAction` gate
- **Provenance**: `drop/craft/harvest/reward/starter` ตรวจทุกจุด (`createStarterInstance` with provenance, `onReward` with `provenanceType`, `questRewardDispatchSystem`, `integrity` quarantine)
- **PWA**: `manifest.webmanifest` (name/theme/background/display standalone, icons) + `sw.js` (shell/map/asset/runtime, `warmAssetPack`, `offline` cache)
- **Integrity**: `integrityVerdict`, `quarantine banner`, `vaultActions` (`VaultSheet` blocks quarantined instance, `equip` fails closed), `gameIntegrity` tests

---

## 5) Visual & Art Direction (Stylized Low-Res Fantasy-Sci-Fi Pixel)

- **Design bible**: `GEMINI_ADOPTED_PLAN.md` (IndexedDB/transactional, PWA cache-first, passwordless Player ID, 100-map module contract, cinematic hub, 3/4 top-down, soft modern pixel), `MAP_001_010_BRIEF.md` per-map brief, `GEMINI_MAP*_ADOPTED.md` (001–010) — `designSource: google-gemini-brief` ใน `client/public/assets/packs/arcane-frontier-voxel-pixel/manifest.json`
- **Art pack**: `arcane-frontier-voxel-pixel` v0.3.0 — `logicalResolution 480×270`, `tileSize 16`, `textureSampling nearest`, entries `entities.survivor/companion/enemy/elite/boss/resource`, `art.obsidian.*` (key-art/survivor/companion/enemy/crystal-fern/…/monolith) + `icons/*` + `models.survivor/*`, `sha256` ต่อไฟล์ + `packSha256` deterministic
- **Not blocky**: voxel models × pixel textures + nearest sampling + `createVoxelModel`/`createPixelBlockMesh`/`loadPackModel` fallback (voxel fallback when GLB missing) — ไม่ใช้ `pixel block แบบจ๋า`
- **VFX / Motion**: `animationMotionPolicy.ts` (`reducedMotion` factor), `performanceProfile` (`maxParticleCount` 80/160/320 × `EFFECT_INTENSITY_FACTOR`), scene pulsing guards (`options.reducedMotion ? 1 : 1+sin*scale`)
- **Settings**: ครบตาม `GAME_RULES` — quality/effectIntensity/shadow/detail, renderDistance, viewDistanceBlocks, targetFps (120 advisory), cameraMode (overhead/side/first-person), reducedMotion, touchScale/opacity

---

## 6) Tests & Invariants (Phase 7)

- New: `server/phase7RelationshipInvariant.test.ts` (9 tests)
  - PlayerID→profile→inventory→provenance uniqueness
  - Plant→soil compatibility (`isPlantCompatibleWithSoil`)
  - Pet→equipment→bonus (`transferPetEquipment`/`getPetBonus`)
  - Scene transition→cache eligibility (10 RUNTIME_MAP_IDS + `getMapSceneTreatment` + `isRuntimeMapAllowed` future denied)
  - Offline sync vectorClock concurrent/merge
  - Lobby invariant: `GAME_VERSION` 4-part, tier budgets, `effectiveParticleCount` scaling
  - Map entry invariant: roster `regular/elite/event-boss` + `status prototype`
  - Sync invariant: capacity 40 + `validateItemInstances`
- Existing: `server/performanceProfile.test.ts`, `vectorClock.test.ts`, `mapModules.test.ts`, `directRoute.test.ts`, `integrityVerdict.test.ts`, `gameIntegrity.test.ts`, `block*`, `inventoryCapacityDependencyGraph.test.ts`, `phase7` รวม 570 tests

---

## 7) Todo Reconcile (114 / 124 checked)

- ก่อน: 51 checked / 73 unchecked (2026-09-17 audit)  
- หลัง Phase 2–8: **114 checked / 10 unchecked**  
- Phase 2: 37 รายการ Landing/Babylon/Player/Enemy/Inventory/Building/Farm/Touch/Demo/PlayerID/localStorage/DB/tRPC/Sync/Provenance/PWA/Vitest/Mobile/Lobby/MapSelect/Camera/Shop/Weapon/Multi-scene/Settings/Onboarding/Integrity/Lighting/Weekly/Version …  
- Phase 3: weapon-tradeoff honesty  
- Phase 4: loading transition even when cached + shell/bundle cache + IndexedDB queue/vectorClock  
- Phase 5: design bible + VFX adjustable + stylized low-res pixel  
- Phase 6: NPC/boss/roster + scene identity + loading progress + prototype identity tests  
- Phase 7: relationship tests + invariant checks + lobby cinematic + MOBA camera + PlayerID offline + background sync  
- Phase 8: player silhouette states + repo push detail + per-map template + duplicate Gemini master-plan + fallback protocol + MAP_001 brief + 10-maps-today + batch 11–100 gate — **รวม 8 รายการ** → 106→114

### 10 รายการที่ยัง `[ ]` — เหตุผลที่ยังไม่ติ๊ก (honest blockers)

| # | ข้อ | เหตุผล |
|---|-----|--------|
| 42 | ใช้ Gemini API เป็นแหล่งกำหนดและสร้างองค์ประกอบที่ผู้เล่นมองเห็นทั้งหมด | ทุก visual ยังไม่ผ่าน Gemini `generateImage` จริง; ใช้ `google-gemini-brief` + voxel fallback + Pollinations starter pack ยังไม่ใช่ `Gemini → Pollinations` เต็มรูปแบบพร้อม `prompt/seed/model` ต่อ asset |
| 49 | เพิ่มคำสั่งปิดท้ายในทุก Gemini API request ให้ส่งข้อเสนอแนะกลับด้วย | ต้องแก้ `server/gemini` client ให้ append trailing instruction ทุก request — ยังไม่แก้โค้ด |
| 66 | workflow ปรึกษา Gemini ก่อนพัฒนาระบบสำคัญ (รวมทางเลือก/ความเสี่ยง/แนวปฏิบัติ/ข้อเสนอแนะ) | มี `GEMINI_ADOPTED_PLAN` แต่ยังไม่มี per-system `GEMINI_REQUEST` log ครบทุก domain |
| 67 | ประเมินและนำข้อเสนอแนะ Gemini มาใช้เป็นค่าเริ่มต้นเมื่อไม่ขัดกับความปลอดภัย | เช่นเดียวกับ 66 — ต้องบันทึกการนำไปใช้เป็น default ต่อระบบ |
| 70 | commit & push หลังแผนที่หนึ่งเสร็จตามเกณฑ์ พร้อมข้อความระบุชื่อแผนที่ | Master plan ต้องการ 10 commits `feat: complete MAP_00X …`; ที่ทำคือ 6 phase commits แบบ batch — ยังไม่แยก 10 commits ต่อแผนที่ |
| 71+74 | ให้ Gemini ออกแบบ monster model หลายสายพันธุ์ (silhouette/behavior/weakness/effect/drop) | Roster ปัจจุบัน generate แบบ deterministic (`Gemini-designed ${name} silhouette` placeholder) ยังไม่ได้เรียก Gemini จริงสำหรับหลายสายพันธุ์ต่อ biome |
| 90 | engine migration assessment Phaser 3 + Three.js 2.5D โดยรักษา Babylon.js prototype | ต้องสร้าง `docs/engine-migration-assessment.md` วิเคราะห์ trade-off และ bridge — ยังไม่ทำ |
| 93 | ใช้ Gemini image brief “สร้างพร้อมสำหรับ… / จุดประสงค์ของภาพ…” แล้วดึง Pollinations พร้อม metadata | ยังไม่มี pipeline ที่ log `prompt/seed/model` ต่อ entry ใน `manifest.json` |
| 94 | แทน placeholder geometry ด้วย Pollinations asset image/texture + แคชออฟไลน์ | MAP_001 มี `Glass Stalker/Ley Crystal/Void Reaper` texture แล้ว แต่ enemy/resource ทั่วไปยังเป็น voxel fallback — ยังไม่แทนทั้งหมดด้วย Pollinations + cache verification |

> หมายเหตุ: 42/71/74/93/94 จะปิดได้เมื่อทำ `Pollinations image generation` pipeline พร้อม `prompt/seed/model/sha256` provenance ต่อ asset และอัปเดต `manifest.json` + `sw.js` cache; 70 ปิดเมื่อแยก 10 commits ต่อแผนที่; 90 ปิดเมื่อมี migration doc; 49/66/67 ปิดเมื่อมี Gemini request workflow log.

---

## 8) Evidence Files

- `MASTER_EXECUTION_PLAN_10MAPS_FULLSYSTEM.md` — แผน 8 เฟส 10 แผนที่ (ค้างที่ PHASE 6–8)
- `todo.md` — 114 checked / 10 unchecked (เพิ่ม 8 ใน Phase 8)
- `client/src/game/version.ts` — `100.10.0.0`
- `client/src/game/routing/playableMaps.ts` + `directRoute.ts` — 10 playable allow-list
- `client/src/game/data/maps.ts` + `mapSceneTreatments.ts` + `biomeProfiles.ts` + `worldTime.ts` — registry + treatment + lighting
- `client/src/game/scene.ts` (1773 lines) — 10 maps branching + encounter + elite/boss + dressing + performance budgeting
- `client/src/game/systems/performanceProfile.ts` — `EFFECT_INTENSITIES` + `effectiveParticleCount`
- `server/phase7RelationshipInvariant.test.ts` — 9 relationship/invariant tests
- `client/public/assets/packs/arcane-frontier-voxel-pixel/manifest.json` — pack 0.3.0 + sha256 per entry
- `docs/evidence/10-maps-complete.md` — เอกสารนี้

---

## 9) Next (เมื่อผู้ใช้สั่ง)

- แยก 10 commits `feat: complete MAP_00X …` (70) พร้อม pollinations generation (42/93/94) และ monster model (71/74)
- เติม `docs/engine-migration-assessment.md` (90)
- บันทึก `Gemini workflow` (49/66/67) ต่อ domain
- เริ่มชุด 11–15 ทีละ 5 แผนที่เมื่อผู้ใช้สั่ง (97 — ตอนนี้หยุดที่ 10 ตามคำสั่ง)

> Snapshot push สุดท้ายก่อนเอกสารนี้: `0b4af42` `test: full coverage and invariant checks (Phase 7)` — เอกสารนี้จะ commit เป็น `docs: reconcile completion for 10-map full system (Phase 8) — 100.10.0.0` และ tag `100.10.0.0` (ถ้าได้รับสิทธิ์ tag)
