# Phase 48 arrange ref 参照棚卸し

## 主な binding 箇所
- `tauri_app/src/system/component/arrange/piano/backing/PEBColFrame.svelte`
- `tauri_app/src/system/component/arrange/piano/backing/table/PEBTableFrame.svelte`
- `tauri_app/src/system/component/arrange/piano/backing/PEBPedalFrame.svelte`
- `tauri_app/src/system/component/arrange/finder/ArrangeFinderFrame.svelte`
- `tauri_app/src/system/component/arrange/finder/list/piano/APFinderVoicsFrame.svelte`

## 主な reader / helper
- `tauri_app/src/app/arrange/piano-editor-scroll.ts`

## 判断
`arrange refs` は arrange feature の内部で閉じており、binding 箇所も限定されていた。
そのため dedicated store に寄せる価値が高く、実装リスクも管理しやすかった。
