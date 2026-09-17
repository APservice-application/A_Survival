# Monster Roster — Gemini-Designed per Biome (10 Maps)

> ปิด `todo 71, 74, 72, 75` · วันที่: 2026-09-18 · Source: `Gemini brief` → `client/src/game/data/maps.ts` (`content.monsters`) + `client/src/game/data/biomeProfiles.ts` + `encounter.ts`  
> ทุก monster มี `silhouette / behavior / weakness / effect / drop` ตาม brief Gemini — ใช้เป็น roster จริงใน `MAP_REGISTRY` ไม่ใช่แค่ metadata

---

## หลักการ (จาก Gemini)

- แต่ละ biome มี **3 roles**: `regular` (ฝูง), `elite` (ตัวเด่น), `event-boss` (boss)
- ใช้ `stylized low-resolution fantasy-sci-fi pixel` — silhouette อ่านชัด ไม่ใช่เรขาคณิตเรียบง่าย
- ทุกตัวมี `weakness` (biome counterplay) + `dropTheme` (resource) + `effectTone` (particle accent)

---

## Roster ต่อแผนที่ (10 แผนที่แรก — playable)

| Map | Biome | Regular | Elite | Event-Boss | Weakness / Counterplay | Drop | Effect |
|-----|-------|---------|-------|------------|------------------------|------|--------|
| MAP_001 Obsidian Frontier | volcanic glass | **Glass Stalker** — แมงมุมแก้วล่องหนบางส่วน เดินลาดตระเวนเป็นฝูง | **Obsidian Golem** — โกเล็มหินออบซิเดียน สูง 1.28× | **Void Reaper** — บอสล่องหนยาม night | แสงจ้า + พืชไล่ (`repel` auras) | Ley Crystal (`material-003`) | อีเทอร์วายุ / crystal growth |
| MAP_002 Ashen Obsidian Plains | ash storm | **Ash Crawler** — ตัวคลานเถ้าดำ คลานช้าเป็นฝูง | **Obsidian Shell Golem** — โกเล็มเปลือกเถ้า | **Pyroclastic Behemoth** — บอสภูเขาไฟ | เข้าพื้นที่ `Stabilizer` (rusty) | Ember Ore (`material-007`) | Ash Storm / visibility drop |
| MAP_003 Bioluminescent Caverns | void/fungal | **Glow Spore Beetle** — ด้วงเรืองแสง บินต่ำ | **Luminous Stalker** — สตอล์กเกอร์เรืองแสง | **Mycelium Empress** — ราชินีไมซีเลียม | แสง + บานดอก (`bloomActive` heal) | Glow Crystal (`material-003`) | Spore Bloom / heal |
| MAP_004 Crystalline Spires | crystal | **Shard Gnat** — ยุงคริสตัล | **Prism Golem** — โกเล็มปริซึม | **Resonance Archon** — อาร์คอนสั่นพ้อง | หลบ `Reflection Laser Field` | Resonance Shard (`material-003`) | Laser Field / slow |
| MAP_005 Corrosive Acid Swamps | swamp | **Acid Slime** — สไลม์กรด | **Mire Lurker** — ตัวซุ่มบึง | **Toxic Hydra** — ไฮดรากรด | เข้า `Vane Shelter` | Toxic Lily (`material-005`) | Acid Drizzle / acid dmg |
| MAP_006 Magnetic Dunes | arch/dune | **Magnetic Hover-Ray** — กระเบนลอยแม่เหล็ก | **Ironclad Golem** — โกเล็มเหล็ก | **Lodestone Colossus** — ยักษ์แม่เหล็ก | เข้า `Stabilizer` + หลบ `Magnetic Storm` | Magnetite Sand (`material-006`) | Magnetic Storm / nav unstable |
| MAP_007 Frozen Crevasses | crevasse | **Frostbite Weaver** — แมงมุมน้ำแข็ง | **Cryo Beast** — อสูรเยือกแข็ง | **Glacial Terror** — ภัยพิบัติธารน้ำแข็ง | เข้า `Steam Vent` (scoutFrost) | Cryo Crystal (`material-007`) | Blizzard / cold dmg |
| MAP_008 Ancient Ruins | ruin | **Sentinel Drone** — โดรนเฝ้า | **Ruin Guardian** — ผู้พิทักษ์ซาก | **Matrix Overlord** — โอเวอร์ลอร์ดเมทริกซ์ | เข้า `Rune Terminal` (kael) | Ancient Relic (`material-008`) | Defense Sweep / laser |
| MAP_009 Overgrown Jungle | canopy | **Vine Stalker** — สตอล์กเกอร์เถาวัลย์ | **Thornback Behemoth** — บีฮีมอทหนาม | **Verdant Hive Mind** — จิตหมู่เขียว | เข้า `Canopy Haven` (iris) | Alien Bloom (`material-009`) | Toxic Downpour / toxin |
| MAP_010 Void Rift | rift | **Rift Larva** — ตัวอ่อนรอยแยก | **Rift Horror** — สยองรอยแยก | **Void Singularity** — ภาวะเอกฐานวอยด์ | อยู่ใกล้ `Stable Pylon` (voidWanderer) | Void Essence (`material-010`) | Void Pulse / gravity |

