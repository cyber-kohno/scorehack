# Phase 42 TrackArr Inventory

## Read sites
- `tauri_app/src/system/component/melody/score/Note.svelte`
- `tauri_app/src/system/component/melody/score/ShadeNote.svelte`
- `tauri_app/src/system/util/preview/previewUtil.ts`

## Write sites
- `tauri_app/src/app/project-io/load-project.ts`
- `tauri_app/src/app/shell/root-control.ts`
- `tauri_app/src/system/store/reducer/terminal/sector/builderHarmonize.ts`
- `tauri_app/src/system/store/reducer/terminal/sector/builderMelody.ts`

## Helper surface introduced
- `tauri_app/src/state/session-state/track-ref-store.ts`
- `tauri_app/src/state/session-state/track-ref-session.ts`

## Migration result
- `trackArr` no longer belongs to `StoreRef`
- callers now use dedicated helper functions instead of `lastStore.ref.trackArr`
