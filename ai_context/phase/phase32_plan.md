# Phase 32 Plan

## Purpose
Phase 32 focuses on relation-maintenance logic that still remains inside `reducerOutline.ts`.

Related documents:
- `ai_context/phase/phase30_outline_reducer_responsibility_map.md`
- `ai_context/phase/phase31_close_note.md`

---

## Main target
- chord relation maintenance during outline insert and remove flows
- related helper candidates inside `tauri_app/src/system/store/reducer/reducerOutline.ts`

---

## Goals
1. inventory relation-maintenance logic in insert/remove paths
2. choose a safe extraction boundary for relation updates
3. move relation updates to an explicit helper module if practical
4. keep action callers stable while shrinking reducer responsibilities

---

## Checklist
- [ ] 1. Inventory relation-maintenance logic
- [ ] 2. Choose extraction boundary
- [ ] 3. Implement extraction safely
- [ ] 4. Re-verify callers and behavior
