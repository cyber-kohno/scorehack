# Phase 49 計画

## 目的
root store から `ref` slice 自体を削除し、現在の dedicated store 構成に合わせて store boundary を更新する。

## 対象
- `tauri_app/src/system/store/store.ts`
- `tauri_app/src/state/store-boundaries.ts`

## ゴール
1. `StoreProps` から `ref` を削除する
2. 初期 store から `ref` を削除する
3. `store-boundaries` を現状の slice に合わせて更新する
4. `npm run check` `npm run build` `cargo check` が通る
