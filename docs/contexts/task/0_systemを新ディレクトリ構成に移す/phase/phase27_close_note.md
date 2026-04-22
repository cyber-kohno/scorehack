# Phase 27 Close Note

## Summary
Phase 27 finalized the `useReducerRef(...)` seam.

The previous helper bundle mixed timeline scroll, outline scroll, terminal scroll, track ref maintenance, and arrange-specific scroll behavior in one place.
That bundle has now been removed.

---

## New boundary
- shared viewport primitive:
  - `tauri_app/src/app/viewport/scroll-actions.ts`
- outline-specific scroll:
  - `tauri_app/src/app/outline/outline-scroll.ts`
- melody-specific scroll:
  - `tauri_app/src/app/melody/melody-scroll.ts`
- terminal-specific scroll:
  - `tauri_app/src/app/terminal/terminal-scroll.ts`
- arrange piano editor scroll:
  - `tauri_app/src/app/arrange/piano-editor-scroll.ts`
- track ref session update:
  - `tauri_app/src/state/session-state/track-ref-session.ts`

---

## Resulting meaning
Ref and scroll behavior is no longer modeled as a generic reducer helper.
It is now explicit application/session behavior organized by feature.

---

## Next-step judgement
A natural next target is `ArrangeUtil.useReducer(...)`, because arrange behavior is now one of the largest remaining legacy helper bundles crossing UI, input, preview, and terminal flows.
