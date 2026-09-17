# Engine Migration Assessment — Babylon.js → Phaser 3 + Three.js 2.5D (ตามข้อเสนอ Gemini)

> ปิด `todo 90` · วันที่: 2026-09-18 · Repo: `APservice-application/A_Survival` · Branch: `main`  
> อ้างอิง: `GEMINI_ADOPTED_PLAN.md` (Game engine decision) + `GAME_RULES.md` (ต้องรักษา prototype ที่เล่นได้)

---

## 1) สถานะปัจจุบัน

- **Runtime**: `Babylon.js 9.22.1` + `Vite + React + TypeScript` + `Dexie/IndexedDB` + `tRPC/Drizzle/MySQL` + `Vitest`
- **Scene**: `client/src/game/scene.ts` (1773 บรรทัด) — top-down 3/4 MOBA (`ArcRotateCamera` 60° pitch, 45° yaw, deadzone 5.4 lerp), 15 maps (`isMap001..015`), `createPixelTerrainChunks` + `createVoxelModel`/`loadPackModel` + `blockWorld` + `worldFarm` + `companion` + `stamina`
- **Asset**: `arcane-frontier-voxel-pixel` pack (`480×270` logical, `16` tile, `nearest`) — voxel fallback + GLB pack (`glbPack.ts`)
- **Build**: `pnpm check` PASS, `129 files / 570 tests` PASS, `HEAD 692d13c` `100.10.0.0` (10 maps)

---

## 2) ข้อเสนอ Gemini (Phaser 3 + Three.js 2.5D)

> “ใช้ Phaser 3 และ Three.js แบบ 2.5D foundation — ภาพ soft modern pixel low-res, ไม่ใช่ blocky”

- **Phaser 3** ดูแล `input / scene lifecycle / tween / tilemap / 2D sprite`
- **Three.js** ดูแล `2.5D rendering` (isometric, depth, lighting, fog) บน `WebGLRenderer` แบบ `low-res + nearest`
- **Bridge**: ต้องสร้าง `implementation bridge` ก่อนแทนที่ `Babylon.js` ทั้งหมด — ไม่ลบ prototype ที่เล่นได้

---

## 3) ทางเลือกที่ประเมิน

| ทางเลือก | ข้อดี | ข้อเสีย | ความเสี่ยง |
|----------|-------|---------|------------|
| **A) คง Babylon.js + เสริม Phaser เป็น overlay UI** | ไม่ต้อง rewrite scene, รักษา 570 tests, แคช/โปรวาน็องซ์ไม่กระทบ | ไม่ได้ 2.5D pipeline เต็มรูปแบบตาม Gemini | ต่ำ |
| **B) สร้าง Bridge แบบค่อยเป็นค่อยไป (adopted)** | รักษา prototype, ทดสอบทีละ map, migration แบบ feature-flag | ต้อง maintain 2 engines ชั่วคราว | กลาง |
| **C) Rewrite ทั้งหมดเป็น Phaser+Three.js ทันที** | ได้ pipeline ใหม่เร็ว | เสีย prototype, 570 tests พัง, offline/DB/sync ต้อง port ใหม่ | สูง — **ไม่เลือก** |

**ตัดสินใจ**: เลือก **B) Bridge** ตาม Gemini + `GAME_RULES` (“รักษา Babylon.js prototype ที่เล่นได้ระหว่างเปลี่ยนผ่าน”)

---

## 4) Bridge Design (ที่ต้องทำก่อน migration จริง)

```
[ React / ArcaneFrontier.tsx ]
        ↓ (props: mapId, reducedMotion, effectIntensity, performanceTier, renderDistance, viewDistanceBlocks, targetFps, cameraMode)
[ GameCanvas.tsx — Engine Adapter ]
        ↓ featureFlag: 'babylon' | 'phaser-three' (default: babylon)
   ┌─────────────────────┐   ┌──────────────────────────────┐
   │ BabylonScene (เดิม) │   │ PhaserThreeScene (ใหม่)      │
   │ scene.ts (1773)     │   │ - Phaser Scene + Three.js    │
   │ + pixelPack/glbPack │   │   renderer (480×270, nearest)│
   └─────────────────────┘   └──────────────────────────────┘
        ↓ shared contracts (คงเดิม)
[ IndexedDB / mapCache / vectorClock / integrity / tRPC / catalog ]
```

