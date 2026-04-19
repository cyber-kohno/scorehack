# Phase 29 Orphaned Compatibility Inventory

## Purpose
Record compatibility files that were audited after the arrange seam extraction.

## Audited files

### Deleted as orphaned
- `tauri_app/src/system/store/reducer/arrangeUtil.ts`
  - reason: no remaining imports or runtime callers
  - replacement surface: `tauri_app/src/app/arrange/arrange-state.ts`
- `tauri_app/src/app/arrange/arrange-reducer.ts`
  - reason: no remaining imports or runtime callers
  - replacement surface: `tauri_app/src/app/arrange/arrange-state.ts`

## Notes
Both files became unnecessary after:
- explicit arrange state accessors were introduced
- explicit piano finder factory was introduced
- piano editor scroll helper stopped depending on a reducer wrapper
