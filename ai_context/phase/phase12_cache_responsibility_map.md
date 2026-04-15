# Phase 12 Cache Responsibility Map

## 目的
このドキュメントは、`cache` の各プロパティが何を表しているかを
責務ごとに整理するためのメモです。

---

## `cache` の構成

### `baseCaches`
役割:
- 調性 / 拍子 / テンポなどの score base 単位の区間情報
- 時間 / beat / bar の基準

主な中身:
- `scoreBase`
- `startBar`
- `startBeat`
- `lengthBeat`
- `startBeatNote`
- `lengthBeatNote`
- `startTime`
- `sustainTime`
- `viewPosLeft`
- `viewPosWidth`

使われ方:
- timeline header
- playback の time/beat 変換
- outline / arrange の target 計算

---

### `chordCaches`
役割:
- chord 要素単位の区間情報
- compiled chord と arrange relation の接続点

主な中身:
- `chordSeq`
- `elementSeq`
- `baseSeq`
- `beat`
- `compiledChord`
- `sectionStart`
- `modulate`
- `tempo`
- `arrs`

使われ方:
- timeline chord 表示
- outline focus 連動
- playback 再生対象計算
- arrange target 計算

---

### `elementCaches`
役割:
- outline element ごとの表示 / 関連付け情報

主な中身:
- `elementSeq`
- `chordSeq`
- `baseSeq`
- `lastChordSeq`
- `viewHeight`
- `outlineTop`
- `curSection`
- `modulate`
- `tempo`

使われ方:
- outline 一覧表示
- outline focus
- timeline focus の接続
- chord selector 位置計算

---

### `outlineTailPos`
役割:
- outline 全体の末尾位置

使われ方:
- outline frame の描画終端
- スクロール / レイアウト計算

---

## 責務の見方

### 1. 時間・拍・小節の基準
- `baseCaches`

### 2. chord 単位の設計イベント
- `chordCaches`

### 3. outline 表示と接続点
- `elementCaches`

### 4. outline レイアウト補助
- `outlineTailPos`

---

## 現時点の判断
- `cache` は単なる高速化用ではなく、
  表示・再生・入力の基準情報をまとめた派生 state
- とくに
  - `baseCaches`
  - `chordCaches`
  - `elementCaches`
は feature 横断の結節点
- そのため、物理分割より前に
  役割の見える化が重要
