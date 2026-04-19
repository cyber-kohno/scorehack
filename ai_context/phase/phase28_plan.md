# Phase 28 Plan

## Purpose
Phase 28 focuses on inventorying and reducing the `ArrangeUtil.useReducer(...)` legacy helper bundle.

Related documents:
- `ai_context/phase/phase27_close_note.md`
- `ai_context/phase/phase25_candidate_comparison.md`

---

## Main target
- `tauri_app/src/system/store/reducer/arrangeUtil.ts`
- callers in arrange UI, arrange input, preview, and terminal builder flows

---

## Goals
1. inventory current `ArrangeUtil.useReducer(...)` capabilities and callers
2. group helpers by arrange sub-feature
3. identify the safest extraction targets
4. record a cleanup plan and judgement

---

## Checklist
- [ ] 1. Inventory current arrange reducer usage
- [ ] 2. Group helpers by destination layer
- [ ] 3. Choose the first extraction target
- [ ] 4. Record the plan and judgement
