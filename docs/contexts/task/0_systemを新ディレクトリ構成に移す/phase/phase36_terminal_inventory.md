# Phase 36 Terminal Inventory

## Remaining usage result
After extraction, active terminal state lives outside `StoreProps`.

### Dedicated state surface
- `tauri_app/src/state/session-state/terminal-store.ts`
  - `terminalStore`
  - `getTerminalStateStore`
  - `setTerminalState`
  - `clearTerminalState`
  - `touchTerminalState`

### Redirected modules
- `tauri_app/src/system/store/reducer/reducerTerminal.ts`
- `tauri_app/src/state/ui-state/terminal-ui-store.ts`
- `tauri_app/src/state/ui-state/shell-ui-store.ts`
- `tauri_app/src/app/terminal/terminal-scroll.ts`
- `tauri_app/src/system/store/store.ts`

## Search result note
Remaining `terminal` matches in the codebase are terminal feature names or terminal DOM refs, not `StoreProps.terminal` field access.
