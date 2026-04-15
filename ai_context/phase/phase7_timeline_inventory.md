# Phase 7 Timeline Inventory

## 概要
Phase 7 では `timeline` を主要対象として扱う。

現行の `timeline` は、単一コンポーネントではなく
- frame
- header
- pitch column
- grid
- focus / overlay
- melody 接続
- playback 接続
- outline / cache 接続
- arrange 接続

がまとまった結節点になっている。

まずはそれぞれの責務を分解して把握する。

---

## 中心となるファイル

### 1. `tauri_app/src/system/component/timeline/TimelineFrame.svelte`
現行 timeline 全体の起点。

主な責務:
- timeline header の配置
- timeline main の配置
- pitch / grid の配置
- piano view の表示条件
- current chord / tonality から pianoInfo を組み立てる
- header の scrollLimitProps を計算して header 子へ渡す

現状の特徴:
- frame と header/main レイアウトを担う
- 同時に cache 参照や piano view 用ロジックも持っている
- `ui/timeline` の最初の入口候補

---

### 2. `tauri_app/src/ui/shell/MainWorkspace.svelte`
timeline の上位入口。

主な責務:
- outline と timeline の 2 カラム配置
- 現在は `system/component/timeline/TimelineFrame.svelte` を直接参照

現状の特徴:
- Phase 7 で `ui/timeline/TimelineFrame.svelte` に切り替える起点

---

## Header

### 3. `tauri_app/src/system/component/timeline/header/BeatMeasureFrame.svelte`
主な責務:
- baseCaches を使って小節 / 拍の header 行を描画
- `MeasureFocus.svelte` を重ねる

### 4. `tauri_app/src/system/component/timeline/header/ChordListFrame.svelte`
主な責務:
- visible chordCaches を抽出して chord 名表示
- outline focus と scroll 中心を使って可視範囲を絞る

### 5. `tauri_app/src/system/component/timeline/header/ProgressInfo.svelte`
主な責務:
- 各 chord の startTime 表示
- section / modulate / tempo 差分表示
- `tempo` は一部ここに既に接続されている

### 6. `tauri_app/src/system/component/timeline/header/MeasureBlock.svelte`
主な責務:
- baseCache 単位の小節表示ブロック描画

### 7. `tauri_app/src/system/component/timeline/header/MeasureFocus.svelte`
主な責務:
- chord focus の header highlight 表示
- melody current beat rect の補助表示

現状の特徴:
- header は比較的役割が分かれている
- `TimelineHeader` という新入口で束ねやすい

---

## Pitch Column

### 8. `tauri_app/src/system/component/timeline/pitch/PitchListFrame.svelte`
主な責務:
- pitch 名の縦リスト表示
- melody mode 時の `PitchFocus` 表示
- pitch ref の bind

### 9. `tauri_app/src/system/component/timeline/pitch/PitchFocus.svelte`
主な責務:
- current melody pitch の highlight 表示

現状の特徴:
- pitch column は比較的独立している
- `ui/timeline/pitch` に寄せやすい対象

---

## Grid

### 10. `tauri_app/src/system/component/timeline/grid/GridRootFrame.svelte`
主な責務:
- timeline grid 全体の描画起点
- base block / chord block / focus の描画
- melody cursor / active track / shade tracks の差し込み
- preview line の差し込み
- grid ref の bind
- preview active 時の背景変更

現状の特徴:
- timeline grid の中心
- Phase 7 で `ui/timeline/grid/TimelineGrid.svelte` 的な入口に変えやすい

### 11. `tauri_app/src/system/component/timeline/grid/BaseBlock.svelte`
主な責務:
- baseCache 単位の拍線 / scale 背景 / tonic 背景表示
- beatWidth / scroll / focusPos / current melody pitch を使う

### 12. `tauri_app/src/system/component/timeline/grid/ChordBlock.svelte`
主な責務:
- chord 単位で arrange track 表示領域を描画
- `ArrangeTracksManage.svelte` を内包

### 13. `tauri_app/src/system/component/timeline/grid/GridFocus.svelte`
主な責務:
- current focus の縦ハイライト表示

