# Phase 35 Implementation Sequence

## Chosen second split target
- `terminal`

## Safe implementation sequence
1. inventory remaining `lastStore.terminal` reads and writes
2. define the dedicated writable terminal state surface
3. redirect terminal selector helpers first
4. redirect reducer writes next
5. update legacy terminal components last if needed
6. remove `terminal` from `StoreProps` only after search and verification are clean

## Important constraints
- keep terminal command behavior unchanged
- do not combine terminal extraction with `preview` extraction
- do not refactor builder semantics at the same time

## Expected next phase output
- second physical store split
- clearer proof that active feature state can move out of the root store safely
