# Architecture

A static Vite/TypeScript app. No backend, no build-time server calls —
`data/*.json` is fetched at bundle time via `resolveJsonModule` imports and
shipped as part of the static site.

## Data flow

```
data/models.json ──┐
                    ├─▶ src/main.ts ──▶ src/lib/trending.ts (matchTrending)
data/trending.json ─┘         │              │
                               │              ▼
                               │      Set<modelId> (this week's trending)
                               ▼
                      src/ui/validate.ts (validateRigInput)
                               │
                               ▼
                        RigSpec { vramGb, ramGb, gpuModel? }
                               │
                               ▼
                      src/lib/solver.ts (recommend)
                               │
                               ▼
                       Recommendation[] (ranked)
                               │
                               ▼
                      src/ui/render.ts (renderResultsList)
                               │
                               ▼
                          #results DOM
```

`data/trending.json` is regenerated weekly by `scripts/refresh-trending.ts`
(run via `.github/workflows/weekly-refresh.yml`), which pulls Hugging Face's
trending-models API and a Hacker News "local llm" search and commits the
merged snapshot. It does **not** attempt catalog matching itself — that's
`matchTrending`'s job, run client-side at page load so a stale/missing
trending file degrades to "nothing is flagged trending," never a crash.

## Modules

- **`src/lib/types.ts`** — shared types: `RigSpec`, `ModelVariant`,
  `FitLevel`/`FitResult`, `Recommendation`, `TrendingEntry`/`TrendingSnapshot`.
  Everything else imports from here; there's no duplicate shape anywhere.
- **`src/lib/solver.ts`** — the actual product logic, framework-free.
  `evaluateFit(spec, variant)` is the constraint solve: does the model's
  weights fit in VRAM, and if so how much context fits in the remaining
  budget (`green` = full context + headroom, `yellow` = fits but truncated
  or tight); if weights alone don't fit VRAM, can the excess be offloaded to
  system RAM (`yellow` = modest offload, `red` = too much of the model would
  run off-GPU, or it doesn't fit RAM either). `recommend(spec, catalog,
  trendingIds)` maps that over the catalog, drops `red` fits, and sorts by
  fit quality → trending tie-break → VRAM requirement.
- **`src/lib/trending.ts`** — `matchTrending()` resolves
  `data/trending.json`'s Hugging Face entries to catalog `modelId`s by
  name-component similarity (case/suffix tolerant). Hacker News entries are
  never matched (they reference tools/discussions, not model IDs). Feeds
  the `trendingIds` set into `recommend()`.
- **`src/ui/validate.ts`** — `validateRigInput()` turns raw form strings
  into a `RigSpec` or a designed error message; the solver never sees
  malformed input.
- **`src/ui/gpu-presets.ts`** — a small list of common GPUs with a
  driver/OS VRAM reservation, so picking one auto-fills a realistic usable
  VRAM figure instead of the card's marketed number.
- **`src/ui/format.ts`** — pure copy formatters (`formatContext`,
  `formatHeadroom`, `fitBadgeCopy`) shared between the detail-view text and
  its tests, kept separate from DOM construction so they're trivial to unit
  test.
- **`src/ui/render.ts`** — builds the actual result-card DOM
  (`renderResultCard`/`renderResultsList`/`renderEmptyState`). Card headers
  are real `<button>`s so keyboard toggling and `aria-expanded` come from
  native semantics rather than a hand-rolled key handler.
- **`src/main.ts`** — wires the above together: renders the page shell,
  attaches the GPU-preset autofill and form-submit handlers, triggers the
  scan-line sweep animation, and calls `recommend()` → `renderResultsList()`.
  Exports `mountApp()` so tests can mount/remount against a fresh `#app` DOM
  without relying on side-effecting module-load timing.
- **`scripts/refresh-trending.ts`** — standalone Node script (not imported
  by the app) that fetches live trending signal and overwrites
  `data/trending.json`. Run via `npm run refresh-data` or the weekly cron.

## Run / test

```bash
npm install
npm run dev         # http://localhost:5173
npm test            # vitest — solver, trending, validate, format, gpu-presets,
                     #   render (jsdom), catalog schema, full app flow (jsdom)
npm run test:coverage # vitest with v8 coverage report (line/branch/function)
npm run typecheck
npm run build        # → dist/, relative-path (base: "./") for subpath hosting
npm run refresh-data # regenerate data/trending.json from live HF/HN signal
```

Tests default to vitest's `node` environment (fast, no DOM) except files
that need one, which opt in per-file with `// @vitest-environment jsdom`
(`tests/render.test.ts`, `tests/app.test.ts`).
