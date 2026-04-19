# Phase 41 Progress

## Current status
Phase 41 has been initialized.
The focus is preparing `ref` for a future physical split.

Related documents:
- `ai_context/phase/phase41_plan.md`
- `ai_context/phase/phase40_close_note.md`

---

## Checklist
- [x] 1. Inventory `ref` subgroups
- [x] 2. Classify binding-heavy vs helper-heavy usage
- [x] 3. Select the first safe sub-surface
- [x] 4. Define the later split strategy

---

## Result
- `ref` grouped into:
  - timeline viewport refs
  - outline refs
  - terminal refs
  - arrange refs
  - track refs
  - scroll timer refs
- `trackArr` selected as the first safe sub-surface to prepare
- direct viewport / terminal / arrange DOM refs judged too binding-heavy for the first extraction
