# Phase 46 計画

## 目的
`ref` の残件のうち、`terminal refs` を root store から切り離す。
対象は `terminal` `helper` `cursor` の 3 つとし、terminal UI と scroll helper の参照を dedicated surface に寄せる。

## 対象
- `tauri_app/src/system/store/props/storeRef.ts`
- `tauri_app/src/state/session-state/terminal-ref-store.ts`
- terminal component / helper / scroll helper

## ゴール
1. `terminal` `helper` `cursor` の binding が dedicated store に寄る
2. `StoreRef` から `terminal` `helper` `cursor` を削除する
3. terminal 関連 reader / writer が dedicated helper 経由になる
4. `npm run check` `npm run build` `cargo check` が通る
