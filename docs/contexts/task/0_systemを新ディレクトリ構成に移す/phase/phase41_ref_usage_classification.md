# Phase 41 Ref Usage Classification

## Binding-heavy areas
These are the parts most tightly coupled to `bind:this` and Svelte component structure.

- timeline viewport refs
  - `header`
  - `grid`
  - `pitch`
- outline list ref
  - `outline`
- terminal refs
  - `terminal`
  - `helper`
  - `cursor`
- arrange refs
  - `arrange.piano.*`
  - `arrange.finder.*`

## Helper-heavy areas
These are less about direct component binding and more about runtime support.

- `elementRefs`
- `trackArr`
- `timerKeys`

## Safer first extraction candidates
Among the helper-heavy areas, the safest early candidates are:

1. `timerKeys`
2. `trackArr`

Reason:
- both already behave more like runtime/session data than global layout refs
- both are manipulated through a smaller number of helper sites than viewport refs

## Riskier later candidates
- timeline viewport refs
- terminal refs
- outline ref
- arrange refs

Reason:
- these are directly bound in many Svelte components
- they are tightly linked to viewport and interaction behavior
