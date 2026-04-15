# Phase 17 Plan

## Purpose
Phase 17 focuses on remaining arrange/input callers that still depend on `useReducerCache(...)` read helpers.

Related documents:
- `ai_context/phase/phase16_close_note.md`
- `ai_context/phase/phase16_cache_helper_caller_inventory.md`

---

## Main target
Arrange and input callers such as:
- `tauri_app/src/system/input/arrange/finder/inputFinder.ts`
- `tauri_app/src/system/input/arrange/inputPianoEditor.ts`
- where useful, nearby input-side cache helper reads

---

## Goals
1. inspect remaining arrange/input cache helper reads
2. add missing accessors if needed
3. migrate the safest arrange/input paths
4. keep behavior unchanged and leave `calculate` callers alone for now

---

## Checklist
- [ ] 1. Inventory arrange/input cache helper reads
- [ ] 2. Add or reuse suitable cache-state accessors
- [ ] 3. Migrate target callers
- [ ] 4. Verify build stability
- [ ] 5. Record next-step judgement
