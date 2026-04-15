# Phase 9 Project Data Inventory

## 目的
このドキュメントは、`data` 参照箇所を洗い出して、
どこで `project data` が読まれ、どこで更新されているかを把握するためのメモです。

---

## 前提
- `project data = data`
- save / load の対象も `data`
- ここでいう参照は、主に
  - `$store.data`
  - `lastStore.data`
  - `store.data`
  を指す

---

## 読み取り / 更新の大分類

### 1. project-io
- `tauri_app/src/app/project-io/project-io-service.ts`
- `tauri_app/src/app/project-io/load-project.ts`

役割:
- save 時に `lastStore.data` を serialize する
- load 時に `lastStore.data` を丸ごと差し替える

判断:
- ここは `project data` 境界そのもの
- 物理分割時にも最重要接点になる

---

### 2. ui-state selector
- `tauri_app/src/state/ui-state/melody-ui-store.ts`

役割:
- `scoreTracks` を UI 表示用に読む

判断:
- すでに `project data selector` 的な役割を持ち始めている
- Phase 9 ではこの方向を広げるのが自然

---

### 3. legacy component の直接参照
- `tauri_app/src/system/component/melody/score/ShadeNote.svelte`
- `tauri_app/src/system/component/melody/score/ShadeTracks.svelte`
- `tauri_app/src/system/component/outline/item/ChordSelector.svelte`

役割:
- Svelte component が `$store.data` を直接読む

判断:
- ここは selector 化の候補
- Phase 9 で真っ先に減らしやすい種類の依存

---

### 4. input
- `tauri_app/src/system/input/inputMelody.ts`
- `tauri_app/src/system/input/inputOutline.ts`

役割:
- project data を読みながら editor 操作を進める

判断:
- すぐに全面置換はしない
- ただし `app/melody`, `app/outline` 入口の内側で
  project data selector / updater を呼ぶ余地がある

---

### 5. reducer
- `tauri_app/src/system/store/reducer/reducerCache.ts`
- `tauri_app/src/system/store/reducer/reducerMelody.ts`
- `tauri_app/src/system/store/reducer/reducerOutline.ts`
- `tauri_app/src/system/store/reducer/reducerTerminal.ts`
- `tauri_app/src/system/store/reducer/arrangeUtil.ts`

役割:
- `elements`, `scoreTracks`, `audioTracks`, `arrange.tracks` を読む
- 一部は更新も行う

判断:
- project data の中核更新ロジック
- ここは Phase 9 では入口整理を優先し、本体置換は急がない

---

### 6. terminal builder
- `tauri_app/src/system/store/reducer/terminal/sector/builderCommon.ts`
- `tauri_app/src/system/store/reducer/terminal/sector/builderHarmonize.ts`
- `tauri_app/src/system/store/reducer/terminal/sector/builderMelody.ts`

役割:
- track 一覧や audio 一覧を project data から読む

判断:
- command 候補生成は selector 化しやすい
- builder 本体更新は Phase 9 後半以降でもよい

---

### 7. preview
- `tauri_app/src/system/util/preview/previewUtil.ts`

役割:
- `elements`, `scoreTracks`, `audioTracks`, `arrange` をまとめて読む

判断:
- playback の project data 入口候補
- ただし Phase 9 前半では `outline` / `melody` 優先のほうが安全

---

## 主な参照対象

### `elements`
使っている場所:
- outline input
- outline reducer
- cache reducer
- preview
- chord selector

意味:
- 曲構成の時間軸本体

---

### `scoreTracks`
使っている場所:
- melody input
- melody reducer
- terminal melody builder
- playback
- melody ui-state
- legacy melody component

意味:
- メロディ本体

---

### `audioTracks`
使っている場所:
- terminal melody builder
- playback

意味:
- オーディオ参照トラック

---

### `arrange.tracks`
使っている場所:
- arrange utility
- outline reducer
- cache reducer
- terminal harmonize builder
- playback

意味:
- arrange 系の persistent data

注意:
- arrange 系は editor 補助概念が混ざる可能性があり、境界整理は慎重に進める

---

## Phase 9 時点の判断

### selector 化を先に進めやすい場所
1. `state/ui-state/melody-ui-store.ts` の延長
2. `outline-ui-store.ts` から `elements` 系を読む方向
3. legacy component の直接 `$store.data` 参照
4. terminal builder の候補生成部分

### 後回しでもよい場所
1. reducer 本体の全面書き換え
2. playback の project data 入口整理
3. arrange 系の深い分解

---

## まとめ
- `data` 参照は feature 横断で広く分散している
- ただし分布を見ると、
  `selector 化しやすい読み取り`
  と
  `legacy reducer 内部の更新`
  を分けて扱える
- したがって、Phase 9 は
  `読み取り入口の整理を先行`
  する方針が妥当
