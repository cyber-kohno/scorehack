# Phase 51 control 責務マップ

## 結論
`control` は次の 3 つの下位面に分けて扱うのが自然である。

1. `mode`
2. `outline control`
3. `melody control`

今回の Phase 51 では、このうち最も横断的で副作用が小さい `mode` を先に dedicated 化した。

## mode
### 主な責務
- ハーモニー / メロディのモード切替
- UI 側の表示分岐
- terminal target の分岐
- preview stop 時の melody cursor 復元条件

### 主な利用箇所
- `src/app/shell/root-control.ts`
- `src/state/ui-state/shell-ui-store.ts`
- `src/state/ui-state/melody-ui-store.ts`
- `src/state/ui-state/outline-ui-store.ts`
- `src/state/ui-state/timeline-ui-store.ts`
- `src/system/store/reducer/reducerTerminal.ts`
- `src/system/util/preview/previewUtil.ts`
- `src/system/component/melody/score/Note.svelte`
- `src/system/component/melody/score/ShadeTracks.svelte`
- `src/system/component/timeline/grid/GridRootFrame.svelte`

### 判断
- root store から先に外しても、`outline` / `melody` 本体の mutation に影響しにくい
- selector / component / util を横断するが、状態の shape 自体は単純
- `control` 分離の足場として最適

## outline control
### 主な責務
- outline focus
- trackIndex
- arrange open state
- focusLock などの selection/navigation 情報

### 主な利用箇所
- `src/app/outline/outline-navigation.ts`
- `src/app/outline/outline-arrange.ts`
- `src/app/outline/outline-state.ts`
- `src/state/ui-state/outline-ui-store.ts`
- `src/state/ui-state/timeline-ui-store.ts`
- `src/system/store/reducer/reducerOutline.ts`
- `src/system/input/inputOutline.ts`
- `src/system/input/arrange/*`
- `src/system/store/reducer/terminal/sector/builderHarmonize.ts`

### 判断
- root store から切り出す価値は高い
- ただし arrange open state が混ざるため、`mode` より難しい
- `reducerOutline.ts` のさらなる薄化と合わせて進めるのが安全

## melody control
### 主な責務
- cursor
- focus / focusLock
- trackIndex
- overlap

### 主な利用箇所
- `src/state/ui-state/melody-ui-store.ts`
- `src/system/store/reducer/reducerMelody.ts`
- `src/system/input/inputMelody.ts`
- `src/system/store/reducer/terminal/sector/builderMelody.ts`
- `src/system/component/melody/*`

### 判断
- feature 内のまとまりはよい
- ただし note editing と selection mutation が濃く、`reducerMelody.ts` に依存が集中している
- `outline control` より先に切る選択肢もあるが、今の順番では outline 側を先に見る方が全体依存をほどきやすい

## 次の推奨順
1. `outline control`
2. `melody control`
3. その後で `control` slice 自体の root store からの完全除去を再評価
