# Phase 43 Close Note

## Summary
Phase 43 extracted `timerKeys` from the generic `ref` slice.

## What changed
- created `tauri_app/src/state/session-state/viewport-timer-store.ts`
- moved viewport timer runtime state out of `StoreRef`
- updated `tauri_app/src/app/viewport/scroll-actions.ts` to use the dedicated store

## Verification
- `npm run check` passed
- `npm run build` passed
- `cargo check` passed

## Meaning
The helper-heavy parts of `ref` have now been reduced substantially.
What remains is mostly binding-heavy:
- timeline viewport refs
- outline refs
- terminal refs
- arrange refs
- element refs

That changes the next decision from “which helper can move next” to
“which binding-heavy subgroup is safest to tackle first”.
