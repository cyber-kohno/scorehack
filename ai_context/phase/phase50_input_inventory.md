# Phase 50 input 参照棚卸し

## 実行時に残っていた主な参照
- `tauri_app/src/app/shell/keyboard-router.ts`
- `tauri_app/src/state/session-state/keyboard-session.ts`
- `tauri_app/src/state/ui-state/outline-ui-store.ts`
- `tauri_app/src/system/component/melody/score/Note.svelte`

## 補足
`holdCallbacks` は root store 上の slice としては実質未使用で、各 input module が返す callback 型としてのみ使われていた。
そのため、今回の対象は実質 `input` の dedicated 化と `holdCallbacks` slice の削除だった。
