# Phase 37 Implementation Sequence

## Chosen third split target
- `env`

## Safe implementation sequence
1. inventory every remaining `lastStore.env` and `$store.env` usage
2. create a dedicated writable env store surface
3. redirect selector and helper reads first
4. update direct component reads next
5. keep env writes explicit and centralized
6. remove `env` from `StoreProps` only after search and verification are clean

## Important constraints
- do not combine `env` extraction with `preview` extraction
- do not refactor layout formulas at the same time
- keep `beatWidth` semantics unchanged

## Expected next phase output
- third physical store split
- a repeatable pattern for simple read-heavy slices
