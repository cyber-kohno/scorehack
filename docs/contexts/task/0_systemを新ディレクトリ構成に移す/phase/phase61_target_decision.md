# Phase 61 次対象の決定

## 決定
次の主要対象は `data`。

## 理由
1. `cursor` は helper 境界で十分安定している
2. `cache` は `data` 依存が強く、先に触ると順序が逆転しやすい
3. `project-data` 入口がすでにあるため、`data` は前進しやすい

## この判断でやること
- `lastStore.data` の残件を feature ごとに再整理する
- `project-data` 入口へ寄せられる caller を先に寄せる
- その後で、最初に物理分離しやすい `data` subgroup を選ぶ

## この判断でやらないこと
- `cursor` の dedicated store 化を急がない
- `cache` の物理分離を先に始めない

## 次の自然な順序
1. `data` 直参照の再棚卸し
2. `outline / melody / arrange / audio / project-io` に分類
3. 最初に dedicated 化しやすい subgroup を選定
