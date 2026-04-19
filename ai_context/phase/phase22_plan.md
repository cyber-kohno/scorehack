# Phase 22 Plan

## Purpose
Phase 22 focuses on shrinking the remaining legacy read-helper surface inside `useReducerCache(...)`.

Related documents:
- `ai_context/phase/phase21_close_note.md`
- `ai_context/phase/phase16_close_note.md`

---

## Main target
- `tauri_app/src/system/store/reducer/reducerCache.ts`
- remaining callers of its helper methods

---

## Goals
1. inventory which `useReducerCache(...)` helper methods are still used
2. decide which belong in `cache-state` or `ui-state`
3. migrate the safest remaining helper callers
4. keep compatibility until usage is reduced enough

---

## Checklist
- [ ] 1. Inventory remaining helper method callers
- [ ] 2. Group helper methods by destination layer
- [ ] 3. Migrate the safest remaining callers
- [ ] 4. Verify build stability
- [ ] 5. Record next-step judgement
