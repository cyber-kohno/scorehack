# Phase 34 FileHandle Inventory

## Remaining usage result
Search result after extraction:
- no remaining `fileHandle` references inside `tauri_app/src`

## Redirected callers
- `tauri_app/src/app/project-io/save-project.ts`
- `tauri_app/src/app/project-io/load-project.ts`

## New storage surface
- `tauri_app/src/state/session-state/project-file-store.ts`
  - `projectFileStore`
  - `getProjectFileState`
  - `getScoreFileHandle`
  - `setScoreFileHandle`
  - `clearProjectFileState`
