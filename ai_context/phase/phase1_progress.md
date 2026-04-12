# Phase 1 進捗

## 目的

このファイルは `phase1_plan.md` の実施結果を追記するための進捗ログである。
端末表示上の文字化けに影響されず、後から現在地を確認できることを目的とする。

---

## 現在の達成状況

- [x] 新ディレクトリ構成を `tauri_app/src` に作成
- [x] `musicTheory` を `src/domain/theory/music-theory.ts` へ移行
- [x] `layout` を `src/styles/tokens/layout-tokens.ts` へ移行
- [x] `disignInitializer` を `src/app/bootstrap/apply-layout-variables.ts` へ移行
- [x] `storeFile` を `src/state/session-state/project-file-store.ts` へ移行
- [x] `fileUtil` を `src/app/project-io` / `src/infra/tauri` へ分割

---

## 完了した項目

## 1. musicTheory

### 新しい配置

- `tauri_app/src/domain/theory/music-theory.ts`

### 実施内容

- 旧 `src/system/util/musicTheory.ts` を廃止
- 参照先を新パスへ移行
- 旧パス参照が残っていないことを確認

### 確認結果

- `npm run check` 成功
- `npm run build` 成功
- `cargo check` 成功

---

## 2. layout

### 新しい配置

- `tauri_app/src/styles/tokens/layout-tokens.ts`

### 実施内容

- 旧 `src/system/const/layout.ts` を廃止
- `Layout` の参照を新パスへ移行
- 旧パス参照が残っていないことを確認

### 確認結果

- `npm run check` 成功
- `npm run build` 成功
- `cargo check` 成功

---

## 3. disignInitializer

### 新しい配置

- `tauri_app/src/app/bootstrap/apply-layout-variables.ts`

### 実施内容

- `applyStaticLayoutVariables`
- `applyDynamicLayoutVariables`

の2関数へ整理

- `Entry.svelte` の呼び出し先を新ファイルへ変更
- 旧 `src/system/util/disignInitializer.ts` を廃止
- 旧パス参照が残っていないことを確認

### 確認結果

- `npm run check` 成功
- `npm run build` 成功
- `cargo check` 成功

---

## 4. storeFile

### 新しい配置

- `tauri_app/src/state/session-state/project-file-store.ts`

### 実施内容

- 保存先ハンドル型を `session-state` へ移動
- `src/system/store/store.ts` の参照先を切り替え
- 旧 `src/system/store/props/storeFile.ts` を廃止

### 確認結果

- `npm run check` 成功
- `npm run build` 成功
- `cargo check` 成功

---

## 5. fileUtil

### 新しい配置

- `tauri_app/src/app/project-io/save-project.ts`
- `tauri_app/src/app/project-io/load-project.ts`
- `tauri_app/src/app/project-io/import-audio.ts`
- `tauri_app/src/app/project-io/export-midi.ts`
- `tauri_app/src/app/project-io/project-file-codec.ts`
- `tauri_app/src/app/project-io/project-io-service.ts`
- `tauri_app/src/infra/tauri/dialog.ts`
- `tauri_app/src/infra/tauri/fs.ts`

### 実施内容

- `save/load/mp3 import/midi export` を分割
- dialog と fs の Tauri 依存を `infra/tauri` へ分離
- codec 処理を `project-file-codec.ts` へ分離
- terminal command と preview の参照先を新ファイルへ変更
- 旧 `src/system/util/fileUtil.ts` を廃止

### 確認結果

- `npm run check` 成功
- `npm run build` 成功
- `cargo check` 成功
- `npm run tauri dev` は即時エラーなく起動待機状態まで確認

---

## 参考メモ

今回の移行中に、既存コード内の壊れた文字列リテラルが数箇所表面化したため、
ビルドを通すための最小修正を加えている。

対象例:

- `src/system/store/reducer/reducerCache.ts`
- `src/system/util/preview/previewUtil.ts`
- `src/system/store/props/arrange/arrangeLibrary.ts`
- `src/system/component/outline/item/ChordSelector.svelte`
- `src/system/component/outline/element/data/DataModulate.svelte`

これらは今回の責務移動そのものではなく、
移行作業で既存の隠れたビルド不整合が露出したため対処したもの。

---

## 次の候補

1. Phase 1 の完了扱いにして、Phase 2 の対象を整理する
2. `store.ts` の分割方針を先に設計する
3. `terminal` の command 群を `app/terminal` へ本格移行する
