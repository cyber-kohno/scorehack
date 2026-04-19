# Phase 47 計画

## 目的
`ref` の残件のうち、`outline` と `elementRefs` を root store から切り離す。
対象は outline list frame と各 outline element の DOM ref とし、可視範囲計算とスクロール補助を dedicated surface に寄せる。

## 対象
- `tauri_app/src/system/store/props/storeRef.ts`
- `tauri_app/src/state/session-state/outline-ref-store.ts`
- outline component の `bind:this`
- `outline-cache.ts`
- `outline-scroll.ts`

## ゴール
1. `outline` と `elementRefs` の binding が dedicated store に寄る
2. `StoreRef` から `outline` と `elementRefs` を削除する
3. 可視要素計算と outline scroll が dedicated helper 経由になる
4. `npm run check` `npm run build` `cargo check` が通る
