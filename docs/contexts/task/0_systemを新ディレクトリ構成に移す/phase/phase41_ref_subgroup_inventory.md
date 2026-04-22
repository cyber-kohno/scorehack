# Phase 41 Ref Subgroup Inventory

## Ref subgroups

### 1. Timeline viewport refs
- `grid`
- `header`
- `pitch`

Main usage:
- timeline scroll limit calculation
- melody / outline auto-scroll
- timeline frame binding

### 2. Outline refs
- `outline`
- `elementRefs`

Main usage:
- outline list scroll adjustment
- focused element positioning
- chord selector positioning support

### 3. Terminal refs
- `terminal`
- `helper`
- `cursor`

Main usage:
- terminal auto-scroll
- helper panel positioning
- cursor display and scrolling

### 4. Arrange refs
- `arrange.piano`
  - `col`
  - `table`
  - `pedal`
- `arrange.finder`
  - `frame`
  - `records`

Main usage:
- piano editor internal scrolling
- finder selection / DOM access

### 5. Track refs
- `trackArr`

Main usage:
- melody note highlight refs
- playback effect refs
- track lifecycle reset on load / mode switch

### 6. Scroll timer refs
- `timerKeys`

Main usage:
- delayed scroll animation control
- duplicate timer cleanup

## Initial takeaway
`ref` is not one uniform session slice.
It is a mixed collection of:
- direct DOM bindings
- runtime helper state
- feature-local indexed refs
- scroll animation metadata
