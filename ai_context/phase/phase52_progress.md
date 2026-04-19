# Phase 52 進捗

## 現在の状況
`outline control` の最初の dedicated 化対象として、`focus / focusLock` の切り出しを完了した。

## チェックリスト
- [x] 1. `outline control` の read / write inventory 作成
- [x] 2. `focus / trackIndex / arrange open state` の subgroup 分類
- [x] 3. 最初の dedicated 化対象の決定
- [x] 4. 最初の安全な切り出し実装

## 実施内容
- `src/state/session-state/outline-focus-store.ts` を追加
- `StoreOutline.Props` から `focus / focusLock` を削除
- root store の `commit()` から outline focus subscriber へ通知するよう更新
- `outline-state` `outline-navigation` `outline-scroll` `outline-arrange` の focus 読み取りを dedicated store 経由へ変更
- `outline-cache` `timeline-cache` `outline-ui-store` `timeline-ui-store` の focus 読み取りを dedicated store 経由へ変更
- `reducerOutline` `inputOutline` `previewUtil` の focus / focusLock mutation を dedicated store 経由へ変更
- outline element 系 component の focus range 表示を dedicated store 経由へ変更

## 検証
- `npm run check` 成功
- `npm run build` 成功
- `cargo check` 成功
