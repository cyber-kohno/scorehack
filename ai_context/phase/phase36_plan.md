# Phase 36 Plan

## Purpose
Phase 36 focuses on the second physical store split by extracting `terminal` from `StoreProps`.

Related documents:
- `ai_context/phase/phase35_second_split_reassessment.md`
- `ai_context/phase/phase35_implementation_sequence.md`

---

## Main target
- `tauri_app/src/system/store/store.ts`
- `tauri_app/src/system/store/reducer/reducerTerminal.ts`
- `tauri_app/src/state/ui-state/terminal-ui-store.ts`
- `tauri_app/src/state/session-state/terminal-session.ts`
- terminal UI and helper callers

---

## Goals
1. inventory remaining `terminal` usage
2. create a dedicated writable terminal state surface
3. redirect selectors and reducer writes safely
4. remove `terminal` from `StoreProps` if verification is clean

---

## Checklist
- [ ] 1. Inventory `terminal` usage
- [ ] 2. Create the dedicated writable store surface
- [ ] 3. Redirect callers safely
- [ ] 4. Remove `terminal` from `StoreProps` and verify
