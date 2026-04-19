# Phase 48 計画

## 目的
`ref` の残件のうち、`arrange refs` を root store から切り離す。
対象は piano editor の `col / table / pedal` と finder の `frame / records` とし、arrange feature の DOM ref を dedicated surface に寄せる。

## 対象
- `tauri_app/src/system/store/props/storeRef.ts`
- `tauri_app/src/state/session-state/arrange-ref-store.ts`
- arrange piano / finder component
- `piano-editor-scroll.ts`

## ゴール
1. `arrange refs` の binding が dedicated store に寄る
2. `StoreRef` から `arrange` を削除する
3. reader / writer が dedicated helper 経由になる
4. `npm run check` `npm run build` `cargo check` が通る
