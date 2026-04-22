# Phase 29 Remaining Seam Landscape

## After cleanup
The previously large legacy seams have been reduced substantially.

## Already removed
- cache recalculation compatibility wrapper
- generic context registry
- generic ref helper bundle
- arrange helper bundle compatibility layer

## Still-active legacy-leaning surfaces
- `tauri_app/src/system/store/reducer/reducerOutline.ts`
- `tauri_app/src/system/store/reducer/reducerMelody.ts`
- `tauri_app/src/system/store/reducer/reducerTerminal.ts`
- some legacy system components under `tauri_app/src/system/component/*`

## Judgement
The remaining surfaces are not orphaned shims.
They are active feature implementations and should be treated as deliberate modernization targets rather than cleanup-only deletions.
