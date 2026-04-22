# Phase 4 Terminal Responsibilities

## 目的
このメモは、Phase 4 時点で `terminal` 周辺の責務がどこにあるかを説明できるようにするための整理です。

---

## terminal が担うもの
`terminal` は単なる UI ではなく、以下の責務を束ねる機能です。

- shell 上での表示 / 非表示
- command 文字列の入力
- command 実行
- helper 候補表示
- log / error / table 出力
- `outline`, `melody`, `project-io`, `arrange` の操作入口

そのため、Phase 4 では「terminal を 1 つの機能単位として説明できる状態」を目標に整理した。

---

## 現在の責務配置

### `ui/terminal`
表示責務を置く。

主なファイル:
- `tauri_app/src/ui/terminal/TerminalFrame.svelte`
- `tauri_app/src/ui/terminal/TerminalOutput.svelte`
- `tauri_app/src/ui/terminal/HelperFrame.svelte`
- `tauri_app/src/ui/terminal/CommandCursor.svelte`
- `tauri_app/src/ui/terminal/output/TBRecord.svelte`
- `tauri_app/src/ui/terminal/output/TBTable.svelte`

責務:
- terminal window の描画
- output の描画
- helper overlay の描画
- cursor の点滅表示
- terminal / helper / cursor ref の登録

### `state/ui-state`
terminal の読み取り selector を置く。

主なファイル:
- `tauri_app/src/state/ui-state/terminal-ui-store.ts`

責務:
- terminal state の参照入口
- outputs / helper / wait / prompt / command split の読み取り

### `state/session-state`
terminal 関連 ref の更新入口を置く。

主なファイル:
- `tauri_app/src/state/session-state/terminal-session.ts`

責務:
- terminal frame ref の設定
- helper frame ref の設定
- cursor ref の設定

### `app/terminal`
terminal の実行入口を置く。

主なファイル:
- `tauri_app/src/app/terminal/terminal-actions.ts`
- `tauri_app/src/app/terminal/terminal-input-router.ts`
- `tauri_app/src/app/terminal/terminal-logger.ts`
- `tauri_app/src/app/terminal/terminal-helper.ts`
- `tauri_app/src/app/terminal/terminal-command-registry.ts`

責務:
- terminal reducer の利用入口
- terminal input の利用入口
- logger の利用入口
- helper の利用入口
- command registry の利用入口

ポイント:
- まだ本体実装の多くは legacy 側に残る
- ただし shell / input / reducer / builder から見える「入口」は `app/terminal` に寄り始めている

### legacy (`system/store/reducer/terminal/*`)
まだ本体実装が残っている。

主なファイル:
- `tauri_app/src/system/store/reducer/reducerTerminal.ts`
- `tauri_app/src/system/store/reducer/terminal/commandRegistUtil.ts`
- `tauri_app/src/system/store/reducer/terminal/helper/commandHelper.ts`
- `tauri_app/src/system/store/reducer/terminal/terminalLogger.ts`
- `tauri_app/src/system/store/reducer/terminal/sector/*`

責務:
- command 実行の本体
- builder ごとのコマンド定義
- helper 候補生成の本体
- logger の本体

---

## Phase 4 で整理できたこと

### 1. shell から terminal を説明しやすくなった
以前は `keyboard-router`, `inputTerminal`, `reducerTerminal`, `terminal component` が直接つながっていた。

現在は:
- `ui/shell` は `ui/terminal` を表示する
- `ui/terminal` は `state/ui-state` と `state/session-state` を使う
- `keyboard-router` は `app/terminal` を使う
- `inputTerminal` / `reducerTerminal` / builder 群も、少しずつ `app/terminal` 入口を使う

という説明ができるようになった。

### 2. terminal の state と ref が見えやすくなった
- 読み取り: `terminal-ui-store.ts`
- ref 更新: `terminal-session.ts`

という入口ができたことで、巨大 store をそのまま使っていても責務境界が見えやすくなった。

### 3. logger / helper / registry の入口ができた
builder や reducer から直接 legacy module を参照するだけでなく、`app/terminal` 側にまとまった入口を作れた。

---

## まだ legacy に残っているもの

### command 実行本体
- `reducerTerminal.ts`

### command registry 本体
- `commandRegistUtil.ts`

### helper 本体
- `helper/commandHelper.ts`

### logger 本体
- `terminalLogger.ts`

### sector builder 本体
- `builderCommon.ts`
- `builderHarmonize.ts`
- `builderInit.ts`
- `builderSection.ts`
- `builderChord.ts`
- `builderModulate.ts`
- `builderMelody.ts`
- `builderPianoEditor.ts`

---

## 次段階で考えること

### 1. `commandRegistUtil.ts` の本体をどう扱うか
Phase 4 では namespace 依存を薄くしたが、本体はまだ legacy 側にある。
次段階では、registry 本体を `app/terminal` に寄せるか、builder 群ごとに分解するかを判断する。

### 2. builder 群の責務分割
現時点では builder は command 定義と業務ロジックがまだ密結合している。
次段階では、以下の分離余地がある。
- command definition
- application action
- validation / logger
- project-io 呼び出し

### 3. helper の独立性向上
helper 候補生成は現在 command registry と terminal state に強く依存している。
将来的には独立した completion service に分ける余地がある。

---

## 現時点のまとめ
Phase 4 によって、`terminal` はまだ完全移行ではないものの、少なくとも

- どこが UI か
- どこが state 読み取りか
- どこが session ref 更新か
- どこが app 入口か
- どこが legacy 本体か

を説明できる状態になった。

これは次に `melody` や別機能へ進むうえでも重要な土台になっている。
