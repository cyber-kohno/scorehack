# Phase 31 Outline Arrange Inventory

## Target
- `tauri_app/src/system/store/reducer/reducerOutline.ts`

## Focused responsibility
Arrange-opening behavior.

## Former reducer-owned helpers
- `getCurrArrangeTrack`
- `buildArrange`
- `openArrangeEditor`
- `openArrangeFinder`

## Extracted destination
- `tauri_app/src/app/outline/outline-arrange.ts`

## New helper surface
- `getCurrentOutlineArrangeTrack`
- `buildOutlineArrange`
- `openOutlineArrangeEditor`
- `openOutlineArrangeFinder`

## Notes
The reducer still exposes
- `getCurrArrangeTrack`
- `openArrangeEditor`
- `openArrangeFinder`
for caller stability, but those now delegate to the outline arrange helper module.
