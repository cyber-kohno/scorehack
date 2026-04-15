# Phase 11 Playback / UI Inventory

## 目的
このドキュメントは、Phase 11 で扱う
`playback / UI 残件`
の対象を洗い出し、
どこに `data` 直参照が残っているかを把握するためのメモです。

---

## playback 側

### 対象ファイル
- `tauri_app/src/system/util/preview/previewUtil.ts`

### 直接参照している project data
- `lastStore.data.elements`
- `lastStore.data.scoreTracks`
- `lastStore.data.audioTracks`
- `lastStore.data.arrange`

### 役割
- preview 再生の開始/停止
- melody / audio / arrange の再生対象構築
- progress 更新
- outline focus 追従

### 判断
- playback の project data 入口がここに集中している
- `project-data` selector を使う受け皿にしやすい
- ただし再生フロー全体は触らず、
  読み取り入口だけを整理する方針が安全

---

## UI 側

### 1. `ShadeNote.svelte`
- `tauri_app/src/system/component/melody/score/ShadeNote.svelte`

直接参照:
- `$store.data.scoreTracks[trackIndex]`

役割:
- シェード表示対象 note の座標と表示判定

判断:
- `melody-project-data` と `melody-ui-store` の延長で整理しやすい

---

### 2. `ShadeTracks.svelte`
- `tauri_app/src/system/component/melody/score/ShadeTracks.svelte`

直接参照:
- `$store.data.scoreTracks`

役割:
- 表示対象 track 群の列挙

判断:
- すでに `melody-ui-store.ts` に近い責務がある
- selector 化しやすい

---

### 3. `ChordSelector.svelte`
- `tauri_app/src/system/component/outline/item/ChordSelector.svelte`

直接参照:
- `$store.data.elements[outline.focus]`

役割:
- 現在 chord の degree symbol を表示する

判断:
- `outline-project-data` か `outline-ui-store` 経由に寄せやすい

---

## 総括

### playback 側の特徴
- 1ファイルに project data 読み取りが集中
- 入口整理の効果が大きい

### UI 側の特徴
- 小さい component に散った直参照
- selector 化で比較的安全に減らせる

### Phase 11 の優先順
1. `previewUtil.ts`
2. `ShadeTracks.svelte`
3. `ShadeNote.svelte`
4. `ChordSelector.svelte`
