import type { ModelVariant, TrendingSnapshot } from "./types";

function normalize(id: string): string {
  return id.toLowerCase().replace(/[^a-z0-9/]/g, "");
}

/** The distinguishing part of a model ID — everything after the last "/", org stripped. */
function nameComponent(id: string): string {
  const normalized = normalize(id);
  const parts = normalized.split("/");
  return parts[parts.length - 1] ?? normalized;
}

/**
 * Two Hugging Face model IDs are treated as the same model when their name components match
 * exactly or one is a prefix of the other (handles suffix drift like "-Instruct" or a quant
 * tag). A 4-char floor on the compared strings avoids short generic names false-matching.
 */
export function isSameModel(modelId: string, trendingId: string): boolean {
  const a = nameComponent(modelId);
  const b = nameComponent(trendingId);
  if (a.length < 4 || b.length < 4) return false;
  return a === b || a.startsWith(b) || b.startsWith(a);
}

/**
 * Resolves this week's trending snapshot against the catalog by Hugging Face model ID
 * similarity. Hacker News entries reference tools and discussions, not model IDs, so they
 * aren't matched here. Unmatched trending entries are simply absent from the result — no
 * crash, no orphaned reference.
 */
export function matchTrending(catalog: ModelVariant[], trending: TrendingSnapshot): Set<string> {
  const hfIds = trending.entries.filter((entry) => entry.source === "huggingface").map((entry) => entry.id);
  const matched = new Set<string>();

  for (const variant of catalog) {
    if (hfIds.some((hfId) => isSameModel(variant.modelId, hfId))) {
      matched.add(variant.modelId);
    }
  }

  return matched;
}
