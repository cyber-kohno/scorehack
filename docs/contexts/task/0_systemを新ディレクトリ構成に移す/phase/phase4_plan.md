# Phase 4 計画

## 目的
Phase 4 では、Phase 3 で整理した `outline` の土台を前提に、次の主要機能単位を新構成へ移していきます。

このフェーズでは `terminal` を先に対象にします。

---

## Phase 4 で terminal を先に扱う理由
`melody` より先に `terminal` を進める理由は以下です。

- このアプリの独自性の中核に terminal 操作がある
- command 登録と command 実行の責務がまだ旧構成に強く残っている
- `project-io` や `outline` の操作入口と結びつけやすい
- `melody` よりも、責務の境界を切る優先度が高い
- 将来的な AI 連携とも接続しやすい

そのため、Phase 4 は `terminal を機能単位で整理するフェーズ` として進めます。

---

## 対象範囲
### 対象に含めるもの
- terminal UI の入口
- terminal state の参照入口
- command registry の入口
- command 実行フロー
- terminal logger
- common / harmonize / init / section / chord / modulate / melody / piano editor 系 command builder の責務整理
- project-io との接続整理

### 対象に含めないもの
- AI 連携実装そのもの
- terminal command 体系の全面再設計
- melody editor 本体の本格移行
- playback の再設計
- arrange editor 本体の再設計

---

## このフェーズで目指す状態
- terminal UI の入口が `src/ui/terminal` に揃う
- terminal の state 参照が `state/ui-state` または `state/session-state` 経由になる
- command 実行の入口が `src/app/terminal` に揃う
- builder 群の責務を新構成で説明できる
- `project-io` と terminal の接続関係を整理できる
- 旧 `system/store/reducer/terminal/*` 依存を段階的に減らせる

---

## 進め方
### 1. terminal 関連ファイルの洗い出し
以下を対象に、現行責務を分類します。
- `src/system/component/terminal/*`
- `src/system/store/reducer/terminal/*`
- terminal を開閉する shell 側の処理
- terminal state を持つ store 定義

### 2. terminal UI の入口を `src/ui/terminal` に作る
この段階では見た目や仕様は変えず、置き場だけを揃えます。

### 3. terminal state selector / updater を作る
巨大 store を維持したまま、terminal の表示状態や入力状態の参照入口を整理します。

### 4. command 実行入口を `src/app/terminal` に寄せる
最初は wrapper でもよいので、terminal command 実行の入口を `app/terminal` 側へ寄せます。

### 5. builder 群を整理する
以下のように、builder の責務を段階的に分けます。
- command registry
- command logger
- sector builder
- validator / helper
- project-io 呼び出し

### 6. 最後に import の流れを整理する
- `ui/terminal` は `app/terminal` と `state/*` を参照する
- `app/terminal` は command 実行と logger を束ねる
- builder 群は必要な domain / action に依存する

---

## 完了条件
以下を満たしたら、Phase 4 は完了扱いにできます。

- terminal UI の入口が `src/ui/terminal` に揃っている
- terminal state の selector / updater が追加されている
- command 実行入口が `src/app/terminal` にある
- terminal builder 群の責務を説明できる
- `npm run check` が通る
- `npm run build` が通る
- `cargo check` が通る
- 進捗が `ai_context/phase` に記録されている

---

## リスクと注意点
### 1. terminal は既存機能の結節点
terminal は `outline`, `melody`, `project-io`, `preview`, `arrange` にまたがるため、一気に整理すると壊しやすいです。

### 2. command 名の再設計は後回し
今回は command 名や UX の再設計ではなく、責務整理を優先します。

### 3. logger と builder は分けて考える
builder 内に logging が混ざっている箇所があるため、段階的に分ける方が安全です。

### 4. UI は最小変更
terminal の見た目改善は後回しにして、まずは配置と責務を整理します。

---

## 推奨実施順
1. terminal 関連ファイルの洗い出し
2. terminal 移行マップ作成
3. `ui/terminal` の入口整理
4. terminal selector / updater 追加
5. `app/terminal` の command 実行入口整理
6. builder 群の依存整理
7. 動作確認と進捗更新

---

## このフェーズで作る可能性が高いファイル
- `tauri_app/src/ui/terminal/TerminalFrame.svelte`
- `tauri_app/src/ui/terminal/TerminalInput.svelte`
- `tauri_app/src/ui/terminal/TerminalOutput.svelte`
- `tauri_app/src/ui/terminal/output/*`
- `tauri_app/src/app/terminal/terminal-command-router.ts`
- `tauri_app/src/app/terminal/terminal-command-registry.ts`
- `tauri_app/src/app/terminal/terminal-actions.ts`
- `tauri_app/src/app/terminal/terminal-logger.ts`
- `tauri_app/src/state/ui-state/terminal-ui-store.ts`
- `tauri_app/src/state/session-state/terminal-session.ts`

---

## 進捗記録
Phase 4 の実作業を始めたら、以下に記録します。
- `ai_context/phase/phase4_progress.md`

---

## 前提メモ
- `tempo / ts` は `modulate` と同じく outline の時間軸要素として扱う
- ただし未完成部分の実装は後回しにし、リファクタリングを優先する
- Phase 3 で `outline` の型・UI入口・action入口の整理は大きく進んでいる
