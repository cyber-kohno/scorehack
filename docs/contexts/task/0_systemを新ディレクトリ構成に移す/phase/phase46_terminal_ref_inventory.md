# Phase 46 terminal refs 参照棚卸し

## 主な binding 箇所
- `tauri_app/src/ui/terminal/TerminalFrame.svelte`
- `tauri_app/src/ui/terminal/HelperFrame.svelte`
- `tauri_app/src/ui/terminal/CommandCursor.svelte`
- `tauri_app/src/system/component/terminal/TerminalFrame.svelte`
- `tauri_app/src/system/component/terminal/HelperFrame.svelte`
- `tauri_app/src/system/component/terminal/CommandCursor.svelte`

## 主な reader / helper
- `tauri_app/src/app/terminal/terminal-scroll.ts`
- `tauri_app/src/state/session-state/terminal-session.ts`

## 判断
`terminal refs` は terminal feature の内部でまとまっており、`outline / elementRefs` より安全に切り出せる。
そのため、`ref` の次の dedicated 化対象として妥当だった。
