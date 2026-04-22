# Phase 7 Timeline Responsibilities

## 概要
Phase 7 では、`timeline` を新構成で説明できる状態にすることを目的に、
- frame
- header
- pitch
- grid
- insertion boundary
- viewport boundary

の責務を切り分けた。

このドキュメントは、現時点でそれぞれの責務をどこが担っているかを整理するためのメモである。

---

## Frame

### `tauri_app/src/ui/timeline/TimelineFrame.svelte`
役割:
- timeline 全体の UI 入口
- header / pitch / grid / piano view の配置
- timeline を 1 つの機能単位として束ねる

主な内容:
- `TimelineHeader`
- `TimelinePitchColumn`
- `TimelineGrid`
- `PianoViewFrame`

現状:
- `MainWorkspace.svelte` はこの新入口を参照する形に変わっている
- timeline 全体の「見える入口」は新構成側へ寄った

### `tauri_app/src/ui/shell/MainWorkspace.svelte`
役割:
- outline と timeline の 2 カラム配置

現状:
- timeline 参照先は `system/component/timeline/TimelineFrame.svelte` ではなく `ui/timeline/TimelineFrame.svelte`

---

## Header

### `tauri_app/src/ui/timeline/header/TimelineHeader.svelte`
役割:
- timeline header の束ね役

主な内容:
- `TimelineChordList`
- `TimelineProgressInfo`
- `TimelineBeatMeasure`

### `tauri_app/src/ui/timeline/header/TimelineChordList.svelte`
役割:
- chord 名表示レイヤの入口

現状:
- 実体はまだ legacy `ChordListFrame.svelte`
- ただし可視 chord 抽出と chord 名解決は `timeline-ui-store.ts` 側へ寄り始めている

### `tauri_app/src/ui/timeline/header/TimelineProgressInfo.svelte`
役割:
- section / modulate / tempo を含む progress 情報レイヤの入口

現状:
- 実体はまだ legacy `ProgressInfo.svelte`
- ただし progress item の組み立ては `timeline-ui-store.ts` 側へ寄り始めている

### `tauri_app/src/ui/timeline/header/TimelineBeatMeasure.svelte`
役割:
- beat / measure 表示レイヤの入口

現状:
- 実体はまだ legacy `BeatMeasureFrame.svelte`
- `MeasureBlock`, `MeasureFocus` は当面 legacy のまま利用している

---

## Pitch

### `tauri_app/src/ui/timeline/pitch/TimelinePitchColumn.svelte`
役割:
- pitch column の入口

現状:
- 実体はまだ legacy `PitchListFrame.svelte`
- melody mode 判定は `timeline-ui-store.ts` の selector 経由へ寄った

### `tauri_app/src/system/component/timeline/pitch/PitchFocus.svelte`
役割:
- current melody pitch の highlight 表示

現状:
- selector ベースで動いており、後続で新配置へ移しやすい状態

---

## Grid

### `tauri_app/src/ui/timeline/grid/TimelineGrid.svelte`
役割:
- timeline grid の入口

現状:
- 実体はまだ legacy `GridRootFrame.svelte`
- ただし timeline 側から見た grid 起点は新構成へ寄った

### `tauri_app/src/system/component/timeline/grid/GridRootFrame.svelte`
役割:
- base block / chord block / focus / melody insertion / playback insertion を束ねる grid 本体

現状:
- `PreviewPositionLine.svelte` を使う形に整理済み
- preview active 判定も selector ベースへ寄っている

### `BaseBlock.svelte`, `ChordBlock.svelte`, `GridFocus.svelte`
役割:
- grid 内の細部描画

現状:
- まだ legacy 側に残している
- Phase 7 では入口整理を優先し、内部整理は後続に回している

---

## Insertion Boundary

### Melody
差し込み先:
- `GridRootFrame.svelte`

差し込み要素:
- `tauri_app/src/ui/melody/MelodyCursor.svelte`
- `tauri_app/src/ui/melody/score/ActiveTrack.svelte`
- `tauri_app/src/ui/melody/score/ShadeTracks.svelte`

現状:
- timeline 側から見た melody insertion は新入口を通る形に揃っている

### Playback
差し込み先:
- `GridRootFrame.svelte`

差し込み要素:
- `tauri_app/src/ui/playback/PreviewPositionLine.svelte`

現状:
- timeline 側から見た playback insertion も新入口を通る形に揃っている

### Outline / Cache
差し込み先:
- header 系コンポーネント

差し込み内容:
- chord 名
- measure / beat
- section / modulate / tempo

現状:
- header 側の各表示は legacy 実装を使っているが、可視判定や情報組み立ては selector 側へ寄り始めている

---

## Viewport Boundary

### `tauri_app/src/state/ui-state/timeline-ui-store.ts`
役割:
- timeline から見た viewport 読み取り selector

主な内容:
- header/grid の scrollLimitProps
- melody mode 判定
- pianoInfo
- visible chordCaches
- progress item 組み立て

### `tauri_app/src/system/store/props/storeRef.ts`
役割:
- DOM ref と `ScrollLimitProps` の最小単位

### `tauri_app/src/system/store/reducer/reducerRef.ts`
役割:
- scroll の更新 / 同期 / animation

現状:
- viewport を読む責務は timeline selector 側
- scroll を動かす責務は reducerRef 側
- この境界で固定したのが Phase 7 の重要な整理ポイント

---

## Overlay / helper

### `tauri_app/src/system/component/timeline/grid/PianoViewFrame.svelte`
役割:
- chord / scale に基づく補助 piano view 表示

現状:
- `TimelineFrame.svelte` 配下で overlay 的に扱っている
- 将来的な配置変更余地はあるが、Phase 7 では timeline の補助 UI として整理した

---

## まだ legacy 側に残っているもの
- `TimelineFrame.svelte` 旧実装本体
- `BeatMeasureFrame.svelte` など header の細部本体
- `GridRootFrame.svelte` の内部本体
- `BaseBlock.svelte`, `MeasureBlock.svelte`, `ChordBlock.svelte` の詳細ロジック
- arrange 表示接点の本格整理

---

## 判断メモ
Phase 7 の目的は timeline の完全移行ではなく、timeline を責務単位で説明できる状態にすることだった。

その意味では現時点で、
- frame 入口
- header 入口
- pitch 入口
- grid 入口
- melody / playback / outline の insertion boundary
- viewport の読み取り / 更新境界

までは揃っており、次フェーズへ進むための土台として十分にまとまっている。
