# Phase 45 完了メモ

## 完了内容
- `timeline-viewport-store.ts` を追加し、`header` `grid` `pitch` の dedicated store を作成した
- `StoreRef` から `header` `grid` `pitch` を削除した
- timeline / melody / outline の viewport reader を dedicated helper 経由へ移した
- timeline component の `bind:this` を dedicated setter 経由に変更した

## 到達点
`ref` のうち timeline viewport に関する部分は root store から外れた。
これにより、残る `ref` は `outline` `terminal` `arrange` `elementRefs` などの DOM binding 寄りの面に絞られた。

## 次の候補
- `outline` / `elementRefs` 側の再評価
- `terminal refs` の dedicated 化
- `arrange refs` の dedicated 化
