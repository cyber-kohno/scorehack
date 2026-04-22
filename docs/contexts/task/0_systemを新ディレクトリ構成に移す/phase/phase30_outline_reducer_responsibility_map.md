# Phase 30 Outline Reducer Responsibility Map

## Target
- `tauri_app/src/system/store/reducer/reducerOutline.ts`

## Responsibility buckets

### Read accessors
Current state:
- partially extracted

Now handled by:
- `tauri_app/src/app/outline/outline-state.ts`

Covered helpers:
- `getCurrentOutlineElement`
- `getCurrentOutlineInitData`
- `getCurrentOutlineSectionData`
- `getCurrentOutlineChordData`
- `getCurrentOutlineTempoData`
- `getCurrentOutlineModulateData`

### Navigation and track selection
Current state:
- partially extracted

Now handled by:
- `tauri_app/src/app/outline/outline-navigation.ts`

Covered helpers:
- `moveOutlineFocus`
- `moveOutlineSectionFocus`
- `changeOutlineHarmonizeTrack`
- `getCurrentOutlineHarmonizeTrack`

### Mutation and relation maintenance
Still inside reducer:
- `insertElement`
- `removeFocusElement`
- `removeElementFromIndex`
- `renameSectionData`
- `setChordData`
- relation updates for arrange track chord references

### Arrange opening
Still inside reducer:
- `buildArrange`
- `openArrangeEditor`
- `openArrangeFinder`

### Cross-feature sync
Still inside reducer:
- `syncChordSeqFromNote`

## Judgement
The first safe extraction boundary is confirmed:
- read accessors
- navigation helpers

The next safe boundary is likely arrange opening, because it has a coherent input/output shape and already depends on explicit arrange helpers.
