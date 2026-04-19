# Phase 38 Plan

## Purpose
Phase 38 focuses on the third physical store split by extracting `env` from `StoreProps`.

Related documents:
- `ai_context/phase/phase37_third_split_reassessment.md`
- `ai_context/phase/phase37_implementation_sequence.md`

---

## Main target
- `tauri_app/src/system/store/store.ts`
- env readers in `src/state/ui-state/*`, `src/app/*`, and UI components

---

## Goals
1. inventory remaining `env` usage
2. create a dedicated writable env store surface
3. redirect helper and component reads safely
4. remove `env` from `StoreProps` and verify

---

## Checklist
- [ ] 1. Inventory `env` usage
- [ ] 2. Create the dedicated writable store surface
- [ ] 3. Redirect callers safely
- [ ] 4. Remove `env` from `StoreProps` and verify
