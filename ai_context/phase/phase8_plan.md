# Phase 8 Plan

## 目的
Phase 8 では、次の主要対象として `store / project-data 境界` を整理します。

このフェーズの主目的は、現行の巨大 store をすぐに物理分割するのではなく、
- project data
- shell ui
- editor ui
- session state
- cache
- refs

の境界を、機能単位で説明できる状態にすることです。

特に、これまで整理してきた
- outline
- terminal
- melody
- playback
- timeline

が、どの state を読み書きしているかを横断的に見えるようにして、
今後の本格分割や Rust/Tauri 連携へ進みやすい土台を作ることを目的とします。

---

## Phase 8 で store / project-data 境界を扱う理由
Phase 8 の対象は `store / project-data 境界` を優先します。

理由は以下です。
- Phase 1 から Phase 7 までで、主要な機能単位の入口と責務はかなり整理できた
- ただし状態の持ち方はまだ巨大 store に強く依存しており、機能整理に対して基盤整理が追いついていない
- 次に `arrange` や deeper split を進める前に、どの state が永続対象で、どれが session / ui / ref なのかを明確にしておく価値が高い
- 将来的なファイル保存形式や Rust 側データ連携を考えると、`project data` の境界を先に明文化しておいた方が安全
- いきなり store 実体分割に入るのではなく、「分割しやすい境界を説明できる状態」を作るのが現実的

そのため、Phase 8 は `state の意味境界を整理するフェーズ` として進めます。

---

## 対象範囲

### 対象に含めるもの
- `StoreProps` の責務分類見直し
- `data / control / input / preview / cache / ref / fileHandle / terminal` の意味整理
- project data と session state の切り分け
- selector / updater の配置方針整理
- save/load 対象と非対象の整理
- `store-boundaries.ts` の見直し
- 各機能から見た state 依存の棚卸し

### 対象に含めないもの
- store 実体の全面分割
- arrange editor の全面整理
- playback engine の deeper split
- tempo / ts の実装完了
- terminal command 体系の再設計
- 保存形式そのものの変更

---

## このフェーズで目指す状態
- `StoreProps` の各フィールドが何の境界に属するか説明できる
- `project data` と `session state` と `ui state` と `refs` の違いが明文化される
- save/load で永続化すべき範囲を説明できる
- 各機能がどの state 境界に主に依存しているかを整理できる
- 今後 store 実体を分けるとしたら、どこから着手すべきか判断できる

---

## 進め方

### 1. store 関連ファイルの洗い出し
以下を対象に、責務と依存を整理します。
- `tauri_app/src/system/store/store.ts`
- `tauri_app/src/state/store-boundaries.ts`
- `tauri_app/src/system/store/props/*`
- `tauri_app/src/state/ui-state/*`
- `tauri_app/src/state/session-state/*`
- `tauri_app/src/app/project-io/*`

### 2. state 境界の棚卸しを行う
`StoreProps` の各フィールドについて、
- 永続対象か
- session 限定か
- ui 表示都合か
- ref か
- cache か

を分類します。

### 3. project data の範囲を明文化する
特に以下を整理します。
- 保存対象になるもの
- 保存対象ではないもの
- 保存時に再計算されるもの
- load 後に復元または再初期化が必要なもの

### 4. selector / updater の配置方針を整理する
これまで追加してきた `ui-state` / `session-state` の置き方を見直し、
今後の追加ルールを決めます。

### 5. 機能ごとの state 依存をまとめる
- outline
- terminal
- melody
- playback
- timeline

が主にどの境界へ依存しているかを整理します。

### 6. 次の本格分割候補を決める
このフェーズの最後に、
- `project data`
- `session state`
- `ui state`
- `refs`
- `cache`

のうち、どこから実体分割に進むのが安全かを判断します。

---

## 推奨実施順
1. store 関連ファイルの洗い出し
2. state 境界の棚卸し
3. project data 範囲の明文化
4. selector / updater 配置方針の整理
5. 機能ごとの state 依存マップ作成
6. 次の本格分割候補の判断
7. 動作確認と進捗更新

---

## このフェーズで作る可能性が高いファイル
- `ai_context/phase/phase8_store_inventory.md`
- `ai_context/phase/phase8_state_boundary_map.md`
- `ai_context/phase/phase8_project_data_scope.md`
- `ai_context/phase/phase8_feature_state_dependencies.md`
- `ai_context/phase/phase8_store_responsibilities.md`
- `ai_context/phase/phase8_close_note.md`

---

## 完了条件
以下を満たしたら、Phase 8 は完了扱いにできます。

- store 関連ファイルの洗い出しができている
- state 境界マップが作られている
- project data の範囲が明文化されている
- feature ごとの state 依存マップが作られている
- 今後どこから実体分割に進むか判断できる
- `npm run check` が通る
- `npm run build` が通る
- `cargo check` が通る
- 進捗が `ai_context/phase` に記録されている

---

## リスクと注意点

### 1. 言葉だけ整理しても意味がない
単に用語を増やすのではなく、`何が保存対象で何が再計算対象か` のように実装判断へ直結する整理にする必要がある。

### 2. 実体分割を急がない
このフェーズは実体分割ではなく、分割可能な境界の見える化が目的。ここで大きく store 実装を動かしすぎるとリスクが高い。

### 3. cache と project data を混同しない
cache は project data から再計算できるなら、原則保存対象ではない。ここを明確に分けるのが重要。

### 4. refs は UI state ではない
refs は DOM 実体への参照であり、ui state と同じ箱で考えない方がよい。Phase 8 ではこれも明示する。

---

## 前提メモ
- outline は Phase 3 で責務整理済み
- terminal は Phase 4 で責務整理済み
- melody は Phase 5 で責務整理済み
- playback は Phase 6 で責務整理済み
- timeline は Phase 7 で責務整理済み
- Phase 8 では、それらの機能が依存する store / project-data 側の境界を整理する

---

## 進捗記録
Phase 8 の実作業を始めたら、以下に記録します。
- `ai_context/phase/phase8_progress.md`

---

## 次の着手
Phase 8 の最初の着手は以下です。

1. store 関連ファイルの洗い出しを行う
2. その結果をもとに state 境界マップを作る

この順で進めると、今後の本格分割に向けて安全に地図を作れます。
