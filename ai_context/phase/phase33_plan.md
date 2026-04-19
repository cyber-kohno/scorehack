# Phase 33 Plan

## Purpose
Phase 33 focuses on evaluating store-splitting readiness after the staged cleanup of `reducerOutline.ts`.

Related documents:
- `ai_context/phase/phase30_close_note.md`
- `ai_context/phase/phase31_close_note.md`
- `ai_context/phase/phase32_close_note.md`

---

## Main target
- readiness assessment for `tauri_app/src/system/store/store.ts`
- identify the safest first physical split candidate

---

## Goals
1. reassess `store.ts` after outline reducer cleanup
2. compare split candidates such as `fileHandle`, `env`, `terminal`, `preview`, and `ref`
3. choose the safest first physical split target
4. prepare an implementation sequence that preserves current caller stability

---

## Checklist
- [ ] 1. Reassess store readiness
- [ ] 2. Compare first split candidates
- [ ] 3. Choose the first split target
- [ ] 4. Record the implementation sequence
