# Phase 45 viewport 参照棚卸し

## 主な binding 箇所
- `tauri_app/src/ui/timeline/TimelineFrame.svelte`
- `tauri_app/src/system/component/timeline/TimelineFrame.svelte`
- `tauri_app/src/system/component/timeline/grid/GridRootFrame.svelte`
- `tauri_app/src/system/component/timeline/pitch/PitchListFrame.svelte`

## 主な reader
- `tauri_app/src/state/ui-state/timeline-ui-store.ts`
- `tauri_app/src/state/ui-state/melody-ui-store.ts`
- `tauri_app/src/app/melody/melody-scroll.ts`
- `tauri_app/src/app/outline/outline-scroll.ts`
- `tauri_app/src/system/component/timeline/TimelineTailMargin.svelte`
- `tauri_app/src/system/component/melody/score/ActiveTrack.svelte`
- `tauri_app/src/system/component/melody/score/ShadeTracks.svelte`

## 判断
`header` `grid` `pitch` は feature 単位でまとまっており、`outline` や `arrange` の ref より先に切り出す価値が高い。
