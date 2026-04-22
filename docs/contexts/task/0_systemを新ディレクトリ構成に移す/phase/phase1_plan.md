# Phase 1 計画

## 目的

Phase 1 は、`tauri_app` の新構成に対して、
最初の実体を安全に移し始めるフェーズである。

この段階では全面移行は行わず、

- 移しやすい
- 責務が比較的明確
- 今後の土台として効果が大きい

ものだけを対象にする。

---

## Phase 1 の狙い

このフェーズで達成したいことは次の通り。

1. `domain / styles / app / infra / state` に最初の実装を置く
2. `util` の中に混在している責務を分離し始める
3. Tauri 依存を `infra` に寄せ始める
4. 既存の挙動をなるべく壊さずに移行方式を確立する
5. 今後の Phase 2 以降で踏襲する移行パターンを作る

---

## 対象

Phase 1 の対象は以下の5つ。

1. `refer_app/src/system/util/musicTheory.ts`
2. `refer_app/src/system/const/layout.ts`
3. `refer_app/src/system/util/disignInitializer.ts`
4. `refer_app/src/system/util/fileUtil.ts`
5. `refer_app/src/system/store/props/storeFile.ts`

---

## 対象ごとの移行方針

## 1. musicTheory

### 現行

- `refer_app/src/system/util/musicTheory.ts`

### 移行先

- `tauri_app/src/domain/theory/music-theory.ts`

### 方針

- まずはほぼそのまま移す
- store 依存や DOM 依存を持ち込まない
- API や型名は急に変えず、既存互換を優先する

### この段階でやること

- 新ファイルを作る
- 既存コードの import を新パスへ切り替える
- 参照が安定したら旧 `system/util/musicTheory.ts` の役割を縮小する

### 完了条件

- `tauri_app/src/domain/theory/music-theory.ts` が存在する
- 主要な参照先が新ファイルへ向く
- `npm run check` が通る

### 状態

- [ ] 未着手
- [ ] 進行中
- [x] 完了

### メモ

- `tauri_app/src/domain/theory/music-theory.ts` を作成
- 既存の `MusicTheory` 参照を新パスへ移行
- 互換のため `tauri_app/src/system/util/musicTheory.ts` は bridge として残置
- 移行中に露出した既存の壊れた文字列リテラルを数箇所修正

---

## 2. layout

### 現行

- `refer_app/src/system/const/layout.ts`

### 移行先

- `tauri_app/src/styles/tokens/layout-tokens.ts`

### 方針

- レイアウト数値定義を `styles/tokens` へ移す
- まずは固定値定義をそのまま移す
- CSS 変数適用の実行責務は別ファイルへ切り出す

### この段階でやること

- `layout-tokens.ts` を作る
- `disignInitializer` 相当から新トークンを参照させる

### 完了条件

- `tauri_app/src/styles/tokens/layout-tokens.ts` が存在する
- レイアウト値を参照する処理が新トークンへ寄る

### 状態

- [ ] 未着手
- [ ] 進行中
- [x] 完了

### メモ

- `tauri_app/src/styles/tokens/layout-tokens.ts` を作成
- 既存の `Layout` 参照を新パスへ移行
- `tauri_app/src/system/const/layout.ts` を削除
- 旧パス参照が残っていないことを確認

---

## 3. disignInitializer

### 現行

- `refer_app/src/system/util/disignInitializer.ts`

### 移行先

- `tauri_app/src/app/bootstrap/apply-layout-variables.ts`

### 方針

- これは `util` ではなく bootstrap 時の runtime 処理として扱う
- 固定 CSS 変数の適用と、可変 CSS 変数の適用を整理する
- 参照する layout は `src/styles/tokens/layout-tokens.ts` に揃える

### この段階でやること

- 新ファイルを作る
- 固定値反映と可変値反映の API を分ける
- 呼び出し元を `Entry.svelte` 相当から差し替える

### 完了条件

- `tauri_app/src/app/bootstrap/apply-layout-variables.ts` が存在する
- 旧 `disignInitializer.ts` なしでも CSS 変数適用が動く
- `npm run build` が通る

### 状態

- [ ] 未着手
- [ ] 進行中
- [x] 完了

### メモ

- `tauri_app/src/app/bootstrap/apply-layout-variables.ts` を作成
- `Entry.svelte` の呼び出し先を新ファイルへ変更
- `tauri_app/src/system/util/disignInitializer.ts` を削除
- 旧パス参照が残っていないことを確認
- 将来的には `design` に綴りを直してもよい

---

## 4. fileUtil

### 現行

- `refer_app/src/system/util/fileUtil.ts`
- `tauri_app/src/system/util/fileUtil.ts`

