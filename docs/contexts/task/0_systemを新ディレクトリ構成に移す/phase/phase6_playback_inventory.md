# Phase 6 Playback Inventory

## 概要
Phase 6 では `playback` を主要対象として扱う。

現行の `playback` は、単一の再生エンジンとしてきれいにまとまっているというより、
- utility
- store props
- timeline UI
- input
- terminal command
- arrange preview helper

にまたがって配置されている。

まずはそれぞれの責務を分解して把握する。

---

## 中心となるファイル

### 1. `tauri_app/src/system/util/preview/previewUtil.ts`
現行 `playback` の中心。

主な責務:
- SoundFont 再生用の note/player 型定義
- note から再生用データへの変換
- SoundFont のロードとキャッシュ参照
- score track の preview 再生開始
- audio track の preview 再生開始
- arrange track の preview 再生開始
- progressTime / linePos の更新
- outline focus の追従
- timer / interval の管理
- stop 処理

現状の特徴:
- 純粋計算と副作用がかなり混在している
- `melody`, `cache`, `ref`, `arrange`, `preview state` に強く依存している
- `useReducer` と `useUpdater` の 2 入口だが、実質的には preview engine 本体

Phase 6 では、このファイルをすぐ消すのではなく、まず `app/playback` の入口を作って依存方向を整えるのが安全。

---

### 2. `tauri_app/src/system/store/props/storePreview.ts`
preview/playback の state 型定義と SoundFont 名管理を持つ。

主な責務:
- timerKeys / intervalKeys
- progressTime / lastTime / linePos
- active audio element 配列
- loaded SoundFont 配列
- SoundFont 名の validate
- SoundFont 名一覧

現状の特徴:
- state 型と SoundFont カタログが同居している
- `preview state` と `audio library metadata` が未分離
- Phase 6 では `state/session-state` と `domain/infra` の境界候補になる

---

### 3. `tauri_app/src/system/component/timeline/grid/PreviewPosLine.svelte`
playback の timeline 表示入口。

主な責務:
- `$store.preview.linePos` を beat 幅に変換して再生線を表示

現状の特徴:
- 見た目は単純
- しかし playback と timeline をつなぐ代表的な境界
- Phase 6 の UI 入口整理では最初に移しやすい対象

---

## 再生命令の入口

### 4. `tauri_app/src/system/input/inputMelody.ts`
melody mode 中の space key で preview を開始 / 停止する。

主な責務:
- `PreviewUtil.useUpdater(storeUtil)` から `startTest`, `stopTest` を取得
- preview 中は通常編集より stop を優先
- score track の SoundFont を直接鳴らす `playSF` も持つ

現状の特徴:
- melody input と playback 起動が混在している
- `playSF` は preview 本体とは別の単音モニタ再生で、将来的には playback と近い場所へ寄せたい

---

### 5. `tauri_app/src/system/input/inputOutline.ts`
outline mode 中の space key で preview を開始 / 停止する。

主な責務:
- `PreviewUtil.useUpdater(storeUtil)` から `startTest`, `stopTest` を取得
- arrange editor / finder より外側で preview を制御

現状の特徴:
- outline input と playback 起動が混在している
- Phase 6 では `app/playback` の入口を経由させる候補

---

## terminal からの接続点

### 6. `tauri_app/src/system/store/reducer/terminal/sector/builderCommon.ts`
load 後の SoundFont ロードを担う。

主な責務:
- プロジェクト load 後に score track を走査
- track.soundFont に応じて `loadSoundFont()` を呼ぶ

現状の特徴:
- project-io と playback 初期化が接続している
- Phase 6 では `app/playback/soundfont-loader` 的な入口候補

---

### 7. `tauri_app/src/system/store/reducer/terminal/sector/builderHarmonize.ts`
arrange/harmonize track 用の SoundFont 設定とロードを担う。

主な責務:
- `sf` コマンドの候補に `StorePreview.InstrumentNames` を使う
- SoundFont 未ロード時に `loadSoundFont()` を呼ぶ

