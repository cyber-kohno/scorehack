# Phase 56 melody focus inventory

## 対象
- `tauri_app/src/system/store/reducer/reducerMelody.ts`
- `tauri_app/src/system/input/inputMelody.ts`
- `tauri_app/src/state/ui-state/melody-ui-store.ts`
- `tauri_app/src/system/component/melody/score/ActiveTrack.svelte`
- `tauri_app/src/system/component/melody/score/Note.svelte`
- `tauri_app/src/system/component/timeline/grid/GridRootFrame.svelte`
- `tauri_app/src/system/util/preview/previewUtil.ts`

## 読み取り面
- 現在 focus 中の note 判定
- focus range 判定
- melody cursor 表示判定
- preview 開始位置の決定

## 書き込み面
- cursor へ戻すときの `focus = -1`
- 近傍 note への focus 移動
- range 選択開始と解除
- copy/paste 後の focus 更新

## 結果
- dedicated store として `melody-focus-store.ts` を追加
- reducer / input / ui-state / component / util の参照を dedicated store に統一
