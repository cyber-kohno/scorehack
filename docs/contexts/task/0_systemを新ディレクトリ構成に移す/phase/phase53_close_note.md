# Phase 53 クローズノート

## 到達点
- `outline control` の `trackIndex` を root control から外した
- `StoreOutline.Props` に残るのは `arrange` だけになった
- `outline control` は selection state と track selection state を dedicated 化できた

## 意味合い
ここまでで `outline control` は、元の大きな 1 つの state からかなり薄くできた。
残っている `arrange` は editor / finder の open state と target を含むため、次はその object 自体をどう扱うかを慎重に判断する段階に入る。

## 次にやること
- `arrange open state` の read / write inventory を作る
- dedicated 化するか、先に app/ui 境界だけ整理するかを判断する
- あわせて root store 全体の残り slice を再確認する
