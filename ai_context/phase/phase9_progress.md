# Phase 9 Progress

## 概要
このファイルは `phase9_plan.md` に対する実施状況を記録するための進捗ログです。

関連ドキュメント:
- `ai_context/phase/phase8_project_data_scope.md`
- `ai_context/phase/phase8_selector_updater_policy.md`
- `ai_context/phase/phase8_split_candidate_judgement.md`
- `ai_context/phase/phase9_project_data_inventory.md`
- `ai_context/phase/phase9_project_data_selector_policy.md`
- `ai_context/phase/phase9_project_data_updater_policy.md`

---

## 現在の進捗状況
- [x] 1. `data` 参照箇所の洗い出しを行う
- [x] 2. `project data selector` 方針を作る
- [x] 3. `project data updater` 方針を作る
- [x] 4. selector を一部導入する
- [x] 5. updater 入口を一部導入する
- [x] 6. `project data` の責務メモを作る
- [x] 7. 動作確認と進捗更新を行う

---

## メモ
- Phase 9 は `data` を次の主要対象とする
- 目的は物理分割ではなく、`project data` の入口整理である
- selector 導入を updater より先に進める
- `outline` / `melody` が最初の導入候補になりやすい
- `project data selector` は `src/state/project-data/*` を新設して受ける方針
- `src/state/project-data/*` の初期ファイルを作成し、`outline-ui-store.ts` と `melody-ui-store.ts` から利用開始した
- `createProjectDataActions(lastStore)` を追加し、custom hook 的な束ね方も維持する
- `reducerOutline.ts`, `builderMelody.ts`, `builderHarmonize.ts` でも `project data` 入口の利用を開始した
- `audio-project-data.ts`, `arrange-project-data.ts` を追加した
- `outline-project-data.ts` に insert / remove updater を追加し、`reducerOutline.ts` から利用開始した
- `phase9_close_note.md` を追加し、Phase 9 の到達点を整理した

---

## 次の候補
1. Phase 10 の計画を作る
2. `data` の物理分割前に追加で揃える入口を判断する
3. `cache` を次フェーズ対象にするか判断する
