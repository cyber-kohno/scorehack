# Phase 30 Candidate Inventory

## Main candidates considered
- `tauri_app/src/system/store/reducer/reducerOutline.ts`
- `tauri_app/src/system/store/reducer/reducerMelody.ts`
- `tauri_app/src/system/store/reducer/reducerTerminal.ts`
- selected legacy system components under `tauri_app/src/system/component/*`

## Why `reducerOutline.ts` is the strongest next target
- directly touches `control.outline`
- mutates project data through outline element insert/remove flows
- updates arrange-related relations when chord elements move or are deleted
- depends on cache-derived state for chord/base/element lookup
- is already consumed by many feature entry points through `createOutlineActions(...)`

## Current `reducerOutline.ts` responsibility buckets
1. current element and typed data access
2. focus movement and section navigation
3. outline element insertion and deletion
4. chord/arrange relation maintenance
5. arrange editor/finder opening
6. harmonize track selection
7. melody-to-outline sync

## Current main callers
- `tauri_app/src/app/outline/outline-actions.ts`
- `tauri_app/src/system/input/inputOutline.ts`
- `tauri_app/src/system/input/inputMelody.ts`
- `tauri_app/src/system/input/arrange/inputPianoEditor.ts`
- terminal builders under `tauri_app/src/system/store/reducer/terminal/sector/*`
- `tauri_app/src/system/component/arrange/ArrangeFrame.svelte`
