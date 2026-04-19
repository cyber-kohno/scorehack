# Phase 39 Plan

## Purpose
Phase 39 focuses on the fourth physical store split by extracting `preview` from `StoreProps`.

Related documents:
- `ai_context/phase/phase38_close_note.md`
- `ai_context/phase/phase36_close_note.md`
- `ai_context/phase/phase6_playback_responsibilities.md`

---

## Main target
- `tauri_app/src/system/store/store.ts`
- preview readers and writers in:
  - `tauri_app/src/state/ui-state/*`
  - `tauri_app/src/state/session-state/*`
  - `tauri_app/src/app/playback/*`
  - `tauri_app/src/system/util/preview/previewUtil.ts`

---

## Goals
1. inventory remaining `preview` usage
2. create a dedicated writable preview store surface
3. redirect safe readers first
4. migrate write paths
5. remove `preview` from `StoreProps` and verify

---

## Checklist
- [ ] 1. Inventory `preview` usage
- [ ] 2. Create the dedicated writable store surface
- [ ] 3. Redirect safe readers
- [ ] 4. Migrate writers carefully
- [ ] 5. Remove `preview` from `StoreProps` and verify
