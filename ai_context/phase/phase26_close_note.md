# Phase 26 Close Note

## Summary
Phase 26 finalized the `ContextUtil` seam.

The old generic cross-feature context registry was removed.
Its responsibilities were split into:
- playback selector usage for preview state
- a feature-local arrange piano editor context helper for subtree sharing

---

## What changed
- Deleted `tauri_app/src/system/store/contextUtil.ts`.
- Replaced `isPreview` usage in melody and timeline components.
- Replaced arrange piano editor subtree context usage with `tauri_app/src/ui/arrange/piano-editor-context.ts`.

---

## Resulting boundary
- Preview state is read from playback state/selectors.
- Arrange editor subtree state is shared via a dedicated feature helper.
- There is no remaining generic context registry in the application.

---

## Next-step judgement
A natural next target is `useReducerRef(...)`, because it is now one of the most visible remaining legacy helper bundles crossing feature boundaries.
