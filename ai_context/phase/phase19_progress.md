# Phase 19 Progress

## Current status
Phase 19 focused on terminal builder cleanup for the remaining legacy `useReducerCache(...)` callers.

Related documents:
- `ai_context/phase/phase19_plan.md`
- `ai_context/phase/phase18_close_note.md`

---

## Checklist
- [x] 1. Inventory terminal builder cache usage
- [x] 2. Add/reuse suitable accessors if needed
- [x] 3. Migrate target builders
- [x] 4. Verify build stability
- [x] 5. Record next-step judgement

---

## Result
`builderInit.ts` and `builderModulate.ts` were confirmed to use `useReducerCache(...)` only for recalculation.

So the useful cleanup here was the same pattern as recent phases:
- make recalculation intent explicit
- avoid carrying a generic `reducerCache` object when only `calculate()` is needed

### Code change
- `tauri_app/src/system/store/reducer/terminal/sector/builderInit.ts`
- `tauri_app/src/system/store/reducer/terminal/sector/builderModulate.ts`

Changed from:
- `const reducerCache = useReducerCache(lastStore)`

To:
- `const { calculate } = useReducerCache(lastStore)`

And replaced `reducerCache.calculate()` with `calculate()`.

---

## Remaining `useReducerCache(...)` callers
At this point, the remaining callers are all explicit recalculation callers:
- `tauri_app/src/app/bootstrap/initialize-app.ts`
- `tauri_app/src/app/project-io/load-project.ts`
- `tauri_app/src/system/input/arrange/finder/inputFinder.ts`
- `tauri_app/src/system/input/arrange/inputPianoEditor.ts`
- `tauri_app/src/system/input/inputOutline.ts`
- `tauri_app/src/system/store/reducer/terminal/sector/builderInit.ts`
- `tauri_app/src/system/store/reducer/terminal/sector/builderModulate.ts`
- `tauri_app/src/system/store/reducer/terminal/sector/builderSection.ts`

This means legacy helper-style cache reading through `useReducerCache(...)` has effectively been cleaned up.

---

## Verification
Executed after the changes:
- `npm run check` : passed
- `npm run build` : passed
- `cargo check` : passed

Build warnings are unchanged existing warnings only.

---

## Judgement
Phase 19 is a strong stopping point.
`useReducerCache(...)` is now effectively acting as a recalculation entry surface rather than a mixed read-helper surface.
That is a meaningful architectural milestone.
