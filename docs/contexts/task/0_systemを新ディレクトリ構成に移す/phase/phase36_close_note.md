# Phase 36 Close Note

## Summary
Phase 36 completed the second physical store split by extracting `terminal` from `StoreProps`.

## What changed
- `terminal` was removed from `tauri_app/src/system/store/store.ts`
- dedicated terminal state moved to `tauri_app/src/state/session-state/terminal-store.ts`
- terminal selectors now read from the dedicated terminal store
- terminal reducer writes now target the dedicated terminal store
- root-store `commit()` now also touches the terminal store so in-place terminal mutations still notify subscribers

## Verification
- `npm run check`
- `npm run build`
- `cargo check`

All commands passed on April 16, 2026.

## Outcome
This confirms that active feature state can be extracted from `StoreProps` even when the feature still uses in-place mutation internally, as long as notification boundaries are preserved.
