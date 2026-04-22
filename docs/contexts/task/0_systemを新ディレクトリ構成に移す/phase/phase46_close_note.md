# Phase 46 完了メモ

## 完了内容
- `terminal-ref-store.ts` を追加し、`terminal` `helper` `cursor` の dedicated store を作成した
- `StoreRef` から `terminal` `helper` `cursor` を削除した
- terminal UI / helper / scroll helper の参照を dedicated store に切り替えた

## 到達点
`ref` のうち terminal に関する部分は root store から外れた。
これにより、残る `ref` は `outline` `elementRefs` `arrange refs` が中心になった。

## 次の候補
- `outline / elementRefs` の dedicated 化準備
- `arrange refs` の dedicated 化準備
- 残存する `ref` 全体の再評価
