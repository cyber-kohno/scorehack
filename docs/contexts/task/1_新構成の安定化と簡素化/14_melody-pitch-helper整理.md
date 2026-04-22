# melody pitch helper の整理

## 目的
`melody-input.ts` の hold callback に混ざっていた pitch 移動ロジックを、通常移動と scale lock 移動の観点で整理する。

## 今回切り出したもの
- `moveMelodyPitchRange()`
- `getNextScalePitch()`
- `moveScaleLockedMelodyPitch()`
- `moveScaleLockedMelodyPitchRange()`

配置:
- [melody-pitch-actions.ts](C:\Users\funny\OneDrive\デスクトップ\rust\scorehack\tauri_app\src\app\melody\melody-pitch-actions.ts)

## 対応した subgroup

### `holdX`
- octave 移動
- 単体 note と range note の両方を扱う

### `holdC`
- scale lock pitch 移動
- 単体 note と range note の両方を扱う

## 整理の意味
これまでは `holdX` と `holdC` の中に、
- pitch をどう進めるか
- range note をどう検証して更新するか
- scale lock のとき次の音をどう求めるか

が直接書かれていた。

今回 helper 化したことで、
- `melody-input.ts` は「どの入力でどの pitch 操作を使うか」
- `melody-pitch-actions.ts` は「pitch 操作をどう実現するか」

に少し分けて読めるようになった。

## 今の見立て
`melody-input.ts` の中で、かなり独立しやすい責務は以下まで整理できた。
- preview 試聴
- clipboard
- cursor / focus 基礎操作
- pitch 系 subgroup

次に候補になるのは、
- `holdE / holdShift` の focus 操作系
- `holdF / holdD` の長さ変更・横移動系

のどちらか。

## おすすめの次の一手
- まずは `holdE / holdShift` の focus 操作系をまとめて見る

理由:
- 今回 `moveMelodyFocus()` まで helper 化できているため、focus 系 subgroup の整理につなげやすい
- `holdD` は outline 同期と scroll を伴うため、focus 系より一段重い
