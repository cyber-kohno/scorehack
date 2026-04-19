# Phase 59 進捗

## 現在の状況
`melody cursor` の dedicated 化判断に向けて、先に access surface を追加した。

## チェックリスト
- [x] 1. inventory 作成
- [x] 2. 責務分類
- [x] 3. 切り出し方針決定
- [x] 4. 検証

## 補足
- `cursor` は reducer / input / UI / preview にまたがるため、いきなり dedicated store にせず helper surface を先に作った
- root store に残る `control.melody` の主要状態は `cursor` のみ
