# Phase 31 Plan

## Purpose
Phase 31 focuses on the next reducer-outline cleanup step after the safe extraction of read and navigation helpers.

Related documents:
- `ai_context/phase/phase30_outline_reducer_responsibility_map.md`
- `ai_context/phase/phase30_close_note.md`

---

## Main target
- `tauri_app/src/system/store/reducer/reducerOutline.ts`

---

## Goals
1. separate arrange-opening helpers from the reducer core
2. clarify relation-maintenance logic for chord insert/delete flows
3. keep `createOutlineActions(...)` stable while shrinking internal responsibilities
4. improve readiness for later store splitting

---

## Checklist
- [ ] 1. Inventory arrange-opening and relation-maintenance helpers
- [ ] 2. Choose the next extraction boundary inside reducerOutline
- [ ] 3. Implement the extraction safely
- [ ] 4. Re-verify callers and behavior
