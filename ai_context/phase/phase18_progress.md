# Phase 18 Progress

## Current status
Phase 18 focused on `inputOutline.ts` and nearby update-side boundaries.

Related documents:
- `ai_context/phase/phase18_plan.md`
- `ai_context/phase/phase17_close_note.md`

---

## Checklist
- [x] 1. Inventory `inputOutline.ts` cache usage
- [x] 2. Split read-helper use from `calculate()` use
- [x] 3. Migrate any safe read paths
- [x] 4. Verify build stability
- [x] 5. Record next-step judgement

---

## Result
`inputOutline.ts` was confirmed to use `useReducerCache(...)` only for recalculation, not for cache read helpers.

That means the correct cleanup here was not removing the dependency entirely, but making its intent explicit.

### Code change
- [tauri_app/src/system/input/inputOutline.ts](tauri_app/src/system/input/inputOutline.ts)
  - changed from `const reducerCache = useReducerCache(lastStore)`
  - to `const { calculate } = useReducerCache(lastStore)`
  - replaced `reducerCache.calculate()` with `calculate()`

---

## Remaining `useReducerCache(...)` callers
The remaining callers are now concentrated in two categories:

### Explicit recalculation callers
- `tauri_app/src/app/bootstrap/initialize-app.ts`
- `tauri_app/src/app/project-io/load-project.ts`
- `tauri_app/src/system/input/arrange/finder/inputFinder.ts`
- `tauri_app/src/system/input/arrange/inputPianoEditor.ts`
- `tauri_app/src/system/input/inputOutline.ts`
- `tauri_app/src/system/store/reducer/terminal/sector/builderSection.ts`

### Terminal builder legacy callers
- `tauri_app/src/system/store/reducer/terminal/sector/builderInit.ts`
- `tauri_app/src/system/store/reducer/terminal/sector/builderModulate.ts`

This is much cleaner than earlier phases.

---

## Verification
Executed after the change:
- `npm run check` : passed
- `npm run build` : passed
- `cargo check` : passed

Build warnings are unchanged existing warnings only.

---

## Judgement
Phase 18 is a good stopping point.
The remaining legacy cache dependency is now mostly intentional and concentrated.
The next natural target is terminal builder cleanup.
