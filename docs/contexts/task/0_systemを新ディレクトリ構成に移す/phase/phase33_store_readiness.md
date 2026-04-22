# Phase 33 Store Readiness Reassessment

## Target
- `tauri_app/src/system/store/store.ts`

## Current shape
`StoreProps` still aggregates:
- `control`
- `terminal`
- `data`
- `input`
- `holdCallbacks`
- `preview`
- `cache`
- `env`
- `ref`
- `fileHandle`

## Reassessment after outline cleanup
The staged cleanup of `reducerOutline.ts` improved store-splitting readiness in two ways:
- feature actions are less entangled with inline outline helper logic
- arrange-opening and relation side effects are now in explicit helper modules instead of buried in the reducer

## Current split readiness by slice

### `fileHandle`
Readiness: high
Reason:
- very small surface
- mainly touched by project IO helpers
- already conceptually aligned with `session-state/project-file-store.ts`

### `env`
Readiness: medium
Reason:
- conceptually small
- but still referenced directly by many UI components and helper functions for layout math

### `terminal`
Readiness: medium
Reason:
- selector and helper boundaries are improved
- but active reducer and component code still access `lastStore.terminal`

### `preview`
Readiness: medium-low
Reason:
- session helpers exist
- but playback code and input code still reach into `lastStore.preview` directly in several places

### `ref`
Readiness: low
Reason:
- wide DOM binding footprint across legacy and new UI
- many direct bindings remain in Svelte components

### `data`
Readiness: low for physical split
Reason:
- logical boundaries are much better than before
- but still central to active reducer and feature code

### `cache`
Readiness: low for physical split
Reason:
- read and recalc boundaries are cleaner now
- but cache remains a cross-feature derived state hub

## Judgement
The safest first physical split candidate is `fileHandle`.
