export type DirectRouteScreen = "landing" | "identity" | "lobby" | "maps" | "home" | "game";

const supportedScreens = new Set<DirectRouteScreen>(["landing", "identity", "lobby", "maps", "home", "game"]);

import { PLAYABLE_MAP_IDS, PLAYABLE_MAP_SET } from "./playableMaps";

/** Playable set — owner requested 10 maps (2026-09-17). First entry remains the default fallback. */
export const RUNTIME_MAP_ID = PLAYABLE_MAP_IDS[0]!;
export const RUNTIME_MAP_IDS = PLAYABLE_MAP_IDS;
export const PLAYABLE_RUNTIME_MAP_IDS = PLAYABLE_MAP_IDS;

export function isRuntimeMapAllowed(mapId: string) {
  return PLAYABLE_MAP_SET.has(mapId);
}

export function isPlayableMap(mapId: string): boolean {
  return PLAYABLE_MAP_SET.has(mapId);
}

/** `route` is the durable direct-entry contract; `demo` remains supported for existing review URLs. */
export function resolveDirectRoute(search: string): DirectRouteScreen {
  const params = new URLSearchParams(search);
  const requested = params.get("route") ?? params.get("demo");
  return requested && supportedScreens.has(requested as DirectRouteScreen) ? requested as DirectRouteScreen : "landing";
}

/** Only the approved vertical-slice maps may be entered from a runtime URL (10-map set). */
export function resolveDirectMapId(search: string, availableMapIds: readonly string[], fallback = RUNTIME_MAP_ID) {
  const safeFallback = availableMapIds.includes(RUNTIME_MAP_ID) ? RUNTIME_MAP_ID : fallback;
  const requested = new URLSearchParams(search).get("map");
  return requested && availableMapIds.includes(requested) && isRuntimeMapAllowed(requested) ? requested : safeFallback;
}
