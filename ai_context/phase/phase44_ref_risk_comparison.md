# Phase 44 Ref リスク比較

## 比較対象
- timeline viewport refs
- outline refs
- terminal refs
- arrange refs
- element refs

## timeline viewport refs
- 価値: 高い
- リスク: 中
- 理由:
  - 使用箇所は多いが役割が比較的一貫している
  - `header / grid / pitch` というまとまりで考えやすい
  - viewport helper 群との相性が良い

## outline refs
- 価値: 中
- リスク: 中〜高
- 理由:
  - `outline` 本体 ref と `elementRefs` が混在している
  - `elementRefs` は index 付き DOM 管理なので、単純分離しにくい

## terminal refs
- 価値: 中
- リスク: 低〜中
- 理由:
  - `terminal / helper / cursor` は feature としてまとまっている
  - ただし terminal 周辺はすでに物理分離を進めており、今すぐ優先しなくても大きな痛みは少ない

## arrange refs
- 価値: 中
- リスク: 高
- 理由:
  - piano editor subtree の内部構造に強く依存
  - finder も含めると局所的だが特殊性が高い

## element refs
- 価値: 高い
- リスク: 高
- 理由:
  - outline focus / scroll に効く
  - ただし `bind:this` + index 管理のため、最初に触るには重い

## 結論
次に最も安全なのは **timeline viewport refs** です。

理由:
- `header / grid / pitch` というまとまりが明確
- 既に `timeline-ui-store` や scroll helper がある
- `terminal` よりアプリ全体への波及価値が高い
- `outline elementRefs` や `arrange` より分解難易度が低い
