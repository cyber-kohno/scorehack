# Phase 27 Plan

## Purpose
Phase 27 focuses on shrinking the `useReducerRef(...)` legacy helper bundle and making scroll/ref adjustments more explicit.

Related documents:
- `ai_context/phase/phase26_close_note.md`
- `ai_context/phase/phase7_timeline_viewport_notes.md`

---

## Main target
- `tauri_app/src/system/store/reducer/reducerRef.ts`
- callers in input, preview, terminal, and melody reducer flows

---

## Goals
1. inventory `useReducerRef(...)` capabilities and callers
2. group them by destination layer
3. migrate the safest read/adjust helpers
4. verify build stability
5. record the new boundary judgement

---

## Checklist
- [ ] 1. Inventory current `useReducerRef(...)` usage
- [ ] 2. Group helpers by destination layer
- [ ] 3. Migrate the safest usages
- [ ] 4. Verify build stability
- [ ] 5. Record next-step judgement
