# Phase 8 Feature State Dependencies

## 概要
このドキュメントは、各主要機能がどの state 境界に主に依存しているかを整理するためのメモである。

分類は以下を使う。
- project data
- editor control
- shell / terminal ui
- session input
- playback session
- cache
- refs
- file session

---

## Outline
主に依存する境界:
- project data
- editor control
- cache
- refs

具体:
- `data.elements`
- `control.outline.*`
- `cache.elementCaches / chordCaches / baseCaches`
- `ref.outline / elementRefs`

特徴:
- data と cache 依存が強い
- scroll では refs にも依存

---

## Terminal
主に依存する境界:
- shell / terminal ui
- project data
- editor control
- file session
- playback session

具体:
- `terminal.*`
- `data.*`
- `control.*`
- `fileHandle`
- `preview.sfItems` など

特徴:
- 横断依存が強い
- 特に command ごとに依存境界が大きく違う

---

## Melody
主に依存する境界:
- project data
- editor control
- session input
- cache
- refs
- playback session

具体:
- `data.scoreTracks / data.audioTracks`
- `control.melody.*`
- `input.*`
- `cache.*`
- `ref.grid / ref.pitch / ref.trackArr`
- `preview` の再生命令導線

特徴:
- editor control と data の両方への依存が強い
- preview 接続もある

---

## Playback
主に依存する境界:
- project data
- editor control
- playback session
- cache
- refs

具体:
- `data.scoreTracks / data.audioTracks / data.arrange`
- `control.outline / control.melody`
- `preview.*`
- `cache.baseCaches / chordCaches / elementCaches`
- `ref.trackArr`

特徴:
- `preview session` と `cache` に強く依存
- project data を読むが、保存対象そのものではない

---

## Timeline
主に依存する境界:
- cache
- refs
- editor control
- project data
- playback session

具体:
- `cache.*`
- `ref.header / ref.grid / ref.pitch`
- `control.outline / control.melody / mode`
- insertion 経由で melody / playback / outline 情報

特徴:
- 典型的な表示結節点
- viewport 読み取りと scroll 更新で refs 依存が強い

---

## Shell
主に依存する境界:
- editor control
- shell / terminal ui
- session input

具体:
- `control.mode`
- `terminal`
- `input / holdCallbacks`

特徴:
- data への直接依存は比較的小さい
- 各機能への routing が中心

---

## Project IO
主に依存する境界:
- project data
- file session
- cache
- refs

具体:
- save: `data`
- load: `data`, `fileHandle`, `cache`, `ref.trackArr`

特徴:
- save/load 対象が `data` 中心であることを明確に示している

---

## 現時点の結論

### project data 依存が最も強い機能
- outline
- melody
- project-io

### session / ui 依存が最も強い機能
- terminal
- shell
- playback

### cache / ref 依存が最も強い機能
- timeline
- playback
- outline

---

## 次の実体分割候補への示唆
- `data` は project data として独立性が高い
- `cache` は derived として独立性が高い
- `ref` は DOM ref として独立性が高い
- 一方 `control` は多機能横断なので、十分な仕様整理なしに切ると複雑化しやすい

このため、物理分割を考えるなら
1. `data`
2. `cache`
3. `ref`

の順が比較的安全と考えられる。
