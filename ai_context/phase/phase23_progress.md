# Phase 23 Progress

## Current status
Phase 23 is complete.
The compatibility wrapper in `reducerCache.ts` has been reduced to the minimum safe surface.

Related documents:
- `ai_context/phase/phase23_plan.md`
- `ai_context/phase/phase22_close_note.md`

---

## Checklist
- [x] 1. Inventory current exported helper methods
- [x] 2. Confirm external usage
- [x] 3. Remove safest unused helpers
- [x] 4. Verify build stability
- [x] 5. Record next-step judgement

---

## What changed
- Confirmed the legacy helper methods in `reducerCache.ts` were no longer used externally.
- Reduced `tauri_app/src/system/store/reducer/reducerCache.ts` to a minimal wrapper that only exposes `calculate()`.
- Verified that `reducerCache` search results now point only to the wrapper file itself.

---

## Verification
- `npm run check` passed
- `npm run build` passed
- `cargo check` passed

---

## Judgement
`reducerCache.ts` is now a very small compatibility layer over the extracted cache recalculation implementation.
The next natural step is to decide whether the wrapper should remain for backward compatibility or whether callers can be moved to `createCacheActions(...)` / `recalculateCache(...)` directly.
