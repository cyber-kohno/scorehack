# Phase 30 Implementation Sequence

## Chosen target
- `tauri_app/src/system/store/reducer/reducerOutline.ts`

## Safe sequence
1. inventory `reducerOutline.ts` responsibilities and callers
2. separate pure-ish data accessor helpers from mutation helpers
3. separate focus/navigation helpers from arrange-opening helpers
4. move arrange-opening or relation-maintenance helpers to explicit feature modules where natural
5. keep `createOutlineActions(...)` as the stable caller boundary during the transition
6. re-evaluate store split readiness after the reducer boundary is cleaner

## Things to avoid
- do not change caller API widely in one step
- do not combine reducer cleanup with physical store splitting
- do not change cache recalculation flow at the same time
