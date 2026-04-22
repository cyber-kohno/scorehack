# Phase 14 Close Note

## Result
Phase 14 completed the cache-read cleanup around core `reducer / util` files.

Cleaned targets:
- `tauri_app/src/system/util/preview/previewUtil.ts`
- `tauri_app/src/system/store/reducer/reducerRef.ts`
- `tauri_app/src/system/store/reducer/reducerMelody.ts`
- `tauri_app/src/system/store/reducer/reducerOutline.ts`

The main remaining direct cache boundary is now concentrated in:
- `tauri_app/src/system/store/reducer/reducerCache.ts`

---

## What became clearer
- `src/state/cache-state/*` works as the stable read boundary for cache-derived values
- surrounding reducers and utils can now depend on cache accessors instead of digging into `lastStore.cache`
- the next phase can focus more directly on `reducerCache.ts` responsibilities

---

## Why this is a good stopping point
If we had entered `reducerCache.ts` earlier, we would have had to clean both callers and the core recalculation logic at once.
By finishing the caller side first, the next phase can stay focused on recalculation flow, update timing, and write boundaries.

---

## Suggested next phase
The next natural target is:
- `reducerCache.ts` boundary cleanup

That phase should clarify:
- what belongs to cache recalculation input
- what belongs to cache write/update responsibility
- how callers should trigger recalculation
