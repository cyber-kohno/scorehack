# Phase 7 Close Note

## Phase 7 の位置づけ
Phase 7 は、`timeline` を新構成で説明できるようにするフェーズとして進めた。

このフェーズでは timeline の全面再構築ではなく、以下を優先した。

- timeline 関連ファイルの洗い出し
- timeline の移行マップ作成
- `ui/timeline` の入口整理
- timeline selector の追加
- outline / melody / playback の接続点整理
- scroll / viewport 境界の見える化

---

## Phase 7 でできたこと
- `ui/timeline` に frame / header / pitch / grid の入口を作成した
- `MainWorkspace.svelte` の timeline 参照先を新入口へ切り替えた
- `state/ui-state/timeline-ui-store.ts` に timeline selector を追加した
- `ChordListFrame.svelte`, `ProgressInfo.svelte`, `PitchListFrame.svelte` の読み取り依存を selector 側へ寄せた
- melody / playback の差し込み口を timeline grid 側から説明できる状態にした
- `scroll / viewport` の責務を `StoreRef -> timeline-ui-store -> reducerRef` の境界で説明できるようにした

---

## まだ残っているもの
- `BaseBlock.svelte` や `MeasureBlock.svelte` の詳細ロジックは legacy 側
- `GridRootFrame.svelte` 本体もまだ legacy 側
- arrange 表示接点の本格整理は未着手
- piano view の最終配置も未確定

---

## 判断メモ
Phase 7 の目的は timeline の完全移行ではなく、`timeline` を
- frame
- header
- pitch
- grid
- insertion boundary
- viewport boundary

の観点で説明できる状態にすることだった。

その意味では、このフェーズは十分に完了扱いにしてよい。

次に進むときは、
- `store / project-data 境界` の整理へ進む
- もしくは `arrange` を主要対象として整理する
- あるいは legacy block の deeper split を狙う

のどれかが自然である。

---

## 検証結果
- `npm run check` 成功
- `npm run build` 成功
- `cargo check` 成功

build 時には既存 warning のみ継続している。
