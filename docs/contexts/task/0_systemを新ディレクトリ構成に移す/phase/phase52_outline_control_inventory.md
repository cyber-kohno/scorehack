# Phase 52 outline control 棚卸し

## 対象の見立て
`outline control` は大きく次の 3 つに分けて扱うのが自然だった。

1. `focus / focusLock`
2. `trackIndex`
3. `arrange open state`

## focus / focusLock
### 主な責務
- 現在の outline element 選択位置
- 範囲選択
- timeline / outline scroll の追従基準
- preview 中の現在 chord 追従

### 主な利用箇所
- `src/app/outline/outline-state.ts`
- `src/app/outline/outline-navigation.ts`
- `src/app/outline/outline-scroll.ts`
- `src/state/cache-state/outline-cache.ts`
- `src/state/cache-state/timeline-cache.ts`
- `src/state/ui-state/outline-ui-store.ts`
- `src/state/ui-state/timeline-ui-store.ts`
- `src/system/store/reducer/reducerOutline.ts`
- `src/system/input/inputOutline.ts`
- `src/system/util/preview/previewUtil.ts`
- `src/ui/outline/outline-elements/OutlineElement.svelte`
- `src/system/component/outline/element/Element.svelte`

### 判断
- arrange object に依存しない
- trackIndex より横断的だが shape が小さい
- 最初の dedicated 化対象として最も安全

## trackIndex
### 主な責務
- harmonize track の現在選択
- arrange track の編集対象切替
- terminal builder の対象 track 切替

### 主な利用箇所
- `src/app/outline/outline-navigation.ts`
- `src/app/outline/outline-arrange.ts`
- `src/app/arrange/arrange-state.ts`
- `src/system/store/reducer/terminal/sector/builderHarmonize.ts`
- `src/system/component/arrange/status/ArrangeStatusBar.svelte`

### 判断
- focus より利用箇所は少ない
- arrange / terminal をまたぐため、次の dedicated 化候補として有力

## arrange open state
### 主な責務
- arrange editor / finder の open 状態保持
- active arrange target の保持
- piano editor / finder subtree への橋渡し

### 主な利用箇所
- `src/app/outline/outline-arrange.ts`
- `src/app/arrange/arrange-state.ts`
- `src/state/ui-state/shell-ui-store.ts`
- `src/system/input/arrange/*`
- `src/system/component/arrange/*`

### 判断
- object shape が重い
- editor / finder runtime state を含む
- focus / trackIndex より先に切るのは危険

## 今回の結論
最初の dedicated 化対象は `focus / focusLock` が最適だった。
次は `trackIndex` を独立対象として見るのが自然で、`arrange open state` は最後に扱うのが安全。
