# Phase 53 計画

## 目的
`outline control` の次の下位面として `trackIndex` を主要対象にする。
`focus / focusLock` は dedicated 化できたため、次は harmonize track の選択状態を root control から外す準備を進める。

## 判断理由
- `trackIndex` は shape が小さい
- arrange target selection と terminal builder にまたがるが、`arrange open state` ほど重くない
- `outline control` をさらに薄くするうえで、次に最も安全な対象

## 対象候補
- `tauri_app/src/app/outline/outline-navigation.ts`
- `tauri_app/src/app/outline/outline-arrange.ts`
- `tauri_app/src/app/arrange/arrange-state.ts`
- `tauri_app/src/system/store/reducer/terminal/sector/builderHarmonize.ts`
- `tauri_app/src/system/component/arrange/status/ArrangeStatusBar.svelte`
- `tauri_app/src/system/input/arrange/*`

## ゴール
1. `trackIndex` の read / write inventory を作る
2. terminal / arrange / outline の接点を整理する
3. dedicated 化の安全性を判断する
