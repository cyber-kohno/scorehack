# Phase 60 cursor helper inventory

## helper 本体
- `tauri_app/src/app/melody/melody-cursor-state.ts`

## helper 経由に寄せた caller
- `tauri_app/src/state/ui-state/melody-ui-store.ts`
- `tauri_app/src/system/store/reducer/reducerMelody.ts`
- `tauri_app/src/system/input/inputMelody.ts`
- `tauri_app/src/system/component/melody/Cursor.svelte`
- `tauri_app/src/system/component/melody/score/ActiveTrack.svelte`
- `tauri_app/src/system/util/preview/previewUtil.ts`

## 結果
- `cursor` は root store に残っているが、direct caller は helper 本体に集約できた
- そのため、dedicated store 化は必須ではなくなった
