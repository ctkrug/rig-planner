import type { Recommendation } from "../lib/types";

const FIT_COPY: Record<Recommendation["fit"], { label: string; ariaLabel: string }> = {
  green: { label: "Comfortable fit", ariaLabel: "Comfortable fit — runs at full context with headroom to spare" },
  yellow: { label: "Tight fit", ariaLabel: "Tight fit — runs, but with a truncated context or RAM offload" },
  red: { label: "Won't fit", ariaLabel: "Won't fit this rig" },
};

export function fitBadgeCopy(fit: Recommendation["fit"]): { label: string; ariaLabel: string } {
  return FIT_COPY[fit];
}

/** e.g. 32768 -> "32K tokens", 4096 -> "4K tokens", 500 -> "500 tokens" */
export function formatContext(tokens: number): string {
  if (tokens >= 1000) {
    const thousands = tokens / 1000;
    const rounded = Number.isInteger(thousands) ? thousands.toString() : thousands.toFixed(1);
    return `${rounded}K tokens`;
  }
  return `${tokens} tokens`;
}

/**
 * Human-readable headroom explanation for the fit-detail expansion, e.g.
 * "12GB VRAM − 9.5GB required = 2.5GB headroom" or, when offloaded, the RAM equivalent.
 */
export function formatHeadroom(rec: Recommendation, spec: { vramGb: number; ramGb: number }): string {
  const budgetGb = rec.offloaded ? spec.ramGb : spec.vramGb;
  const budgetLabel = rec.offloaded ? "RAM" : "VRAM";
  const requiredGb = budgetGb - rec.headroomGb;
  const headroomAbs = Math.abs(rec.headroomGb).toFixed(1);
  const sign = rec.headroomGb >= 0 ? "headroom" : "short";
  return `${budgetGb}GB ${budgetLabel} − ${requiredGb.toFixed(1)}GB required = ${headroomAbs}GB ${sign}`;
}

export function formatContextDetail(rec: Recommendation): string {
  const achievable = formatContext(rec.achievableContext);
  if (rec.achievableContext >= rec.variant.contextLength) {
    return `Full ${achievable} context`;
  }
  return `${achievable} of ${formatContext(rec.variant.contextLength)} max context`;
}
