# Phase 18 Plan

## Purpose
Phase 18 focuses on `inputOutline.ts` and nearby update-side boundaries that still rely on legacy `useReducerCache(...)` access.

Related documents:
- `ai_context/phase/phase17_close_note.md`
- `ai_context/phase/phase16_close_note.md`

---

## Main target
- `tauri_app/src/system/input/inputOutline.ts`

---

## Goals
1. inspect whether `inputOutline.ts` uses cache only for recalculation or also for reads
2. reduce any remaining read-helper dependency where safe
3. keep explicit recalculation behavior intact
4. leave terminal builder cleanup for a later phase

---

## Checklist
- [ ] 1. Inventory `inputOutline.ts` cache usage
- [ ] 2. Split read-helper use from `calculate()` use
- [ ] 3. Migrate any safe read paths
- [ ] 4. Verify build stability
- [ ] 5. Record next-step judgement
