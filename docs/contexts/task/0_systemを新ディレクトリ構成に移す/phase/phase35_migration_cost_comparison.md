# Phase 35 Migration Cost Comparison

## Comparison

### `terminal`
Value:
- strong proof that feature state can leave `StoreProps`
- relatively coherent state owner
- fewer cross-feature math dependencies than `env`

Risk:
- medium
- mostly concentrated in terminal reducer and terminal UI

### `env`
Value:
- small and simple state shape

Risk:
- medium-high
- many direct component reads make migration noisy and broad

### `preview`
Value:
- conceptually a good session slice

Risk:
- medium-high
- playback and input flows are still intertwined with it

### `ref`
Value:
- very high long-term payoff

Risk:
- very high
- too much direct DOM-binding surface remains

## Choice
Choose `terminal` as the second physical split target.

## Why
It balances
- bounded caller surface
- existing helper groundwork
- meaningful architectural progress
better than the alternatives.
