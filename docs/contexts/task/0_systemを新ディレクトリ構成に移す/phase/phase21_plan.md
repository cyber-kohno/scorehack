# Phase 21 Plan

## Purpose
Phase 21 focuses on reducing the implementation dependency inside `createCacheActions(...)` so that cache recalculation no longer needs to live behind `useReducerCache(...)`.

Related documents:
- `ai_context/phase/phase20_close_note.md`
- `ai_context/phase/phase15_reducer_cache_inventory.md`

---

## Main target
- `tauri_app/src/app/cache/cache-actions.ts`
- `tauri_app/src/system/store/reducer/reducerCache.ts`

---

## Goals
1. inspect how much of `reducerCache.ts` can be extracted without changing behavior
2. move recalculation implementation toward a dedicated function or module
3. keep compatibility for legacy read helpers
4. leave read-helper migration/removal for a later phase if needed

---

## Checklist
- [ ] 1. Inventory recalculation-only code inside `reducerCache.ts`
- [ ] 2. Decide extraction target and placement
- [ ] 3. Create extracted recalculation implementation
- [ ] 4. Point `createCacheActions(...)` to the new implementation
- [ ] 5. Verify and record next-step judgement
