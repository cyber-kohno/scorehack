# Phase 57 melody control inventory

## 対象
- `tauri_app/src/system/store/reducer/reducerMelody.ts`
- `tauri_app/src/system/input/inputMelody.ts`
- `tauri_app/src/state/ui-state/melody-ui-store.ts`
- `tauri_app/src/system/component/melody/Cursor.svelte`
- `tauri_app/src/system/component/melody/score/ActiveTrack.svelte`
- `tauri_app/src/system/util/preview/previewUtil.ts`

## subgroup 分類
### cursor
- reducer と input の両方で read/write が多い
- UI 表示とも直結している
- 次の主要対象として妥当

### isOverlap
- reducer と input から更新される
- 実質的に cursor 操作に付随する派生状態
- `cursor` と同時に見る方が安全

### clipboard
- 参照と更新が `inputMelody.ts` にほぼ閉じている
- feature local な session state として分離しやすい

## 判断
最初の安全な dedicated 化対象は `clipboard`。
理由は、影響範囲が最も狭く、挙動リスクが低いため。
