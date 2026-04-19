# Phase 29 Cleanup Classification

## Classification rules
- delete: no imports, no runtime callers, no documentation need for compatibility
- keep temporarily: still imported or used as a migration seam
- inline later: low-value wrapper that still carries active callers

## Result

### Delete
- `tauri_app/src/system/store/reducer/arrangeUtil.ts`
- `tauri_app/src/app/arrange/arrange-reducer.ts`

### Keep temporarily
- `tauri_app/src/system/store/reducer/reducerOutline.ts`
- `tauri_app/src/system/store/reducer/reducerMelody.ts`
- `tauri_app/src/system/store/reducer/reducerTerminal.ts`

Reason:
These files are still active feature entry implementations, not orphaned compatibility files.

### Inline later or reconsider
None newly identified in this phase.
