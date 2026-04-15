# Phase 8 Progress

## 概要
このファイルは `phase8_plan.md` に対する実施状況を記録するための進捗ログです。

関連ドキュメント:
- `ai_context/phase/phase8_store_inventory.md`
- `ai_context/phase/phase8_state_boundary_map.md`
- `ai_context/phase/phase8_project_data_scope.md`
- `ai_context/phase/phase8_feature_state_dependencies.md`
- `ai_context/phase/phase8_selector_updater_policy.md`
- `ai_context/phase/phase8_split_candidate_judgement.md`

---

## 現在の進捗状況
- [x] 1. store 関連ファイルの洗い出しを行う
- [x] 2. state 境界マップを作る
- [x] 3. project data の範囲を整理する
- [x] 4. selector / updater 配置方針を整理する
- [x] 5. feature ごとの state 依存マップを作る
- [x] 6. 次の本格分割候補を判断する
- [x] 7. 動作確認と進捗更新を行う

---

## メモ
- Phase 8 は `store / project-data 境界` を主要対象として進める
- 物理的な store 分割ではなく、意味境界の整理を優先する
- これまで整理した各機能が、どの state に依存しているかを横断的に見えるようにする
- 現時点で次の本格分割候補は `data -> cache -> ref` の順が最も安全

---

## 次の候補
1. `data` の読み取り入口と更新入口を揃える
2. `cache` 再計算の依存境界をさらに明示する
3. Phase 8 のクローズノートを作る
