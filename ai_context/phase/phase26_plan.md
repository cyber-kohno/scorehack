# Phase 26 Plan

## Purpose
Phase 26 focuses on replacing the remaining `ContextUtil` dependency flow with explicit state or app-level accessors.

Related documents:
- `ai_context/phase/phase25_close_note.md`
- `ai_context/phase/phase7_timeline_responsibilities.md`

---

## Main target
- `tauri_app/src/system/store/contextUtil.ts`
- arrange piano editor components using `ContextUtil`
- smaller `ContextUtil` usages such as preview indicator reads

---

## Goals
1. inventory current `ContextUtil` keys and usage groups
2. decide destination layers for each key
3. migrate the safest reads and writes
4. verify build stability
5. record the new boundary

---

## Checklist
- [ ] 1. Inventory current `ContextUtil` keys
- [ ] 2. Group usages by destination layer
- [ ] 3. Migrate the safest usages
- [ ] 4. Verify build stability
- [ ] 5. Record next-step judgement
