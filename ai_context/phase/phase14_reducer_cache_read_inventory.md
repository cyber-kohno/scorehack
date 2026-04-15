# Phase 14 Reducer / Util Cache Read Inventory

## 目的
このドキュメントは、Phase 14 で扱う
`reducer / util` 側の `cache` 読み取り残件を整理するためのメモです。

---

## 今回の主要対象

### `previewUtil.ts`
役割:
- playback 実行時の `cache` 読み取り

主な依存:
- `baseCaches`
- `chordCaches`
- `elementCaches`
- tail chord

今回の整理:
- `src/state/cache-state/playback-cache.ts` を追加
- `previewUtil.ts` の主要読み取りを accessor 経由へ寄せ始めた

---

### `reducerRef.ts`
役割:
- outline / timeline / scroll の補助

主な依存:
- current outline element cache
- focus chord cache

今回の整理:
- `outline-cache.ts`
- `timeline-cache.ts`
の accessor を使うように変更した

---

## まだ残る主要候補
1. `reducerMelody.ts`
2. `reducerOutline.ts`
3. `reducerCache.ts`

---

## 現時点の判断
- `previewUtil.ts` と `reducerRef.ts` は、
  reducer / util 側の入り口として先に整理する価値が高かった
- 次は `reducerMelody.ts` と `reducerOutline.ts` を寄せると、
  `reducerCache.ts` 本体に入る準備がかなり整う
