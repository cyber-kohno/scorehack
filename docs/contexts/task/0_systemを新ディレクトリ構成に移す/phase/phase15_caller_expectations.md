# Phase 15 Caller Expectations

## Current caller pattern
Most existing callers still depend on `useReducerCache(lastStore)` and consume helper methods from it.
Examples include:
- initialize/load flow using `calculate`
- timeline components using `getCurChord`, `getCurBase`, `getFocusInfo`, `getChordBlockRight`
- melody/input logic using `getBeatNoteTail`, `getBaseFromBeat`
- preview logic using `getChordFromBeat`

---

## Current judgement
It is still too early to remove these helpers from `useReducerCache`.
They act as a compatibility surface while the cache read boundary is being clarified.

---

## Safe direction from here
The next safe move is:
1. keep `useReducerCache` as the compatibility entry
2. move or mirror helper logic into `src/state/cache-state/*` only when callers are ready
3. leave behavior unchanged while shrinking direct raw cache access