### 14. `tauri_app/src/system/component/timeline/grid/PreviewPosLine.svelte`
主な責務:
- preview line 表示

現状:
- すでに `ui/playback/PreviewPositionLine.svelte` へ入口整理済み

### 15. `tauri_app/src/system/component/timeline/TimelineTailMargin.svelte`
主な責務:
- 終端余白の描画

---

## Piano View

### 16. `tauri_app/src/system/component/timeline/grid/PianoViewFrame.svelte`
主な責務:
- chord / scale 情報を canvas piano view に描画

現状の特徴:
- timeline frame の右下に浮く補助 UI
- timeline に属しているが、将来的には `ui/common` や `ui/timeline/overlay` に分ける余地がある

---

## Arrange 接続

### 17. `tauri_app/src/system/component/timeline/grid/arrange/ArrangeTracksManage.svelte`
主な責務:
- chord block 内の arrange track 表示を束ねる

### 18. `tauri_app/src/system/component/timeline/grid/arrange/ArrangeNote.svelte`
主な責務:
- arrange note 表示

現状の特徴:
- timeline grid 配下にいるが、実質 arrange 機能の表示接点
- Phase 7 では「timeline 内 arrange 接続点」として把握し、全面整理は後回しが安全

---

## すでに新構成へ寄り始めている接続点

### Melody 接続
- `tauri_app/src/ui/melody/MelodyCursor.svelte`
- `tauri_app/src/ui/melody/score/ActiveTrack.svelte`
- `tauri_app/src/ui/melody/score/ShadeTracks.svelte`

### Playback 接続
- `tauri_app/src/ui/playback/PreviewPositionLine.svelte`

### Timeline helper
- `tauri_app/src/app/timeline/get-timeline-focus-pos.ts`

現状の特徴:
- timeline はすでに melody / playback の新入口を差し込む形に寄り始めている
- Phase 7 ではこの方向を header / pitch / frame に広げるのが自然

---

## 責務の大分類

### Frame
- `tauri_app/src/system/component/timeline/TimelineFrame.svelte`
- `tauri_app/src/ui/shell/MainWorkspace.svelte`

### Header
- `BeatMeasureFrame.svelte`
- `ChordListFrame.svelte`
- `ProgressInfo.svelte`
- `MeasureBlock.svelte`
- `MeasureFocus.svelte`

### Pitch
- `PitchListFrame.svelte`
- `PitchFocus.svelte`

### Grid
- `GridRootFrame.svelte`
- `BaseBlock.svelte`
- `ChordBlock.svelte`
- `GridFocus.svelte`
- `TimelineTailMargin.svelte`

### Overlay / helper
- `PianoViewFrame.svelte`

### Cross-feature insertion points
- melody: cursor / active track / shade tracks
- playback: preview line
- arrange: ArrangeTracksManage / ArrangeNote

---

## 先に移しやすいもの
- `TimelineFrame.svelte`
- `BeatMeasureFrame.svelte`
- `ChordListFrame.svelte`
- `ProgressInfo.svelte`
- `PitchListFrame.svelte`
- `GridRootFrame.svelte`

理由:
- 入口として束ねやすい
- 見た目の意味がはっきりしている
- 内部の細かい block にはまだ踏み込まなくても整理効果が大きい

---

## 慎重に扱うもの
- `BaseBlock.svelte`
- `MeasureBlock.svelte`
- `ArrangeTracksManage.svelte`
- `ArrangeNote.svelte`
- `PianoViewFrame.svelte`

理由:
- cache / scroll / arrange / canvas 描画への依存が強い
- Phase 7 前半では入口整理までに留める方が安全

---

## 判断メモ
Phase 7 の目的は timeline の完全移行ではなく、timeline を
- frame
- header
- pitch
- grid
- cross-feature boundary

の観点で説明できる状態にすること。

そのため最初は `BaseBlock` や `MeasureBlock` の内部最適化に入るより、
- `MainWorkspace -> TimelineFrame`
- `TimelineFrame -> header / pitch / grid`
- `grid -> melody / playback insertion`

の入口構造を新構成へ揃えるのが安全である。
