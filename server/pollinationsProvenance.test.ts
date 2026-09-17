import { describe, expect, it } from "vitest";
import { buildPollinationsUrl, createPollinationsProvenance, geminiBriefToPrompt, hashToSeed, validatePollinationsProvenance } from "../client/src/game/assets/pollinationsProvenance";

describe("pollinations provenance contract", () => {
  it("converts Gemini brief to stylized prompt", () => {
    const brief = "สร้างพร้อมสำหรับ art.obsidian.survivor / จุดประสงค์ของภาพ: ไอคอนผู้รอดชีวิตสำหรับ Lobby";
    const prompt = geminiBriefToPrompt(brief);
    expect(prompt).toContain(brief);
    expect(prompt).toContain("stylized low-resolution");
    expect(geminiBriefToPrompt("")).toContain("stylized");
  });

  it("hashes assetId to deterministic seed and builds pollinations url", () => {
    expect(hashToSeed("art.obsidian.survivor")).toBe(hashToSeed("art.obsidian.survivor"));
    expect(hashToSeed("art.obsidian.survivor")).not.toBe(hashToSeed("art.obsidian.enemy"));
    const url = buildPollinationsUrl("test prompt", 382917, "flux");
    expect(url).toBe("https://image.pollinations.ai/p/test%20prompt?seed=382917&model=flux&width=512&height=512&nologo=true");
  });

  it("creates provenance with gemini brief and validates it", () => {
    const brief = "สร้างพร้อมสำหรับ art.obsidian.enemy / จุดประสงค์ของภาพ: ศัตรู Glass Stalker สำหรับ MAP_001";
    const prov = createPollinationsProvenance({ geminiBrief: brief, assetId: "art.obsidian.enemy", seed: 12345, model: "flux" });
    expect(prov.geminiBrief).toBe(brief);
    expect(prov.prompt).toContain(brief);
    expect(prov.seed).toBe(12345);
    expect(prov.url).toContain("seed=12345");
    expect(validatePollinationsProvenance(prov).valid).toBe(true);
  });

  it("rejects invalid provenance shapes", () => {
    const brief = "สร้างพร้อมสำหรับ art.obsidian.test / จุดประสงค์ของภาพ: ทดสอบ";
    const prov = createPollinationsProvenance({ geminiBrief: brief, assetId: "art.obsidian.test" });
    expect(validatePollinationsProvenance({ ...prov, source: "other" as any }).valid).toBe(false);
    expect(validatePollinationsProvenance({ ...prov, geminiBrief: "wrong" }).valid).toBe(false);
    expect(validatePollinationsProvenance({ ...prov, seed: -1 }).valid).toBe(false);
    expect(validatePollinationsProvenance({ ...prov, url: "https://example.com" }).valid).toBe(false);
  });
});
