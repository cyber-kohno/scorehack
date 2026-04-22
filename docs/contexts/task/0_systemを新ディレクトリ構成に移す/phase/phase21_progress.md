# Phase 21 Progress

## Current status
Phase 21 focused on separating recalculation implementation from legacy `useReducerCache(...)` compatibility.

Related documents:
- `ai_context/phase/phase21_plan.md`
- `ai_context/phase/phase20_close_note.md`

---

## Checklist
- [x] 1. Inventory recalculation-only code inside `reducerCache.ts`
- [x] 2. Decide extraction target and placement
- [x] 3. Create extracted recalculation implementation
- [x] 4. Point `createCacheActions(...)` to the new implementation
- [x] 5. Verify and record next-step judgement

---

## What changed in code
### New extracted implementation
- `tauri_app/src/state/cache-state/recalculate-cache.ts`

This file now holds the actual cache recalculation implementation.

### Updated explicit entry
- `tauri_app/src/app/cache/cache-actions.ts`

`createCacheActions(lastStore).recalculate()` now calls:
- `recalculateCache(lastStore)`

directly.

### Updated compatibility layer
- `tauri_app/src/system/store/reducer/reducerCache.ts`

`useReducerCache(...)` still exists, but it is now a thin compatibility layer:
- `calculate()` delegates to `recalculateCache(lastStore)`
- legacy read helpers remain in place

---

## Result
Direct feature-level usage of `useReducerCache(...)` has been eliminated.
The search result is now effectively empty outside compatibility implementation.

That means:
- explicit app-level recalculation entry exists
- recalculation implementation is extracted
- legacy reducer compatibility remains only where it is actually useful

---

## Verification
Executed after the changes:
- `npm run check` : passed
- `npm run build` : passed
- `cargo check` : passed

Build warnings are unchanged existing warnings only.

---

## Judgement
Phase 21 is another strong architectural milestone.
The recalculation path is now split into:
- explicit app action entry
- extracted implementation
- legacy compatibility wrapper

This is a much healthier shape for future cleanup of the remaining read-helper compatibility surface.
