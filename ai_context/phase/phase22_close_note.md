# Phase 22 Close Note

## Summary
Phase 22 completed the inventory and cleanup of the remaining legacy helper surface around `useReducerCache(...)`.

The important outcome is that feature code no longer depends on `useReducerCache(...)` directly.
Only the compatibility wrapper at `tauri_app/src/system/store/reducer/reducerCache.ts` still exports that shape.

---

## What changed
- Confirmed helper-method usage had already been migrated away from feature callers.
- Removed stale unused imports from:
  - `tauri_app/src/app/project-io/load-project.ts`
  - `tauri_app/src/system/input/arrange/finder/inputFinder.ts`
  - `tauri_app/src/system/input/arrange/inputPianoEditor.ts`
- Re-verified the project with `check`, `build`, and `cargo check`.

---

## Resulting structure
- App-level recalculation entry:
  - `tauri_app/src/app/cache/cache-actions.ts`
- Recalculation implementation:
  - `tauri_app/src/state/cache-state/recalculate-cache.ts`
- Compatibility wrapper:
  - `tauri_app/src/system/store/reducer/reducerCache.ts`

This means the remaining work is no longer about feature migration.
It is now about shrinking the compatibility layer itself.

---

## Next-step judgement
The next safe target is to inspect the unused helper methods still exported by `reducerCache.ts`, decide whether they can be deleted, and reduce the file to the minimum backward-compatible surface.
