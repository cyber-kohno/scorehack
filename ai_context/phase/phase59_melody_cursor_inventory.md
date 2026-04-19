# Phase 59 melody cursor inventory

## 対象
- `tauri_app/src/system/store/reducer/reducerMelody.ts`
- `tauri_app/src/system/input/inputMelody.ts`
- `tauri_app/src/state/ui-state/melody-ui-store.ts`
- `tauri_app/src/system/component/melody/Cursor.svelte`
- `tauri_app/src/system/component/melody/score/ActiveTrack.svelte`
- `tauri_app/src/system/util/preview/previewUtil.ts`

## 責務分類
### cursor read
- UI 表示位置
- active track 上の基準 note 決定
- preview 開始位置の決定
- overlap 判定の基準

### cursor write
- outline 位置との同期
- focus note から cursor への戻し
- input による移動
- tuplets / div / len / pitch の更新

## 判断
- `cursor` は単純な session state ではなく、melody 編集の中心状態
- そのため、いきなり dedicated store にせず、まず access surface を `app/melody/melody-cursor-state.ts` に寄せる方が安全
