# Phase 51 進捗

## 現在の状況
`control` の最初の下位面として `mode` の dedicated 化を完了した。

## チェックリスト
- [x] 1. `control` 参照の棚卸し
- [x] 2. `mode / outline / melody` の subgroup 分類
- [x] 3. 安全な実施順の決定
- [x] 4. 最初の切り出し実装

## 実施内容
- `mode` 専用 store として `src/state/session-state/mode-store.ts` を追加
- root store の `control` から `mode` を削除
- `commit()` から mode subscriber へ通知する形に更新
- `shell-ui-store` `melody-ui-store` `outline-ui-store` `timeline-ui-store` の mode 読み取りを dedicated store 経由へ変更
- `previewUtil` `reducerTerminal` の mode 依存を dedicated store 経由へ変更
- Svelte component に残っていた `$store.control.mode` 直参照を dedicated store 経由へ変更

## 検証
- `npm run check` 成功
- `npm run build` 成功
- `cargo check` 成功
