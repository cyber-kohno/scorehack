# Phase 20 Plan

## Purpose
Phase 20 focuses on formalizing cache recalculation as its own explicit entry, instead of leaving it attached only to `useReducerCache(...)`.

Related documents:
- `ai_context/phase/phase19_close_note.md`
- `ai_context/phase/phase15_close_note.md`

---

## Main target
Explicit recalculation callers that still rely on `useReducerCache(lastStore).calculate()`.

---

## Goals
1. define a clearer recalculation entry point
2. keep behavior unchanged
3. migrate a safe subset of current callers
4. leave the rest on compatibility paths if needed

---

## Checklist
- [ ] 1. Inventory current recalculation callers
- [ ] 2. Decide placement for explicit recalculation entry
- [ ] 3. Create the new entry
- [ ] 4. Migrate the safest callers
- [ ] 5. Verify and record next-step judgement
