# Phase 15 ReducerCache Inventory

## Main file
- `tauri_app/src/system/store/reducer/reducerCache.ts`

## Responsibilities currently mixed in this file
1. Read project data and environment values
2. Recalculate cache arrays
3. Write recalculated cache back into store
4. Provide read helpers for callers

---

## Recalculation input
- `lastStore.data.elements`
- `lastStore.data.arrange.tracks`
- `lastStore.env.beatWidth`
- theory helpers from `domain/theory/music-theory`
- layout constants from `styles/tokens/layout-tokens`

---

## Recalculation output
- `baseCaches`
- `chordCaches`
- `elementCaches`
- `outlineTailPos`

These are written back as `StoreCache.Props`.

---

## Read helper surface exposed from `useReducerCache`
- `calculate`
- `getChordInfoFromElementSeq`
- `getBeatNoteTail`
- `getChordBlockRight`
- `getCurElement`
- `getCurBase`
- `getCurChord`
- `getBaseFromBeat`
- `getChordFromBeat`
- `getFocusInfo`

---

## Important observation
`reducerCache.ts` is not only a recalculation reducer.
It is also the legacy read entry for many callers.
That is why boundary cleanup should avoid aggressive splitting until callers are ready.
