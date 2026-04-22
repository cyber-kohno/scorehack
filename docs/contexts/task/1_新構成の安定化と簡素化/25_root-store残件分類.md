# root-store 残件分類

## `StoreProps` が残る主な領域

### 1. token-only helper / selector
- root store 実体を持たず、dedicated state や cache helper に token を流すだけ
- 例:
  - `state/cache-state/*`
  - `app/viewport/scroll-actions.ts`
  - `app/timeline/get-timeline-focus-pos.ts`
  - 一部の `app/*-actions.ts`

### 2. reducer / scroll / state helper
- 実際の更新や計算の中心で、まだ互換 token を広く受けている
- 例:
  - `app/melody/melody-reducer.ts`
  - `app/outline/outline-reducer.ts`
  - `app/melody/melody-scroll.ts`
  - `app/outline/outline-scroll.ts`

### 3. project-io / bootstrap
- 初期化や save/load の境界
- 例:
  - `app/project-io/*`
  - `app/bootstrap/*`

### 4. playback / shell orchestration
- runtime side effect や commit を持つ
- `StoreProps` 単体より `StoreUtil` の意味が重要になりやすい

## `StoreUtil` が残る主な領域

### 1. commit を本当に持つ orchestrator
- `app/melody/melody-input.ts`
- `app/outline/outline-input.ts`
- `app/terminal/terminal-input.ts`
- `app/playback/playback-actions.ts`
- `app/playback/preview-util.ts`
- `app/shell/keyboard-router.ts`
- `app/arrange/*input.ts`

### 2. `createStoreUtil(...)` を内部生成している builder
- `app/terminal/sector/builderCommon.ts`
- `app/terminal/sector/builderHarmonize.ts`
- `app/terminal/sector/builderMelody.ts`

## 今回の判断
- `StoreProps` は token-only 領域から先に `RootStoreToken` へ寄せる
- `StoreUtil` はいきなり全面 rename せず、意味が最もはっきりしている orchestrator から `CommitContext` へ寄せる

## 今回先に触った `CommitContext` 対象
- `app/terminal/terminal-input.ts`
- `app/playback/playback-actions.ts`
- `app/bootstrap/initialize-app.ts`
- `app/playback/preview-util.ts`
- `app/shell/keyboard-router.ts`
- `app/arrange/arrange-input.ts`
- `app/arrange/piano-editor-input.ts`
- `app/arrange/guitar-editor-input.ts`
- `app/arrange/finder/finder-input.ts`

## 理由
- `commit` を持つ責務が名前に現れた方が読みやすい
- ただし `keyboard-router` や `melody-input` のような中心 orchestrator は、もう少し周辺分類が進んでから触る方が安全

## 補足
- `keyboard-router` は中心 orchestrator ではあるが、今回の変更は
  - 引数名 / 型名
  - 下位入力呼び出し
  の置換に留めており、責務分割までは踏み込んでいない
- `preview-util` も同様に、今回は `useUpdater()` の context 名整理に留めている
- `arrange input` 群も同様に、責務分割ではなく `commit を持つ文脈` の名前整理に留めている

## 2026-04-23 時点の更新
`StoreProps` は廃止済み。
以後は
- token-only 文脈: `RootStoreToken`
- commit を持つ文脈: `CommitContext`
で統一している。

## 2026-04-23 commit の整理メモ
`CommitContext.commit()` は、現状では update 最適化のための API ではなく、
分割済み state を安全に同期するための互換バリアとして扱う。

そのため、次の段階では
- いきなり commit を無くす
- いきなり selective update に変える
のではなく、まず feature ごとに「どの touch が本当に必要か」を整理していく。
