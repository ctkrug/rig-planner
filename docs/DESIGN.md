# Design direction

## Aesthetic direction

**Blueprint / technical.** Rigfit is an engineering tool for planning
hardware, so the page reads like a schematic: a deep blueprint-navy canvas
with cyan linework, dimension-line accents, and monospace annotations next
to clean technical headings — the fit badges read like inspection stamps on
a spec sheet, not app UI chrome. This is a deliberate departure from generic
"dark gray cards + one accent" — the grid, the linework, and the
dimension-mark corners are load-bearing, not decorative.

## Tokens

| Token | Value | Use |
|---|---|---|
| `--bg` | `#0a1929` | Page background (deep blueprint navy) |
| `--surface-1` | `#0f2439` | Card / panel surface |
| `--surface-2` | `#15304a` | Raised surface (hover, active panel) |
| `--text` | `#e8f1f8` | Primary text |
| `--text-muted` | `#7fa8c9` | Secondary text, labels, annotations |
| `--accent` | `#4fd1ff` | Blueprint cyan — links, focus, linework, primary CTA |
| `--accent-support` | `#ff8a4f` | Warm orange — trending badge, secondary emphasis |
| `--success` | `#4ade80` | Green fit badge |
| `--warning` | `#fbbf24` | Yellow fit badge |
| `--danger` | `#f87171` | Red fit badge |

- **Type pairing:** [Space Grotesk](https://fonts.google.com/specimen/Space+Grotesk)
  (display — wordmark, headings, section titles) + [IBM Plex Mono](https://fonts.google.com/specimen/IBM+Plex+Mono)
  (UI — body copy, labels, data values, form inputs). System fallback stack:
  `system-ui, sans-serif` / `ui-monospace, monospace`.
- **Spacing scale:** 8px unit — 8 / 16 / 24 / 32 / 48 / 64.
- **Corner radius:** 4px. Sharp and technical, not soft — this is a
  schematic, not a toy.
- **Shadow / glow:** interactive and focused elements get a soft cyan glow
  (`0 0 0 3px rgba(79, 209, 255, 0.25)`); panels get a subtle downward
  shadow for depth, not heavy elevation.
- **Motion:** UI transitions 160ms ease-out; micro-feedback (badge pop,
  button press) 90ms ease-out.

## Layout intent

The hero is the **rig console**: on desktop (1440×900) a two-column layout
— a fixed-width input panel (~35%, GPU/RAM fields + the "Plan My Rig" CTA)
on the left, and the ranked results list (~65%, filling the remaining
viewport height) on the right. Together they fill ≥60vh with no empty
background sea. On phone (390×844) the layout stacks: input console first
(collapsed to essentials), CTA, then results below — the primary action is
always reachable without scrolling past decoration.

## Signature detail

A **blueprint scan-line sweep**: hitting "Plan My Rig" triggers a
horizontal cyan scan line that sweeps down across the input panel into the
results panel as the ranked list populates, reinforcing the "your rig is
being analyzed" moment. The page background carries a faint fixed grid
(blueprint graph-paper lines) at low opacity, and panels get architectural
corner dimension-marks (small cyan tick marks at each corner) instead of
plain borders.

## Juice plan (n/a — utility tool, not a game)

Rigfit is a data tool, not a game, so the game-feel checklist doesn't
apply verbatim. The equivalent "feel good to use" moments this direction
still commits to:

- The scan-line sweep on submit (input → visible response well under
  100ms, sweep animation 400–600ms).
- Fit badges pop in with a small scale/opacity tween (120ms ease-out) as
  they render, staggered slightly per row, rather than appearing all at
  once.
- Hover on a result row lifts it slightly (translateY + glow), not just a
  color swap.
- `prefers-reduced-motion` drops the scan-line sweep and stagger, keeping
  instant-render fallback.