- **Shared contracts** ที่ไม่เปลี่ยน: `MAP_REGISTRY` (500m radius), `mapSceneTreatments`/`biomeProfiles`, `blockWorld`/`blockAction`/`worldFarm`, `inventorySystem` (40 slots/64 stack), `vectorClock`, `provenance`, `session`
- **Adapter**: `GameCanvas` รับ `engine: 'babylon' | 'phaser-three'` จาก `settings` หรือ `?engine=` query; `telemetry` ยังใช้ `RuntimePerformanceSampler` เดิม

---

## 5) เกณฑ์ย้ายทีละแผนที่

1. สร้าง `PhaserThreeScene` สำหรับ `MAP_001` ก่อน — Render `terrain 128 tiles` + `voxel fallback` ให้ได้ภาพตรงกับ `Babylon` (เทียบ screenshot 812×375 + desktop + `tournament` กล้อง 60°/45°)
2. ทำ `performanceProfile` เดิม (`low/balanced/high` + `effectiveParticleCount` + `reducedMotion`) ให้มีผลใน `Three.js` (`maxParticleCount` 80/160/320 × factor)
3. เทส `map001Encounter`/`blockWorld`/`worldFarm` ยัง PASS โดยไม่แก้ logic
4. เมื่อ `MAP_001` ผ่าน จึงค่อย `MAP_002–010` ทีละแผนที่ — แต่ละแผนที่ commit `feat: migrate MAP_00X to phaser-three bridge`

---

## 6) ความเสี่ยงและวิธีลด

| ความเสี่ยง | วิธีลด |
|-----------|--------|
| WebGL shader ต่างกัน → post-process พังบน mobile | คง `no post-process` (เหมือน Babylon ปัจจุบัน — emissive อย่างเดียว) + เทสบน `low` tier |
| Asset pack `480×270 nearest` ไม่ตรง | ใช้ `pack` เดิม (`manifest.json` 0.3.0) ทั้งสอง engines |
| `IndexedDB` + `Cache Storage` ต้อง port | ไม่ port — ใช้ `indexedDb.ts`/`mapCache.ts` เดิมทั้งคู่ |
| Tests 570 ต้อง rewrite | คง `vitest` เดิม — `PhaserThreeScene` ต้องผ่าน `mapModules`/`encounter` tests เดิมโดยไม่แก้ test |
| ผู้เล่น offline ต้องเล่นต่อได้ | `localStorage` + `IndexedDB` + `SW` ไม่เปลี่ยน — engine เป็นเพียง renderer |

---

## 7) สิ่งที่ยังไม่ทำ (blocker จนกว่าจะเริ่ม migration จริง)

- ยังไม่สร้าง `PhaserThreeScene` — เอกสารนี้เป็น **assessment** เท่านั้น ไม่ได้ลบ `scene.ts`
- ยังไม่เพิ่ม `phaser@3.90` / `three@0.160` dependencies — รอ bridge branch
- ยังไม่มี `featureFlag` ใน `GameCanvas` — รอ implement เมื่อเริ่ม `MAP_001` migration

---

## 8) สรุปการตัดสินใจ

- **คง `Babylon.js` prototype ที่เล่นได้** (100.10.0.0, 10 maps, 570 tests) เป็น baseline
- **ทำ bridge แบบค่อยเป็นค่อยไป** ตาม Gemini — เริ่มที่ `MAP_001` เป็น pilot, ผ่านเกณฑ์ `screenshot + tsc + tests + offline` จึงค่อยขยาย
- **ไม่ rewrite ทันที** — ลดความเสี่ยงและรักษา `offline-first` + `provenance` + `cache` ที่ลงทุนไปแล้ว

> เอกสารนี้ปิด `todo 90` ในขอบเขต assessment — การ implement จริงต้องเปิด branch/worktree ใหม่และทำทีละแผนที่ตาม `MASTER_EXECUTION_PLAN_10MAPS_FULLSYSTEM.md`
