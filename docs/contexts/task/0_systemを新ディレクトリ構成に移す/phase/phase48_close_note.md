# Phase 48 完了メモ

## 完了内容
- `arrange-ref-store.ts` を追加し、piano / finder の dedicated store を作成した
- `StoreRef` から `arrange` を削除した
- arrange component と scroll helper の参照を dedicated store に切り替えた

## 到達点
`StoreRef` は実質的に空になり、root store の `ref` slice は実利用を持たない状態になった。
これで `ref` の dedicated 化は一通り完了したと見てよい。

## 次の候補
- root store から `ref` slice 自体を削除する
- `store-boundaries` を更新して、root store の現状を再整理する
- 次の本格対象を `control / input / data / cache` から選び直す
