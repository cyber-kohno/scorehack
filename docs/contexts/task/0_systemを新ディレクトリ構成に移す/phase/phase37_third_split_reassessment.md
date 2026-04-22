# Phase 37 Third Split Reassessment

## Candidate overview after `terminal` extraction

### `env`
Characteristics:
- very small shape
- currently only `beatWidth`
- affects layout math and coordinate conversion

Readiness:
- medium-high

Main concern:
- many direct reads across UI and helper code

Mitigating factor:
- state shape is trivial
- writes are rare
- migration mainly means redirecting reads, not untangling complex mutation flows

### `preview`
Characteristics:
- session-like playback state
- helper groundwork already exists in `src/state/session-state/playback-session.ts`
- read selectors already exist in `src/state/ui-state/playback-ui-store.ts`

Readiness:
- medium

Main concern:
- state is operationally heavier than `env`
- timers, audio handles, progress, and playback coordination still live together
- extraction would affect playback and input behavior at the same time

### `ref`
Characteristics:
- broad DOM-binding surface
- still heavily used by both legacy and new UI

Readiness:
- low

Main concern:
- physical split would require too many component-level changes
- highest breakage risk among remaining candidates

## Judgement
The safest third physical split target is `env`.
