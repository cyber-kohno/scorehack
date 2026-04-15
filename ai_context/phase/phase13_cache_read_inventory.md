# Phase 13 Cache Read Inventory

## 目的
このドキュメントは、Phase 13 で整理対象にする
`cache` 読み取り箇所のうち、
まずどこから着手したかを記録するためのメモです。

---

## 今回着手した範囲

### outline
対象:
- `tauri_app/src/state/ui-state/outline-ui-store.ts`
- `tauri_app/src/system/component/outline/ElementCurrentInfo.svelte`
- `tauri_app/src/system/component/outline/ElementListFrame.svelte`

内容:
- `src/state/cache-state/cache-store.ts`
- `src/state/cache-state/outline-cache.ts`
を追加
- outline の `cache` 生読み取りを `cache-state` 経由へ寄せ始めた

### timeline / helper
対象:
- `tauri_app/src/state/ui-state/timeline-ui-store.ts`
- `tauri_app/src/app/timeline/get-timeline-focus-pos.ts`
- `tauri_app/src/system/component/timeline/header/BeatMeasureFrame.svelte`
- `tauri_app/src/system/component/timeline/grid/GridRootFrame.svelte`
- `tauri_app/src/App.svelte`
- `tauri_app/src/app/bootstrap/apply-layout-variables.ts`

内容:
- `src/state/cache-state/timeline-cache.ts` を追加
- timeline の `cache` 生読み取りを `cache-state` 経由へ寄せ始めた
- app/helper 側の軽い `cache` 直読みも整理した

---

## 追加した入口

### `cache-store.ts`
役割:
- `cache` 本体の低レベル入口

### `outline-cache.ts`
役割:
- current element cache
- current base cache
- visible outline element caches
- outline tail position
のような outline 向け cache accessor

---

## 現時点の判断
- `cache-state` を新設する方針は有効
- `ui-state` は `cache-state` の上に乗る形で整理できる
- `outline` は最初の対象として適切だった

---

## 次に広げる候補
1. outline legacy data component
2. playback の `cache` 読み取り
3. reducer / util 側の `cache` 読み取り
