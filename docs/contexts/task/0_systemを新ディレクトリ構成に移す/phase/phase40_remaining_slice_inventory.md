# Phase 40 Remaining Slice Inventory

## Remaining root store slices
- `control`
- `data`
- `input`
- `holdCallbacks`
- `cache`
- `ref`

## High-level observations
- `control`
  - widely read and written
  - deeply tied to feature reducers and input routing
- `data`
  - central project data
  - already has project-data access layers, but still too central for the next immediate split
- `input`
  - session-like
  - still tightly coupled to keyboard routing and feature hold behavior
- `holdCallbacks`
  - small shape
  - but defined by active feature inputs, so it is coupled to `input`
- `cache`
  - already refactored significantly
  - still a cross-feature derived state hub
- `ref`
  - physically large in usage count
  - but semantically bounded to DOM / viewport / track refs

## Most important finding
The next split candidate is not the smallest slice. It is the slice with the best combination of:
- bounded responsibility
- limited write complexity
- realistic migration surface

Under that lens, `ref` remains the strongest next candidate, but only with preparation.
