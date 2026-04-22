# Phase 40 Progress

## Current status
Phase 40 has been initialized.
The focus is deciding the next safe root store split after `preview`.

Related documents:
- `ai_context/phase/phase40_plan.md`
- `ai_context/phase/phase39_close_note.md`

---

## Checklist
- [x] 1. Reassess remaining root store slices
- [x] 2. Compare migration cost and risk
- [x] 3. Decide the next target
- [x] 4. Define the next implementation sequence

---

## Result
- reassessment completed for:
  - `ref`
  - `control`
  - `input`
  - `holdCallbacks`
  - `data`
  - `cache`
- next target selected: `ref`
- decision: add one preparation phase before the physical `ref` split
