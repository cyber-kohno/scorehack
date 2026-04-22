# Phase 15 Plan

## Purpose
Phase 15 focuses on `reducerCache.ts` boundary cleanup.
Now that the main caller side has been organized, we can examine cache recalculation responsibilities more directly.

Related documents:
- `ai_context/phase/phase14_close_note.md`
- `ai_context/phase/phase12_cache_recalculation_flow.md`
- `ai_context/phase/phase12_cache_dependency_map.md`

---

## Main target
- `tauri_app/src/system/store/reducer/reducerCache.ts`

---

## Goals
1. Clarify the input boundary of cache recalculation
2. Clarify the write boundary for `lastStore.cache`
3. Reduce mixed responsibilities inside `reducerCache.ts`
4. Prepare for later cache-update trigger cleanup

---

## Planned approach
- first inspect `reducerCache.ts` read/write responsibilities
- separate read helpers from write/update logic where safe
- keep behavior unchanged
- verify with build checks after each step

---

## Steps
- [ ] 1. Inventory `reducerCache.ts` reads and writes
- [ ] 2. Create boundary notes for recalculation input/output
- [ ] 3. Introduce helper accessors or helper functions where useful
- [ ] 4. Reconfirm caller expectations
- [ ] 5. Close the phase with next-step judgement

---

## Done criteria
- `reducerCache.ts` responsibilities are explainable in terms of input / recalculation / write-back
- the main mixed boundary points are identified or reduced
- `npm run check` passes
- `npm run build` passes
- `cargo check` passes
