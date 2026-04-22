# Phase 50 計画

## 目的
root store から `input` と `holdCallbacks` の責務を外し、キーボード hold 状態を dedicated session store に統一する。

## 対象
- `tauri_app/src/system/store/store.ts`
- `tauri_app/src/state/session-state/input-store.ts`
- `tauri_app/src/state/session-state/keyboard-session.ts`
- `tauri_app/src/app/shell/keyboard-router.ts`
- `tauri_app/src/state/ui-state/outline-ui-store.ts`
- `tauri_app/src/system/component/melody/score/Note.svelte`

## ゴール
1. root store から `input` を削除する
2. root store から `holdCallbacks` を削除する
3. hold 状態の read / write を dedicated store に統一する
4. `npm run check` `npm run build` `cargo check` が通る
