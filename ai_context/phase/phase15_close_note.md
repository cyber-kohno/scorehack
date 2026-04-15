# Phase 15 Close Note

## Result
Phase 15 clarified the boundary inside `reducerCache.ts` without changing behavior.

Main outcomes:
- input / recalculation / write-back / read-helper roles are now easier to distinguish
- cache write-back is explicit through `setCache(...)`
- cache reads inside the file are funneled through `readCache()` backed by `getCache(...)`
- caller expectations were documented before any aggressive extraction

---

## Why this matters
`reducerCache.ts` is still both:
- the recalculation core
- a compatibility read surface for many callers

If we had tried to split it physically here, the risk of regressions would have been high.
This phase instead created a safer platform for the next move.

---

## Recommended next phase
The next natural target is to reduce dependency on `useReducerCache(...)` helper reads from callers.
That likely means:
1. identify the most-used helper reads
2. mirror or move them into `src/state/cache-state/*`
3. migrate caller groups one by one

A good next target set would be:
- timeline callers
- melody/input callers
- preview/helper callers
