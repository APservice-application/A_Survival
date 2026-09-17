/**
 * Pollinations provenance helper — Gemini brief → Pollinations.ai
 * Closes todo 42/93/94 in contract scope (MAP_001 fully, 002–010 pending generation).
 */

export type PollinationsModel = "flux" | "turbo" | "gptimage";

export type PollinationsProvenance = {
  source: "pollinations";
  geminiBrief: string;
  prompt: string;
  seed: number;
  model: PollinationsModel;
  url: string;
  generatedAt: string;
  sha256?: string;
};

const STYLIZED_SUFFIX = "stylized low-resolution fantasy-sci-fi pixel, soft modern, not blocky 3D, clear silhouette";

export function geminiBriefToPrompt(brief: string): string {
  const trimmed = brief.trim().replace(/\s+/g, " ");
  if (!trimmed) return STYLIZED_SUFFIX;
  // Ensure Gemini brief in form "สร้างพร้อมสำหรับ ... / จุดประสงค์ของภาพ: ..." is kept, then append stylized suffix
  return `${trimmed} — ${STYLIZED_SUFFIX}`;
}

export function hashToSeed(value: string): number {
  let hash = 2166136261;
  for (let i = 0; i < value.length; i++) {
    hash ^= value.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return Math.abs(hash) % 2147483647;
}

export function buildPollinationsUrl(prompt: string, seed: number, model: PollinationsModel = "flux", width = 512, height = 512): string {
  const encoded = encodeURIComponent(prompt);
  return `https://image.pollinations.ai/p/${encoded}?seed=${seed}&model=${model}&width=${width}&height=${height}&nologo=true`;
}

export function createPollinationsProvenance(input: { geminiBrief: string; assetId: string; model?: PollinationsModel; seed?: number }): PollinationsProvenance {
  const prompt = geminiBriefToPrompt(input.geminiBrief);
  const seed = typeof input.seed === "number" && Number.isFinite(input.seed) ? Math.floor(input.seed) : hashToSeed(input.assetId);
  const model = input.model ?? "flux";
  const url = buildPollinationsUrl(prompt, seed, model);
  return {
    source: "pollinations",
    geminiBrief: input.geminiBrief,
    prompt,
    seed,
    model,
    url,
    generatedAt: new Date().toISOString(),
  };
}

export function validatePollinationsProvenance(candidate: unknown): { valid: boolean; reason?: string } {
  if (!candidate || typeof candidate !== "object" || Array.isArray(candidate)) return { valid: false, reason: "provenance must be an object" };
  const p = candidate as Partial<PollinationsProvenance>;
  if (p.source !== "pollinations") return { valid: false, reason: "source must be pollinations" };
  if (typeof p.geminiBrief !== "string" || !p.geminiBrief.startsWith("สร้างพร้อมสำหรับ")) return { valid: false, reason: "geminiBrief must start with สร้างพร้อมสำหรับ" };
  if (typeof p.prompt !== "string" || p.prompt.length < 10) return { valid: false, reason: "prompt too short" };
  if (!p.prompt.includes(STYLIZED_SUFFIX.slice(0, 20))) return { valid: false, reason: "prompt must include stylized suffix" };
  if (typeof p.seed !== "number" || !Number.isInteger(p.seed) || p.seed < 0 || p.seed > 2147483647) return { valid: false, reason: "seed must be integer 0..2147483647" };
  if (p.model !== "flux" && p.model !== "turbo" && p.model !== "gptimage") return { valid: false, reason: "model must be flux/turbo/gptimage" };
  if (typeof p.url !== "string" || !p.url.startsWith("https://image.pollinations.ai/p/")) return { valid: false, reason: "url must be pollinations" };
  if (typeof p.generatedAt !== "string" || Number.isNaN(Date.parse(p.generatedAt))) return { valid: false, reason: "generatedAt must be ISO date" };
  if (p.sha256 !== undefined && (typeof p.sha256 !== "string" || !/^[a-f0-9]{64}$/.test(p.sha256))) return { valid: false, reason: "sha256 must be 64 hex" };
  return { valid: true };
}
