# Phase 4: Terminal 移行マップ

## 目的
このドキュメントは、現行 terminal 関連ファイルを新構成のどこへ移す想定かを整理するための移行マップです。

ここでの目的は、今すぐすべてを移すことではなく、
- どのファイルを先に触るべきか
- どれはそのまま移せるか
- どれは分割が必要か
を明確にすることです。

---

## 移行方針の要約
Phase 4 では terminal を以下のレイヤに分けて扱います。

- `ui/terminal`
  - terminal 表示
  - output 表示
  - helper 表示
  - cursor 表示
- `app/terminal`
  - input 入口
  - command 実行入口
  - command registry 入口
  - logger 入口
- `state/ui-state`, `state/session-state`
  - terminal 表示状態
  - command / focus / helper / wait の参照入口
- `domain` は基本不要
  - terminal は UI / app 寄りの責務が中心
- 旧 `system/*`
  - 段階移行中の依存先として暫定維持

---

## ファイル対応表

| 現行ファイル | 想定移行先 | 扱い | 理由 |
| --- | --- | --- | --- |
| `tauri_app/src/system/component/terminal/TerminalFrame.svelte` | `tauri_app/src/ui/terminal/TerminalFrame.svelte` | そのまま移しやすい | terminal UI の最上位コンテナ |
| `tauri_app/src/system/component/terminal/TerminalOutput.svelte` | `tauri_app/src/ui/terminal/TerminalOutput.svelte` | そのまま移しやすい | output 種別の表示振り分け |
| `tauri_app/src/system/component/terminal/CommandCursor.svelte` | `tauri_app/src/ui/terminal/CommandCursor.svelte` | 分割して移す | reducer 依存があるため selector 化したい |
| `tauri_app/src/system/component/terminal/HelperFrame.svelte` | `tauri_app/src/ui/terminal/HelperFrame.svelte` | そのまま移しやすい | helper 表示専用 |
| `tauri_app/src/system/component/terminal/output/TBRecord.svelte` | `tauri_app/src/ui/terminal/output/TBRecord.svelte` | そのまま移しやすい | output 表示専用 |
| `tauri_app/src/system/component/terminal/output/TBTable.svelte` | `tauri_app/src/ui/terminal/output/TBTable.svelte` | そのまま移しやすい | output 表示専用 |
| `tauri_app/src/system/input/inputTerminal.ts` | `tauri_app/src/app/terminal/terminal-input-router.ts` | 分割して移す | 入力入口として再配置したい |
| `tauri_app/src/system/store/reducer/reducerTerminal.ts` | `tauri_app/src/app/terminal/terminal-actions.ts` | 分割して移す | terminal reducer 相当の中心 |
| `tauri_app/src/system/store/reducer/terminal/commandRegistUtil.ts` | `tauri_app/src/app/terminal/terminal-command-registry.ts` | 分割して移す | command registry の中心 |
| `tauri_app/src/system/store/reducer/terminal/terminalLogger.ts` | `tauri_app/src/app/terminal/terminal-logger.ts` | そのまま移しやすい | logger 専用責務 |
| `tauri_app/src/system/store/reducer/terminal/helper/commandHelper.ts` | `tauri_app/src/app/terminal/terminal-command-helper.ts` | 分割して移す | helper / completion の入口 |
| `tauri_app/src/system/store/reducer/terminal/sector/*` | `tauri_app/src/app/terminal/builders/*` | 分割して移す | command 実装群を app 層に寄せたい |
| `tauri_app/src/system/store/props/storeTerminal.ts` | `tauri_app/src/state/session-state/terminal-session.ts` + 互換レイヤー | 分割して移す | state 本体と型整理をしたい |
| `tauri_app/src/system/store/reducer/reducerRef.ts` の terminal scroll 部分 | 当面維持 | 今回は残す | UI 入口整理後に扱う方が安全 |

---

## 最初に着手する単位
### 第1段階: UI 入口の移動
対象:
- `TerminalFrame.svelte`
- `TerminalOutput.svelte`
- `HelperFrame.svelte`
- `CommandCursor.svelte`
- `output/*`

狙い:
- `RootLayout.svelte` から見た terminal の入口を新構成へ移す
- 実際の内部依存はまだ旧ファイルに残っていてもよい

### 第2段階: selector / updater の導入
対象:
- terminal 可視状態
- command string
- focus
- helper
- wait
- outputs

狙い:
- terminal UI が直接巨大 store を読む箇所を減らす

### 第3段階: input / action の入口移動
対象:
- `inputTerminal.ts`
- `reducerTerminal.ts`

狙い:
- `app/terminal` に terminal 操作の入口を作る
- いきなり完全分解せず、最初は wrapper でもよい

### 第4段階: registry / builder 整理
対象:
- `commandRegistUtil.ts`
- `terminalLogger.ts`
- `commandHelper.ts`
- sector builder 群

狙い:
- registry / logger / helper / builder の責務を分離しやすくする

---

## このフェーズで新規作成する可能性が高いファイル
- `tauri_app/src/ui/terminal/TerminalFrame.svelte`
- `tauri_app/src/ui/terminal/TerminalOutput.svelte`
- `tauri_app/src/ui/terminal/CommandCursor.svelte`
- `tauri_app/src/ui/terminal/HelperFrame.svelte`
- `tauri_app/src/ui/terminal/output/TBRecord.svelte`
- `tauri_app/src/ui/terminal/output/TBTable.svelte`
- `tauri_app/src/app/terminal/terminal-input-router.ts`
- `tauri_app/src/app/terminal/terminal-actions.ts`
- `tauri_app/src/app/terminal/terminal-command-registry.ts`
- `tauri_app/src/app/terminal/terminal-command-helper.ts`
- `tauri_app/src/app/terminal/terminal-logger.ts`
- `tauri_app/src/state/ui-state/terminal-ui-store.ts`
- `tauri_app/src/state/session-state/terminal-session.ts`

---

## 今回はまだ触らない前提のもの
- command 名や help UX の全面再設計
- AI command / AI assist 実装
- preview や arrange と terminal の仕様改善

これらは terminal の入口整理後に扱う方が安全です。

---

## 推奨実装順
1. `src/ui/terminal/TerminalFrame.svelte` を作る
2. `RootLayout.svelte` の参照先を新 terminal 入口へ切り替える
3. `src/ui/terminal` に output / helper / cursor を寄せる
4. `terminal-ui-store.ts` を作る
5. `inputTerminal.ts` の入口 wrapper を `app/terminal` に作る
6. その後で `reducerTerminal.ts` と registry / builder の整理に入る

この順なら、見通しを作りながら壊しにくく進められます。
