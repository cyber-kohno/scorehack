# Phase 41 Plan

## Purpose
Phase 41 prepares the `ref` slice for a future physical split.

Related documents:
- `ai_context/phase/phase40_close_note.md`
- `ai_context/phase/phase27_close_note.md`

---

## Main target
- `tauri_app/src/system/store/props/storeRef.ts`
- direct `ref` readers and writers across:
  - `tauri_app/src/app/*`
  - `tauri_app/src/state/*`
  - `tauri_app/src/system/component/*`
  - `tauri_app/src/ui/*`

---

## Goals
1. inventory `ref` by subgroup
2. classify direct DOM bindings vs helper/runtime refs
3. identify the first safe sub-surface to extract
4. define the split strategy for the later physical `ref` split

---

## Checklist
- [ ] 1. Inventory `ref` subgroups
- [ ] 2. Classify binding-heavy vs helper-heavy usage
- [ ] 3. Select the first safe sub-surface
- [ ] 4. Define the later split strategy
