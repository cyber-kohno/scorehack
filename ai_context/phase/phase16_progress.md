# Phase 16 Progress

## Current status
Phase 16 focused on reducing caller dependency on legacy `useReducerCache(...)` read helpers.

Related documents:
- `ai_context/phase/phase16_plan.md`
- `ai_context/phase/phase16_cache_helper_caller_inventory.md`
- `ai_context/phase/phase16_caller_grouping.md`

---

## Checklist
- [x] 1. Inventory current helper-read callers
- [x] 2. Group them by feature
- [x] 3. Add missing cache-state accessors if needed
- [x] 4. Migrate the safest caller group
- [x] 5. Verify and document next-step judgement

---

## What changed in code
### `src/state/cache-state/cache-store.ts`
- added generic helper reads:
  - `getBeatNoteTail(...)`
  - `getBaseCacheFromBeat(...)`
  - `getChordCacheFromBeat(...)`

### `src/state/ui-state/timeline-ui-store.ts`
- added timeline-facing helpers:
  - `getTimelineFocusInfo(...)`
  - `getTimelineTailMarginLeft(...)`

### Timeline caller migration
The following timeline components no longer rely on `useReducerCache(...)` for read helpers:
- `tauri_app/src/system/component/timeline/grid/GridFocus.svelte`
- `tauri_app/src/system/component/timeline/header/MeasureFocus.svelte`
- `tauri_app/src/system/component/timeline/TimelineFrame.svelte`
- `tauri_app/src/system/component/timeline/TimelineTailMargin.svelte`

### Additional caller migration
- `tauri_app/src/system/component/melody/score/Note.svelte`
- `tauri_app/src/system/input/inputMelody.ts`
- `tauri_app/src/system/util/preview/previewUtil.ts`

---

## Remaining `useReducerCache(...)` callers
Main remaining callers are now:
- recalculation entry callers using `calculate`
- arrange/input callers
- terminal builder callers
- `inputOutline.ts` (still using `calculate`)

This is a much smaller and clearer set than before Phase 16.

---

## Verification
Executed after the changes:
- `npm run check` : passed
- `npm run build` : passed
- `cargo check` : passed

Build warnings are unchanged existing warnings only.

---

## Judgement
Phase 16 is a good stopping point.
The remaining callers are no longer mixed between many UI/read paths and a few runtime/update paths.
That makes the next phase safer to target by responsibility.
