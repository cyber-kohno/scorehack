# Phase 39 Close Note

## Summary
Phase 39 completed the fourth physical store split by extracting `preview` from the root store.

## What changed
- created `tauri_app/src/state/session-state/preview-store.ts`
- redirected `preview` readers and writers to dedicated playback surfaces
- removed `preview` from `tauri_app/src/system/store/store.ts`
- updated `commit()` so playback subscribers continue to receive notifications safely

## Verification
- `npm run check` passed
- `npm run build` passed
- `cargo check` passed

## Meaning
The root store now no longer owns:
- `fileHandle`
- `terminal`
- `env`
- `preview`

The next large remaining physical split candidate is `ref`.
`ref` is riskier than the previous slices because it is tied directly to DOM bindings and viewport behavior.
