# Phase 24 Plan

## Purpose
Phase 24 focuses on deciding and applying the final boundary for cache recalculation calls.

Related documents:
- `ai_context/phase/phase23_close_note.md`
- `ai_context/phase/phase20_close_note.md`

---

## Main target
- `tauri_app/src/system/store/reducer/reducerCache.ts`
- remaining internal call sites that still conceptually depend on legacy recalculation compatibility

---

## Goals
1. inventory which files still conceptually rely on the `calculate()` compatibility shape
2. decide whether the wrapper should remain or be removed
3. migrate the safest remaining call sites if removal is chosen
4. verify build stability
5. record the final cache recalculation boundary

---

## Checklist
- [ ] 1. Inventory remaining compatibility callers
- [ ] 2. Decide keep-vs-remove policy
- [ ] 3. Migrate the safest remaining callers if needed
- [ ] 4. Verify build stability
- [ ] 5. Record final boundary judgement
