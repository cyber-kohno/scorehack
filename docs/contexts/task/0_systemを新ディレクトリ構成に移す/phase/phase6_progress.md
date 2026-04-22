# Phase 6 Progress

## 概要
このファイルは `phase6_plan.md` に対する実施状況を記録するための進捗ログです。

関連ドキュメント:
- `ai_context/phase/phase6_playback_inventory.md`
- `ai_context/phase/phase6_playback_migration_map.md`

---

## 現在の進捗状況
- [x] 1. playback 関連ファイルの洗い出しを行う
- [x] 2. playback の移行マップを作る
- [x] 3. `ui/playback` または timeline 側入口の整理に着手する
- [x] 4. playback selector / updater を追加する
- [x] 5. `app/playback` の input / action 入口整理に着手する
- [x] 6. `domain/playback` と `infra/audio` への切り出しを進める
- [x] 7. timeline との接続整理に着手する
- [x] 8. 動作確認と進捗更新を行う

---

## メモ
- Phase 6 は `playback` を主要対象として進める
- 起点は `tauri_app/src/system/util/preview/previewUtil.ts` と `tauri_app/src/system/store/props/storePreview.ts`
- timeline 側では `tauri_app/src/system/component/timeline/grid/PreviewPosLine.svelte` が代表的な接続点
- まずは副作用を増やさず、入口整理と責務の見える化を優先する
- `tauri_app/src/ui/playback/PreviewPositionLine.svelte` を追加し、timeline grid からの参照先を新入口へ切り替えた
- `tauri_app/src/state/ui-state/playback-ui-store.ts` と `tauri_app/src/state/session-state/playback-session.ts` を追加し、preview state の読み取り / 更新入口を作成した
- `tauri_app/src/app/playback/playback-actions.ts` と `tauri_app/src/app/playback/playback-preview-router.ts` を追加し、input / terminal からの playback 導線を新入口へ寄せ始めた
- `tauri_app/src/domain/playback/playback-types.ts` と `tauri_app/src/domain/playback/playback-progress.ts` を追加し、preview の型と time <-> beat 計算を切り出した
- `tauri_app/src/infra/audio/soundfont-player.ts` を追加し、SoundFont 読み込みのライブラリ依存を薄く分離した

---

## 次の候補
1. `phase6_playback_inventory.md` を作る
2. `phase6_playback_migration_map.md` を作る
3. `playback` の UI / state / app / domain / infra の境界を決める
