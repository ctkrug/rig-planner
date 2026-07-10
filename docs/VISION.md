# Vision

## The problem

Local LLM tooling answers "does model X fit on my hardware?" one model at a
time — you pick a model, dig up its GGUF quant sizes, do the VRAM math
yourself, and repeat for every candidate. There's no tool that starts from
the hardware you actually have and works backward to "here's what you should
run." And even when someone does that math, the answer is usually static:
lists of "recommended local models" go stale within weeks because the
ecosystem moves fast — new fine-tunes, new quant formats, new best-in-class
7B models displace last month's pick constantly.

## Who it's for

People with a GPU (or a beefy Mac) who want to run something useful locally
today, without becoming an expert in GGUF quantization math or spending an
evening cross-referencing model cards. Primarily hobbyists and developers
already comfortable with tools like Ollama or llama.cpp, but who don't want
to manually track what's currently good.

## The core idea

Reverse the usual flow. Instead of "pick a model, check if it fits," Rigfit
takes the hardware budget as the input and solves for the
best-fitting, currently-relevant model:

1. **Input:** GPU VRAM, system RAM, optionally a specific GPU model for more
   accurate real-world VRAM headroom (driver/OS overhead varies).
2. **Solve:** filter the model+quantization catalog to what fits, factoring
   in usable context length at that quant and RAM-offload fallback for
   borderline cases.
3. **Rank:** order by fit quality, then boost anything currently trending on
   Hugging Face or Hacker News so the top of the list reflects *this week*,
   not a snapshot from whenever the catalog was last hand-edited.
4. **Present:** a ranked list with a green/yellow/red fit badge per entry —
   the "wow" is seeing a real, current, ranked recommendation instead of a
   spec sheet you have to interpret yourself.

## Key design decisions

- **Reverse direction is the whole point.** Plenty of sites list "best local
  LLMs" — none start from your hardware and solve for you. This is the
  differentiator, not a feature among many.
- **Static site, no backend.** The catalog and trending snapshot are data
  files (`data/models.json`, `data/trending.json`) built into the static
  bundle. No server means no hosting cost and no infra to keep alive — it
  fits the "$0 metered cost, low-maintenance" constraint of everything in
  this portfolio.
- **Freshness via a scheduled script, not a live API call from the
  browser.** A weekly GitHub Actions cron regenerates `data/trending.json`
  and commits it. This keeps the deployed site fast and free (static JSON,
  no client-side API keys or rate limits) while staying current within a
  week, which is fine for a "what's hot" signal.
- **The solver is real constraint-solving, not a lookup table.** VRAM
  headroom, context length at a given quant, and RAM-offload viability are
  all factored into the fit score — the catalog is data, but the ranking
  logic is not hardcoded per model.
- **Trending boosts rank; it doesn't gate it.** A model that fits well but
  isn't currently trending should still show up — trending only affects
  ordering among otherwise-comparable fits, so the list never goes empty
  just because nothing on HN this week matches your hardware.

## What "v1 done" looks like

- Enter VRAM + RAM, hit go, and get a ranked list of model+quant
  combinations with a fit badge — no login, no config file, works on first
  load.
- The catalog covers a meaningfully broad range of popular local models
  across the small/medium/large VRAM tiers, not just two or three examples.
- The weekly refresh pipeline has run at least once for real (not just
  locally) via the GitHub Actions cron, and trending status visibly affects
  ranking in the UI.
- The page meets the design bar in `docs/DESIGN.md`: composed at phone and
  desktop widths, themed interaction states, no anti-generic tells.
- Deployable as a static bundle to `apps.charliekrug.com/rig-planner` with
  relative asset paths and no server dependency.
