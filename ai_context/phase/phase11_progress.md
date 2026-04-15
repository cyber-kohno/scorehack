# Phase 11 Progress

## 概要
このファイルは `phase11_plan.md` に対する実施状況を記録するための進捗ログです。

関連ドキュメント:
- `ai_context/phase/phase10_data_split_checklist.md`
- `ai_context/phase/phase10_next_phase_options.md`
- `ai_context/phase/phase10_close_note.md`
- `ai_context/phase/phase11_playback_ui_inventory.md`
- `ai_context/phase/phase11_playback_ui_migration_map.md`
- `ai_context/phase/phase11_close_note.md`

---

## 現在の進捗状況
- [x] 1. playback 残件の入口整理を行う
- [x] 2. UI 残件 component の selector 化を進める
- [x] 3. 必要な selector を補う
- [x] 4. 残件の再確認を行う
- [x] 5. クローズ条件と判断メモを作る

---

## メモ
- Phase 11 は `playback / UI 残件の最終入口整理` を主要対象とする
- `data` の物理分割はまだ行わない
- 次に `cache` 境界へ進みやすい状態を作ることが目的
- `previewUtil.ts` と `ShadeTracks / ShadeNote / ChordSelector` を主要対象として扱う
- 再確認後の残件は `input / reducer / cache / 正規接点` に絞られた

---

## 次の候補
1. Phase 12 の計画を作る
2. `cache` 境界整理に進む
3. `input` 残件を別フェーズで扱うか判断する
