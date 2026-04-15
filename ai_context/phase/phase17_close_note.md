# Phase 17 Close Note

## Result
Phase 17 reduced arrange/input dependency on legacy `useReducerCache(...)` read helpers.

The main outcome is that remaining `useReducerCache(...)` usage is now concentrated in more intentional places:
- explicit recalculation callers using `calculate`
- terminal builder logic
- `inputOutline.ts`

---

## Why this matters
Earlier phases removed broad UI and display usage.
This phase removed the low-risk arrange/input read-helper usage as well.
That means the next refactor can focus on more behavior-sensitive paths without a lot of unrelated UI noise.

---

## Recommended next phase
The next natural options are:
1. clean up `inputOutline.ts` and related update-side boundaries
2. clean up terminal builder callers
3. explicitly separate `calculate` callers from legacy helper callers

The safest next target is likely `inputOutline.ts` because it sits closer to feature behavior than terminal builders, but is still easier to reason about than command execution paths.
