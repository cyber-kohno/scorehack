# Phase 5 Close Note

## Phase 5 の位置づけ
Phase 5 は、`melody` を新構成で説明できるようにするフェーズとして進めた。

このフェーズでは melody editor の全面作り直しではなく、以下を優先した。

- melody UI の入口整理
- melody state 読み取り入口の整理
- shell / terminal から melody への導線整理
- melody 型と純粋ロジックの domain 化
- timeline と melody の接続点整理

---

## Phase 5 でできたこと
- `ui/melody` に melody UI の入口を作成した
- `state/ui-state/melody-ui-store.ts` に melody 用 selector を追加した
- `app/melody` に action / input の入口を作成した
- `keyboard-router.ts`, `root-control.ts`, `reducerTerminal.ts`, `builderMelody.ts` の melody 導線を `app/melody` 側へ寄せた
- `domain/melody` に型と純粋ロジックを切り出した
- timeline の `GridRootFrame`, `MeasureFocus`, `PitchFocus`, `BaseBlock` の melody 依存を整理した

---

## まだ残っているもの
- `inputMelody.ts` の本体はまだ legacy 側
- `reducerMelody.ts` の本体もまだ legacy 側
- `Note.svelte`, `Factors.svelte`, `ShadeNote.svelte` の詳細描画はまだ legacy 側
- preview 接続の深い整理はまだこれから

---

## 判断メモ
Phase 5 の目的は melody の完全移行ではなく、melody を `timeline 上の編集機能` として責務単位で説明できる状態にすることだった。

その意味では、このフェーズは十分に完了扱いにしてよい。

次に進むときは、
- `playback` を次の主要対象にする
- もしくは `timeline` 全体の責務整理へ進む

のどちらかが自然である。

---

## 検証結果
- `npm run check` 成功
- `npm run build` 成功
- `cargo check` 成功

build 時には既存 warning のみ継続している。
