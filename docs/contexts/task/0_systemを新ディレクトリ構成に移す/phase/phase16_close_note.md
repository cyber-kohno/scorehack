# Phase 16 Close Note

## Result
Phase 16 reduced the spread of legacy `useReducerCache(...)` read-helper usage.

Most importantly, the timeline UI group was migrated away from reducer-bound read helpers and onto `cache-state` / `ui-state` accessors.
Additional low-risk caller cleanup also landed in melody display, melody input, and preview runtime.

---

## What changed conceptually
Before Phase 16:
- many read-only callers still depended on `useReducerCache(...)`

After Phase 16:
- read-only UI callers are much more selector/accessor based
- remaining `useReducerCache(...)` usage is concentrated in:
  - recalculation callers
  - arrange/input logic
  - terminal builder logic

---

## Why this is a useful stopping point
This phase separated the easy caller migrations from the higher-risk runtime/update paths.
That means the next phase can choose a focused target instead of mixing UI migration with command/input behavior.

---

## Recommended next phase
The next natural choices are:
1. arrange/input caller cleanup
2. terminal builder cleanup
3. explicit separation of `calculate` callers from read-helper callers

The safest next target is likely arrange/input caller cleanup.
