# Phase 4: Terminal 関連ファイル洗い出し

## 目的
このドキュメントは、Phase 4 で `terminal` を新構成へ移していく前提として、現行 terminal 関連ファイルと責務を整理するためのものです。

ここではまだコードの全面移行は行わず、
- どのファイルが terminal に関係するか
- それぞれが UI / 入力 / state / command 実行 / helper のどれに当たるか
- どこに横断依存があるか
を明らかにします。

---

## 主要ファイル一覧

### UI
- `tauri_app/src/system/component/terminal/TerminalFrame.svelte`
- `tauri_app/src/system/component/terminal/TerminalOutput.svelte`
- `tauri_app/src/system/component/terminal/CommandCursor.svelte`
- `tauri_app/src/system/component/terminal/HelperFrame.svelte`
- `tauri_app/src/system/component/terminal/output/TBRecord.svelte`
- `tauri_app/src/system/component/terminal/output/TBTable.svelte`

### 入力
- `tauri_app/src/system/input/inputTerminal.ts`

### state / 型
- `tauri_app/src/system/store/props/storeTerminal.ts`
- `tauri_app/src/system/store/store.ts`
- `tauri_app/src/system/store/props/storeRef.ts`

### 更新ロジック
- `tauri_app/src/system/store/reducer/reducerTerminal.ts`
- `tauri_app/src/system/store/reducer/terminal/commandRegistUtil.ts`
- `tauri_app/src/system/store/reducer/terminal/terminalLogger.ts`
- `tauri_app/src/system/store/reducer/terminal/helper/commandHelper.ts`

### sector builder
- `tauri_app/src/system/store/reducer/terminal/sector/builderCommon.ts`
- `tauri_app/src/system/store/reducer/terminal/sector/builderHarmonize.ts`
- `tauri_app/src/system/store/reducer/terminal/sector/builderInit.ts`
- `tauri_app/src/system/store/reducer/terminal/sector/builderSection.ts`
- `tauri_app/src/system/store/reducer/terminal/sector/builderChord.ts`
- `tauri_app/src/system/store/reducer/terminal/sector/builderModulate.ts`
- `tauri_app/src/system/store/reducer/terminal/sector/builderMelody.ts`
- `tauri_app/src/system/store/reducer/terminal/sector/builderPianoEditor.ts`

### 接続元として重要な周辺
- `tauri_app/src/ui/shell/RootLayout.svelte`
- `tauri_app/src/app/shell/keyboard-router.ts`
- `tauri_app/src/system/store/reducer/reducerRef.ts`

---

## 責務の整理

## 1. UI
### `TerminalFrame.svelte`
責務:
- terminal 全体の描画
- outputs の表示
- command prompt の表示
- helper の表示
- terminal DOM ref の保持

特徴:
- UI でありながら reducer と ref 調整に直接依存している
- `ui/terminal` の入口として移しやすいが、selector 化が必要

### `TerminalOutput.svelte`
責務:
- output block の種類ごとの表示振り分け

特徴:
- 比較的純粋な UI で移しやすい

### `CommandCursor.svelte`
責務:
- terminal command のカーソル表示
- current focus に応じたカーソル位置計算

特徴:
- reducer 依存があるが UI 寄り

### `HelperFrame.svelte`
責務:
- command helper 候補表示

特徴:
- UI 単体としては薄い
- helper state に依存

### `output/TBRecord.svelte`, `output/TBTable.svelte`
責務:
- terminal output の record/table 表示

特徴:
- UI 専用で新構成へ移しやすい

---

## 2. 入力
### `inputTerminal.ts`
責務:
- terminal open 中のキー入力処理
- command の編集
- Enter 実行
- helper 反映
- terminal close

特徴:
- terminal 入力の中心
- `reducerTerminal` と `commandHelper` に強く依存
- まずは `app/terminal` に入口を作るのが安全

---

## 3. state / 型
### `storeTerminal.ts`
責務:
- terminal command string
- focus
- outputs
- helper
- wait 状態
- availableFuncs
- target

特徴:
- terminal に必要な state は概ねここに集まっている
- ただし `availableFuncs` が command registry 実装に依存している

### `store.ts`
責務:
- `terminal: null | StoreTerminal.Props` を持つ

特徴:
- shell 側の表示有無と terminal state 本体がここで接続されている

### `storeRef.ts`
責務:
- `ref.terminal` を持つ

特徴:
- scroll 調整と helper 表示に使われる

---

## 4. 更新ロジック
### `reducerTerminal.ts`
責務:
- terminal open / close
- current terminal 取得
- command 編集
- focus 移動
- command 実行
- availableFuncs 再構築

特徴:
- terminal の reducer 相当ロジックが集まっている
- command registry と logger を直接利用している
- 最終的には `app/terminal` の入口に寄せたい中心

### `commandRegistUtil.ts`
責務:
- current target に応じた availableFuncs の構築
- sector builder の束ね

特徴:
- registry の中心
- builder 群の集約点として重要

### `terminalLogger.ts`
責務:
- command 実行ログ出力
- info / error / table などの output 作成

特徴:
- logger 専用の責務として分離しやすい

### `helper/commandHelper.ts`
責務:
- helper 候補の生成
- command 入力位置に応じた補完候補作成

特徴:
- terminal helper 専用
- command parser に近い責務も持つ

---

## 5. sector builder
各 builder は command 実装の実体です。

### `builderCommon.ts`
責務:
- save / load など system 共通 command
- project-io との接続点

### `builderHarmonize.ts`
責務:
- harmonize track 操作
- soundfont 設定

### `builderInit.ts`
責務:
- init sector の scale / tempo 変更

### `builderSection.ts`
責務:
- section 名変更

### `builderChord.ts`
責務:
- chord symbol 一覧表示など chord 補助

### `builderModulate.ts`
責務:
- modulate method 変更

### `builderMelody.ts`
責務:
- score track / audio track / mp3 upload など melody 周辺 command

### `builderPianoEditor.ts`
責務:
- piano backing editor 関連 command

特徴:
- builder ごとに責務は分かれているが、共通の logger / terminal / store 依存が多い
- `app/terminal/builders` のような置き場へ将来的に寄せやすい

---

## 横断依存の要点
terminal は以下にまたがっています。

- shell の open / close
- keyboard input routing
- terminal state
- command registry
- logger
- helper
- outline / melody / arrange / project-io / preview への command 呼び出し

そのため terminal は UI だけ移しても終わりません。

特に以下の依存が強いです。
- `keyboard-router.ts` からの open と入力委譲
- `reducerTerminal.ts` と `commandRegistUtil.ts` の密結合
- builderCommon / builderMelody からの project-io 呼び出し
- `reducerRef.ts` による scroll 調整

---

## 現時点での判断
### 先に移しやすいもの
- `TerminalFrame.svelte`
- `TerminalOutput.svelte`
- `HelperFrame.svelte`
- `CommandCursor.svelte`
- `TBRecord.svelte`, `TBTable.svelte`

### 分割前提で移すもの
- `inputTerminal.ts`
- `reducerTerminal.ts`
- `commandRegistUtil.ts`

### 依存先として当面残すもの
- builder 群の実体
- `reducerRef.ts` の scroll 調整
- `storeTerminal.ts` の構造本体

---

## Phase 4 の第一歩として妥当な進め方
1. `src/ui/terminal` に UI 入口を作る
2. `RootLayout.svelte` の terminal 参照を新入口へ切り替える
3. terminal selector / updater を追加する
4. その後に `inputTerminal.ts` の入口を `app/terminal` に作る

この順番なら、既存動作を大きく壊さずに進めやすいです。
