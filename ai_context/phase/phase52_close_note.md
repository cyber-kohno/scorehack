# Phase 52 クローズノート

## 到達点
- `outline control` のうち `focus / focusLock` を root control から外した
- `StoreOutline.Props` に残る責務は `trackIndex / arrange` だけになった
- scroll / cache / preview / selection 表示の軸を dedicated store に統一できた

## 意味合い
今回の整理で、`outline control` は一枚の state ではなく、
- 軽い selection state
- track selection state
- arrange open state
に分けて段階的に外すべき対象だとコード上でも明確になった。

## 次にやること
- `trackIndex` の read / write inventory を作る
- terminal harmonize builder と arrange target selection の境界を確認する
- `trackIndex` を dedicated 化するか、先に `arrange open state` との接点だけ整理するか判断する
