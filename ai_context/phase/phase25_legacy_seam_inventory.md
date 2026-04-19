# Phase 25 Legacy Seam Inventory

## Summary
After finalizing cache recalculation, the most visible remaining legacy seams are now concentrated in a few areas.

---

## Main seam candidates

### 1. `ContextUtil`
Files:
- `tauri_app/src/system/store/contextUtil.ts`
- `tauri_app/src/app/bootstrap/initialize-app.ts`
- multiple arrange piano editor components
- `tauri_app/src/system/component/melody/score/Note.svelte`
- `tauri_app/src/system/component/timeline/header/MeasureFocus.svelte`

Characteristics:
- global mutable registry style
- small number of conceptual keys (`isPreview`, `arrange`, `pianoEditor`, `backingProps`)
- strongly concentrated in arrange piano editor legacy components
- cleanup value is high because it removes a hidden dependency mechanism

Risk:
- medium
- many Svelte components depend on it, but the dependency graph is localized

---

### 2. `useReducerRef(...)`
Files:
- `tauri_app/src/system/store/reducer/reducerRef.ts`
- input files
- terminal frame
- preview util
- melody reducer

Characteristics:
- imperative DOM/scroll adjustment boundary
- already partially surrounded by `state/session-state`
- still used as a legacy imperative helper bundle

Risk:
- medium to high
- touching scroll and ref behavior can cause subtle UI regressions

---

### 3. `ArrangeUtil.useReducer(...)`
Files:
- arrange input
- arrange UI components
- preview util
- reducerRef
- terminal piano editor builder

Characteristics:
- large helper bundle for arrange-specific behavior
- concentrated in piano arrange and finder flows
- likely valuable, but coupled to unfinished arrange features

Risk:
- high
- arrange is still one of the least stabilized areas

---

### 4. legacy `system/component/*` wrappers
Characteristics:
- many files remain under `src/system/component/*`
- but a large portion are already wrapped by newer `src/ui/*` entry components
- residual cleanup is broad rather than focused

Risk:
- broad but low-to-medium per file
- low leverage compared with the seams above

---

## Conclusion
The next best seam to finalize is `ContextUtil`.
It is more bounded than `useReducerRef(...)`, more mature than arrange reducer cleanup, and has better cleanup value than broad component relocation.
