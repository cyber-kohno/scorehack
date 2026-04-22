# Phase 30 Risk And Value Comparison

## Comparison

### reducerOutline
Value:
- high
- directly improves safety for later store split
- central to outline, arrange entry, and chord relation handling

Risk:
- medium
- broad caller surface, but the responsibilities are already partly isolated by `createOutlineActions(...)`

### reducerMelody
Value:
- high
- central to melody editing and preview sync

Risk:
- medium-high
- more timeline and playback coupling remains

### reducerTerminal
Value:
- medium
- important product surface, but less directly tied to store splitting order

Risk:
- medium-high
- many command-specific branches and builder interactions

### legacy components
Value:
- medium
- improves local readability

Risk:
- low to medium
- but weaker leverage for future store separation

## Judgement
`reducerOutline.ts` is the best next target because it gives the strongest leverage for a later store split while staying within manageable risk.
