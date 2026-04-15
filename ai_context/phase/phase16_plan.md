# Phase 16 Plan

## Purpose
Phase 16 focuses on reducing caller dependency on legacy `useReducerCache(...)` read helpers.
Now that `reducerCache.ts` itself has a clearer boundary, the next safe step is to move caller-side reads toward `src/state/cache-state/*`.

Related documents:
- `ai_context/phase/phase15_close_note.md`
- `ai_context/phase/phase15_caller_expectations.md`
- `ai_context/phase/phase13_cache_selector_policy.md`

---

## Main target
Caller groups that still depend on `useReducerCache(lastStore)` for read helpers.

Examples:
- timeline components
- melody/input logic
- preview/helper logic

---

## Goals
1. inventory remaining caller helper dependencies
2. identify which helpers belong in `cache-state`
3. migrate the safest caller group first
4. keep `useReducerCache` as compatibility during transition

---

## Steps
- [ ] 1. Inventory current helper-read callers
- [ ] 2. Group them by feature
- [ ] 3. Add missing cache-state accessors if needed
- [ ] 4. Migrate the safest caller group
- [ ] 5. Verify and document next-step judgement
