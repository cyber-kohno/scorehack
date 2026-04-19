# Phase 27 Progress

## Current status
Phase 27 is complete.
The `useReducerRef(...)` helper bundle has been eliminated and replaced with explicit feature-level helpers.

Related documents:
- `ai_context/phase/phase27_plan.md`
- `ai_context/phase/phase26_close_note.md`

---

## Checklist
- [x] 1. Inventory current `useReducerRef(...)` usage
- [x] 2. Group helpers by destination layer
- [x] 3. Migrate the safest usages
- [x] 4. Verify build stability
- [x] 5. Record next-step judgement

---

## What changed
- Added reusable viewport scroll primitives:
  - `tauri_app/src/app/viewport/scroll-actions.ts`
- Added explicit feature helpers:
  - `tauri_app/src/app/outline/outline-scroll.ts`
  - `tauri_app/src/app/melody/melody-scroll.ts`
  - `tauri_app/src/app/terminal/terminal-scroll.ts`
  - `tauri_app/src/app/arrange/piano-editor-scroll.ts`
- Added ref/session helper:
  - `tauri_app/src/state/session-state/track-ref-session.ts`
- Removed `tauri_app/src/system/store/reducer/reducerRef.ts`

---

## Verification
- `npm run check` passed
- `npm run build` passed
- `cargo check` passed

---

## Judgement
The legacy mixed ref/scroll helper bundle is gone.
Scroll and ref adjustments are now grouped by feature responsibility instead of being hidden behind a generic reducer-like helper.
