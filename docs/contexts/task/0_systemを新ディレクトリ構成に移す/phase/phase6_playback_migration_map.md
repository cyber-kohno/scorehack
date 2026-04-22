# Phase 6 Playback Migration Map

## 概要
このドキュメントは、現行 `playback` 関連ファイルを新構成のどこへ寄せる想定かを整理するための移行マップです。

Phase 6 では全面移行ではなく、
- そのまま移しやすいもの
- wrapper を挟んで入口だけ先に寄せるもの
- 分割前提のもの
- 後回しにするもの

を区別して進めます。

---

## 1. UI

### `tauri_app/src/system/component/timeline/grid/PreviewPosLine.svelte`
移行先候補:
- `tauri_app/src/ui/playback/PreviewPositionLine.svelte`

方針:
- まずは wrapper でもよいので新入口を作る
- `linePos` と `beatWidth` の読み取りは selector 経由へ寄せる
- timeline grid からは新入口を参照する形に変える

優先度:
- 高

理由:
- 見た目が単純で、playback と timeline の代表的境界だから

---

## 2. State

### `tauri_app/src/system/store/props/storePreview.ts`
移行先候補:
- `tauri_app/src/state/ui-state/playback-ui-store.ts`
- `tauri_app/src/state/session-state/playback-session.ts`
- `tauri_app/src/domain/playback/playback-types.ts`
- `tauri_app/src/infra/audio/soundfont-catalog.ts`

方針:
- まず `progressTime / linePos / timerKeys / intervalKeys / audios / sfItems` の selector / updater を追加する
- `InstrumentNames` と `validateSFName()` は最終的に state から分離する
- ただし Phase 6 前半では互換のため `storePreview.ts` を残してよい

優先度:
- 高

理由:
- playback の境界づくりの起点になるから

---

## 3. App / Action 入口

### `tauri_app/src/system/util/preview/previewUtil.ts`
移行先候補:
- `tauri_app/src/app/playback/playback-actions.ts`
- `tauri_app/src/app/playback/playback-preview-router.ts`
- `tauri_app/src/domain/playback/playback-progress.ts`
- `tauri_app/src/domain/playback/playback-types.ts`
- `tauri_app/src/infra/audio/soundfont-player.ts`
- `tauri_app/src/infra/preview/audio-preview.ts`

方針:
- いきなり本体分割しない
- まず `PreviewUtil.useUpdater(storeUtil)` と `PreviewUtil.useReducer(lastStore)` の外側に `app/playback` 入口を作る
- その後、純粋ロジックと副作用を分ける

想定分割:
- `app/playback/playback-actions.ts`
  - start / stop / loadSoundFont などの入口
- `domain/playback/playback-progress.ts`
  - time <-> beat 変換
- `domain/playback/playback-types.ts`
  - SoundTimePlayer / TrackPlayer 等の型
- `infra/audio/soundfont-player.ts`
  - SoundFont load / play / stop
- `infra/preview/audio-preview.ts`
  - HTMLAudioElement 操作

優先度:
- 高

理由:
- ここが playback 本体であり、依存整理の中心だから

---

## 4. Input 側の導線

### `tauri_app/src/system/input/inputMelody.ts`
移行先候補:
- `tauri_app/src/app/playback/playback-preview-router.ts`
- `tauri_app/src/app/melody/melody-input-router.ts`

方針:
- `PreviewUtil.useUpdater(storeUtil)` の直接参照をやめ、`app/playback` の入口経由にする
- 単音モニタ再生 `playSF()` は後続で `playback` または `audio monitor` 的責務として整理する

優先度:
- 高

理由:
- space key の再生開始 / 停止は、最初に app 層へ寄せやすいから

### `tauri_app/src/system/input/inputOutline.ts`
移行先候補:
- `tauri_app/src/app/playback/playback-preview-router.ts`
- `tauri_app/src/app/outline/outline-input-router.ts`

方針:
- melody と同様に、preview 開始 / 停止の入口だけ `app/playback` に切る

優先度:
- 高

---

## 5. Terminal 側の導線

### `tauri_app/src/system/store/reducer/terminal/sector/builderCommon.ts`
移行先候補:
- `tauri_app/src/app/playback/soundfont-loader.ts`
- `tauri_app/src/app/project-io/project-io-service.ts`

方針:
- load 完了後の SoundFont 読み込みを `app/playback` 側の helper / action に寄せる
- project-io と playback の接点を builder から薄くする

優先度:
- 中

### `tauri_app/src/system/store/reducer/terminal/sector/builderHarmonize.ts`
移行先候補:
- `tauri_app/src/app/playback/soundfont-loader.ts`
- `tauri_app/src/app/terminal/terminal-command-registry.ts`

方針:
- `StorePreview.InstrumentNames` と `loadSoundFont()` の直接依存を `app/playback` 側へ寄せる

優先度:
- 中

### `tauri_app/src/system/store/reducer/terminal/sector/builderMelody.ts`
移行先候補:
- `tauri_app/src/app/playback/soundfont-loader.ts`
- `tauri_app/src/app/project-io/project-io-service.ts`

方針:
- `sf` コマンドの playback 依存と `aul` の audio track 導線を分けて整理する

優先度:
- 中

---

## 6. Helper / Pure Conversion

### `tauri_app/src/system/util/preview/arrange/pianoArrangePreviewUtil.ts`
移行先候補:
- `tauri_app/src/domain/playback/piano-arrange-preview.ts`
  または
- `tauri_app/src/domain/arrange/piano-preview-pattern.ts`

方針:
- 副作用がないため、比較的早い段階で切り出しやすい
- ただし arrange と playback のどちらへ置くかは、Phase 6 中に責務を見ながら決める

優先度:
- 中

---

## 7. Store 全体との関係

### `tauri_app/src/system/store/store.ts`
移行先候補:
- 直ちに移すのではなく、境界ファイルを追加する

追加候補:
- `tauri_app/src/state/ui-state/playback-ui-store.ts`
- `tauri_app/src/state/session-state/playback-session.ts`

方針:
- store 実体はまだ分割しない
- `preview` の読み取り / 更新入口だけ先に分ける

優先度:
- 高

---

## 実施順の提案
1. `PreviewPosLine.svelte` の新入口を `ui/playback` に作る
2. `playback-ui-store.ts` と `playback-session.ts` を作る
3. `app/playback/playback-actions.ts` を作って `previewUtil` の入口を包む
4. `inputMelody.ts` と `inputOutline.ts` を `app/playback` 経由へ変える
5. terminal の SoundFont 導線を `app/playback/soundfont-loader.ts` 側へ寄せる
6. `previewUtil.ts` の純粋部分を `domain/playback` へ切り出し始める
7. arrange preview helper の配置を見直す

---

## 先にやらないこと
- `previewUtil.ts` の全面書き換え
- AudioContext 周りの実装変更
- 再生仕様そのものの変更
- SoundFont ライブラリ差し替え
- timeline 全体の移行
- store の実体分割

---

## 判断メモ
Phase 6 では、`playback` を
- UI
- app 入口
- state 境界
- domain
- infra

に分ける土台づくりを優先する。

最初に狙うべきなのは `previewUtil.ts` を小さくすることではなく、
`previewUtil.ts` に向かう依存を `app/playback` へ集めること。

これができると、その後の分割はかなり安全になる。
