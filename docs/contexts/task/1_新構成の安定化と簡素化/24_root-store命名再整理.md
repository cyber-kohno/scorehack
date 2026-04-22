# root-store 命名再整理

## 背景
- `src/state/root-store.ts` の `StoreProps` は、現在 `Record<string, never>` の空オブジェクト
- それでも API 上は `lastStore: StoreProps` が広く残っており、実体 state を渡しているように見える
- 実際には dedicated store 群へ到達するための互換トークンでしかない場所も多い

## 用途の分類

### 1. 互換トークン
- 実体 state ではなく、互換のために空の token を受け取っているだけ
- 典型例:
  - `state/project-data/*`
  - `app/cache/cache-actions.ts`
  - 一部の `ui-state/*`

### 2. commit オーケストレーション
- `commit()` を呼ぶ責務が本体
- `lastStore` より `commit` の方が意味的に重要
- 典型例:
  - `app/melody/melody-input.ts`
  - `app/outline/outline-input.ts`
  - `app/terminal/terminal-input.ts`
  - `app/playback/playback-actions.ts`
  - `app/playback/preview-util.ts`

### 3. 互換名残
- 昔の root store 由来の命名だけが残っていて、意味があいまい
- 典型例:
  - `_lastStore`
  - `StoreProps` を受けるだけの selector / helper

## 今回の方針
- いきなり全面 rename はしない
- まずは「互換トークン」として意味が明確な場所から、小さく新しい名前に寄せる
- `StoreProps` 自体は当面残すが、別名として
  - `RootStoreToken`
  - `CommitContext`
  を追加し、役割が読める API を増やす

## 最初の適用対象
- `state/project-data/*`
- `app/cache/cache-actions.ts`

## 続く適用対象
- `state/ui-state/shell-ui-store.ts`
- `app/arrange/arrange-state.ts`

### 理由
- どちらも dedicated state を読むだけで、root store 本体を持っていない
- orchestration より selector / helper の性格が強く、`RootStoreToken` へ寄せやすい

## さらに広げた対象
- `state/ui-state/timeline-ui-store.ts`
- `state/ui-state/outline-ui-store.ts`

### 理由
- cache / project-data helper に token を流しているが、root store の実体は読んでいない
- UI selector としての役割が中心なので、命名を先に良くする価値が高い

## façade にも広げた対象
- `app/bootstrap/apply-layout-variables.ts`
- `app/melody/melody-actions.ts`
- `app/outline/outline-actions.ts`
- `app/terminal/terminal-actions.ts`
- `app/project-data/project-data-actions.ts`

### 理由
- これらは orchestration 本体ではなく、token を下位へ流す薄い入口
- `StoreProps` より `RootStoreToken` の方が責務を正しく表せる
- この層を先に整えると、次に残る `StoreProps` は reducer / scroll / cache / project-io など、意味のある場所へ寄って見やすくなる

## cache / scroll helper に広げた対象
- `state/cache-state/cache-store.ts`
- `app/timeline/get-timeline-focus-pos.ts`
- `app/viewport/scroll-actions.ts`
- `app/arrange/piano-editor-scroll.ts`

### 理由
- いずれも root store 実体を持たず、cache や ref/session state に token を流している
- 特に scroll helper は「空 token を受けるだけ」の代表例なので、先に名前を良くしておく価値が高い

## project-io に広げた対象
- `app/project-io/project-io-service.ts`
- `app/project-io/load-project.ts`
- `app/project-io/save-project.ts`

### 理由
- save/load の入口ではあるが、root store 実体を直接扱っているわけではない
- `createCacheActions()` や `createProjectDataActions()` に token を流している側なので、`RootStoreToken` の方が役割を表しやすい

## さらに整理した小さな token-only 残件
- `state/ui-state/terminal-ui-store.ts`
- `app/melody/melody-audition.ts`
- `app/melody/melody-cursor-state.ts`
- `app/shell/root-control.ts`

### 理由
- `void lastStore` が残っていたり、dedicated state / selector に token を流すだけの小さな helper が中心
- この層を片付けると、残る `StoreProps` は本当に reducer / cache / playback / shell orchestrator 側へ寄ってくる

## 判断
- この領域は `lastStore` を読んでいるように見えて、実際には dedicated store 群へ到達しているだけ
- そのため、挙動を変えずに命名だけ良くする最初の対象として適している

## 2026-04-23 追加整理
- `melody-reducer.ts`
- `outline-reducer.ts`

上の 2 本も `RootStoreToken` 化したことで、`StoreProps` という名前自体をコードベースから削除できた。
現在の root-store 文脈は
- `RootStoreToken`
- `CommitContext`
の 2 つで表現する形に揃っている。

## 2026-04-23 lastStore ローカル名の扱い
`CommitContext` のフィールド名はまだ `lastStore` のまま残しているが、
小さい orchestrator では取り出した直後のローカル名を `rootStoreToken` に寄せ始めている。

目的は次の 2 つ。
- `CommitContext` の構造変更を急がずに、読み手へ実態を伝える
- 広い rename による影響を避けながら、少しずつ命名を新構成へ寄せる

## 2026-04-23 orchestrator 側の lastStore ローカル名整理
主な `CommitContext` 利用箇所では、取り出した直後に `rootStoreToken` へ別名化する形で揃えた。
対象:
- `initialize-app.ts`
- `keyboard-router.ts`
- `terminal-input.ts`
- `playback-actions.ts`
- `preview-util.ts`
- `melody-input.ts`
- `outline-input.ts`
- `arrange/piano-editor-input.ts`
- `arrange/finder/finder-input.ts`

この状態になったので、`CommitContext` のフィールド名自体を今すぐ rename しなくても、読み味の問題はかなり緩和できている。
