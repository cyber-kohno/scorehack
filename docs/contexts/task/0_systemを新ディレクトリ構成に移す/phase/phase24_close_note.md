# Phase 24 Close Note

## Summary
Phase 24 completed the final boundary decision for cache recalculation.

The old compatibility wrapper `reducerCache.ts` was no longer referenced anywhere, so it was removed.
This finishes the transition from legacy cache recalculation entry points to the new application and state layers.

---

## Final boundary
- App-level operation entry:
  - `tauri_app/src/app/cache/cache-actions.ts`
- Cache recalculation implementation:
  - `tauri_app/src/state/cache-state/recalculate-cache.ts`

There is no remaining legacy reducer wrapper for cache recalculation.

---

## What changed
- Confirmed zero remaining imports of `tauri_app/src/system/store/reducer/reducerCache.ts`.
- Deleted that file.
- Re-verified `check`, `build`, and `cargo check`.

---

## Resulting meaning
Cache recalculation is now clearly modeled as:
1. an application action
2. backed by a state-layer implementation

This is a strong architectural boundary compared with the original prototype structure.

---

## Next-step judgement
The next natural target is to choose another remaining legacy seam and apply the same final-boundary cleanup pattern there.
