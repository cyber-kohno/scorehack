# Phase 52 計画

## 目的
`control` の次の下位面として `outline control` を主要対象にする。
`mode` は dedicated 化できたため、次は root store 内に残る `control.outline` の責務を整理し、物理分離または dedicated surface 化の準備を進める。

## 判断理由
- `outline control` は `focus / trackIndex / arrange open state` を持ち、`timeline` `outline` `arrange` `terminal` をまたいで使われている
- `reducerOutline.ts` の責務を薄くした今、次に触る価値が高い
- `melody control` より先に着手すると、arrange 依存も含めた横断状態の整理が進めやすい

## 対象候補
- `tauri_app/src/app/outline/outline-state.ts`
- `tauri_app/src/app/outline/outline-navigation.ts`
- `tauri_app/src/app/outline/outline-arrange.ts`
- `tauri_app/src/state/ui-state/outline-ui-store.ts`
- `tauri_app/src/state/ui-state/timeline-ui-store.ts`
- `tauri_app/src/system/store/reducer/reducerOutline.ts`
- `tauri_app/src/system/input/inputOutline.ts`
- `tauri_app/src/system/input/arrange/*`
- `tauri_app/src/system/store/reducer/terminal/sector/builderHarmonize.ts`

## ゴール
1. `outline control` の read / write 分布を整理する
2. `focus / trackIndex / arrange open state` の subgroup を明確にする
3. 最初に安全に dedicated 化できる下位面を決める
