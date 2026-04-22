# Phase 33 First Split Candidate Comparison

## Candidate comparison

### `fileHandle`
Value:
- establishes the first real store extraction pattern
- low caller count
- low coordination risk

Risk:
- low

### `env`
Value:
- useful for future layout and beat-width isolation

Risk:
- medium
- many UI and helper references still read `lastStore.env.beatWidth`

### `terminal`
Value:
- user-facing feature isolation
- already has selector/session helper groundwork

Risk:
- medium
- active reducer and builder code still depend on shared terminal shape

### `preview`
Value:
- strong conceptual fit with session state

Risk:
- medium-high
- playback and input flows still touch preview directly in several places

### `ref`
Value:
- high long-term payoff

Risk:
- high
- broad Svelte binding footprint

## Choice
Pick `fileHandle` first.

## Why
It offers the best ratio of
- safety
- clarity
- proof that physical store extraction is workable
without destabilizing active feature code.