### Silhouette & Palette (Gemini brief)

- **Regular**: ขนาด ~1.12×, สีตาม biome accent, เดินเร็ว 1.5–1.7×, ฝูง 7 ตัว (เกิน 4 ถูกซ่อนใน 002/006/007/008/009/010 ตาม `performanceTier`)
- **Elite**: ขนาด 1.28×, `elite` flag, health ~180, เปิดเมื่อ `encounter.activateElite`, pulsing `sin(1/240)` เมื่อ `!reducedMotion`
- **Event-Boss**: ขนาด 1.3×, health 420, เปิดเมื่อ `bossActive` (`memory.state === "boss-active"` หรือ `lighting.phase === "night"` ใน fallback), ลอย `y = 0.25 + sin(1/420)*0.22`

### Behavior / Weakness / Effect (ต่อ biome)

- ทุก `regular` ใช้ `player.position.subtract(enemy.position).normalize().scale(dt * (1.5 + index*0.05) * enemySpeedMultiplier)` — `enemySpeedMultiplier`/`playerSpeedMultiplier` มาจาก `resolveMap00XEncounter`
- `weakness` เป็น counterplay จริงใน `scene.ts`: `repel auras` (001), `Stabilizer` (002/006), `Shelter` (005/007/008/009), `Pylon` (010), `Laser/Storm/Blizzard avoidance`
- `dropTheme` ผูกกับ `resources` ใน `maps.ts` และ `onReward` `provenanceType: harvest/drop` + `eventId` ต่อ map (`map002-ember-ore-${resource.name}` …)

---

## ไฟล์ที่ถือ roster จริง

- `client/src/game/data/maps.ts` — `MAP_REGISTRY[].content.monsters` (3 roles) + `eventBossName` + `resources` + `radiusMeters 500` + `keyArt`
- `client/src/game/data/biomeProfiles.ts` — `terrainAssetIds` + `decorations` + `sceneTreatment` (`fogColor/skyColor/lightColor`)
- `client/src/game/map002/encounter.ts` … `map010/encounter.ts` — `initial*`/`resolve*` + `activateElite`/`spawn*`/`sheltered`/`damagePerSecond`
- `client/src/game/scene.ts` — `isMap00X` branching, `elite.setEnabled`, `boss.setEnabled`, `repelledEnemies`, `attackPulse` damage

---

## Tests

- `server/mapModules.test.ts` — 10 แรก `status prototype` + `radius 500` + `keyArt` เป็น Pollinations / manus-storage + `monsters` ครบ 3 roles
- `server/mapSceneTreatments.test.ts` — treatment ครบทุก map
- `server/map002Encounter.test.ts` … `map015Encounter.test.ts` — deterministic `spawn`/`damage`/`shelter`
- `server/phase7RelationshipInvariant.test.ts` — roster invariant `regular/elite/event-boss`

> Roster นี้เป็น **Gemini-designed** (brief → roster) และเป็น **runtime roster** จริงใน `MAP_REGISTRY` — ไม่ใช่แค่ docs

