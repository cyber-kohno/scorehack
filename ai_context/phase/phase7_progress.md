# Phase 7 Progress

## 概要
このファイルは `phase7_plan.md` に対する実施状況を記録するための進捗ログです。

関連ドキュメント:
- `ai_context/phase/phase7_timeline_inventory.md`
- `ai_context/phase/phase7_timeline_migration_map.md`

---

## 現在の進捗状況
- [x] 1. timeline 関連ファイルの洗い出しを行う
- [x] 2. timeline の移行マップを作る
- [x] 3. `ui/timeline` の入口整理に着手する
- [x] 4. timeline selector を追加する
- [x] 5. outline / melody / playback の接続点整理に着手する
- [x] 6. scroll / viewport 境界整理に着手する
- [x] 7. 動作確認と進捗更新を行う

---

## メモ
- Phase 7 は `timeline` を主要対象として進める
- `outline / melody / playback` の各入口が揃ってきたので、次はそれらが集まる timeline 側の責務を整理する
- まずは内部ロジックよりも frame / header / pitch / grid の入口を整える
- `ui/timeline/TimelineFrame.svelte` と `header / pitch / grid` の入口を追加し、`MainWorkspace.svelte` の timeline 参照先を新入口へ切り替えた
- `state/ui-state/timeline-ui-store.ts` を追加し、scrollLimitProps / melody mode / pianoInfo の timeline selector を作成した

---

## 次の候補
1. `phase7_timeline_inventory.md` を作る
2. `phase7_timeline_migration_map.md` を作る
3. `timeline` の UI / state / boundary の境界を決める
