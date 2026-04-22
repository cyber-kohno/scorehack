# Phase 33 Implementation Sequence

## Chosen first split target
- `fileHandle`

## Safe implementation sequence
1. inventory every remaining `lastStore.fileHandle` read and write
2. decide the new writable store surface for file-handle state
3. keep read/write helper APIs stable while changing the storage location underneath
4. update `project-io` callers first
5. verify no unrelated reducer or component depends on `StoreProps.fileHandle`
6. only then remove `fileHandle` from `StoreProps`

## Important constraints
- do not combine `fileHandle` extraction with `env` or `terminal` extraction
- do not change project save/load behavior in the same step
- keep `project-file-store.ts` as the conceptual source of truth

## Expected next phase output
- first physical split of one `StoreProps` field
- proven migration pattern for later slices
