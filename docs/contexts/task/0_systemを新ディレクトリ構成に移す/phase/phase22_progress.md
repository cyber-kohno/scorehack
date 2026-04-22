# Phase 22 Progress

## Current status
Phase 22 is complete.
The remaining legacy read-helper surface inside `useReducerCache(...)` was inventoried, and the last stale feature imports were removed.

Related documents:
- `ai_context/phase/phase22_plan.md`
- `ai_context/phase/phase21_close_note.md`

---

## Checklist
- [x] 1. Inventory remaining helper method callers
- [x] 2. Group helper methods by destination layer
- [x] 3. Migrate the safest remaining callers
- [x] 4. Verify build stability
- [x] 5. Record next-step judgement

---

## What was confirmed
- External feature files no longer import `useReducerCache(...)`.
- The only remaining `useReducerCache` symbol is the compatibility layer itself:
  - `tauri_app/src/system/store/reducer/reducerCache.ts`
- Legacy helper methods inside `reducerCache.ts` are no longer used by feature callers.
- Stale unused imports were removed from:
  - `tauri_app/src/app/project-io/load-project.ts`
  - `tauri_app/src/system/input/arrange/finder/inputFinder.ts`
  - `tauri_app/src/system/input/arrange/inputPianoEditor.ts`

---

## Verification
- `npm run check` passed
- `npm run build` passed
- `cargo check` passed

---

## Judgement
`reducerCache.ts` is now effectively a compatibility wrapper around the new cache recalculation implementation.
The next natural step is to reduce or remove the unused legacy helper surface inside that wrapper.