### 移行先

- `tauri_app/src/app/project-io/save-project.ts`
- `tauri_app/src/app/project-io/load-project.ts`
- `tauri_app/src/app/project-io/import-audio.ts`
- `tauri_app/src/app/project-io/export-midi.ts`
- `tauri_app/src/infra/tauri/dialog.ts`
- `tauri_app/src/infra/tauri/fs.ts`
- 必要に応じて `tauri_app/src/infra/persistence/project-repository.ts`

### 方針

- 1つの `fileUtil` に集まっている責務を分割する
- dialog と fs は `infra`
- save/load/import/export の操作は `app/project-io`
- 変換処理が純粋なら `src/lib/utils` に寄せる

### この段階でやること

- 新ファイル群を作る
- 既存の Tauri 対応済み処理を分解する
- 既存呼び出し側は互換ラッパー経由でも可とする

### 完了条件

- save/load/mp3 import の実装入口が `src/app/project-io` 側にある
- Tauri の dialog/fs 呼び出しが `src/infra/tauri` 側に寄る
- `npm run check`
- `npm run build`
- `cargo check`
- `npm run tauri dev`
  が通る

### 状態

- [ ] 未着手
- [ ] 進行中
- [ ] 完了

### メモ

- 機能仕様は変えない

---

## 5. storeFile

### 現行

- `refer_app/src/system/store/props/storeFile.ts`
- `tauri_app/src/system/store/props/storeFile.ts`

### 移行先

- `tauri_app/src/state/session-state/project-file-store.ts`

### 方針

- 保存先の path/name を持つセッション状態として扱う
- 永続データではなく一時状態として分離する
- 巨大 store 全体はまだ分割しない

### この段階でやること

- 新ファイルを作る
- 型と初期値を先に定義する
- 既存処理は必要に応じて橋渡しする

### 完了条件

- `tauri_app/src/state/session-state/project-file-store.ts` が存在する
- 保存先状態が新ファイルに定義される

### 状態

- [ ] 未着手
- [ ] 進行中
- [ ] 完了

### メモ

- 

---

## 実施順

依存の軽いものから進めるため、順番は以下を推奨する。

1. `musicTheory`
2. `layout`
3. `disignInitializer`
4. `storeFile`
5. `fileUtil`
6. 最後に import 差し替えと動作確認

---

## 作業単位の目安

### Day 1

- `musicTheory`
- `layout`

### Day 2

- `disignInitializer`

### Day 3

- `storeFile`
- `fileUtil` の分割開始

### Day 4

- save/load/mp3 import の呼び出し側差し替え
- ビルド確認
- Tauri 起動確認

---

## このフェーズでやらないこと

Phase 1 では、以下は扱わない。

- 巨大 store の全面分割
- `outline / melody / terminal` の本格移行
- コマンド体系の再設計
- UI コンポーネント名の全面変更
- Arrange 系の本格整理
- domain 型の全面再定義

---

## 完了判定

Phase 1 は、次の状態になったら完了とする。

1. `musicTheory` が `src/domain/theory` に移っている
2. `layout` が `src/styles/tokens` に移っている
3. CSS 変数適用が `src/app/bootstrap` から行われる
4. `storeFile` 相当が `src/state/session-state` にある
5. save/load/mp3 import の入口が `src/app/project-io` にある
6. Tauri 依存が `src/infra/tauri` にある
7. 以下が通る
   - `npm run check`
   - `npm run build`
   - `cargo check`
   - `npm run tauri dev`

---

## 進捗サマリ

### 現在の状況

- [x] `tauri_app/src` に新ディレクトリ構成を作成済み
- [x] `musicTheory` を `src/domain/theory` へ移行済み
- [x] `layout` を `src/styles/tokens` へ移行済み
- [x] `disignInitializer` を `src/app/bootstrap` へ移行済み
- [ ] `storeFile` は未移行
- [ ] `fileUtil` は未分割

### 次に着手する候補

1. `musicTheory` の移行
2. `layout` の移行
3. `disignInitializer` の移行

---

## 更新ログ

### 2026-04-13

- Phase 1 計画書を作成
- 新ディレクトリ構成作成済みであることを反映
- `musicTheory` を `src/domain/theory/music-theory.ts` へ移行
- build/check/cargo check が通る状態を確認
- `layout` を `src/styles/tokens/layout-tokens.ts` へ移行
- `src/system/const/layout.ts` を削除
- build/check/cargo check が通る状態を確認
- `disignInitializer` を `src/app/bootstrap/apply-layout-variables.ts` へ移行
- `src/system/util/disignInitializer.ts` を削除
- build/check/cargo check が通る状態を確認
