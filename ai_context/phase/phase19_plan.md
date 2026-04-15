# Phase 19 Plan

## Purpose
Phase 19 focuses on terminal builder cleanup for the remaining legacy `useReducerCache(...)` callers.

Related documents:
- `ai_context/phase/phase18_close_note.md`
- `ai_context/phase/phase4_terminal_responsibilities.md`

---

## Main target
- `tauri_app/src/system/store/reducer/terminal/sector/builderInit.ts`
- `tauri_app/src/system/store/reducer/terminal/sector/builderModulate.ts`
- nearby terminal builder cache/helper usage

---

## Goals
1. inspect remaining terminal builder cache helper usage
2. replace safe read-helper dependencies with newer accessors where possible
3. leave explicit recalculation usage intact unless a cleaner entry emerges
4. verify behavior stays unchanged

---

## Checklist
- [ ] 1. Inventory terminal builder cache usage
- [ ] 2. Add/reuse suitable accessors if needed
- [ ] 3. Migrate target builders
- [ ] 4. Verify build stability
- [ ] 5. Record next-step judgement
