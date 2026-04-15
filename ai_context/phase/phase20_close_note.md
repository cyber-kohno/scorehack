# Phase 20 Close Note

## Result
Phase 20 formalized cache recalculation as its own explicit app-level entry.

Instead of many feature files depending on:
- `useReducerCache(lastStore).calculate()`

they now depend on:
- `createCacheActions(lastStore).recalculate()`

---

## Why this matters
This is more than a naming cleanup.
It changes the architectural reading of the system:
- recalculation is now an application action
- `useReducerCache(...)` becomes an internal compatibility implementation detail

That is a much healthier boundary for future refactoring.

---

## Recommended next phase
The next natural target is to reduce the implementation dependency inside `createCacheActions(...)` itself.
For example:
1. move recalculation logic out of `useReducerCache(...)`
2. let `createCacheActions(...)` call a dedicated recalculation function directly
3. keep `useReducerCache(...)` only for legacy read helpers until those can be removed or relocated
