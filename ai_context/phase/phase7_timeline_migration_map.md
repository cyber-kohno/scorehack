# Phase 7 Timeline Migration Map

## 概要
このドキュメントは、現行 `timeline` 関連ファイルを新構成のどこへ寄せる想定かを整理するための移行マップです。

Phase 7 では timeline 全面移行ではなく、
- そのまま移しやすい入口
- wrapper を挟んで先に寄せるもの
- legacy のまま残す細部
- 後回しにするもの

を区別して進めます。

---

## 1. Frame

### `tauri_app/src/system/component/timeline/TimelineFrame.svelte`
移行先候補:
- `tauri_app/src/ui/timeline/TimelineFrame.svelte`

方針:
- 最初は legacy 実装を包むのではなく、同等の構成を `ui/timeline` 側に作る
- header / pitch / grid の入口を新パスから参照するようにする
- `MainWorkspace.svelte` の参照先を新入口に切り替える

優先度:
- 高

理由:
- timeline 全体の起点であり、入口整理の効果が大きいから

### `tauri_app/src/ui/shell/MainWorkspace.svelte`
移行先候補:
- 現状維持しつつ import 先を変更

方針:
- `system/component/timeline/TimelineFrame.svelte` 直参照をやめ、`ui/timeline/TimelineFrame.svelte` を使う

優先度:
- 高

---

## 2. Header

### `tauri_app/src/system/component/timeline/header/BeatMeasureFrame.svelte`
移行先候補:
- `tauri_app/src/ui/timeline/header/BeatMeasureLayer.svelte`
  または
- `tauri_app/src/ui/timeline/header/TimelineBeatMeasure.svelte`

方針:
- 新入口へ移し、`MeasureBlock` と `MeasureFocus` を内包する構成にする
- まずは中の block を legacy のまま使ってよい

優先度:
- 高

### `tauri_app/src/system/component/timeline/header/ChordListFrame.svelte`
移行先候補:
- `tauri_app/src/ui/timeline/header/TimelineChordList.svelte`

方針:
- 新入口に移し、scroll / focus 由来の可視 chord 抽出を selector 化できる余地を作る

優先度:
- 高

### `tauri_app/src/system/component/timeline/header/ProgressInfo.svelte`
移行先候補:
- `tauri_app/src/ui/timeline/header/TimelineProgressInfo.svelte`

方針:
- section / modulate / tempo 表示を担う header 情報レイヤとして整理する
- 今後 `tempo / ts` を受ける timeline 側の入口候補

優先度:
- 高

### `MeasureBlock.svelte`, `MeasureFocus.svelte`
移行先候補:
- 当面 legacy 維持

方針:
- Phase 7 前半では `BeatMeasureFrame` の配下として残し、内部構造は後で扱う

優先度:
- 中

---

## 3. Pitch

### `tauri_app/src/system/component/timeline/pitch/PitchListFrame.svelte`
移行先候補:
- `tauri_app/src/ui/timeline/pitch/TimelinePitchColumn.svelte`

方針:
- 新入口へ移し、pitch list と `PitchFocus` をまとめる
- pitch ref bind もここで扱う

優先度:
- 高

### `tauri_app/src/system/component/timeline/pitch/PitchFocus.svelte`
移行先候補:
- `tauri_app/src/ui/timeline/pitch/PitchFocus.svelte`
  または
- 当面 legacy 維持

方針:
- まずは `PitchListFrame` の新入口から利用する形にする
- 内部は selector ベースなので、後から移しやすい

優先度:
- 中

---

## 4. Grid

### `tauri_app/src/system/component/timeline/grid/GridRootFrame.svelte`
移行先候補:
- `tauri_app/src/ui/timeline/grid/TimelineGrid.svelte`

方針:
- 新入口へ移し、
  - base block
  - chord block
  - focus
  - melody insertion
  - playback insertion
  を束ねる timeline grid の起点にする

優先度:
- 高

### `BaseBlock.svelte`
移行先候補:
- 当面 legacy 維持

