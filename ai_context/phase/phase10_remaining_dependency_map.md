# Phase 10 Remaining Dependency Map

## 目的
このドキュメントは、Phase 10 時点で残っている `data` 直参照を
feature / 層ごとに分類して、
次にどこへ手を入れると効果が高いかを判断するためのメモです。

---

## カテゴリ別整理

### A. UI 残件
対象:
- `tauri_app/src/system/component/melody/score/ShadeNote.svelte`
- `tauri_app/src/system/component/melody/score/ShadeTracks.svelte`
- `tauri_app/src/system/component/outline/item/ChordSelector.svelte`

特徴:
- 表示用途
- selector 化しやすい
- 比較的安全に触りやすい

優先度:
- 高

理由:
- 機能影響が比較的小さく、
  `project data selector` へ寄せる効果がわかりやすい

---

### B. Input 残件
対象:
- `tauri_app/src/system/input/inputMelody.ts`
- `tauri_app/src/system/input/inputOutline.ts`

特徴:
- キーボード操作の中核
- 読み取りと制御更新が密結合

優先度:
- 中

理由:
- 分けたいが、急ぐと操作感を壊しやすい

---

### C. Reducer / Cache 残件
対象:
- `tauri_app/src/system/store/reducer/arrangeUtil.ts`
- `tauri_app/src/system/store/reducer/reducerCache.ts`
- `tauri_app/src/system/store/reducer/reducerTerminal.ts`
- `tauri_app/src/system/store/reducer/terminal/sector/builderCommon.ts`

特徴:
- `data` の中心処理
- 参照量は少なく見えても影響範囲が大きい

優先度:
- 最重要

理由:
- `data` を物理分割するなら、ここが一番のリスク源になる
- 特に `reducerCache.ts` は `cache` 境界とも直結している

---

### D. Playback 残件
対象:
- `tauri_app/src/system/util/preview/previewUtil.ts`

特徴:
- project data をまとめて読む
- playback 実行の中心

優先度:
- 高

理由:
- `data` 分割時に入口が明確でないと壊れやすい
- ただし reducer / cache よりは局所化しやすい

---

### E. 正規接点
対象:
- `tauri_app/src/app/project-io/project-io-service.ts`
- `tauri_app/src/state/project-data/project-data-store.ts`

特徴:
- 意図的に `data` を触る境界

優先度:
- 低

理由:
- 残件ではなく、むしろ境界として維持すべき

---

## 次に触るならどこか

### 1. UI 残件
最初に触りやすい。

理由:
- selector 化の延長で進められる
- 既存の `project-data` / `ui-state` 方針に自然に乗る

### 2. Playback 残件
次に価値が高い。

理由:
- `previewUtil.ts` の project data 入口が明確になると、
  `data` 分割時の不安がかなり減る

### 3. Reducer / Cache 残件
最も重要だが、いきなり触るのは慎重にしたい。

理由:
- ここは次フェーズで計画的に扱うべき

---

## 現時点の結論
- 件数としては多くない
- ただし残件は core に集まっている
- 次フェーズ候補としては
  1. UI / playback 側の入口整理をもう少し進める
  2. その後で reducer / cache を主要対象にする
の順が安全
