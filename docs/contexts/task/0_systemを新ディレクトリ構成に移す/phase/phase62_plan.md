# Phase 62 計画

## 目的
`data` を次の主要対象として、残っている直参照を減らし、最初の物理分離候補を選べる状態にする。

## 方針
- いきなり `StoreProps.data` を削除しない
- まず `project-data` 入口へ寄せられる caller を寄せる
- `outline / melody / arrange / audio / project-io` の subgroup 単位で見る

## 実施ステップ
1. `data` 直参照の再棚卸し
2. subgroup ごとの分類
3. 最初の dedicated 化候補の決定
4. 安全な caller から `project-data` 入口へ寄せる

## ゴール
- `data` 残件の全体像が見える
- 最初に物理分離する subgroup を決められる
- 直接 `lastStore.data` を触る箇所がさらに減る
