# Phase 16 Cache Helper Caller Inventory

## Current `useReducerCache(...)` caller groups

### Recalculation callers
These still intentionally use `calculate`:
- `tauri_app/src/app/bootstrap/initialize-app.ts`
- `tauri_app/src/app/project-io/load-project.ts`
- `tauri_app/src/system/store/reducer/terminal/sector/builderSection.ts`

### Timeline UI callers
These were the safest initial migration group:
- `tauri_app/src/system/component/timeline/grid/GridFocus.svelte`
- `tauri_app/src/system/component/timeline/header/MeasureFocus.svelte`
- `tauri_app/src/system/component/timeline/TimelineFrame.svelte`
- `tauri_app/src/system/component/timeline/TimelineTailMargin.svelte`

### Melody / input callers
- `tauri_app/src/system/component/melody/score/Note.svelte`
- `tauri_app/src/system/input/inputMelody.ts`
- `tauri_app/src/system/input/inputOutline.ts`

### Arrange / input callers
- `tauri_app/src/system/input/arrange/finder/inputFinder.ts`
- `tauri_app/src/system/input/arrange/inputPianoEditor.ts`

### Preview caller
- `tauri_app/src/system/util/preview/previewUtil.ts`

### Terminal callers
- `tauri_app/src/system/store/reducer/terminal/sector/builderInit.ts`
- `tauri_app/src/system/store/reducer/terminal/sector/builderModulate.ts`

---

## Judgement
The safest first migration group is timeline UI because:
- it is mostly read-only
- equivalent selector-style helpers already exist or are easy to add
- behavior risk is lower than input/reducer paths
