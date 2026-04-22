# Phase 34 Plan

## Purpose
Phase 34 focuses on the first physical store split by extracting `fileHandle` from `StoreProps`.

Related documents:
- `ai_context/phase/phase33_store_readiness.md`
- `ai_context/phase/phase33_implementation_sequence.md`

---

## Main target
- `tauri_app/src/system/store/store.ts`
- `tauri_app/src/state/session-state/project-file-store.ts`
- project IO callers under `tauri_app/src/app/project-io/*`

---

## Goals
1. inventory remaining `fileHandle` usage
2. move file-handle state to an explicit writable store
3. keep helper APIs stable while redirecting callers
4. remove `fileHandle` from `StoreProps` if verification is clean

---

## Checklist
- [ ] 1. Inventory `fileHandle` usage
- [ ] 2. Create or finalize the dedicated writable store surface
- [ ] 3. Redirect callers safely
- [ ] 4. Remove `fileHandle` from `StoreProps` and verify
