# Phase 10 Data Reference Inventory

## 目的
このドキュメントは、Phase 9 後の時点で
`data` を直接参照している箇所を再洗い出しして、
本格分割前にどこが残件になっているかを把握するためのメモです。

---

## 前提
- ここでいう直接参照は主に
  - `$store.data`
  - `lastStore.data`
  - `store.data`
  を指す
- `src/state/project-data/project-data-store.ts` は意図的な境界として残しているため、
  「残件」ではなく「入口」として扱う

---

## 直接参照一覧

### 1. project-io
- `tauri_app/src/app/project-io/project-io-service.ts`
  - `JSON.stringify(lastStore.data)`

意味:
- save 対象そのもの

判断:
- これは残件というより正規の接点
- `project data` の入口として許容してよい

---

### 2. project-data 入口
- `tauri_app/src/state/project-data/project-data-store.ts`
  - `return lastStore.data`
  - `lastStore.data = nextData`

意味:
- `project data` 専用の低レベル入口

判断:
- これは意図した直接参照
- 分割前提の受け皿として維持してよい

---

### 3. legacy component
- `tauri_app/src/system/component/melody/score/ShadeNote.svelte`
- `tauri_app/src/system/component/melody/score/ShadeTracks.svelte`
- `tauri_app/src/system/component/outline/item/ChordSelector.svelte`

意味:
- Svelte component が `$store.data` を直接読む

判断:
- 優先的に selector 化しやすい残件
- UI 側の分割前整理としては良い候補

---

### 4. input
- `tauri_app/src/system/input/inputMelody.ts`
- `tauri_app/src/system/input/inputOutline.ts`

意味:
- keyboard 入力の中で project data を読む

判断:
- feature action / project data action に寄せる余地がある
- ただし挙動影響が大きいため慎重に扱う

---

### 5. reducer / utility
- `tauri_app/src/system/store/reducer/arrangeUtil.ts`
- `tauri_app/src/system/store/reducer/reducerCache.ts`
- `tauri_app/src/system/store/reducer/reducerTerminal.ts`
- `tauri_app/src/system/store/reducer/terminal/sector/builderCommon.ts`

意味:
- reducer 本体や utility の中で直接 data を読む

判断:
- 分割前に最も注意が必要な領域
- とくに `reducerCache.ts` は `data -> cache` の中核なので重要

---

### 6. playback
- `tauri_app/src/system/util/preview/previewUtil.ts`
  - `const { elements, scoreTracks, audioTracks } = lastStore.data`
  - `const arrange = lastStore.data.arrange`

意味:
- preview の project data 入口

判断:
- Phase 10 以降の重要残件
- `data` 分割へ入る前に見える化しておく必要がある

---

## 現時点の総括

### すでに整理済みの接点
- `outline-ui-store.ts`
- `melody-ui-store.ts`
- `reducerOutline.ts`
- `reducerMelody.ts`
- `builderMelody.ts`
- `builderHarmonize.ts`
- `load-project.ts`

### まだ残っている直参照の主領域
1. legacy component
2. input
3. reducer / cache
4. playback

---

## 判断メモ
- 直接参照の総量は、Phase 9 開始時よりかなり減っている
- ただし残っている場所は、
  `壊れやすい中心部`
  に寄ってきている
- そのため、ここから先は
  件数よりも「どこに残っているか」のほうが重要
