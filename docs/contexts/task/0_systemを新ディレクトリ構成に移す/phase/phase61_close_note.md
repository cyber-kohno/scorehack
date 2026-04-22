# Phase 61 クローズノート

## 何を決めたか
- root store の残件 `cursor / data / cache` を再評価した
- 次の主要対象は `data` に決めた

## どういう整理になったか
- `cursor`
  - helper 境界で維持
- `data`
  - 次フェーズの主要対象
- `cache`
  - `data` の後に再評価

## この判断の意味
ここからは root store の大物整理として、`data` を前進させるのが最も筋がよい。

`cache` は入口が揃っていても、`data` を土台にしているため、順番としては後に置く。
