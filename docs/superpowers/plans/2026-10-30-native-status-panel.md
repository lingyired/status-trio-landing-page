# Native Status Panel Implementation Plan

> **For agentic workers:** Use subagent-driven-development to execute this plan. The user explicitly selected `group/smart-auto` for implementation. The parent owns browser acceptance.

**Goal:** Reproduce the native Status Trio panel's visual structure and controls in the existing interactive landing page, especially its battery detail view.

**Architecture:** Retain React, the shared in-memory demo state and the current panel routing. Replace presentation within the existing panel rather than redesigning the landing page. Use static SVG for the native power ribbons and local vector icons; no new runtime dependencies.

**Tech Stack:** React 19, TypeScript, Rsbuild, CSS, inline SVG.

**Spec:** The user's two screenshots and the concrete design specification below form this plan's specification. Frozen native v1.8.0 views are the layout source of truth.

## Design Specification

The website summary and native battery screenshot show different routes. Improve both, and compare battery detail against battery detail for acceptance.

- Surface: warm charcoal translucent material in dark mode, corresponding light material, restrained border and shadow, continuous rounded shape and anchored pointer. Use native system typography within this reproduction. Preserve the surrounding site's design.
- Summary: compact section headers and device rows; short secondary lines; quieter connection/use buttons; aligned icons/checkmarks; native sliders, switches and footer. Keep demo disclosures concise and truthful, without repeating engineering paragraphs in every section.
- Battery detail order: back chevron with `Battery · {level}%`; power diagram; compact right-aligned metrics and estimate explanation; optional CPU energy list; low-power switch; optional charge action area; two plain settings actions.
- Power graph: reproduce `BatteryPowerFlowView.swift`. Input card at left (62 units wide), right destination cards (94 wide), diagram height132 for two destinations/76 for one, cubic ribbons joining cards. Use green battery and blue system treatments, with thickness proportional to flow. Zero flow produces no nonzero ribbon. Hidden input/destination settings must still give a coherent layout.
- CPU list: compact 16-unit local icons, app names and right-aligned values. Remove graph bars from the status panel. Existing fixed CPU-activity percentages may stay with accurate activity-basis copy; if examples change to mW/W, label them explicitly as fixed CPU-energy examples and update every consumer and explanation consistently. Do not invent measured energy.
- Actions: a native-looking small switch for low power; compact charge status/action row retaining all existing phase transitions; two native-looking text actions for system power settings and App battery settings. Browser cannot open system settings: the system action must disclose that locally, while App battery settings opens the existing website settings. No silent inert button or actual OS operation.

## Global Constraints

- Implementation root: `/Users/lingsmbp/Documents/aiwork/status-trio-landing-page-worktrees/release-1.7.4`.
- Read-only frozen source: `/Users/lingsmbp/Documents/aiwork/status-trio-landing-page-worktrees/evidence-latest-20261030/app-v1.8.0`.
- Before-pass baseline: `/Users/lingsmbp/Documents/aiwork/status-trio-landing-page-worktrees/evidence-panel-native-20261030/baseline`.
- Native reference image: `/var/folders/fb/571dj86d5g3c996z315hl1r40000gn/T/codex-clipboard-c77b3d67-4c5f-4295-8009-6d6efdd58a7c.png`.
- Website before image: `/var/folders/fb/571dj86d5g3c996z315hl1r40000gn/T/codex-clipboard-b380f1fc-be80-4844-b308-c3f27c7c99cf.png`.
- No stage, commit, push, merge, PR, deploy, release, native App launch, real hardware sampling, OS changes, audio playback or installation.
- Preserve shared state, release v1.8.0 metadata, Homebrew, mirrors, Fund01, page layout, all approved image assets and existing status-icon geometry.
- Preserve all existing default preferences and charge-demo semantics. No default input-power or CPU-list enablement merely to improve a screenshot.
- Preserve zh/en, light/dark, keyboard focus on detail entry/return, escape/outside dismissal, settings navigation and empty-panel recovery.
- No native Swift edits and no new libraries. Demo disclosure must remain discoverable and accurate.

## Review Focus

1. With input hidden, either/both destinations hidden or zero battery power, cards/ribbons must remain truthful and contained.
2. At375px width, long English labels and a tall panel must scroll vertically without horizontal clipping.
3. Charging, completion, cancel and reset must retain the existing distinction between reading, power connection and charge limit.
4. Keyboard users must reach Back, switch, charge actions and settings; detail focus restoration must survive the visual replacement.
5. Summary changes must preserve Bluetooth/audio availability and shared Menu Bar/Dock state; native-looking system actions must explain browser limitations.

## File Responsibilities

