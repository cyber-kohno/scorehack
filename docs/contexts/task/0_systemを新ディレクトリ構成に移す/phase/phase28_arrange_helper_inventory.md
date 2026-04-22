# Phase 28 Arrange Helper Inventory

## Target
- `tauri_app/src/system/store/reducer/arrangeUtil.ts`
- arrange-related callers that previously depended on `ArrangeUtil.useReducer(...)`

## Former helper surface
- `getArrange`
- `getPianoEditor`
- `getPianoFinder`
- `getCurTrack`
- `getPianoLib`
- `createFinder`
- `createPianoFinder`

## Current destination after refactor
- arrange active state
  - `tauri_app/src/app/arrange/arrange-state.ts`
  - `getActiveArrange`
  - `getPianoArrangeEditor`
  - `getPianoArrangeFinder`
  - `getCurrentArrangeTrack`
  - `getCurrentPianoLibrary`
- arrange finder creation
  - `tauri_app/src/app/arrange/arrange-state.ts`
  - `createPianoArrangeFinder`
- piano editor scroll action
  - `tauri_app/src/app/arrange/piano-editor-scroll.ts`
- outline caller for finder open
  - `tauri_app/src/system/store/reducer/reducerOutline.ts`

## Result
- `ArrangeUtil.useReducer(...)` call sites are gone.
- `ArrangeUtil.createFinder(...)` call sites are gone.
- `tauri_app/src/system/store/reducer/arrangeUtil.ts` remains only as an orphaned legacy file.
