# Phase 58 cursor overlap inventory

## 対象
- `tauri_app/src/system/store/reducer/reducerMelody.ts`
- `tauri_app/src/system/input/inputMelody.ts`
- `tauri_app/src/state/ui-state/melody-ui-store.ts`
- `tauri_app/src/system/component/melody/Cursor.svelte`
- `tauri_app/src/system/component/melody/score/ActiveTrack.svelte`
- `tauri_app/src/system/util/preview/previewUtil.ts`

## 責務分類
### cursor
- reducer から書き換えられる
- input から頻繁に read/write される
- UI 表示、preview 開始位置、スクロール調整と密結合
- 次の主要対象

### isOverlap
- cursor の現在位置と既存 note の衝突判定結果
- reducer から更新され、input と cursor UI が参照する
- 独立した boolean 状態として分けやすい

## 判断
- 先に `isOverlap` を dedicated 化
- `cursor` は最後の melody control 本体として次フェーズで扱う
