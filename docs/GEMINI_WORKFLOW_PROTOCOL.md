# Gemini Workflow Protocol — การปรึกษา Gemini ก่อนพัฒนาระบบสำคัญ

> เอกสารนี้ปิด `todo 49, 66, 67, 87` พร้อม `GAME_RULES.md` และ `GEMINI_ADOPTED_PLAN.md`  
> วันที่: 2026-09-18 · Repo: `APservice-application/A_Survival` · Branch: `main`

---

## 1) หลักการรวมคำขอ (66)

ก่อนเริ่มระบบสำคัญทุกครั้ง ต้อง **รวบรวมข้อกำหนดที่เกี่ยวข้องทั้งหมดเป็นคำขอเดียว** แล้วส่งให้ Gemini วางแผนแบบ batch — ห้ามแบ่งย่อยหรือส่งซ้ำโดยไม่จำเป็น

### Checklist ที่ต้องรวมในคำขอเดียว (ถ้าเกี่ยวข้อง)

- ทางเลือกสถาปัตยกรรม / API / data model
- ความเสี่ยงด้านความปลอดภัย, ข้อมูลผู้เล่น, ประสิทธิภาพ, ออฟไลน์, provenance
- แนวปฏิบัติที่ดี (best practices) ของ domain นั้น
- ข้อเสนอแนะเพิ่มเติมที่ Gemini เห็นว่าช่วยยกระดับงาน
- ผลกระทบต่อระบบเดิมและการย้อนกลับ

### ตัวอย่างระบบที่ต้องปรึกษาก่อน

`IndexedDB transaction store + vectorClock + background sync`, `PWA manifest/SW`, `provenance quarantine`, `map module loading/cache`, `stylized pixel art direction`, `pollinations asset provenance`, `engine migration Phaser 3 + Three.js 2.5D`

### อัตราและ retry (ตาม GAME_RULES)

- เว้นระยะ **6–10 วินาที** ระหว่างคำขอ Gemini ทุกครั้ง
- หลัง `API error / quota` → บันทึกเวลา error + รออย่างน้อย **60 วินาที** ก่อน retry
- `prompt hygiene`: ย่อโค้ด/ไฟล์/ภาพเป็น schema/brief ที่ครบถ้วนก่อนส่ง ลดการส่ง context ซ้ำ

---

## 2) คำสั่งปิดท้ายทุก request (49)

> **“ส่งข้อเสนอแนะหรือข้อคิดเห็นที่ใช้พัฒนางานได้กลับมาด้วย”**

เติมเป็น trailing instruction ใน **ทุก** Gemini API request โดยไม่มีข้อยกเว้น ตัวอย่าง:

```
... (body ของระบบที่ขอ) ...

ปิดท้าย: โปรดส่งข้อเสนอแนะหรือข้อคิดเห็นที่ใช้พัฒนางานได้กลับมาด้วย — รวมถึงทางเลือกที่ยังไม่ได้เลือก, ความเสี่ยงที่ควรเฝ้าระวัง, และแนวทางที่ทำให้ระบบทนทานขึ้น
```

ผู้ช่วยต้อง **อ่านและประเมิน** ข้อเสนอแนะที่ Gemini ส่งกลับทุกครั้ง ก่อนเริ่ม implement — ไม่ทิ้งหรือละเลย

---

## 3) ประเมินและนำไปใช้เป็นค่าเริ่มต้น (67)

> “ประเมินและนำข้อเสนอแนะจาก Gemini มาใช้เป็นค่าเริ่มต้นทุกครั้งที่ไม่ขัดกับความปลอดภัย ข้อมูลผู้เล่น หรือข้อจำกัดทางเทคนิคของเกม”

### เกณฑ์ตัดสินใจ

| ปัจจัย | นำไปใช้เป็น default | ไม่นำไปใช้ (ต้องบันทึกเหตุผล) |
|-------|---------------------|--------------------------------|
| ความปลอดภัย / auth / provenance | — | ขัดกับ `GAME_RULES` หรือเปิดช่องโกง |
| ข้อมูลผู้เล่น / privacy | — | ส่ง PII ออกนอกเครื่องโดยไม่จำเป็น |
| ข้อจำกัดเทคนิค (mobile, Babylon.js, Dexie, tRPC) | ✅ ถ้าเข้ากันได้ | ต้องคง Babylon prototype ที่เล่นได้ระหว่าง migration |
| ประสิทธิภาพ offline-first | ✅ | — |

### สิ่งที่นำไปใช้แล้ว (อ้างอิง)

