# Phase 45 計画

## 目的
`ref` の残件のうち、`timeline viewport refs` を root store から切り離す。
対象は `header` `grid` `pitch` の 3 つとし、timeline 表示・melody 表示・scroll helper からの参照を dedicated surface に寄せる。

## 対象
- `tauri_app/src/system/store/props/storeRef.ts`
- `tauri_app/src/state/session-state/timeline-viewport-store.ts`
- timeline / melody / outline の viewport reader / writer
- timeline 関連 component の `bind:this`

## ゴール
1. `header` `grid` `pitch` の binding が dedicated store に寄る
2. `StoreRef` から `header` `grid` `pitch` を削除する
3. reader が dedicated helper 経由になる
4. `npm run check` `npm run build` `cargo check` が通る