現状の特徴:
- harmonize track 設定と playback library 管理が接続している
- terminal 側から見た playback の代表的導線

---

### 8. `tauri_app/src/system/store/reducer/terminal/sector/builderMelody.ts`
score track 用の SoundFont 設定と audio file upload 後の再生前提を担う。

主な責務:
- `sf` コマンドの候補に `StorePreview.InstrumentNames` を使う
- SoundFont 未ロード時に `loadSoundFont()` を呼ぶ
- `aul` で audio track に mp3 を入れる

現状の特徴:
- score track と audio track の両方がここに現れる
- Phase 6 では `SoundFont` と `audio track playback` を分けて考える必要がある

---

## arrange preview helper

### 9. `tauri_app/src/system/util/preview/arrange/pianoArrangePreviewUtil.ts`
arrange piano pattern を preview 用 note 群へ変換する純粋寄り helper。

主な責務:
- piano arrange pattern -> note 群変換
- voicing / pedal / relationStruct の計算

現状の特徴:
- `previewUtil.ts` から呼ばれる補助ロジック
- 副作用はなく、比較的 `domain/playback` または `domain/arrange` へ寄せやすい

---

## store 上の位置づけ

### 10. `tauri_app/src/system/store/store.ts`
`preview` は巨大 store の一部として保持されている。

主な責務:
- `preview: StorePreview.Props`
- `commit()` により再生進捗更新も含めて store 再通知

現状の特徴:
- playback state はまだ独立 store ではない
- Phase 6 では store 実体分割まではやらず、selector / updater で境界を作る方針が安全

---

## timeline 側の接続点

### 11. `tauri_app/src/system/component/timeline/grid/GridRootFrame.svelte`
`PreviewPosLine.svelte` を含む timeline grid の入口。

### 12. `tauri_app/src/system/component/timeline/header/MeasureFocus.svelte`
直接 playback を読むわけではないが、preview 中の focus 追従と見た目上つながるため、将来的な境界整理の対象。

現段階では Phase 6 の直接対象は `PreviewPosLine.svelte` を優先し、timeline 全面整理は後続に回すのがよい。

---

## 責務の大分類

### UI
- `tauri_app/src/system/component/timeline/grid/PreviewPosLine.svelte`

### App / UseCase 的入口
- `tauri_app/src/system/input/inputMelody.ts`
- `tauri_app/src/system/input/inputOutline.ts`
- `tauri_app/src/system/store/reducer/terminal/sector/builderCommon.ts`
- `tauri_app/src/system/store/reducer/terminal/sector/builderHarmonize.ts`
- `tauri_app/src/system/store/reducer/terminal/sector/builderMelody.ts`

### State
- `tauri_app/src/system/store/props/storePreview.ts`
- `tauri_app/src/system/store/store.ts`

### Core playback engine
- `tauri_app/src/system/util/preview/previewUtil.ts`

### Helper / pure conversion
- `tauri_app/src/system/util/preview/arrange/pianoArrangePreviewUtil.ts`

---

## 先に移しやすいもの
- `tauri_app/src/system/component/timeline/grid/PreviewPosLine.svelte`
- `tauri_app/src/system/store/props/storePreview.ts` の state 読み取り部分
- `PreviewUtil.useUpdater(storeUtil)` の入口
- `builderCommon.ts` の SoundFont load 導線

---

## 後で慎重に扱うもの
- `tauri_app/src/system/util/preview/previewUtil.ts` 本体
- AudioContext / HTMLAudioElement / setTimeout / setInterval を直接扱う部分
- outline focus 追従を含む progress 更新
- arrange preview を巻き込む部分

---

## 判断メモ
Phase 6 の目的は playback の完全移行ではなく、playback を
- UI
- action
- state
- domain
- infra
- timeline boundary

の観点で説明できる状態にすること。

そのため最初は `previewUtil.ts` を直接分割するより、
- 入口を `app/playback` に切る
- `PreviewPosLine.svelte` を UI 入口として整理する
- `storePreview.ts` の読み取り入口を selector 化する

ところから進めるのが安全である。
