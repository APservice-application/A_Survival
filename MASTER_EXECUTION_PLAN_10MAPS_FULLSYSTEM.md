# MASTER EXECUTION PLAN — ทำทุกระบบให้เสร็จ (10 แผนที่แรก)

> คำสั่งผู้ใช้: "สร้างให้เสร็จทุกระดับระบบเลยไม่เสร็จไม่หยุด ทำให้เสร็จจนกว่าจะไม่มีอะไรให้ทำ ส่วนแผนที่เกมเอาแค่10แผ่นที่ก่อน"
> วันที่: 2026-09-17
> Repo: `APservice-application/A_Survival`
> Branch: `main`
> AI: Agent (autonomous)

---

## หลักการ
- ทำ **ทุกระบบ** ให้เสร็จจริง ไม่ใช่แค่ docs — ต้องมีโค้ด + test + check + build + push
- แผนที่: ทำ **10 แผนที่แรก** ให้เป็น `prototype` ที่เล่นได้จริง (scene content เฉพาะตัว, encounter, boss, loading, cache) — แผนที่ 11-100 คงเป็น `planned` ไว้ก่อนตามกติกาเดิม
- ไม่หยุดกลางทาง — ทำงานเป็นเฟส ต่อเนื่องจน `todo.md` และ `AI_COORDINATION_BACKLOG.md` ไม่มี PARTIAL/PENDING ที่ทำได้แล้ว
- ทุกเฟส: `code → pnpm check → pnpm test → build → commit → push`

---

## สถานะก่อนเริ่ม (Audit 2026-09-17)
- `pnpm check`: PASS
- `pnpm test`: 128 files / 561 tests PASS
- `todo.md`: 51 checked / 73 unchecked (หลายข้อที่ unchecked แท้จริงทำแล้ว แต่ไม่ได้ติ๊ก)
- `AI_COORDINATION_BACKLOG.md`: VERIFIED 4 / PARTIAL 45 / PENDING 3 (รวม 52)
- `RUNTIME_MAP_ID`: ล็อคไว้แค่ `obsidian-frontier` → ต้องปลดล็อค 10 แผนที่
- MAP_REGISTRY: 15 prototype (001-015) + 85 planned = 100 — จะปรับให้ 10 แรกเป็น playable set หลัก
- Landing/Lobby/Identity/Maps/Home/Game/Loading/Integrity/Vault/HomeSystem/Farm/Cache/Offline มีแล้วแต่ต้อง hardening

---

## เฟสงาน (ทำต่อเนื่องไม่หยุด)

### PHASE 0 — Audit & Reconcile (DONE)
- [x] อ่าน GAME_RULES, PLAN, STRUCTURE, ASSETS, VISUAL, MAPS, todo, backlog
- [x] สร้าง `GAME_UNDERSTANDING.md` และไฟล์นี้

### PHASE 1 — ปลดล็อค 10 แผนที่ให้เล่นได้จริง
**Goal:** ผู้เล่นเลือกและเข้าเล่น MAP_001-010 ได้จาก Lobby/Maps ไม่ติด fallback
- [ ] แก้ `client/src/game/routing/directRoute.ts`: `RUNTIME_MAP_ID` → `RUNTIME_MAP_IDS = 10` + `isRuntimeMapAllowed` เช็ค 10 ตัว
- [ ] แก้ `client/src/game/data/maps.ts`: ยืนยัน 10 แรก `status: prototype` + `radius 500` + accent/keyArt ครบ
- [ ] แก้ `client/src/pages/ArcaneFrontier.tsx`: Maps grid โชว์ 10 แผนที่, direct route fallback ไม่เด้งกลับ obsidian, loadingVariant ครบ 10 biome
- [ ] แก้ `client/src/game/storage/mapCache.ts` + `indexedDb.ts`: cache eligibility สำหรับ 10 maps
- [ ] Tests: `directRoute.test.ts`, `mapCache.test.ts`, `mapModules.test.ts`
- [ ] Commit: `feat: unlock 10 maps playable set (MAP_001-010)`

### PHASE 2 — Core Loop Hardening (Landing/Lobby/Maps/Home/Game)
**Goal:** ปิด todo หมวด P0 ที่ยัง [ ] แต่โค้ดมีแล้ว — ทำให้ตรวจผ่านจริง
- Landing: เพิ่มปุ่ม PWA install + ตรวจ 812x375
- Lobby cinematic: เมนูซ้าย/บน/กลาง/ล่าง/ข้าง + version 100.1.1.1 + weekly event panel
- Map Select: แสดง biome/threat/radius/bundleKey ครบ 10
- Home: modular build + farm soil feedback + pet equipment จริง
- Camera: top-down 3/4 MOBA + safe-area
- Tests: relationship tests + invariant checks
- Commit: `feat: harden core loop UI and 10-map select`

