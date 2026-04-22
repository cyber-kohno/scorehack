# Phase 18 Close Note

## Result
Phase 18 clarified the role of `useReducerCache(...)` inside `inputOutline.ts`.

The important finding was:
- this file was not using cache read helpers anymore
- it only needed recalculation through `calculate()`

So the useful cleanup was to make that dependency explicit instead of trying to remove it prematurely.

---

## Why this matters
After this phase, remaining `useReducerCache(...)` usage is no longer broadly spread across UI, preview, melody, timeline, and arrange reads.
It is mostly concentrated in:
- intentional recalculation callers
- terminal builder legacy paths

That is a strong signal that the next refactor can focus on terminal builders without getting mixed up with general UI/state cleanup.

---

## Recommended next phase
The next natural target is terminal builder cleanup, especially:
- `builderInit.ts`
- `builderModulate.ts`
- nearby command execution paths

A secondary option would be to explicitly document `calculate()` as a dedicated recalculation entry and stop thinking of it as part of the old helper surface.
