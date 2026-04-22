# Phase 39 Progress

## Current status
Phase 39 has been initialized.
The focus is the fourth physical store split: `preview`.

Related documents:
- `ai_context/phase/phase39_plan.md`
- `ai_context/phase/phase38_close_note.md`

---

## Checklist
- [x] 1. Inventory `preview` usage
- [x] 2. Create the dedicated writable store surface
- [x] 3. Redirect safe readers
- [x] 4. Migrate writers carefully
- [x] 5. Remove `preview` from `StoreProps` and verify

---

## Result
- `preview` moved to `tauri_app/src/state/session-state/preview-store.ts`
- `StoreProps.preview` removed from `tauri_app/src/system/store/store.ts`
- direct `lastStore.preview` / `$store.preview` references in `tauri_app/src` are now `0`
- verification completed with:
  - `npm run check`
  - `npm run build`
  - `cargo check`
