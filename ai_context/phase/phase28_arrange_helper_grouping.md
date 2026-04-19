# Phase 28 Arrange Helper Grouping

## Purpose
Record how the old `ArrangeUtil` bundle was decomposed.

## Grouping

### Arrange state accessors
Moved to `tauri_app/src/app/arrange/arrange-state.ts`.

Responsibilities:
- resolve active arrange session
- resolve current arrange track
- resolve piano editor state
- resolve piano finder state
- resolve current piano library

### Arrange factory logic
Also moved to `tauri_app/src/app/arrange/arrange-state.ts`.

Responsibilities:
- create piano finder data from
  - current time signature
  - current chord cache
  - current arrange track

### Arrange viewport behavior
Placed in `tauri_app/src/app/arrange/piano-editor-scroll.ts`.

Responsibilities:
- adjust piano editor column scroll from explicit refs and editor state

### Arrange-opening behavior
Kept in feature reducer caller.

Current location:
- `tauri_app/src/system/store/reducer/reducerOutline.ts`

Responsibilities:
- decide when finder should open
- collect track, cache, and time signature inputs
- call the explicit finder factory

## Judgement
This split is healthier than keeping a generic `ArrangeUtil.useReducer(...)` bundle because the responsibilities now align with
- state access
- factory logic
- viewport behavior
- feature action caller
