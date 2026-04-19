# Phase 42 Plan

## Purpose
Phase 42 prepares the `ref` slice further by extracting the `trackArr` sub-surface from generic `ref` usage.

Related documents:
- `ai_context/phase/phase41_close_note.md`
- `ai_context/phase/phase27_close_note.md`

---

## Main target
- `tauri_app/src/system/store/props/storeRef.ts`
- `trackArr` readers and writers across:
  - `tauri_app/src/system/component/melody/score/*`
  - `tauri_app/src/system/util/preview/previewUtil.ts`
  - `tauri_app/src/app/project-io/load-project.ts`
  - `tauri_app/src/app/shell/root-control.ts`
  - `tauri_app/src/state/session-state/track-ref-session.ts`
  - terminal builder files that resize track arrays

---

## Goals
1. inventory all `trackArr` reads and writes
2. create a dedicated helper/session surface
3. redirect current users safely
4. reduce the remaining `ref` slice before the later full split

---

## Checklist
- [ ] 1. Inventory `trackArr` readers and writers
- [ ] 2. Create the dedicated helper/session surface
- [ ] 3. Redirect callers safely
- [ ] 4. Reassess remaining `ref` surface
