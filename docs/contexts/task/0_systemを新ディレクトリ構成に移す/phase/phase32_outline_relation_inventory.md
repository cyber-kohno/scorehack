# Phase 32 Outline Relation Inventory

## Target
- `tauri_app/src/system/store/reducer/reducerOutline.ts`

## Focused responsibility
Chord relation maintenance during outline insert and remove flows.

## Former reducer-owned logic
- shift arrange relation `chordSeq` after chord insertion
- validate removable multi-selection range
- remove arrange relation linked to a deleted chord
- decrement later relation `chordSeq` values after chord deletion
- cleanup unreferenced piano units after relation removal
- resolve chord sequence at outline element index during removal

## Extracted destination
- `tauri_app/src/app/outline/outline-relations.ts`

## New helper surface
- `shiftOutlineArrangeRelationsAfterChordInsert`
- `canRemoveOutlineRange`
- `removeOutlineArrangeRelationsForChord`
- `getOutlineChordSeqAtElementIndex`

## Notes
The reducer still owns the higher-level mutation flow, but the relation-maintenance details are now grouped in one explicit module.