方針:
- cache / scroll / pitch 背景計算が重いため、Phase 7 前半では内部に踏み込まない

優先度:
- 中

### `ChordBlock.svelte`
移行先候補:
- 当面 legacy 維持

方針:
- arrange 接続があるため、grid 入口整理のあとに考える

優先度:
- 中

### `GridFocus.svelte`
移行先候補:
- `ui/timeline/grid/GridFocus.svelte`
  または legacy 維持

方針:
- まずは `TimelineGrid.svelte` 配下で利用する形にする

優先度:
- 中

### `TimelineTailMargin.svelte`
移行先候補:
- `ui/timeline/grid/TimelineTailMargin.svelte`
  または共通化

方針:
- まずは grid 配下の補助表示として扱う

優先度:
- 低

---

## 5. Cross-feature insertion points

### Melody insertion
対象:
- `tauri_app/src/ui/melody/MelodyCursor.svelte`
- `tauri_app/src/ui/melody/score/ActiveTrack.svelte`
- `tauri_app/src/ui/melody/score/ShadeTracks.svelte`

方針:
- timeline 側から見た差し込み口を `TimelineGrid.svelte` に固定する
- melody 側の本体整理は Phase 5 の成果をそのまま活かす

優先度:
- 高

### Playback insertion
対象:
- `tauri_app/src/ui/playback/PreviewPositionLine.svelte`

方針:
- timeline 側から見た差し込み口を `TimelineGrid.svelte` に固定する

優先度:
- 高

### Outline / cache insertion
対象:
- `ChordListFrame.svelte`
- `BeatMeasureFrame.svelte`
- `ProgressInfo.svelte`

方針:
- header 側で outline / cache 情報を受ける入口に整理する

優先度:
- 高

---

## 6. Overlay / helper

### `tauri_app/src/system/component/timeline/grid/PianoViewFrame.svelte`
移行先候補:
- `tauri_app/src/ui/timeline/overlay/PianoViewOverlay.svelte`
  または
- 当面 `TimelineFrame.svelte` 配下で legacy 維持

方針:
- 右下補助 UI として frame 配下に残しつつ、責務だけ timeline overlay として説明する

優先度:
- 低

---

## 7. Arrange 接続

### `ArrangeTracksManage.svelte`, `ArrangeNote.svelte`
移行先候補:
- 当面 legacy 維持

方針:
- timeline 内 arrange 接点として把握する
- 本格整理は arrange フェーズで扱う

優先度:
- 低

---

## 8. State / selector

### 追加候補
- `tauri_app/src/state/ui-state/timeline-ui-store.ts`
- `tauri_app/src/state/session-state/timeline-session.ts`

方針:
- まずは読み取り selector を中心に追加する
- 候補は以下
  - beatWidth
  - scrollLimitProps(header / grid)
  - isMelodyMode
  - isPlaybackActive
  - current pianoInfo 表示条件
  - visible chord/base caches の抽出条件

優先度:
- 高

---

## 実施順の提案
1. `ui/timeline/TimelineFrame.svelte` を作る
2. `ui/timeline/header/*`, `ui/timeline/pitch/*`, `ui/timeline/grid/*` の入口を作る
3. `MainWorkspace.svelte` の import を新入口へ切り替える
4. `timeline-ui-store.ts` を作る
5. header / pitch / grid の読み取りを selector 経由へ寄せる
6. scroll / viewport 由来の責務を整理する

---

## 先にやらないこと
- `BaseBlock.svelte` のロジック最適化
- `MeasureBlock.svelte` の内部整理
- arrange track 表示の本格整理
- piano view canvas 実装変更
- timeline 全体の見た目変更

---

## 判断メモ
Phase 7 では、timeline を
- frame
- header
- pitch
- grid
- insertion boundary

に分ける土台づくりを優先する。

最初に狙うべきなのは block 単位の完全移行ではなく、
`MainWorkspace -> TimelineFrame -> header/pitch/grid` の入口構造を新構成に揃えること。

これができると、後続で `tempo / ts` の timeline 反映や arrange 表示整理にもつなげやすくなる。
