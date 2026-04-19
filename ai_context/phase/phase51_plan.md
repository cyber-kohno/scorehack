# Phase 51 計画

## 目的
残る root store slice のうち、次の主要対象を `control` に定める。
`control` は mode / outline / melody の UI 状態をまとめて持っており、現在も feature 横断で広く参照されているため、次の整理価値が最も高い。

## 判断理由
- `control` は参照件数が最も多い
- `data` は `project-data` 入口の整理がかなり進んでいる
- `cache` は再計算入口と read helper の整理が進んでおり、今は安定している
- `control` はまだ `reducerMelody` `reducerOutline` `previewUtil` `ui-state` に広く残っている

## 対象候補
- `tauri_app/src/system/store/props/storeControl.ts`
- `tauri_app/src/app/shell/root-control.ts`
- `tauri_app/src/app/outline/outline-navigation.ts`
- `tauri_app/src/state/ui-state/shell-ui-store.ts`
- `tauri_app/src/state/ui-state/melody-ui-store.ts`
- `tauri_app/src/state/ui-state/outline-ui-store.ts`
- `tauri_app/src/system/store/reducer/reducerMelody.ts`
- `tauri_app/src/system/store/reducer/reducerOutline.ts`

## ゴール
1. `control` の参照分布を feature ごとに整理する
2. `mode / outline / melody` の下位面を分けて扱えるようにする
3. `control` の dedicated 化または境界整理の実施順を決める
