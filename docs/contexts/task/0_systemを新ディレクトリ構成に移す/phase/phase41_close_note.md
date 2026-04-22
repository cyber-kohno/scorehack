# Phase 41 Close Note

## Summary
Phase 41 prepared the `ref` slice by breaking it into subgroups and selecting the first safe sub-surface.

## Decision
The first preparation target inside `ref` is `trackArr`.

## Why
`trackArr` has a better balance of:
- meaningful surface reduction
- limited binding complexity
- lower risk than viewport refs or terminal refs

## Meaning
The next phase should focus on:
- `trackArr` inventory
- dedicated helper surface
- redirecting the existing readers and writers

This is the preparation step that should happen before the larger physical `ref` split.
