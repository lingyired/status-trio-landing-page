# Native Status Panel Visual Pass Report

Plan: `docs/superpowers/plans/2026-10-30-native-status-panel.md`

## Outcome

Implemented the native status-panel visual pass in the existing interactive
landing page. The summary and battery detail now use the native panel's 330 pt
scale, warm translucent material, compact typography and controls. The battery
detail uses the frozen v1.8 power-flow geometry, local app icons for CPU activity
examples, a native-style Low Power switch, the existing charge-demo transitions,
and explicit browser behavior for the two settings actions.

No defaults, behavioral helpers, approved composite status-icon geometry,
screenshots, release metadata, Homebrew copy, audio behavior, or native App
sources were changed.

## Changed Paths

- `src/sections/StatusPanel.tsx`
- `src/sections/BatteryPowerFlow.tsx`
- `src/styles/landing.css`
- `src/copy.ts`
- `docs/superpowers/plans/2026-10-30-native-status-panel.md`
- `docs/superpowers/plans/2026-10-30-native-status-panel-report.md`

`src/status/demo-state.ts`, `src/sections/StatusDock.tsx`, and approved image
assets remain byte-identical to the before-pass baseline.

## Implemented

- Scoped the warm charcoal/light material to `.sp` and its pointer; other
  `.card` surfaces retain their existing material.
- Matched the native 330 pt panel width and 14 pt inset while preserving full
  width under the existing 860 px responsive breakpoint.
- Tightened summary rows, titles, secondary lines, device actions and footer
  controls; replaced the sun-like settings mark with a cog-shaped local SVG.
- Added one compact demo disclosure per surface instead of repeating long
  engineering notices in each section.
- Added `BatteryPowerFlow.tsx` with the frozen native geometry: 302-unit local
  canvas, 62-unit input, 94-unit destinations, 132/76-unit heights, centers
  31/101, edge coordinates 66 and `width - 98`, cubic controls at half-span,
  and `46 * watts / max(input, visible destination sum, 1)` ribbon thickness.
- Preserved coherent layouts for hidden input, hidden destinations, one
  destination and zero flow. Zero flow emits no nonzero ribbon.
- Reordered battery detail to header, power diagram, compact right-aligned
  metrics, estimate explanation, optional CPU activity examples, Low Power
  switch, optional charge area, and two plain settings actions.
- Removed status-panel graph bars from CPU examples. Fixed percentage examples
  remain percentages and now use local 16 px icons, app names and right-aligned
  values with activity-basis wording.
- Preserved every charge-demo phase transition and the distinction between the
  battery reading and simulated charge limit.
- The Low Power control is a labelled `role="switch"` button with
  `aria-checked`; it patches the existing `lowPower` state.
- The system power action only reveals local explanatory feedback. The App
  battery action uses the existing `openSettings('battery')` route.
- Preserved detail focus/return logic, escape/outside dismissal ownership,
  Bluetooth/audio state, shared Menu Bar/Dock state and panel routing.

## Verification

| Check | Result |
| --- | --- |
| `npm run typecheck` | PASS |
| `npm run build` | PASS |
| `verify-release-copy.mjs` | PASS |
| `verify-v1.8-defaults.mjs` | PASS |
| `verify-v1.8-state.mjs` | PASS |
| `verify-demo-contracts.mjs` | PASS |
| `verify-rendered-contracts.cjs` | PASS |
| `verify-power-flow.cjs` | PASS: 21 combinations |
| `git diff --check` | PASS |
| Existing preview `http://127.0.0.1:4174/` | HTTP 200 |
| Before-pass baseline comparison | Only the six paths listed above differ or are new |
| Approved screenshot assets | Byte-identical to baseline |

An early parent review found two geometry defects in the first build. Both were
corrected before this report was finalized:

- Battery destination text now uses `batteryY + 1` and `batteryY + 15`, so it
  stays inside the upper card when two destinations are visible.
- Ribbon scale now uses `max(chargerInputWatts, visible battery + system sum, 1)`
  rather than the largest individual destination.

Typecheck, build, all five contracts and `git diff --check` were rerun after the
correction.

A second parent browser pass found two CSS layout defects, also corrected:

- Removed the cyclic `max-width: 62%` from battery metric values. The row grid
  now gives the value column a bounded `4.5rem` to `48%` track, with right
  alignment and normal wrapping for longer English values.
- Replaced the percentage-based intrinsic panel width with a definite `330px`
  width plus `max-width: 100%`. `.pg-dock-body` can now measure the same width
  as the panel; the existing mobile `width: 100%` behavior and `StatusDock`
  positioning logic remain unchanged.
- Shortened all visible charge action/state labels in Chinese and English
  (`立即充满电` / `模拟完成` / `恢复充电上限` / `重置演示` and matching states)
  while preserving the disclosure and exact state transitions.

A final independent reviewer pass found three narrow issues, also corrected:

- The power section now checks visibility before power-source availability.
  With all three power items hidden, both battery and external-power states show
  the hidden-items explanation, and the estimate note is rendered only when
  power flow and at least one metric are visible.
- The estimate copy now describes independent fixed examples rather than
  claiming page values changed because of sensor timing. It separately notes
  that native-app sensor readings may lag.
- Battery and system numeric values use the primary ink color; green and blue
  remain limited to the icons, card tints and ribbons.

The final correction was rebuilt and verified with typecheck, all five unchanged
contracts, the independent 21-combination power-flow contract,
`git diff --check`, and loopback HTTP 200.

Actual contract outputs:

```text
PASS: v1.8.0, build 46, manifest/cask digest, installation and bilingual release copy
PASS: v1.8 battery defaults, opt-in energy/Apple discovery, five fixed energy examples and Standard/DDC default
PASS: power-source coherence, native/DDC/BetterDisplay routes, charge start/cancel/complete/restore/reset/hide/unplug and CPU units
PASS: native 1.7.4 demo mapping contracts and boundary cases
PASS: rendered gap masks, Ethernet visibility, Wi-Fi measurements and independent input fallback
```

## Parent Browser Acceptance

Parent-observed results:

- Panel and `.pg-dock-body` both measured 330 px; the caret remained inside the
  panel and all metric values stayed on one line.
- Twelve zh/en × light/dark × 375/768/1440 layout combinations reported zero
  document or `.lp-desktop` horizontal overflow.
- Low Power preserved the 75% reading and changed the power source from
  plugged-in to charging.
- Charge start, cancel, reset and complete transitions worked.

The parent continues summary, network, focus and visibility acceptance and owns
the final screenshots. No native App launch, real hardware access, OS operation,
audio playback, stage, commit, push, merge, deploy or release was performed.

## Parent Final Acceptance

Completed2026-10-30:36responsive route/language/theme/width combinations, zero horizontal overflow; popover/caret measurements match. Detail keyboard focus, Low Power, all charge phases, system action feedback, App-settings navigation, Bluetooth fallback, Escape and empty-panel recovery verified through rendered UI. Hidden/zero/single power cases verified. Browser console contains no warnings/errors. Original repositories and8approved screenshots remain unchanged. Final parent typecheck/build, five existing contracts,21new diagram combinations and whitespace checks all pass. PreviewHTTP200; viewport override reset. Final screenshots/evidence are in sibling evidence-panel-native-20261030.
