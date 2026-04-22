# Phase 37 Migration Cost Comparison

## Comparison

### `env`
Value:
- easy-to-understand state slice
- low mutation complexity
- good proof that layout-related read-heavy state can leave `StoreProps`

Risk:
- medium
- broad read surface, but mostly mechanical replacement

### `preview`
Value:
- strong architectural payoff for playback/session isolation

Risk:
- medium-high
- more behavioral risk because playback runtime state is richer than `env`

### `ref`
Value:
- high long-term payoff

Risk:
- very high
- too much direct DOM coupling remains

## Choice
Choose `env` as the third physical split target.

## Why
It gives the best safety profile now:
- simple state shape
- low write complexity
- manageable migration effort
without touching the most behavior-sensitive playback runtime state yet.
