# Phase 27 Ref Helper Inventory

## Previous `useReducerRef(...)` capabilities
- `adjustGridScrollXFromOutline`
- `adjustOutlineScroll`
- `adjustGridScrollXFromNote`
- `adjustGridScrollYFromCursor`
- `adjustTerminalScroll`
- `adjustHelperScroll`
- `resetScoreTrackRef`
- `adjustPEBScrollCol`

---

## Grouping by destination

### Outline / timeline scroll
Destination:
- `src/app/outline/outline-scroll.ts`

Moved helpers:
- `adjustGridScrollXFromOutline`
- `adjustOutlineScroll`

### Melody / timeline scroll
Destination:
- `src/app/melody/melody-scroll.ts`

Moved helpers:
- `adjustGridScrollXFromNote`
- `adjustGridScrollYFromCursor`

### Terminal scroll
Destination:
- `src/app/terminal/terminal-scroll.ts`

Moved helpers:
- `adjustTerminalScroll`
- `adjustHelperScroll`

### Track ref session update
Destination:
- `src/state/session-state/track-ref-session.ts`

Moved helpers:
- `resetScoreTrackRef`

### Arrange piano editor scroll
Destination:
- `src/app/arrange/piano-editor-scroll.ts`

Moved helpers:
- `adjustPEBScrollCol`
