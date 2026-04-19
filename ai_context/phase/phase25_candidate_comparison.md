# Phase 25 Candidate Comparison

## Comparison table

| Candidate | Cleanup value | Risk | Locality | Recommended |
| --- | --- | --- | --- | --- |
| `ContextUtil` | High | Medium | High | Yes |
| `useReducerRef(...)` | High | Medium-High | Medium | Later |
| `ArrangeUtil.useReducer(...)` | Medium-High | High | Medium | Later |
| broad `system/component/*` cleanup | Medium | Medium | Low | Later |

---

## Why `ContextUtil` wins now
1. It removes a hidden global dependency mechanism.
2. Its usage is concentrated enough to refactor in a bounded phase.
3. It prepares the arrange piano editor subtree for more explicit state flow.
4. It also removes small legacy reads in non-arrange places such as preview indicators.

---

## Why not `useReducerRef(...)` yet
`useReducerRef(...)` is important, but it controls scroll and DOM adjustment behavior. That is more regression-prone and benefits from a cleaner component/state boundary first.

---

## Why not `ArrangeUtil.useReducer(...)` yet
Arrange-specific cleanup is attractive, but the arrange area still contains unfinished and highly coupled behavior. It is better to remove `ContextUtil` first so the arrange tree becomes easier to reason about.
