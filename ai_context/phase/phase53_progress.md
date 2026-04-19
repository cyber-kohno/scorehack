# Phase 53 進捗

## 現在の状況
`outline control` の次の下位面として `trackIndex` の dedicated 化を完了した。

## チェックリスト
- [x] 1. `trackIndex` の read / write inventory 作成
- [x] 2. terminal / arrange / outline の接点整理
- [x] 3. dedicated 化の安全性判断
- [x] 4. 最初の安全な切り出し実装

## 実施内容
- `src/state/session-state/outline-track-store.ts` を追加
- `StoreOutline.Props` から `trackIndex` を削除
- root store の `commit()` から outline track subscriber へ通知するよう更新
- `outline-navigation` `outline-arrange` `arrange-state` の track selection 読み書きを dedicated store 経由へ変更
- `builderHarmonize` の active track 判定と track change ログを dedicated store 経由へ変更
- `previewUtil` の arrange layer 再生対象判定を dedicated store 経由へ変更

## 検証
- `npm run check` 成功
- `npm run build` 成功
- `cargo check` 成功
