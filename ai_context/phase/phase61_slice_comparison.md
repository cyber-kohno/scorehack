# Phase 61 候補比較

## 比較軸
- 境界整理の進み具合
- 依存の重さ
- 次フェーズで安全に前進できるか

## `control.melody.cursor`

### 良い点
- caller は helper に集約済み
- 変更面積は小さい

### 懸念
- dedicated store 化しても得られる改善が限定的
- ここを先にやっても、root store の大物整理はあまり進まない

### 判定
- 今すぐ主要対象にする優先度は低い

## `data`

### 良い点
- `project-data` の入口がすでにある
- `outline / melody / arrange / audio` に subgroup がある
- root store の大物整理として価値が高い

### 懸念
- reducer / input / terminal builder 側に直参照がまだ残る
- いきなり物理分離ではなく、まず残件整理から入る必要がある

### 判定
- 次の主要対象として最も妥当

## `cache`

### 良い点
- `cache-state` の入口と recalculation entry がそろっている
- read helper の散らばりはかなり減っている

### 懸念
- `data` と密結合
- `recalculate-cache.ts` 自体が `lastStore.data` を前提にしている
- `data` を先に整理しないまま物理分離に進むと、順番が逆転しやすい

### 判定
- 次対象としては早い
- `data` の次に見る方が安全

## 結論
次フェーズの主要対象は `data` にする。

`cursor` は helper 境界で維持し、`cache` は `data` 整理後に再評価する。
