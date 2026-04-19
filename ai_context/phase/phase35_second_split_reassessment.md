# Phase 35 Second Split Reassessment

## Candidate overview after `fileHandle` extraction

### `env`
Characteristics:
- small data shape
- mostly `beatWidth`
- heavily referenced across legacy and new UI for layout math

Readiness:
- medium

Main concern:
- many direct `$store.env.beatWidth` usages remain in Svelte components
- physical split would require broad UI touch points even though the data shape is small

### `terminal`
Characteristics:
- cohesive feature state
- already has selector helpers in `src/state/ui-state/terminal-ui-store.ts`
- already has session helpers in `src/state/session-state/terminal-session.ts`
- active writes are concentrated in `src/system/store/reducer/reducerTerminal.ts`

Readiness:
- medium-high

Main concern:
- reducer and a few legacy terminal components still assume `lastStore.terminal`

### `preview`
Characteristics:
- session-like state for playback progress and handles
- helper module already exists in `src/state/session-state/playback-session.ts`
- read access is partially isolated in `src/state/ui-state/playback-ui-store.ts`

Readiness:
- medium

Main concern:
- playback logic and input code still reach directly into `lastStore.preview`
- wider coordination surface than `terminal`

### `ref`
Characteristics:
- huge DOM binding footprint
- broad usage across legacy and new components

Readiness:
- low

Main concern:
- physical split would require many `bind:this` and component-level changes

## Judgement
The safest second physical split target is `terminal`.