### PHASE 3 — Survival Loop (Player/Enemy/Inventory/Building/Farm)
- Player: walk/run/dash/health + state
- Enemy: detect/attack/drop per biome roster
- Inventory: 40 slots / 64 stack + provenance
- Building: place/rotate/move/recall modular + collision
- Farm: seed→sprout→young→mature + harvest → inventory 40
- Touch: joystick + ATTACK/DASH/USE + hotbar 2-step
- Commit: `feat: complete survival loop systems`

### PHASE 4 — Data & Offline (DB/tRPC/Sync/Provenance/PWA)
- DB schema + tRPC profile/save/inventory/provenance
- Sync queue + vector clock + background sync (แทน localStorage)
- Provenance `drop/craft/harvest/reward/starter` ตรวจทุกจุด
- Manifest + SW + Cache Storage (game shell + 10 bundles)
- Commit: `feat: offline-first sync and provenance hardening`

### PHASE 5 — Visual & Art (Gemini/VFX/Settings)
- Gemini bible: character silhouette, VFX, item, UI — บันทึก brief + provenance
- แทน placeholder geometry ด้วย image/texture + cache
- VFX walk/attack/magic/pickup ปรับ density ได้
- Settings: quality/particle/shadow/music/SFX/reducedMotion/touch/renderDistance
- Commit: `feat: visual direction and settings complete`

### PHASE 6 — 10 Maps Content Complete (ทีละแผนที่)
**ทำทีละ 1 แผนที่ตาม template — 10 commits**
- MAP_001 Obsidian Frontier — เติม objective UI + elite/boss anim + soundscape
- MAP_002 Ashen Obsidian Plains — Ash Storm + Pyroclastic Behemoth
- MAP_003 Bioluminescent Caverns — Spore Bloom + Mycelium Empress
- MAP_004 Crystalline Spires — Reflection Laser + Resonance Archon
- MAP_005 Corrosive Acid Swamps — Acid Rain + Toxic Hydra
- MAP_006 Magnetic Dunes — Magnetic Storm + Lodestone Colossus
- MAP_007 Frozen Crevasses — Blizzard + Glacial Terror
- MAP_008 Ancient Ruins — Defense Sweep + Matrix Overlord
- MAP_009 Overgrown Jungle — Toxic Downpour + Verdant Hive Mind
- MAP_010 Void Rift — Gravity Tide + Void Singularity
- แต่ละแผนที่: `encounter.ts` + scene treatment + asset pack + tests + screenshot
- Commit: `feat: complete MAP_00X ...` (10 commits)

### PHASE 7 — Testing & Polish
- Vitest ครอบคลุม provenance/sync/combat
- Invariant checks @ Lobby/Map/Sync
- ตรวจภาพ 812x375 + desktop + `tsc --noEmit`
- Commit: `test: full coverage and invariant checks`

### PHASE 8 — Final Reconcile & Docs
- อัปเดต `todo.md` ติ๊ก [x] ที่เสร็จจริง
- อัปเดต `AI_COORDINATION_BACKLOG.md` / `OWNER_REQUIREMENTS_MATRIX.md`
- สรุป `docs/evidence/10-maps-complete.md`
- Tag version `100.10.0.0` (10 maps)
- Commit: `docs: reconcile completion for 10-map full system`

---

## ลำดับตอนนี้
เริ่ม **PHASE 1** ทันที — ปลดล็อค 10 แผนที่

---

## กติกา
- ห้ามแก้ `OWNER_REQUIREMENTS_MATRIX.md` บน branch worker ถ้าเป็น AI-0 เท่านั้นที่ merge — แต่เราทำบน main โดยตรงตามคำสั่งผู้ใช้ (เจ้าของ repo อนุญาต)
- รักษา `git diff --check`, `pnpm check`, `pnpm test`, `pnpm build` ผ่านทุกครั้ง
- ทุกภาพใช้ Gemini brief + Pollinations metadata เก็บ provenance
- ไม่สร้าง auth/secret ปลอม ไม่ force push ไม่ลบ recovery ref

