# Phase 38 Env Inventory

## Slice shape
- `env`
  - `beatWidth`

## Main read groups
- `tauri_app/src/state/ui-state/*`
- `tauri_app/src/state/cache-state/*`
- `tauri_app/src/app/melody/melody-scroll.ts`
- legacy Svelte components in:
  - `tauri_app/src/system/component/melody/*`
  - `tauri_app/src/system/component/timeline/*`
  - `tauri_app/src/ui/melody/*`

## Write complexity
- low
- effectively a single writable value

## Migration result
- dedicated store created at `tauri_app/src/state/session-state/env-store.ts`
- root store ownership removed from `tauri_app/src/system/store/store.ts`
- all reads redirected to `envStore` or `getEnvBeatWidth()`
