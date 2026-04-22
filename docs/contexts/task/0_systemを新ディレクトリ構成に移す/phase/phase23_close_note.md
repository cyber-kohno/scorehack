# Phase 23 Close Note

## Summary
Phase 23 completed the reduction of `reducerCache.ts` into the smallest safe compatibility wrapper.

At this point, the broad helper-method surface that used to live in `useReducerCache(...)` is gone.
The file now exists only to preserve the legacy `calculate()` shape.

---

## What changed
- Confirmed there were no external feature callers left for the old helper methods.
- Removed the unused helper exports from `tauri_app/src/system/store/reducer/reducerCache.ts`.
- Kept only `calculate()` delegating to the extracted cache recalculation implementation.
- Re-verified `check`, `build`, and `cargo check`.

---

## Resulting structure
- App-level cache operation entry:
  - `tauri_app/src/app/cache/cache-actions.ts`
- Cache recalculation implementation:
  - `tauri_app/src/state/cache-state/recalculate-cache.ts`
- Minimal compatibility wrapper:
  - `tauri_app/src/system/store/reducer/reducerCache.ts`

---

## Next-step judgement
The next safe decision is whether to keep this wrapper indefinitely as a compatibility seam, or to remove it and align the remaining internal call sites with `cache-actions` or `recalculate-cache` directly.
