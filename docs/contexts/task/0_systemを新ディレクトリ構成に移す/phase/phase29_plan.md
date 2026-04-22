# Phase 29 Plan

## Purpose
Phase 29 focuses on cleanup of orphaned compatibility files and a final audit of remaining legacy seams after the arrange seam extraction.

Related documents:
- `ai_context/phase/phase28_close_note.md`
- `ai_context/phase/phase25_legacy_seam_inventory.md`

---

## Main target
- orphaned compatibility files such as
  - `tauri_app/src/system/store/reducer/arrangeUtil.ts`
  - `tauri_app/src/app/arrange/arrange-reducer.ts`
- remaining legacy seam candidates that still deserve follow-up judgement

---

## Goals
1. confirm which compatibility files are fully orphaned
2. classify them as delete, inline, or keep-temporarily
3. record the remaining legacy seam landscape after major refactor phases
4. prepare a safe final cleanup sequence

---

## Checklist
- [ ] 1. Inventory orphaned compatibility files
- [ ] 2. Classify cleanup action for each file
- [ ] 3. Record remaining seam landscape
- [ ] 4. Prepare the next cleanup or stabilization phase
