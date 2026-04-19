# Phase 43 Plan

## Purpose
Phase 43 continues the `ref` preparation work by extracting the `timerKeys` sub-surface from generic `ref` usage.

Related documents:
- `ai_context/phase/phase42_close_note.md`
- `ai_context/phase/phase41_ref_usage_classification.md`

---

## Main target
- `tauri_app/src/system/store/props/storeRef.ts`
- `timerKeys` readers and writers across:
  - `tauri_app/src/app/viewport/scroll-actions.ts`
  - any remaining helper/runtime callers

---

## Goals
1. inventory `timerKeys` usage
2. create a dedicated helper/session surface
3. redirect current users safely
4. reassess the remaining `ref` slice after helper-heavy sub-surfaces are removed

---

## Checklist
- [ ] 1. Inventory `timerKeys` usage
- [ ] 2. Create the dedicated helper/session surface
- [ ] 3. Redirect callers safely
- [ ] 4. Reassess remaining `ref` surface
