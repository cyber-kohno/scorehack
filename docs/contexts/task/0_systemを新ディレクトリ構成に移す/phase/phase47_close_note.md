# Phase 47 完了メモ

## 完了内容
- `outline-ref-store.ts` を追加し、`outline` と `elementRefs` の dedicated store を作成した
- `StoreRef` から `outline` と `elementRefs` を削除した
- outline component の binding を dedicated store へ切り替えた
- `outline-cache.ts` と `outline-scroll.ts` の reader を dedicated helper 経由へ移した

## 到達点
`ref` のうち outline に関する部分は root store から外れた。
これにより、残る主要な `ref` は `arrange refs` が中心になった。

## 次の候補
- `arrange refs` の dedicated 化
- 残存する `ref` 全体の再評価
- `control / input / data / cache` 側の次の本格整理対象の判断
