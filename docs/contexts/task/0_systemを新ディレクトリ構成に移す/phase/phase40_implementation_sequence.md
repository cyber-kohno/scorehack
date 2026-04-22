# Phase 40 Implementation Sequence

## Decision
Phase 40 does not split another root store slice directly.
Instead, it selects `ref` as the next target and recommends a preparation phase first.

## Next safe sequence
1. inventory `ref` by subgroup
   - outline refs
   - timeline refs
   - terminal refs
   - arrange refs
   - track refs
   - timer keys
2. distinguish:
   - DOM binding refs
   - runtime scroll helpers
   - transient arrays such as `trackArr`
3. move easy session helpers first
4. identify which `bind:this={$store.ref...}` sites must become feature-local helpers
5. only after that, attempt the physical `ref` split

## Why this order
The current `ref` slice is not only a store field.
It is also the handshake point between:
- Svelte component binding
- viewport scrolling
- playback note highlighting
- terminal cursor / helper behavior

Splitting it without preparation would be riskier than the previous four physical splits.
