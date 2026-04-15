# Phase 20 Progress

## Current status
Phase 20 focused on formalizing cache recalculation as an explicit entry instead of a legacy reducer-bound caller pattern.

Related documents:
- `ai_context/phase/phase20_plan.md`
- `ai_context/phase/phase19_close_note.md`

---

## Checklist
- [x] 1. Inventory current recalculation callers
- [x] 2. Decide placement for explicit recalculation entry
- [x] 3. Create the new entry
- [x] 4. Migrate the safest callers
- [x] 5. Verify and record next-step judgement

---

## What changed in code
### New explicit entry
- `tauri_app/src/app/cache/cache-actions.ts`

This file introduces:
- `createCacheActions(lastStore)`
- `recalculate()`

At this stage it is still a thin compatibility wrapper around the existing cache recalculation logic.
That is intentional, because the goal here was to formalize the entry without changing behavior.

### Migrated callers
The following callers now use `createCacheActions(lastStore)` instead of calling `useReducerCache(lastStore)` directly:
- `tauri_app/src/app/bootstrap/initialize-app.ts`
- `tauri_app/src/app/project-io/load-project.ts`
- `tauri_app/src/system/input/arrange/finder/inputFinder.ts`
- `tauri_app/src/system/input/arrange/inputPianoEditor.ts`
- `tauri_app/src/system/input/inputOutline.ts`
- `tauri_app/src/system/store/reducer/terminal/sector/builderInit.ts`
- `tauri_app/src/system/store/reducer/terminal/sector/builderModulate.ts`
- `tauri_app/src/system/store/reducer/terminal/sector/builderSection.ts`

---

## Result
`useReducerCache(...)` no longer appears as a direct caller dependency across feature files.
The only remaining usage is inside:
- `tauri_app/src/app/cache/cache-actions.ts`

That means cache recalculation now has a much clearer application-facing entry point.

---

## Verification
Executed after the changes:
- `npm run check` : passed
- `npm run build` : passed
- `cargo check` : passed

Build warnings are unchanged existing warnings only.

---

## Judgement
Phase 20 is a strong architectural milestone.
The recalculation boundary is now explicit at the app layer, even though the internal implementation is still compatibility-based.
That gives us a clean platform for later extraction of the recalculation core itself.
