# Phase 44 クローズノート

## 概要
Phase 44 では、helper-heavy な `ref` 下位面を外した後に残る binding-heavy な `ref` を再評価した。

## 結論
次に最も安全なのは `timeline viewport refs`。

対象:
- `header`
- `grid`
- `pitch`

## 理由
- まとまりが明確
- timeline 関連 helper / selector が既に存在する
- `outline elementRefs` や `arrange refs` より着手しやすい

## 次の段階
Phase 45 では、
- viewport refs の棚卸し
- dedicated helper/session surface の作成
- `bind:this` の置換可能性の確認
を進める
