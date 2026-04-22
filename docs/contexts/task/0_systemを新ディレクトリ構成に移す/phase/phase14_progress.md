# Phase 14 Progress

## Current status
This phase is about reducing direct `cache` reads in `reducer / util` files before touching `reducerCache.ts` itself.

Related documents:
- `ai_context/phase/phase14_plan.md`
- `ai_context/phase/phase14_reducer_cache_read_inventory.md`

---

## Checklist
- [x] 1. Organize `previewUtil.ts` cache reads
- [x] 2. Organize `reducerRef.ts` cache reads
- [x] 3. Organize `reducerMelody.ts` / `reducerOutline.ts` cache reads
- [x] 4. Reconfirm remaining cache-read dependencies
- [ ] 5. Prepare close note and next-step judgement

---

## What was done
### `previewUtil.ts`
- Added `src/state/cache-state/playback-cache.ts`
- Replaced direct access to `baseCaches`, `chordCaches`, `elementCaches`, and tail chord data with playback cache accessors
- Repaired the temporary corruption caused during replacement work

### `reducerRef.ts`
- Replaced direct reads with:
  - `src/state/cache-state/outline-cache.ts`
  - `src/state/cache-state/timeline-cache.ts`

### `reducerMelody.ts`
- Replaced focus element / focus chord cache reads with timeline cache accessors

### `reducerOutline.ts`
- Replaced handled cache reads with:
  - `src/state/cache-state/cache-store.ts`
  - `src/state/cache-state/outline-cache.ts`

---

## Remaining direct cache-read targets
The main remaining target is:
- `tauri_app/src/system/store/reducer/reducerCache.ts`

This file still directly reads and writes `lastStore.cache`, which is expected for now.
That makes it the natural next phase target.

---

## Verification
Executed after the above changes:
- `npm run check` : passed
- `npm run build` : passed
- `cargo check` : passed

Build warnings are unchanged existing warnings only.

---

## Notes
Phase 14 has reached the point where the surrounding reducer/util callers are mostly organized.
The next logical step is to document-close this phase and move into `reducerCache.ts` boundary cleanup.
