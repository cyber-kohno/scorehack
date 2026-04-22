# Phase 44 実装順メモ

## 判断
次の主要対象は `timeline viewport refs` とする。

対象:
- `header`
- `grid`
- `pitch`

## 推奨順
1. `timeline viewport refs` の read / write を洗い出す
2. dedicated session/helper surface を作る
3. `bind:this={$store.ref.header}` などを段階的に置き換える
4. scroll helper / selector 側を dedicated surface へ寄せる
5. その後で `StoreRef` から `header / grid / pitch` を削除するか判断する

## この順がよい理由
- viewport refs は scroll helper と一緒に扱いやすい
- `timeline` は既に phase 7 で責務整理済み
- `outline` や `arrange` より先に進めると、画面全体の ref 依存を大きく減らせる

## この段階でまだ触らないもの
- `elementRefs`
- `outline`
- `arrange.piano`
- `arrange.finder`

これらは viewport refs の整理後に再評価する方が安全
