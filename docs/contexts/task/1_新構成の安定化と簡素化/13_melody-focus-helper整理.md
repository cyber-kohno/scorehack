# melody focus helper の整理

## 目的
`melody-input.ts` の中で、入力分岐そのものではない基礎操作を helper 化し、後続の責務整理を進めやすくする。

## 今回切り出したもの
- `isMelodyCursorFocus()`
- `getFocusedMelodyNote()`
- `moveMelodyFocus()`
- `moveMelodyPitch()`

配置:
- [melody-focus-actions.ts](C:\Users\funny\OneDrive\デスクトップ\rust\scorehack\tauri_app\src\app\melody\melody-focus-actions.ts)

## 意味
これまでは `melody-input.ts` の中に、
- cursor かどうかを判定する処理
- focus 中 note を読む処理
- focus 移動
- pitch 移動

が直接書かれていた。

今回 helper 化したことで、
- `melody-input.ts` は「どの入力でどの操作を行うか」
- helper 側は「その操作をどう実現するか」

に少しずつ分けて読めるようになった。

## まだ `melody-input.ts` に残っている主要責務
- hold callback 群
- note の追加 / 削除 / 長さ変更 / 横移動
- outline 同期
- overlap 判定
- scroll 調整

## 今の見立て
- `cursor / focus` の helper 化は、直接ファイルサイズを大きく減らすより、次の整理の基準を作る意味が大きい
- 次に候補になるのは、`hold` の subgroup を責務ごとに見ること
  - `holdX`: octave 移動
  - `holdE`: focus in/out
  - `holdF`: 長さ変更
  - `holdD`: 横移動
  - `holdC`: scale lock pitch 移動
  - `holdShift`: tuplets / focus range
  - `holdCtrl`: clipboard（分離済み）

## おすすめの次の一手
- `holdX / holdC` の pitch 移動系をまとめて眺める
- もしくは `holdE / holdShift` の focus 操作系をまとめて眺める

どちらも候補だが、今は `movePitch()` と `moveFocus()` の helper ができたので、
まずは pitch 系 subgroup から整理する方がつながりがよい。
