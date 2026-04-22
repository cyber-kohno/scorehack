# Phase 12 Cache Dependency Map

## 目的
このドキュメントは、どの機能がどの `cache` に依存しているかを
横断的に整理するためのメモです。

---

## 機能別依存

### 1. Outline
主な依存:
- `elementCaches`
- `baseCaches`
- `chordCaches`
- `outlineTailPos`

代表箇所:
- `state/ui-state/outline-ui-store.ts`
- `system/component/outline/*`
- `system/store/reducer/reducerOutline.ts`

意味:
- outline 表示
- 現在位置
- 現在 section / tonality / tempo 表示
- chord selector 表示
に使われる

---

### 2. Timeline
主な依存:
- `baseCaches`
- `chordCaches`
- `elementCaches`

代表箇所:
- `state/ui-state/timeline-ui-store.ts`
- `system/component/timeline/*`
- `app/timeline/get-timeline-focus-pos.ts`

意味:
- chord 表示
- progress 表示
- beat / measure 表示
- piano view 補助
に使われる

---

### 3. Playback
主な依存:
- `baseCaches`
- `chordCaches`
- `elementCaches`

代表箇所:
- `system/util/preview/previewUtil.ts`

意味:
- startTime / endTime 計算
- chord 開始位置
- outline focus 追従
- arrange preview 対象構築
に使われる

---

### 4. Melody
主な依存:
- `elementCaches`
- `chordCaches`

代表箇所:
- `system/store/reducer/reducerMelody.ts`

意味:
- cursor と chord の同期
- outline との接続
に使われる

---

### 5. Arrange
主な依存:
- `chordCaches`
- `baseCaches`

代表箇所:
- `system/store/reducer/arrangeUtil.ts`
- `system/store/reducer/reducerOutline.ts`

意味:
- finder 構築
- arrange target 計算
- relation 対象 chord の特定
に使われる

---

### 6. Terminal
主な依存:
- `data` 本体への依存が中心
- `cache` は比較的限定的

代表箇所:
- `system/store/reducer/reducerTerminal.ts`
- `system/store/reducer/terminal/sector/builderCommon.ts`

意味:
- 直接の `cache` 利用は少ないが、
  load 後の再計算フローには密接に関わる

---

## cache ごとの依存先

### `baseCaches`
使う機能:
- outline
- timeline
- playback
- arrange

### `chordCaches`
使う機能:
- outline
- timeline
- playback
- melody
- arrange

### `elementCaches`
使う機能:
- outline
- timeline
- playback
- melody

### `outlineTailPos`
使う機能:
- outline

---

## 現時点の総括
- `cache` は feature 横断の結節点
- とくに `chordCaches` は最も広く使われている
- したがって、
  `cache` に手を入れるなら
  まずは
  - selector 化
  - 再計算入口整理
  のどちらを先にするか慎重に判断する必要がある
