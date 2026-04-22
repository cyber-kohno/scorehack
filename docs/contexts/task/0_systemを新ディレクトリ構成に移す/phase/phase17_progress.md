# Phase 17 Progress

## Current status
Phase 17 focused on remaining arrange/input callers that still depended on `useReducerCache(...)` read helpers.

Related documents:
- `ai_context/phase/phase17_plan.md`
- `ai_context/phase/phase16_close_note.md`

---

## Checklist
- [x] 1. Inventory arrange/input cache helper reads
- [x] 2. Add or reuse suitable cache-state accessors
- [x] 3. Migrate target callers
- [x] 4. Verify build stability
- [x] 5. Record next-step judgement

---

## What changed in code
### `tauri_app/src/system/input/arrange/finder/inputFinder.ts`
- replaced `getCurElement()` usage with `getCurrentOutlineElementCache(...)`
- kept `calculate()` usage as-is

### `tauri_app/src/system/input/arrange/inputPianoEditor.ts`
- replaced `getCurChord()` usage with `getTimelineCurrentChordCache(...)`
- replaced `getCurBase()` usage with `getTimelineCurrentBaseCache(...)`
- kept `calculate()` usage as-is

---

## Resulting `useReducerCache(...)` callers
Remaining callers are now concentrated in:
- recalculation entry points using `calculate`
- `inputOutline.ts`
- terminal builder paths

This is a tighter and more understandable set than before Phase 17.

---

## Verification
Executed after the changes:
- `npm run check` : passed
- `npm run build` : passed
- `cargo check` : passed

Build warnings are unchanged existing warnings only.

---

## Judgement
Phase 17 is a good stopping point.
At this point, `arrange/input` read-helper dependency has been reduced without disturbing recalculation behavior.
The next natural target is either:
- `inputOutline.ts` and nearby input/update paths
- terminal builder callers
