# Phase 39 Preview Inventory

## Slice shape
- `preview`
  - `timerKeys`
  - `intervalKeys`
  - `lastTime`
  - `progressTime`
  - `linePos`
  - `audios`
  - `sfItems`

## Main read groups
- `tauri_app/src/state/ui-state/playback-ui-store.ts`
- `tauri_app/src/system/input/inputMelody.ts`
- `tauri_app/src/system/input/inputOutline.ts`
- `tauri_app/src/system/util/preview/previewUtil.ts`
- `tauri_app/src/system/component/timeline/grid/PreviewPosLine.svelte`

## Main write groups
- `tauri_app/src/state/session-state/playback-session.ts`
- `tauri_app/src/system/util/preview/previewUtil.ts`

## Migration result
- dedicated store created at `tauri_app/src/state/session-state/preview-store.ts`
- root store ownership removed from `tauri_app/src/system/store/store.ts`
- read paths redirected to preview selectors or `previewStore`
- write paths redirected to `playback-session.ts`