- Modify `src/sections/StatusPanel.tsx`: summary/detail presentation and local system-action disclosure; retain routing and state helpers.
- Optionally create `src/sections/BatteryPowerFlow.tsx`: one static diagram component if this improves readability.
- Modify `src/styles/landing.css`: scoped panel material, compact rows, diagram, native controls and responsive treatment.
- Modify `src/copy.ts`: matching zh/en labels and concise demo disclosures.
- Modify `src/status/demo-state.ts` only if fixed energy example presentation needs a consistent type change. Do not alter behavioral helpers for a styling task.
- Modify `src/sections/StatusDock.tsx` only if pointer/material integration requires it. Preserve positioning and event ownership.
- Write `docs/superpowers/plans/2026-10-30-native-status-panel-report.md`: task-only file inventory and checks.

## Task 1: Native Panel Surface and Compact Summary

- [x] Read the existing panel, CSS and native section views before editing. Compare to both user screenshots.
- [x] Scope the new material to `.sp` and its pointer, preserving the site's other `.card` surfaces.
- [x] Tighten row spacing and typography. Keep device identity, availability, focus and selection clear.
- [x] Use concise secondary labels and a discoverable local-demo disclosure rather than repeated long section explanations.
- [x] Inspect summary in both themes at375px and desktop. Exercise Bluetooth connection/output/input actions and footer recovery.

## Task 2: Native Battery Detail

- [x] Read native `BatteryDetailsView.swift`, `BatteryPowerFlowView.swift`, `HighEnergyAppsView.swift`, and the existing charge helpers.
- [x] Replace metric tiles and straight rails with the curved native diagram. Consume `batteryPowerFlowValues(state.batteryPower)` and existing visibility preferences.
- [x] Use these native geometry constants: two destinations132high, one76high, input62wide, right94wide, input edge66, right edge `width - 98`, centers31/101 for two destinations; cubic control at half the span. Ribbon thickness is `46 * watts / max(input, visible destination sum, 1)`.
- [x] Use an SVG viewBox or measured local width without polling. Keep metric labels accessible and avoid squashing text at mobile widths.
- [x] Reorder detail content to match the design specification; keep useful condition/capacity information where native-like compact metrics fit.
- [x] Replace energy bars with icon/name/value rows and an accurate basis note.
- [x] Restyle low power as a labelled `role="switch"` or native checkbox with correct checked state. Preserve its existing state patch.
- [x] Compact the existing charge area without removing start/completion/cancel/reset actions or eligibility explanations.
- [x] Add two plain action rows; system action exposes local explanatory feedback, App action uses existing `openSettings('battery')`.
- [x] Check all five review-focus conditions through focused state contracts and browser acceptance.

## Task 3: Verification and Local Delivery

- [x] Run `npm run typecheck` and `npm run build`.
- [x] Run the existing release-copy, v1.8-defaults, v1.8-state, demo and rendered contracts unchanged:

```sh
node /Users/lingsmbp/Documents/aiwork/status-trio-landing-page-worktrees/evidence-latest-20261030/verify-release-copy.mjs /Users/lingsmbp/Documents/aiwork/status-trio-landing-page-worktrees/release-1.7.4
node /Users/lingsmbp/Documents/aiwork/status-trio-landing-page-worktrees/evidence-latest-20261030/verify-v1.8-defaults.mjs /Users/lingsmbp/Documents/aiwork/status-trio-landing-page-worktrees/release-1.7.4
node /Users/lingsmbp/Documents/aiwork/status-trio-landing-page-worktrees/evidence-latest-20261030/verify-v1.8-state.mjs /Users/lingsmbp/Documents/aiwork/status-trio-landing-page-worktrees/release-1.7.4
node /Users/lingsmbp/Documents/aiwork/status-trio-landing-page-worktrees/evidence-1.7.4-20261025/verify-demo-contracts.mjs /Users/lingsmbp/Documents/aiwork/status-trio-landing-page-worktrees/release-1.7.4
node /Users/lingsmbp/Documents/aiwork/status-trio-landing-page-worktrees/evidence-1.7.4-20261025/verify-rendered-contracts.cjs /Users/lingsmbp/Documents/aiwork/status-trio-landing-page-worktrees/release-1.7.4
git diff --check
```

- [x] Parent reloads the local page and verifies zh/en × light/dark at375/768/1440 widths, checking document and `.lp-desktop` overflow. Review summary, battery detail and network detail.
- [x] Parent enables optional power-input/energy examples through UI solely for screenshot comparison, verifies power states and takes final desktop/mobile screenshots.
- [x] Verify existing screenshot files are byte-identical to before-pass baseline, task-only inventory has no unrelated edits, and loopback preview returns HTTP200.
- [x] Update this checklist/report with observed results and any limitations. Keep preview process and review tab alive.

## Execution

The user has explicitly authorized plan-then-execution using `group/smart-auto`. Start one focused implementation worker after this file is written. Parent performs non-overlapping browser setup and acceptance preparation while the worker edits; parent does not concurrently edit product files.
