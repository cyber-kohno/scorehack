# Phase 21 Close Note

## Result
Phase 21 completed the extraction of cache recalculation implementation from `useReducerCache(...)`.

The key architectural shift is:
- recalculation implementation no longer lives only inside the legacy reducer wrapper
- `createCacheActions(...)` now points directly to the extracted implementation
- `useReducerCache(...)` is reduced to a compatibility layer for legacy read helpers

---

## Why this matters
This completes the main arc that started when cache recalculation was still bundled together with broad helper access.
Now the system reads much more cleanly:
- app layer triggers recalculation
- state/cache layer owns recalculation implementation
- reducer layer only keeps compatibility where still needed

---

## Recommended next phase
The next natural target is the remaining legacy read-helper surface inside `useReducerCache(...)`.
For example:
1. inventory which helper methods are still actually used
2. move or mirror them into `cache-state` / `ui-state` where appropriate
3. shrink `reducerCache.ts` further until it can eventually disappear or become trivial
