# Phase 14 Plan

## Purpose
Phase 14 focuses on organizing `cache` reads on the `reducer / util` side.
The goal is to reduce direct `lastStore.cache` reads in core behavior files before touching `reducerCache.ts` itself.

Related documents:
- `ai_context/phase/phase13_close_note.md`
- `ai_context/phase/phase13_cache_read_inventory.md`

---

## Target files
- `tauri_app/src/system/util/preview/previewUtil.ts`
- `tauri_app/src/system/store/reducer/reducerRef.ts`
- `tauri_app/src/system/store/reducer/reducerMelody.ts`
- `tauri_app/src/system/store/reducer/reducerOutline.ts`
- later: `tauri_app/src/system/store/reducer/reducerCache.ts`

---

## Strategy
1. Replace direct cache reads with `src/state/cache-state/*` accessors where possible.
2. Keep existing behavior unchanged.
3. Avoid entering `reducerCache.ts` main logic until surrounding callers are cleaner.
4. Verify each step with build checks.

---

## Steps
- [x] 1. Organize `previewUtil.ts` cache reads
- [x] 2. Organize `reducerRef.ts` cache reads
- [x] 3. Organize `reducerMelody.ts` / `reducerOutline.ts` cache reads
- [ ] 4. Reconfirm remaining cache-read dependencies
- [ ] 5. Prepare close note and next-step judgement

---

## Done criteria
- `previewUtil.ts` uses playback-related cache accessors
- `reducerRef.ts` uses outline/timeline cache accessors
- `reducerMelody.ts` and `reducerOutline.ts` no longer directly read the handled cache values
- `npm run check` passes
- `npm run build` passes
- `cargo check` passes

---

## Expected next step
After this phase, the next natural target is `reducerCache.ts` boundary cleanup.
