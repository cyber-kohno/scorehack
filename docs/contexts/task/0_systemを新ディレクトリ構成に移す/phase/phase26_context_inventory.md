# Phase 26 Context Inventory

## Current keys
The previous `ContextUtil` usage consisted of four conceptual values.

1. `isPreview`
2. `arrange`
3. `pianoEditor`
4. `backingProps`

---

## Usage grouping

### `isPreview`
Previous usage:
- `tauri_app/src/app/bootstrap/initialize-app.ts`
- `tauri_app/src/system/component/melody/score/Note.svelte`
- `tauri_app/src/system/component/timeline/header/MeasureFocus.svelte`

New destination:
- `src/state/ui-state/playback-ui-store.ts`

---

### `arrange`, `pianoEditor`, `backingProps`
Previous usage:
- `tauri_app/src/system/component/arrange/piano/ArrangePianoEditor.svelte`
- backing subtree components
- voicing chooser

New destination:
- feature-local helper
  - `tauri_app/src/ui/arrange/piano-editor-context.ts`

These values still use Svelte context, but no longer pass through a generic cross-feature registry.
