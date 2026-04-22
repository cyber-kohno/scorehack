# Phase 43 Progress

## Current status
Phase 43 has been initialized.
The focus is preparing the `ref` slice further by extracting `timerKeys`.

Related documents:
- `ai_context/phase/phase43_plan.md`
- `ai_context/phase/phase42_close_note.md`

---

## Checklist
- [x] 1. Inventory `timerKeys` usage
- [x] 2. Create the dedicated helper/session surface
- [x] 3. Redirect callers safely
- [x] 4. Reassess remaining `ref` surface

---

## Result
- `timerKeys` moved to `tauri_app/src/state/session-state/viewport-timer-store.ts`
- `timerKeys` removed from `tauri_app/src/system/store/props/storeRef.ts`
- viewport scroll helper now reads timer keys from the dedicated store
- verification completed with:
  - `npm run check`
  - `npm run build`
  - `cargo check`
