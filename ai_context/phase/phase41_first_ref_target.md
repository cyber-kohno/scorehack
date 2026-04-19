# Phase 41 First Ref Target

## Decision
The first safe sub-surface to prepare inside `ref` is:
- `trackArr`

## Why not `timerKeys` first
`timerKeys` is also small and promising, but:
- it is already localized in viewport helper code
- it does not reduce as much visible `ref` surface area on its own

`trackArr` is the better first target because it touches:
- melody note refs
- shade note refs
- playback effect refs
- project load reset
- mode switch reset
- terminal builder track lifecycle

So preparing `trackArr` first gives more leverage before the later full `ref` split.

## What should come next
1. inventory all `trackArr` reads and writes
2. create a dedicated helper surface for track refs
3. redirect readers/writers
4. then reassess whether `timerKeys` or viewport refs should follow
