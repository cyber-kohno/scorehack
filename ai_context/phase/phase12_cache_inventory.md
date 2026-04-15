# Phase 12 Cache Inventory

## 目的
このドキュメントは、Phase 12 で扱う `cache` 関連ファイルと
主要な参照箇所を洗い出すためのメモです。

---

## 中心ファイル

### 1. `storeCache.ts`
- `tauri_app/src/system/store/props/storeCache.ts`

役割:
- `cache` の型定義
- `INITIAL`
- `BaseCache`
- `ChordCache`
- `ElementCache`

判断:
- `cache` 境界の定義書

---

### 2. `reducerCache.ts`
- `tauri_app/src/system/store/reducer/reducerCache.ts`

役割:
- `data` から `cache` を再計算する本体
- `baseCaches`, `chordCaches`, `elementCaches`, `outlineTailPos` を構築する
- `cache` から情報を読む helper も持つ

判断:
- `cache` 境界の中核
- Phase 12 の最重要ファイル

---

## `cache` を読む主要箇所

### app
- `tauri_app/src/App.svelte`
- `tauri_app/src/app/bootstrap/apply-layout-variables.ts`
- `tauri_app/src/app/timeline/get-timeline-focus-pos.ts`

意味:
- 起動待機判定
- CSS 変数計算
- timeline focus 位置計算

---

### ui-state
- `tauri_app/src/state/ui-state/outline-ui-store.ts`
- `tauri_app/src/state/ui-state/timeline-ui-store.ts`

意味:
- outline 表示
- timeline 表示
の selector が `cache` に強く依存している

---

### legacy component
- `tauri_app/src/system/component/outline/*`
- `tauri_app/src/system/component/timeline/*`

代表:
- `ElementCurrentInfo.svelte`
- `ElementListFrame.svelte`
- `DataChord.svelte`
- `DataModulate.svelte`
- `GridRootFrame.svelte`
- `BeatMeasureFrame.svelte`

意味:
- まだ component 直参照もかなり残っている

---

### reducer / util
- `tauri_app/src/system/store/reducer/reducerMelody.ts`
- `tauri_app/src/system/store/reducer/reducerOutline.ts`
- `tauri_app/src/system/store/reducer/reducerRef.ts`
- `tauri_app/src/system/util/preview/previewUtil.ts`

意味:
- feature ロジックが `cache` を読む

---

## inventory の総括
- `cache` の定義と再計算は `storeCache.ts` / `reducerCache.ts` に集中
- 読み取りは
  - ui-state
  - legacy component
  - reducer / util
  - app
  に広がっている
- したがって Phase 12 では、
  まず `cache` の責務を分解してから、
  どこを selector 化するかを判断するのが妥当
