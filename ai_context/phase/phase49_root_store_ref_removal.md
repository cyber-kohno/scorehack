# Phase 49 root store からの ref 削除

## 実施内容
- `StoreProps` から `ref` を削除した
- root store の初期値から `ref` を削除した
- `store-boundaries` から `refs` 境界を削除した

## 意味合い
これにより、DOM ref はすべて dedicated session store 側で管理される構成になった。
root store は UI / project data / input / cache に集中できる状態へ進んだ。
