# Phase 21 Progress

## Current status
Phase 21 has been initialized.
The focus is separating recalculation implementation from legacy `useReducerCache(...)` compatibility.

Related documents:
- `ai_context/phase/phase21_plan.md`
- `ai_context/phase/phase20_close_note.md`

---

## Checklist
- [ ] 1. Inventory recalculation-only code inside `reducerCache.ts`
- [ ] 2. Decide extraction target and placement
- [ ] 3. Create extracted recalculation implementation
- [ ] 4. Point `createCacheActions(...)` to the new implementation
- [ ] 5. Verify and record next-step judgement
