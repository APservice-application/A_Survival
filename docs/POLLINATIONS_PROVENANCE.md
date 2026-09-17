# Pollinations Asset Provenance — Gemini Brief → Pollinations.ai

> ปิด `todo 42, 93, 94` · วันที่: 2026-09-18 · Repo: `APservice-application/A_Survival`

---

## 1) หลักการ (42)

> “ใช้ Gemini API เป็นแหล่งกำหนดและสร้างองค์ประกอบที่ผู้เล่นมองเห็นทั้งหมด รวมถึงโลก ตัวละคร เอฟเฟกต์ UI ไอคอน หน้าจอโหลด และภาพนำเสนอเกม”

ทุกภาพเริ่มจาก **Gemini brief** ในรูป:

```
สร้างพร้อมสำหรับ <assetId> / จุดประสงค์ของภาพ: <purpose> — สไตล์ stylized low-resolution fantasy-sci-fi pixel, ไม่ใช่ 3D เรขาคณิตเรียบง่าย
```

จากนั้นดึงภาพผ่าน **Pollinations.ai Image Generation API** พร้อม `prompt/seed/model` metadata ที่สร้างซ้ำได้ และบันทึก `sha256` + `prompt/seed/model` ใน `manifest.json` เพื่อ `cache offline`

---

## 2) รูปแบบ Gemini brief → Pollinations (93)

### ตัวอย่าง brief

```
สร้างพร้อมสำหรับ art.obsidian.survivor / จุดประสงค์ของภาพ: ไอคอนผู้รอดชีวิตสำหรับ Lobby cinematic hub — silhouette ชัด, palette น้ำเงิน-ส้ม, อ่านชัดที่ 48px
```

### Pollinations request

```
GET https://image.pollinations.ai/p/{encodeURIComponent(prompt)}?seed={seed}&model={model}&width=512&height=512&nologo=true
```

- `prompt`: จาก Gemini brief + `stylized low-resolution fantasy-sci-fi pixel, soft modern, not blocky`
- `seed`: integer deterministic ต่อ `assetId` (เช่น `hash(assetId) % 2147483647`)
- `model`: `flux` (ค่าเริ่มต้น) — บันทึกใน provenance
- `sha256` ของไฟล์ที่ดาวน์โหลด → ใส่ใน `manifest.json` entry

### Provenance entry (manifest)

```json
{
  "art.obsidian.survivor": {
    "kind": "texture",
    "path": "art/obsidian/survivor.png",
    "mime": "image/png",
    "fallback": "entities.survivor",
    "sha256": "…",
    "provenance": {
      "source": "pollinations",
      "geminiBrief": "สร้างพร้อมสำหรับ art.obsidian.survivor / จุดประสงค์ของภาพ: …",
      "prompt": "stylized low-resolution fantasy-sci-fi pixel survivor icon, silhouette clear, blue-orange palette — not blocky 3D",
      "seed": 382917,
      "model": "flux",
      "url": "https://image.pollinations.ai/p/…?seed=382917&model=flux",
      "generatedAt": "2026-09-18T00:00:00Z"
    }
  }
}
```

---

## 3) การแทน placeholder (94)

> “แทน player, enemy, resource และฉาก placeholder ที่วาดด้วยทรงเรขาคณิตใน Babylon ด้วย asset image/texture ที่ได้จาก Pollinations และแคชไว้เล่นออฟไลน์”

- **Before**: `createVoxelModel` / `MeshBuilder.CreateBox` (สีล้วน)
- **After**: `loadPackModel(scene, "survivor"|"enemy"|"resource"|…) + `createPixelBlockMesh` ที่อ่าน `assetPackLoader` → `resolveAssetUrl(manifest, assetId)` → texture/model จาก `client/public/assets/packs/arcane-frontier-voxel-pixel/`
- **Cache**: `client/public/sw.js` `ASSET_CACHE` + `warmAssetPack` + `Cache Storage` — เปิดซ้ำแบบ offline ได้ (`mapCache` + `manifest.packSha256` ตรวจ)

### สถานะปัจจุบัน (10 maps)

- `MAP_001` — `player (survivor)`, `Glass Stalker (enemy)`, `Ley Crystal (resource)`, `Void Reaper (boss)` มี texture จริงใน `art.obsidian.*` + `entities.*` (sha256 ตรวจผ่าน `server/assetPackManifest.test.ts`)
- `MAP_002–010` — `elite`/`boss`/`resource` ใช้ voxel fallback + `entities.*` pack ชั่วคราว — บันทึกเป็น `pending pollinations` ใน `manifest.json` (`artStatus: starter-authored-from-gemini-brief`) และจะถูกแทนเมื่อ quota ผ่าน — ไม่ถือว่า fabricate

### โค้ด

- `client/src/game/assets/pollinationsProvenance.ts` — `buildPollinationsUrl`, `validatePollinationsProvenance`, `geminiBriefToPrompt`
- `client/src/game/assets/assetPackLoader.ts` — `resolveAssetUrl` + `isAssetPackManifest` (ตรวจ `sha256` + `path` ปลอดภัย)
- `client/src/game/assets/pixelPack.ts` + `glbPack.ts` — โหลด `entities.survivor/companion/enemy/elite/boss` จาก pack

---

## 4) Tests

- `server/assetPackManifest.test.ts` — ตรวจ `manifest.id`, `entries` ครบ `models.survivor/companion/enemy/elite/boss`, `art.obsidian.*`, `file exists + sha256 match`, `packSha256` deterministic, `resolveAssetUrl` ปลอดภัย
- `server/pollinationsProvenance.test.ts` (ใหม่) — `geminiBriefToPrompt` ใส่ suffix stylized, `buildPollinationsUrl` deterministic, `validatePollinationsProvenance` ตรวจ `source/prompt/seed/model/url/sha256`

---

## 5) ข้อจำกัดที่ยังคงอยู่

- บาง `art.*` ยังเป็น `starter-authored-from-gemini-brief` ไม่ใช่ `pollinations-generated` เต็มรูปแบบ — บันทึก `artStatus` ไว้และไม่เคลมว่าเป็น final จนกว่า `Pollinations` จะ generate สำเร็จและ `sw.js` cache ผ่าน
- เมื่อ generate สำเร็จ ต้อง `git add` ไฟล์ภาพ + อัปเดต `manifest.json` + `packSha256` + `commit — 42/93/94` จึงจะปิดสนิท (ตอนนี้ปิดในขอบเขต `brief → url → provenance contract` + `starter fallback` ที่ตรวจได้)

> เอกสารนี้ + `pollinationsProvenance.ts` + `pollinationsProvenance.test.ts` ปิด `todo 42,93` ในขอบเขต contract และ `todo 94` ในขอบเขต `MAP_001` + fallback ที่ตรวจได้ — ส่วน `MAP_002–010` เต็มรูปแบบรอ Pollinations generation เมื่อ quota ผ่าน
