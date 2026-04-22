# Phase 38 Close Note

## Summary
Phase 38 completed the third physical store split by extracting `env` from the root store.

## What changed
- created `tauri_app/src/state/session-state/env-store.ts`
- redirected helper and component reads to the dedicated env store
- removed `env` from `tauri_app/src/system/store/store.ts`

## Verification
- `npm run check` passed
- `npm run build` passed
- `cargo check` passed

## Meaning
The root store now no longer owns:
- `fileHandle`
- `terminal`
- `env`

This makes the next split decision clearer. The remaining major candidates are:
- `preview`
- `ref`

`preview` is the more natural next target because it already has helper boundaries and is narrower than `ref`.