- `Gemini → IndexedDB + vectorClock + queue` → `client/src/game/storage/indexedDb.ts` + `vectorClock.ts` + `syncVector.ts`
- `Gemini → PWA cache-first assets, network-first APIs, Background Sync` → `client/public/sw.js` + `manifest.webmanifest`
- `Gemini → passwordless Player ID + instant local profile` → `client/src/game/storage/session.ts`
- `Gemini → soft modern pixel fantasy-sci-fi` → `client/public/assets/packs/arcane-frontier-voxel-pixel` (`480×270`, `nearest`, voxel fallback)
- `Gemini → 3/4 top-down MOBA camera` → `client/src/game/scene.ts` + `cameraModes.ts`
- `Gemini → map module contract 1–1.5km` → `client/src/game/data/maps.ts` + `playableMaps.ts` + `directRoute.ts`

---

## 4) Fallback Model Protocol (87)

> “สลับ Gemini รุ่นทางเลือกอัตโนมัติหลัง cooldown เมื่อรุ่นเดิม error และแจ้งผู้ใช้เฉพาะเมื่อทางเลือกที่รองรับใช้ไม่ได้ทั้งหมด”

### ลำดับ fallback ที่รองรับ

1. `gemini-2.5-pro` (หลัก)
2. `gemini-2.5-flash`
3. `gemini-2.0-flash`
4. `gemini-1.5-pro`

### ขั้นตอน

1. เรียก `gemini-2.5-pro` ด้วย brief เดียว
2. หาก `quota / 429 / 5xx` → บันทึก `errorAt = Date.now()` + รอ **≥60s**
3. สลับไปรุ่นถัดไปในลำดับโดยอัตโนมัติ ไม่ต้องถามผู้ใช้
4. ทำซ้ำจนกว่าจะสำเร็จ หรือจนครบลำดับ — จึงค่อยแจ้งผู้ใช้ว่า “ทางเลือกที่รองรับใช้ไม่ได้ทั้งหมด” พร้อม `errorAt` และรุ่นที่ลองแล้ว
5. ห้าม fabricate ภาพ/โมเดล/โค้ดระหว่าง fallback — บันทึกเป็น `pending` และใช้ `starter-authored-from-gemini-brief` ชั่วคราว

### หลักฐานใน repo

- `GEMINI_ADOPTED_PLAN.md` บันทึก master plan ที่ได้จาก fallback chain
- `client/public/assets/packs/arcane-frontier-voxel-pixel/manifest.json` `designSource: google-gemini-brief`, `artStatus: starter-authored-from-gemini-brief` — บ่งบอกว่ายังรอ image generation เต็มรูปแบบเมื่อ quota ผ่าน

---

## 5) API Offloading (คำสั่งสูงสุด)

> Gemini เป็น AI Agent ภายนอกสำหรับอ่านโค้ด วิเคราะห์ไฟล์/ภาพหน้าจอ สรุปบริบท กลั่นกรองทางเลือก และจัดทำแผนงานแบบรวมชุดก่อน ผู้ช่วยจึงลงมือ implement/test

- ส่ง `code/file/screenshot/context` แบบ batch ให้ Gemini วิเคราะห์/วางแผนก่อน
- ผู้ช่วยรับแผนแล้วจึง `implement → pnpm check → pnpm test → build → commit → push`
- หลีกเลี่ยงการส่งบริบทซ้ำหรือแบ่งคำถามย่อยโดยไม่จำเป็น

---

## 6) การบันทึกและตรวจสอบ

- ทุกครั้งที่ปรึกษา Gemini ก่อนระบบใหม่ ให้บันทึก `brief + response + adopted plan` ใน `GEMINI_*_ADOPTED.md` หรือ `docs/evidence/`
- `todo.md` ติ๊ก `[x]` เฉพาะเมื่อมีโค้ด + test + check + build + push จริง — ไม่นับแค่ docs
- `AI_COORDINATION_BACKLOG.md` อัปเดตเมื่อมี PARTIAL → VERIFIED

---

## 7) ข้อจำกัดที่ยังคงอยู่

- ห้ามสร้าง binary asset ปลอมหรือแก้ `MANUAL` provenance เพื่อให้ graph ผ่าน
- ห้ามเขียน `IndexedDB`/`Cache Storage` ใน preview dependency graph — ใช้ pure validator
- รักษา `Babylon.js` prototype ที่เล่นได้ระหว่าง `Phaser 3 + Three.js 2.5D` migration (ดู `docs/ENGINE_MIGRATION_ASSESSMENT.md`)

> เอกสารนี้เป็น source of truth ของ workflow 49/66/67/87 — ใช้อ้างอิงก่อนเริ่มระบบใหม่ทุกครั้งร่วมกับ `GAME_RULES.md`
