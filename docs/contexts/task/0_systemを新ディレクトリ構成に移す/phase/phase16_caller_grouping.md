# Phase 16 Caller Grouping

## Grouping by migration safety

### Group A: safest
Timeline UI read-only callers
- focus highlight
- tail margin
- piano helper display

### Group B: moderate
Read-only-ish component callers outside timeline
- melody note tonality display

### Group C: higher risk
Input callers
- melody input
- outline input
- arrange input

### Group D: highest risk
Runtime logic / preview / terminal helper callers
- preview runtime reads
- terminal builders
- recalculation callers using `calculate`

---

## Current strategy
1. migrate Group A first
2. verify behavior and build stability
3. then consider Group B or C depending on dependency shape
