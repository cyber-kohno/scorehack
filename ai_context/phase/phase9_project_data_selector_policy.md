# Phase 9 Project Data Selector Policy

## 目的
このドキュメントは、`project data` の読み取り入口をどこに置くか、
そしてどういう単位で selector を切るかを決めるための方針メモです。

---

## 基本方針
- `project data` の読み取りは、可能な限り component や builder から直接 `data` を深掘りしない
- まず `selector` を作る
- selector は UI 専用整形と、project data 専用読み取りを混ぜすぎない

そのため、Phase 9 では次の 2 層で考える。

### 1. feature 向け project data selector
- `src/state/project-data/*`
- `data` の読み取り専用
- project data に何が入っているかを feature 単位で取り出す

### 2. UI 向け selector
- `src/state/ui-state/*`
- project data selector を必要に応じて利用する
- UI 表示向けの整形や派生条件をここで作る

---

## 配置方針

### 新しく想定する配置
- `src/state/project-data/project-data-store.ts`
- `src/state/project-data/outline-project-data.ts`
- `src/state/project-data/melody-project-data.ts`
- `src/state/project-data/audio-project-data.ts`
- `src/state/project-data/arrange-project-data.ts`

この層の役割:
- `lastStore.data` から feature 単位の塊を読む
- `elements`
- `scoreTracks`
- `audioTracks`
- `arrange`
などの入口を揃える

---

## selector の分け方

### outline 系
候補:
- 現在の outline elements
- 指定 index の element
- section 数
- track index と arrange track 対応

置き場:
- `src/state/project-data/outline-project-data.ts`

理由:
- `elements` は outline の中核 project data だから

---

### melody 系
候補:
- scoreTracks 一覧
- 指定 track の scoreTrack
- 現在 track の note 一覧
- active / shade 用の track 群

置き場:
- `src/state/project-data/melody-project-data.ts`

理由:
- `scoreTracks` の読み取りをまとめやすい
- すでに `melody-ui-store.ts` に一部似た責務があるため、受け皿を作りやすい

---

### audio 系
候補:
- audioTracks 一覧
- 名前一覧
- name から audio track を引く

置き場:
- `src/state/project-data/audio-project-data.ts`

理由:
- terminal builder や playback で使い回しやすい

---

### arrange 系
候補:
- arrange tracks 一覧
- 指定 index の arrange track
- track 名一覧

置き場:
- `src/state/project-data/arrange-project-data.ts`

理由:
- harmonize builder や outline reducer の入口整理に効く

注意:
- arrange 系は editor 補助概念との境界確認を続ける

---

## ui-state との役割分担

### `project-data` に置くもの
- 生の project data 読み取り
- feature 単位の基本 selector

例:
- `getOutlineElements()`
- `getScoreTracks()`
- `getAudioTracks()`
- `getArrangeTracks()`

### `ui-state` に置くもの
- project data selector を使った UI 向け整形
- mode / focus / cache / preview と組み合わせた表示条件

例:
- 現在表示すべき melody track
- cursor 表示条件
- outline header の文言
- timeline progress 表示

---

## Phase 9 での導入順

### 最初に導入する候補
1. `outline-project-data.ts`
2. `melody-project-data.ts`

理由:
- すでに `outline-ui-store.ts` と `melody-ui-store.ts` がある
- 読み取りの受け渡しを整理しやすい
- UI と reducer の両方から恩恵が出やすい

### 次の候補
3. `audio-project-data.ts`
4. `arrange-project-data.ts`

理由:
- terminal builder と playback で使い回しやすい

---

## ルール

### 1. component は `project-data` か `ui-state` を経由する
- 新規に `$store.data` を直接読まない

### 2. feature の生データ読み取りは `project-data` に集める
- `ui-state` に project data の生取得を散らしすぎない

### 3. UI 向けの表示整形は `ui-state`
- project data selector だけで UI 文脈まで背負わせない

### 4. reducer の内部書き換えは後回し
- まずは読み取り導線から整理する

---

## Phase 9 時点の結論
- `project data selector` は `src/state/project-data/*` を新設して受けるのが最も自然
- `ui-state` はその上に乗る表示 selector 層として維持する
- 最初の導入対象は `outline` と `melody`

この方針なら、
既存の `ui-state` 整理を壊さずに、
`project data` 専用境界を一段追加できる
