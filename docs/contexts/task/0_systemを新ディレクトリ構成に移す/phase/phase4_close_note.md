# Phase 4 Close Note

## Phase 4 の位置づけ
Phase 4 は、`terminal` を新構成で説明できるようにするフェーズとして進めた。

このフェーズでは command 体系の再設計や AI 連携実装ではなく、以下を優先した。

- terminal UI の入口整理
- terminal state / ref の入口整理
- shell から terminal への導線整理
- logger / helper / command registry の入口整理
- builder 群の依存方向の整理

---

## Phase 4 でできたこと
- `ui/terminal` に terminal UI の入口を作成した
- `state/ui-state` と `state/session-state` に terminal 用の境界を追加した
- `app/terminal` に action / input / logger / helper / command registry の入口を作成した
- `keyboard-router.ts`, `inputTerminal.ts`, `reducerTerminal.ts` の terminal 導線を `app/terminal` 側へ寄せた
- builder 群と `storeTerminal.ts` の command 型 / logger 依存を整理した
- `CommandCursor.svelte` の legacy 依存を外した

---

## まだ残っているもの
- `reducerTerminal.ts` の本体はまだ legacy 側
- `commandRegistUtil.ts` の本体もまだ legacy 側
- builder 群の command 定義と業務ロジックはまだ密結合
- terminal helper の completion ロジックもまだ legacy 側

---

## 判断メモ
Phase 4 の目的は terminal の完全移行ではなく、terminal を「責務単位で説明できる状態」にすることだった。

その意味では、このフェーズは十分に完了扱いにしてよい。

次に進むときは、terminal をさらに深く分解するより、別の主要機能へ進むか、Phase 5 で terminal / melody / playback の優先順位を決める方がよい。

---

## 検証結果
- `npm run check` 成功
- `npm run build` 成功
- `cargo check` 成功

build 時には既存 warning のみ継続している。
