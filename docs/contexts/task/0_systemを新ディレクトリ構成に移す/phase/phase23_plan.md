# Phase 23 Plan

## Purpose
Phase 23 focuses on shrinking the compatibility wrapper in `reducerCache.ts` to the minimum necessary surface.

Related documents:
- `ai_context/phase/phase22_close_note.md`
- `ai_context/phase/phase21_close_note.md`

---

## Main target
- `tauri_app/src/system/store/reducer/reducerCache.ts`

---

## Goals
1. inventory which exported helper methods are now unused
2. confirm whether any external compatibility still needs them
3. remove the safest unused helper methods
4. keep `calculate()` compatibility only if still justified
5. verify build stability and record the new boundary

---

## Checklist
- [ ] 1. Inventory current exported helper methods
- [ ] 2. Confirm external usage
- [ ] 3. Remove safest unused helpers
- [ ] 4. Verify build stability
- [ ] 5. Record next-step judgement
