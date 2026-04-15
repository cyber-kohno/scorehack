# Phase 19 Close Note

## Result
Phase 19 completed the cleanup of terminal builder callers that still depended on legacy `useReducerCache(...)` usage.

The key architectural change is not that `useReducerCache(...)` disappeared, but that its role is now much clearer:
- it is primarily an explicit recalculation entry
- it is no longer broadly used as a generic read-helper surface

---

## Why this matters
Earlier phases reduced UI, preview, melody, timeline, and arrange read-helper usage.
This phase finished the same cleanup for terminal builders.

As a result, the remaining `useReducerCache(...)` callers are now intentional recalculation callers.
That is a much better boundary than where the project started.

---

## Recommended next phase
The next natural target is to formalize recalculation as its own concept.
For example:
1. introduce a named recalculation entry under `app/cache` or `state/cache-state`
2. migrate current `calculate()` callers to that entry
3. treat `useReducerCache(...)` as legacy compatibility until it can disappear

That would turn the current implicit boundary into an explicit one.
