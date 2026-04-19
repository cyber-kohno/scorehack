# Phase 28 Close Note

## Summary
Phase 28 reduced the `ArrangeUtil` seam to zero runtime callers.

What changed:
- broken arrange-related headers were repaired first
- arrange callers were redirected to `tauri_app/src/app/arrange/arrange-state.ts`
- outline finder opening now uses `createPianoArrangeFinder(...)` directly
- piano editor scroll no longer depends on an arrange reducer wrapper

## Verification
- `npm run check`
- `npm run build`
- `cargo check`

All commands passed on April 16, 2026.

## Remaining situation
- `tauri_app/src/system/store/reducer/arrangeUtil.ts` is orphaned
- `tauri_app/src/app/arrange/arrange-reducer.ts` is also no longer referenced

These are now cleanup candidates rather than active dependency seams.

## Judgement
Phase 28 is complete from a dependency-boundary perspective.
The next natural step is a cleanup-focused phase that removes or consolidates orphaned compatibility files and performs a final legacy seam audit.
