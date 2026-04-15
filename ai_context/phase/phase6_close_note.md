# Phase 6 Close Note

## Phase 6 の位置づけ
Phase 6 は、`playback` を新構成で説明できるようにするフェーズとして進めた。

このフェーズでは playback engine の全面再実装ではなく、以下を優先した。

- playback UI の入口整理
- playback state の読み取り / 更新入口整理
- input / terminal からの playback 導線整理
- playback 型と時間計算の domain 化
- SoundFont 読み込み依存の infra 化
- timeline との接続整理

---

## Phase 6 でできたこと
- `ui/playback` に preview position line の入口を作成した
- `state/ui-state/playback-ui-store.ts` に playback selector を追加した
- `state/session-state/playback-session.ts` に playback updater を追加した
- `app/playback` に action / preview router の入口を作成した
- `inputMelody.ts`, `inputOutline.ts`, terminal builder 群の playback 導線を `app/playback` 側へ寄せた
- `domain/playback` に型と time <-> beat 計算を切り出した
- `infra/audio` に SoundFont load の入口を作成した
- timeline grid から playback UI を新入口経由で参照する形へ整理した

---

## まだ残っているもの
- `previewUtil.ts` の本体はまだ legacy 側
- note -> player 変換の純粋部分もまだ `previewUtil.ts` に残っている
- AudioContext / HTMLAudioElement / timer / interval の副作用本体も legacy 側
- arrange preview helper の最終配置はまだ保留

---

## 判断メモ
Phase 6 の目的は playback の完全移行ではなく、`playback` を
- UI
- state
- app
- domain
- infra
- timeline boundary

の観点で説明できる状態にすることだった。

その意味では、このフェーズは十分に完了扱いにしてよい。

次に進むときは、
- `timeline` 全体の責務整理へ進む
- もしくは `project-data / store 本体境界` の整理へ進む
- あるいは `previewUtil.ts` の deeper split を狙う

のどれかが自然である。

---

## 検証結果
- `npm run check` 成功
- `npm run build` 成功
- `cargo check` 成功

build 時には既存 warning のみ継続している。
