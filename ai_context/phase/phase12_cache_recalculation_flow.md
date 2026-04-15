# Phase 12 Cache Recalculation Flow

## 目的
このドキュメントは、`data -> cache` の再計算が
どこで行われ、何を前提にしているかを整理するためのメモです。

---

## 再計算本体
- `tauri_app/src/system/store/reducer/reducerCache.ts`

中心関数:
- `calculate()`

この関数は、
- `lastStore.data.elements`
- `lastStore.data.arrange.tracks`
- `lastStore.env.beatWidth`
などを参照しながら
`lastStore.cache` を丸ごと再構築する

---

## 再計算の入力

### project data
- `elements`
- `arrange.tracks`

### env
- `beatWidth`

### domain / theory
- `MusicTheory`
- outline element 型

---

## 再計算の出力
- `baseCaches`
- `chordCaches`
- `elementCaches`
- `outlineTailPos`

最終的に
- `lastStore.cache = { ... }`
の形で差し替えられる

---

## 再計算を呼ぶ代表箇所

### 1. 起動時 / 初期化時
- 初期表示前に calculate が走る構造がある

### 2. load-project
- `tauri_app/src/app/project-io/load-project.ts`

### 3. 各 feature 操作後
- outline / melody / terminal command などの commit 後に再計算される前提がある

---

## 再計算フローの意味
- `cache` は保存されない
- `data` と表示環境から毎回導出される
- したがって `cache` は
  `project data の派生 state`
として見るのが妥当

---

## 現時点の注意点

### 1. 再計算契機の整理がまだ十分ではない
- どの操作が calculate を必須とするかは、まだコードを追わないと見えにくい

### 2. `env.beatWidth` 依存がある
- `cache` は純粋に project data だけで決まるわけではない
- 表示環境依存も含んでいる

### 3. arrange relation を読む
- `data` 側の複雑さが `cache` にも反映される

---

## 現時点の結論
- `cache` は `data` だけの派生ではなく、
  `data + env + theory`
  による派生 state
- この認識を前提に、
  次は `cache` 依存マップを整理すると全体像が見えやすい
