import "./style.css";
import rawCatalog from "../data/models.json";
import rawTrending from "../data/trending.json";
import type { ModelVariant, TrendingSnapshot } from "./lib/types";
import { recommend } from "./lib/solver";
import { matchTrending } from "./lib/trending";
import { renderEmptyState, renderResultsList } from "./ui/render";
import { validateRigInput } from "./ui/validate";
import { GPU_PRESETS, usableVramGb } from "./ui/gpu-presets";

const MODEL_CATALOG = rawCatalog as ModelVariant[];
const TRENDING = rawTrending as TrendingSnapshot;
const trendingIds = matchTrending(MODEL_CATALOG, TRENDING);

function gpuOptionsHtml(): string {
  return GPU_PRESETS.map((preset) => `<option value="${preset.id}">${preset.label}</option>`).join("");
}

function pageHtml(): string {
  return `
    <div class="page">
      <header class="site-header">
        <p class="eyebrow">Local LLM fit planner</p>
        <h1 class="wordmark">Rig<span class="wordmark__accent">Planner</span></h1>
        <p class="tagline">
          Enter your GPU and RAM. Get a ranked list of local LLMs and quantizations you can run
          right now, refreshed weekly against what's trending.
        </p>
      </header>
      <main class="console">
        <section class="panel panel--input" aria-label="Rig input">
          <form id="rig-form" novalidate>
            <div class="field">
              <label for="gpu-preset">GPU model <span class="field__optional">(optional)</span></label>
              <select id="gpu-preset" name="gpu-preset">
                <option value="">— not listed / skip —</option>
                ${gpuOptionsHtml()}
              </select>
            </div>
            <div class="field">
              <label for="vram">GPU VRAM (GB)</label>
              <input id="vram" name="vram" type="number" inputmode="decimal" min="0" step="0.5" placeholder="e.g. 12" />
            </div>
            <div class="field">
              <label for="ram">System RAM (GB)</label>
              <input id="ram" name="ram" type="number" inputmode="decimal" min="0" step="1" placeholder="e.g. 32" />
            </div>
            <p id="form-error" class="form-error" role="alert" hidden></p>
            <button type="submit" class="cta">Plan My Rig</button>
          </form>
        </section>
        <section class="panel panel--results" aria-label="Recommendations">
          <div id="results" aria-live="polite"></div>
        </section>
        <div class="scan-line" aria-hidden="true"></div>
      </main>
    </div>
  `;
}

function wireForm(): void {
  const form = document.querySelector<HTMLFormElement>("#rig-form");
  const gpuSelect = document.querySelector<HTMLSelectElement>("#gpu-preset");
  const vramInput = document.querySelector<HTMLInputElement>("#vram");
  const ramInput = document.querySelector<HTMLInputElement>("#ram");
  const errorEl = document.querySelector<HTMLParagraphElement>("#form-error");
  const results = document.querySelector<HTMLDivElement>("#results");
  const consoleEl = document.querySelector<HTMLElement>(".console");

  if (!form || !gpuSelect || !vramInput || !ramInput || !errorEl || !results || !consoleEl) return;

  gpuSelect.addEventListener("change", () => {
    const preset = GPU_PRESETS.find((p) => p.id === gpuSelect.value);
    if (preset) vramInput.value = String(usableVramGb(preset));
  });

  form.addEventListener("submit", (event) => {
    event.preventDefault();

    const validation = validateRigInput({
      vramGb: vramInput.value,
      ramGb: ramInput.value,
      gpuModel: gpuSelect.selectedOptions[0]?.textContent ?? undefined,
    });

    if (!validation.ok) {
      errorEl.textContent = validation.error;
      errorEl.hidden = false;
      return;
    }
    errorEl.hidden = true;

    consoleEl.classList.remove("is-scanning");
    void consoleEl.offsetWidth; // restart the sweep animation on repeat submissions
    consoleEl.classList.add("is-scanning");

    const recommendations = recommend(validation.spec, MODEL_CATALOG, trendingIds);
    renderResultsList(results, recommendations, validation.spec);
  });
}

export function mountApp(): void {
  const app = document.querySelector<HTMLDivElement>("#app");
  if (!app) return;

  app.innerHTML = pageHtml();
  wireForm();

  const results = document.querySelector<HTMLDivElement>("#results");
  results?.append(renderEmptyState('Enter your GPU VRAM and system RAM, then hit "Plan My Rig".'));
}

mountApp();
