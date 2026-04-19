# Phase 51 対象判断

## 比較結果
### control
- 参照件数が最も多い
- shell / outline / melody / timeline / preview / terminal にまたがる
- 次に整理すると、以後の reducer 整理や UI selector 整理が進めやすい

### data
- `project-data` 入口がすでにある
- 実行時の直参照はかなり減っている
- 今すぐ物理分離へ行くより、control を先に整理した方が安全

### cache
- `cache-state` と再計算入口の整理が完了している
- 現時点では大きな不安定要素ではない
- 先に control を整理した方が影響範囲を読みやすい

## 結論
次の主要対象は `control` にする。
