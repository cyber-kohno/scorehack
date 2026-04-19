# Phase 47 outline ref 参照棚卸し

## 主な binding 箇所
- `tauri_app/src/ui/outline/ElementList.svelte`
- `tauri_app/src/ui/outline/outline-elements/OutlineElement.svelte`
- `tauri_app/src/system/component/outline/ElementListFrame.svelte`
- `tauri_app/src/system/component/outline/element/Element.svelte`

## 主な reader / helper
- `tauri_app/src/state/cache-state/outline-cache.ts`
- `tauri_app/src/app/outline/outline-scroll.ts`

## 判断
`outline` と `elementRefs` は outline feature の内部でまとまっており、scroll / visible range と一緒に切り出すのが自然だった。
これにより `ref` のうち outline 面の依存を root store から外せる。
