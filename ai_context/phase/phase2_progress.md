# Phase 2 進捗

## 概要
このファイルは `phase2_plan.md` に対する実施状況を記録するための進捗ログです。

関連ドキュメント:
- `ai_context/phase/phase2_shell_responsibilities.md`

---

## 現在の進捗状況
- [x] 1. 起動処理を `Entry.svelte` から分離する
- [x] 2. レイアウト責務を `MainFrame.svelte` から `ui/shell` へ寄せる
- [x] 3. `header` を `ui/header` へ寄せる
- [x] 4. `inputRoot.ts` と `reducerRoot.ts` を `app/shell` に寄せる
- [x] 5. 巨大 store をすぐ分割しないまま、分割しやすい境界を作る
- [x] 6. `shell` まわりの責務を新構成で説明できる状態にする

---

## 1. 起動処理を `Entry.svelte` から分離する

### 新しい配置
- `tauri_app/src/App.svelte`
- `tauri_app/src/app/bootstrap/initialize-app.ts`
- `tauri_app/src/app/bootstrap/bind-global-keyboard.ts`

### 実施内容
- `main.ts` のエントリー先を `App.svelte` に変更
- 初期化処理を `initialize-app.ts` に分離
- グローバルキーボード登録を `bind-global-keyboard.ts` に分離
- 旧 `Entry.svelte` を削除

### 確認結果
- `npm run check` 成功
- `npm run build` 成功
- `cargo check` 成功

### メモ
- `ContextUtil.set("isPreview", ...)` は起動処理側へ移設
- キーボード登録は `window.onkeydown` ではなく `addEventListener` ベースへ変更

---

## 2. レイアウト責務を `MainFrame.svelte` から `ui/shell` へ寄せる

### 新しい配置
- `tauri_app/src/ui/shell/RootLayout.svelte`
- `tauri_app/src/ui/shell/MainWorkspace.svelte`

### 実施内容
- 全体レイアウトを `ui/shell` へ移設
- `App.svelte` の描画先を `RootLayout.svelte` に変更
- 旧 `src/system/MainFrame.svelte` を削除

### 確認結果
- `npm run check` 成功
- `npm run build` 成功
- `cargo check` 成功

### メモ
- この段階では見た目や既存の内部コンポーネント構成は大きく変えていない
- `ui/shell` の中から既存 `system/component/*` を呼ぶ構造で段階移行している

---

## 3. `header` を `ui/header` へ寄せる

### 新しい配置
- `tauri_app/src/ui/header/AppHeader.svelte`
- `tauri_app/src/ui/header/ModeLabel.svelte`

### 実施内容
- `RootLayout.svelte` のヘッダ参照を `ui/header` に切り替え
- 旧 `src/system/component/header/RootHeader.svelte` を削除
- 旧 `src/system/component/header/ModeSwitch.svelte` を削除

### 確認結果
- `npm run check` 成功
- `npm run build` 成功
- `cargo check` 成功

### メモ
- mode 切替ロジックはまだ既存 state を参照している
- 先に UI の責務だけを `ui/header` へ移した

---

## 4. `inputRoot.ts` と `reducerRoot.ts` を `app/shell` に寄せる

### 新しい配置
- `tauri_app/src/app/shell/keyboard-router.ts`
- `tauri_app/src/app/shell/root-control.ts`
- `tauri_app/src/app/timeline/get-timeline-focus-pos.ts`

### 実施内容
- キー入力ルーティングを `keyboard-router.ts` に分離
- mode 切替と hold 状態管理を `root-control.ts` に分離
- timeline の focus 位置計算を `get-timeline-focus-pos.ts` に分離
- `bind-global-keyboard.ts` の呼び出し先を新 router に変更
- 旧 `src/system/input/inputRoot.ts` を削除
- 旧 `src/system/store/reducer/reducerRoot.ts` を削除

### 確認結果
- `npm run check` 成功
- `npm run build` 成功
- `cargo check` 成功

### メモ
- `inputOutline.ts`, `inputMelody.ts`, `inputTerminal.ts` 本体はまだ `system/input` に残している
- 今回は root の責務だけを `app/shell` へ寄せた

---

## 5. 巨大 store をすぐ分割しないまま、分割しやすい境界を作る

### 新しい配置
- `tauri_app/src/state/ui-state/shell-ui-store.ts`
- `tauri_app/src/state/session-state/keyboard-session.ts`
- `tauri_app/src/state/store-boundaries.ts`

### 実施内容
- shell で使う state の読み取り入口を `shell-ui-store.ts` に分離
- キーボード hold 状態の更新入口を `keyboard-session.ts` に分離
- 現行 `store.ts` の責務分類を `store-boundaries.ts` に定義
- `root-control.ts` から直接 `lastStore.input` を触る箇所を updater 経由へ変更
- `keyboard-router.ts` から直接 `lastStore.control.mode` を読む箇所を selector 経由へ変更
- `AppHeader.svelte` と `RootLayout.svelte` の shell 関連 state 参照を selector 経由へ変更

### 確認結果
- `npm run check` 成功
- `npm run build` 成功
- `cargo check` 成功

### メモ
- この段階では store 実体は 1 つのまま維持している
- `writable` の分割や `StoreProps` の再設計はまだ行っていない
- 目的は「実データ構造を変えずに、責務ごとの参照入口と更新入口を作ること」
- 次フェーズで store を本格分割する場合の置換起点として使える状態になった

---

## 6. `shell` まわりの責務を新構成で説明できる状態にする

### 作成したドキュメント
- `ai_context/phase/phase2_shell_responsibilities.md`

### 実施内容
- `shell` の位置づけを文章で定義
- 起動、レイアウト、入力、state 境界の責務を整理
- Phase 2 時点で新構成に移したものと旧構成に残しているものを分離して記録
- 次フェーズへ引き継ぐ観点を明文化

### メモ
- このドキュメントを読むことで、Phase 2 完了時点の `shell` の責務と配置を説明できる状態にした

---

## 次の候補
1. Phase 3 の計画を作る
2. `outline` を先に移すか `terminal` を先に移すか決める
3. `store-boundaries.ts` を起点に次の機能移行単位を確定する
