# Phase 15 Cache Boundary Notes

## Input boundary
The recalculation part of `reducerCache.ts` depends on:
- project data
- arrange relations
- environment values such as beat width
- theory calculation helpers
- layout constants for outline element heights

This means cache is still derived state, but not from project data alone.
It is derived from `data + env + theory + layout rules`.

---

## Write boundary
Phase 15 introduces an explicit write boundary through:
- `tauri_app/src/state/cache-state/cache-store.ts`
  - `getCache(lastStore)`
  - `setCache(lastStore, nextCache)`

`reducerCache.ts` now writes recalculated cache through `setCache(...)` instead of assigning directly.

---

## Read boundary
The file still exposes legacy read helpers because many callers depend on them.
To make the boundary clearer, internal helper reads now use `readCache()` backed by `getCache(lastStore)`.

This is a small but useful step because it separates:
- recalculation write-back
- cache read access

---

## Why this matters
Without this step, `reducerCache.ts` hides both read and write boundaries behind raw `lastStore.cache` access.
With explicit cache-store functions in place, the next refactor can focus on:
- caller migration
- helper relocation
- recalculation trigger cleanup
