# Design

Source of truth for the visual system. Product truth lives in `PRODUCT.md`.

**Direction (2026-11-18): Security console.** Chosen by the user after rejecting the paper "case file"
look as too marketing. Bans from the handoff still hold (user confirmed): no neon green on black, no
blinking cursor, no `>` prompt logos, no matrix rain, no glow.

## World

The site reads like a well-made security tool (think Burp, Wireshark, a SOC console): dark-first,
dense panes with title bars, hairline grid, monospace for every piece of data, one amber signal accent,
and a small severity-style color set used only to classify real attributes. Credible tooling, not
movie hacking.

- Pages are built from **panes**: an outlined panel with a mono caps title bar (title left, meta right).
- Data is tabular: key/value tables, list rows with IDs (`PRJ-001`), ISO-style dates (`2026-09`).
- Projects are a findings-style table: ID, AREA (color-coded), title + summary, stack, date.
  AREA is a real classification (AI SEC / APPSEC / CRYPTO), never an invented severity score.
- Status line: "OPEN TO CO-OP / INTERNSHIP" with an amber indicator, once per page at most.

## Palette

| Role | Dark (primary design) | Light (daylight console) |
|---|---|---|
| Background | `#0B0E12` | `#EEF1F4` |
| Pane / surface-container-low | `#11161C` | `#FAFBFC` |
| Pane title bar / surface-container | `#161C24` | `#E6EAEF` |
| surface-container-high | `#1C232C` | `#DDE2E8` |
| surface-container-highest | `#232B35` | `#D3D9E0` |
| Text | `#D9DFE7` | `#141A21` |
| Muted | `#8B97A6` | `#4E5A68` |
| Outline (pane borders) | `#2A333E` | `#B8C1CB` |
| Hairline (row rules) | `#1E262F` | `#D3D9E0` |
| Primary / signal amber | `#F0B04A` | `#8A5A00` |
| Focus / link cyan | `#5CC8E0` | `#00708A` |
| Area: AI SEC (red) | `#FF7B6E` | `#B3261E` |
| Area: APPSEC (amber) | `#F0B04A` | `#8A5A00` |
| Area: CRYPTO (blue) | `#7DB8FF` | `#1D5FA8` |

Material seeds: primary `#C98A1E`, tertiary `#2A8FA8`, neutral `#5B6672` (`src/styles/_theme-colors.scss`);
exact values are mapped onto `--mat-sys-*` with `light-dark()` in `src/styles/_theme.scss`. Area colors
are site tokens (`--site-area-*`). No pure black or white.

## Type

- UI / body (`plain-family`): **IBM Plex Sans** 400/500/600.
- Data, headings, labels (`brand-family` + `--site-font-mono`): **IBM Plex Mono** 400/500/600.
- h1 is the only large type (mono, 600). Section titles live in pane title bars (mono caps, small).
- Never Inter, never JetBrains Mono.

## Shape, density, motion

- Radius 2px max (panes, buttons); 0 inside tables.
- Density: compact. Rows 40-48px, tap targets still >= 44px on touch.
- No shadows, no glow. Hover = row background shifts to `surface-container`, accent text.
- Motion: minimal; route view transition is a short fade; everything off under reduced motion.

## Components (Angular Material)

`mat-toolbar` header, `mat-sidenav` mobile nav (< 768px), `matButton` (`filled` = amber, one per view;
`outlined` secondary), `mat-card appearance="outlined"` as the **projects pane** only (rows inside are
not cards), `mat-list` / `mat-nav-list` for writeups, certs, contact channels, `mat-divider` between
rows where a rule is needed. Tags render as plain mono text separated by `/`. Icons: Material Symbols
Outlined (subset list in `src/index.html`).

## Copy

Plain, first person, specific. No em-dashes. Status line appears once per page at most.
