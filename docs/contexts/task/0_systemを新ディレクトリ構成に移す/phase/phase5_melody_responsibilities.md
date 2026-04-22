# Phase 5 Melody Responsibilities

## 目的
このメモは、Phase 5 時点で `melody` 周辺の責務がどこにあるかを説明できるようにするための整理です。

---

## melody が担うもの
`melody` は単純なノート表示機能ではなく、以下をまとめて扱う機能です。

- 単旋律ノートの編集
- cursor / focus / range の制御
- score track / audio track の扱い
- outline との同期
- timeline grid / header / pitch での表示
- terminal からの melody 操作

そのため、Phase 5 では `melody` を timeline 上の編集機能として整理した。

---

## 現在の責務配置

### `ui/melody`
表示責務を置く。

主なファイル:
- `tauri_app/src/ui/melody/MelodyCursor.svelte`
- `tauri_app/src/ui/melody/MelodyUnitDisplay.svelte`
- `tauri_app/src/ui/melody/score/ActiveTrack.svelte`
- `tauri_app/src/ui/melody/score/ShadeTracks.svelte`
- `tauri_app/src/ui/melody/score/Note.svelte`

責務:
- melody cursor 表示
- active track 表示
- shade track 表示
- note 表示入口
- unit 表示入口

### `state/ui-state`
melody の読み取り selector を置く。

主なファイル:
- `tauri_app/src/state/ui-state/melody-ui-store.ts`

責務:
- current cursor / current target note の参照
- current track / current notes の参照
- focus index / focus range の参照
- current pitch / beat rect の参照
- shade 表示対象の参照
- scrollLimitProps の参照

### `app/melody`
melody の実行入口を置く。

主なファイル:
- `tauri_app/src/app/melody/melody-actions.ts`
- `tauri_app/src/app/melody/melody-input-router.ts`

責務:
- melody reducer の利用入口
- melody input の利用入口
- shell / terminal から見える melody 導線の起点

### `domain/melody`
型と純粋ロジックを置く。

主なファイル:
- `tauri_app/src/domain/melody/melody-types.ts`
- `tauri_app/src/domain/melody/melody-control.ts`

責務:
- note / norm / track 型
- melody control state 型
- beat 計算
- overlap 判定
- normalize
- pitch validation
- unit text 生成

### timeline 境界
timeline から melody を参照する境界を整理した。

主なファイル:
- `tauri_app/src/system/component/timeline/grid/GridRootFrame.svelte`
- `tauri_app/src/system/component/timeline/grid/BaseBlock.svelte`
- `tauri_app/src/system/component/timeline/header/MeasureFocus.svelte`
- `tauri_app/src/system/component/timeline/pitch/PitchFocus.svelte`

責務:
- timeline から melody 表示入口を呼ぶ
- melody の現在位置 / pitch / beat rect を selector 経由で参照する

### legacy (`system/input`, `system/store/reducer`, `system/component/melody`)
まだ本体実装が残っている。

主なファイル:
- `tauri_app/src/system/input/inputMelody.ts`
- `tauri_app/src/system/store/reducer/reducerMelody.ts`
- `tauri_app/src/system/component/melody/*`
- `tauri_app/src/system/component/melody/score/*`

責務:
- melody 編集本体
- focus / range / note edit ロジック
- 既存 note component の詳細描画

---

## Phase 5 で整理できたこと

### 1. melody の入口が見えるようになった
以前は shell, timeline, terminal がそれぞれ直接 melody 本体を読んでいた。

現在は:
- `ui/melody`
- `state/ui-state/melody-ui-store.ts`
- `app/melody`
- `domain/melody`

という入口ができ、どこから melody を触るか説明しやすくなった。

### 2. timeline との接続点が見えるようになった
Phase 5 によって、melody は timeline と一体ではあるが、
- timeline は melody selector を読む
- melody 表示は `ui/melody` を通る

という境界を説明できるようになった。

### 3. `storeMelody.ts` の役割が薄くなった
型と純粋ロジックの本体は `domain/melody` に寄り始めている。
`storeMelody.ts` は互換レイヤー寄りになり、今後さらに整理しやすい状態になった。

---

## まだ legacy に残っているもの

### input 本体
- `inputMelody.ts`

### reducer 本体
- `reducerMelody.ts`

### note 詳細描画
- `system/component/melody/score/Note.svelte`
- `system/component/melody/score/Factors.svelte`
- `system/component/melody/score/ShadeNote.svelte`

### preview 接続の深い部分
- `PreviewUtil` を呼ぶ melody input の一部

---

## 次段階で考えること

### 1. `inputMelody.ts` の責務分割
現在は以下が混在している。
- cursor operation
- note edit
- range selection
- clipboard
- preview test
- outline sync
- scroll sync

次段階では、少なくとも
- selection
- note edit
- playback test
のように分ける余地がある。

### 2. `reducerMelody.ts` の責務分割
現在は action と view sync が混ざっている。
- note operation
- focus operation
- track operation
- outline sync
- ref scroll sync

を分ける余地がある。

### 3. timeline 側を新構成へさらに寄せる
Phase 5 では melody 境界まで整理した。
次段階では timeline 全体の責務整理へ広げる余地がある。

---

## 現時点のまとめ
Phase 5 によって、`melody` はまだ完全移行ではないものの、少なくとも

- どこが UI か
- どこが state 読み取りか
- どこが app 入口か
- どこが domain か
- timeline との境界がどこか

を説明できる状態になった。

これは次に `playback` や timeline 全体へ進むための土台になっている。
