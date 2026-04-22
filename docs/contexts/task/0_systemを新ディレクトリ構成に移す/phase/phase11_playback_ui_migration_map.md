# Phase 11 Playback / UI Migration Map

## 目的
このドキュメントは、Phase 11 で
`playback / UI 残件`
をどの入口へ寄せるかを整理するための移行マップです。

---

## playback

### 現行
- `previewUtil.ts` が `lastStore.data` を直接読む

### 移行先候補
- `src/state/project-data/outline-project-data.ts`
- `src/state/project-data/melody-project-data.ts`
- `src/state/project-data/audio-project-data.ts`
- `src/state/project-data/arrange-project-data.ts`
- 必要なら `src/app/playback/playback-actions.ts`

### 方針
- 再生フローは変えない
- project data の取得だけ新入口へ寄せる

---

## `ShadeTracks.svelte`

### 現行
- `$store.data.scoreTracks`

### 移行先候補
- `src/state/ui-state/melody-ui-store.ts`
- 既存の `getShadeMelodyTracks(lastStore)` を活用

### 方針
- component が直接 `scoreTracks` を読まず、
  selector を通して表示対象を受け取る

---

## `ShadeNote.svelte`

### 現行
- `$store.data.scoreTracks[trackIndex]`

### 移行先候補
- `src/state/project-data/melody-project-data.ts`
- 必要なら `src/state/ui-state/melody-ui-store.ts`

### 方針
- note 自体の取得は project-data selector
- 表示判定や整形は component もしくは ui-state

---

## `ChordSelector.svelte`

### 現行
- `$store.data.elements[outline.focus]`

### 移行先候補
- `src/state/project-data/outline-project-data.ts`
- `src/state/ui-state/outline-ui-store.ts`

### 方針
- current element の取得は selector 経由
- symbol 表示用の最低限の値だけ component へ渡す

---

## 実装順
1. `previewUtil.ts`
2. `ShadeTracks.svelte`
3. `ShadeNote.svelte`
4. `ChordSelector.svelte`

---

## 判断メモ
- playback は入口整理の効果が大きい
- UI 側は小さく直せるため、まとめて Phase 11 で片付けやすい
- この順なら、既存動作を大きく揺らさずに `data` 直参照を減らせる
