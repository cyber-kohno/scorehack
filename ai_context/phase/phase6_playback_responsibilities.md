# Phase 6 Playback Responsibilities

## 概要
Phase 6 では、`playback` を新構成で説明できる状態にすることを目的に、
- UI
- state
- app
- domain
- infra
- legacy engine

の責務を切り分けた。

このドキュメントは、現時点でそれぞれの責務をどこが担っているかを整理するためのメモである。

---

## UI

### `tauri_app/src/ui/playback/PreviewPositionLine.svelte`
役割:
- playback の progress line を描画する UI 入口
- `linePos` を直接 `preview` から読むのではなく、selector 経由で受ける

現状:
- timeline grid から呼ばれる playback UI の代表入口になっている

---

## State

### `tauri_app/src/state/ui-state/playback-ui-store.ts`
役割:
- playback の読み取り selector

主な内容:
- playback active 判定
- linePos
- progressTime
- lastTime
- timerKeys / intervalKeys
- loaded SoundFonts
- active audios
- line offset 計算

### `tauri_app/src/state/session-state/playback-session.ts`
役割:
- playback の更新入口

主な内容:
- timer / interval のセット
- progressTime / lastTime / linePos の更新
- audio push / clear / pause
- loaded SoundFont 追加 / player 設定 / stop

現状:
- `previewUtil.ts` の state 更新は、まだすべてではないがかなり `playback-session` 経由に寄った

---

## App

### `tauri_app/src/app/playback/playback-actions.ts`
役割:
- playback の action 入口

主な内容:
- SoundFont load 判定
- SoundFont load
- preview 開始
- preview 停止

### `tauri_app/src/app/playback/playback-preview-router.ts`
役割:
- input 側から使う preview router 入口

主な内容:
- `startPreview`
- `stopPreview`

現状:
- `inputMelody.ts` と `inputOutline.ts` は preview を `app/playback` 経由で呼ぶ形になっている
- terminal builder 群も SoundFont load を `app/playback` 経由で呼ぶ形になっている

---

## Domain

### `tauri_app/src/domain/playback/playback-types.ts`
役割:
- playback の型定義

主な内容:
- track target mode
- option
- sound time player
- track player
- sound note

### `tauri_app/src/domain/playback/playback-progress.ts`
役割:
- playback の時間計算

主な内容:
- beat -> time
- time -> beat

現状:
- `previewUtil.ts` から時間計算ロジックを参照する形に変わっている

---

## Infra

### `tauri_app/src/infra/audio/soundfont-player.ts`
役割:
- SoundFont ライブラリ依存を薄く包む

主な内容:
- `createSoundFontPlayer()`

現状:
- `previewUtil.ts` から直接 `SoundFont.instrument(...)` を呼ばず、この入口を使う形に変わっている

---

## Legacy Core

### `tauri_app/src/system/util/preview/previewUtil.ts`
役割:
- playback engine 本体

まだ持っている責務:
- note -> player 変換
- score/audio/arrange の再生組み立て
- timer / interval の起動
- outline focus 追従
- stop 処理

すでに切り出せたもの:
- playback 型
- time <-> beat 計算
- SoundFont load のライブラリ依存
- preview state 更新の一部

現状:
- Phase 6 では本体を全面分割せず、依存方向だけ新構成へ寄せる段階まで進めた

---

## Timeline Boundary

### `tauri_app/src/system/component/timeline/grid/GridRootFrame.svelte`
役割:
- timeline 側から playback UI を呼ぶ入口

現状:
- `PreviewPosLine.svelte` 直参照から `ui/playback/PreviewPositionLine.svelte` へ移行済み
- preview active 判定も `ContextUtil` 越しではなく selector ベースへ寄り始めている

---

## まだ legacy 側に残っているもの
- `previewUtil.ts` 本体の大部分
- AudioContext / HTMLAudioElement / setTimeout / setInterval の直接操作
- arrange preview helper の最終配置
- preview と outline focus 追従の深い分離

---

## 判断メモ
Phase 6 の目的は playback の完全移行ではなく、playback を責務単位で説明できる状態にすることだった。

その意味では現時点で、
- UI 入口
- state 読み取り / 更新入口
- app 入口
- domain 型
- domain 計算
- infra の最小入口

までは揃っており、次フェーズへ進むための土台として十分にまとまっている。
