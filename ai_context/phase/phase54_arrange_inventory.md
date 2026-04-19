# Phase 54 arrange 在庫

## 読み取り箇所
今回差し替えた主な読み取り箇所は以下。

- `tauri_app/src/app/arrange/arrange-state.ts`
- `tauri_app/src/state/ui-state/shell-ui-store.ts`
- `tauri_app/src/state/ui-state/outline-ui-store.ts`
- `tauri_app/src/system/input/arrange/inputArrange.ts`
- `tauri_app/src/system/input/arrange/inputGuitarEditor.ts`
- `tauri_app/src/system/input/arrange/inputPianoEditor.ts`
- `tauri_app/src/system/input/arrange/finder/inputFinder.ts`
- `tauri_app/src/system/input/inputOutline.ts`
- `tauri_app/src/system/store/reducer/reducerTerminal.ts`
- `tauri_app/src/system/component/arrange/finder/ArrangeFinderFrame.svelte`
- `tauri_app/src/system/component/arrange/status/ArrangeStatusBar.svelte`

## 書き込み箇所
今回 dedicated store に置き換えた主な書き込み箇所は以下。

- `tauri_app/src/app/outline/outline-arrange.ts`
- `tauri_app/src/system/input/arrange/inputArrange.ts`
- `tauri_app/src/system/input/arrange/inputPianoEditor.ts`
- `tauri_app/src/system/input/arrange/finder/inputFinder.ts`

## 結果
- `outline-arrange-store` を追加して、arrange open state は session-state に移った
- `StoreOutline.Props` は不要になった
- `StoreControl` から `outline` を削除できた
