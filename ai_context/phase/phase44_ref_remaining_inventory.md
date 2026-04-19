# Phase 44 残存 Ref 棚卸し

## 現在 `ref` に残っている主な下位面

### 1. timeline viewport refs
- `header`
- `grid`
- `pitch`

主な役割:
- timeline header / grid / pitch の `bind:this`
- scroll limit 計算
- melody / outline の自動スクロール

### 2. outline refs
- `outline`
- `elementRefs`

主な役割:
- outline リスト本体の `bind:this`
- focus 中 element の DOM 参照
- element 単位の位置追跡

### 3. terminal refs
- `terminal`
- `helper`
- `cursor`

主な役割:
- terminal 本体の `bind:this`
- helper 表示位置
- cursor の DOM 制御

### 4. arrange refs
- `arrange.piano`
  - `col`
  - `table`
  - `pedal`
- `arrange.finder`
  - `frame`
  - `records`

主な役割:
- piano editor 内部スクロール
- finder の選択・表示位置

## 現時点の整理
- `trackArr` は切り出し済み
- `timerKeys` は切り出し済み
- 残っているのは、ほぼ `bind:this` と viewport/DOM 制御に強く結びついた面
