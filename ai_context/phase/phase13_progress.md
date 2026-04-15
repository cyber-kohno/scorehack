# Phase 13 Progress

## 概要
このファイルは `phase13_plan.md` に対する実施状況を記録するための進捗ログです。

関連ドキュメント:
- `ai_context/phase/phase12_close_note.md`
- `ai_context/phase/phase12_cache_dependency_map.md`
- `ai_context/phase/phase12_next_phase_options.md`
- `ai_context/phase/phase13_cache_selector_policy.md`
- `ai_context/phase/phase13_cache_read_inventory.md`
- `ai_context/phase/phase13_close_note.md`

---

## 現在の進捗状況
- [x] 1. `cache` 読み取り入口方針を作る
- [x] 2. outline 系の `cache` 読み取り整理を進める
- [x] 3. timeline 系の `cache` 読み取り整理を進める
- [x] 4. app / helper 系の読み取り整理を進める
- [x] 5. 残件の再確認を行う
- [x] 6. クローズ条件と判断メモを作る

---

## メモ
- Phase 13 は `cache の読み取り入口整理` を主要対象とする
- ここではまだ `reducerCache` の再計算入口には入らない
- まずは読む側を整理して、次フェーズを安全にする
- `src/state/cache-state/*` を新設して、生読み取りを寄せる方針で進めている
- 再確認時点で、`cache` 直読みの残件は legacy data component と reducer / util にかなり集中している
- 表示系の主要接点は一区切りついたため、次は core 側へ進める状態

---

## 次の候補
1. 次フェーズの計画を作る
2. `reducer / util` 側の `cache` 読み取り整理へ進む
3. `reducerCache` 本体に入る順番を決める
