# Phase 40 Slice Comparison

## Candidate comparison

### `ref`
- value: high
- risk: high
- why:
  - many hidden DOM dependencies still flow through it
  - but the responsibility is still narrower than `control`, `data`, or `cache`

### `input`
- value: medium
- risk: high
- why:
  - logically session-like
  - but still coupled with `holdCallbacks` and active feature input routers

### `holdCallbacks`
- value: low-medium
- risk: medium-high
- why:
  - small surface
  - but not independent enough from `input` yet

### `control`
- value: very high
- risk: very high
- why:
  - central UI/editor state
  - too many active features still depend on it directly

### `data`
- value: very high
- risk: very high
- why:
  - project core
  - still better handled through boundary refinement first

### `cache`
- value: high
- risk: very high
- why:
  - already much cleaner than before
  - still a derived hub that crosses many features

## Decision
The next target should be `ref`, but not as an immediate physical split.
The safer move is:
1. prepare `ref` boundaries
2. reduce direct DOM binding dependency
3. then split `ref`
