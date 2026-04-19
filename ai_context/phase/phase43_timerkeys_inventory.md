# Phase 43 TimerKeys Inventory

## Main usage
- `tauri_app/src/app/viewport/scroll-actions.ts`

## Role
- runtime metadata for smooth scroll animation
- de-duplicating queued timers for the same target

## Migration result
- dedicated store created at `tauri_app/src/state/session-state/viewport-timer-store.ts`
- generic `ref.timerKeys` ownership removed
- caller surface remains localized in viewport helper code
