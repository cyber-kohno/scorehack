# melody focus range helper の整理

## 目的
`holdE / holdShift` に残っていた focus 操作系を小さく helper 化し、`melody-input.ts` の hold 分岐を読みやすくする。

## 今回切り出したもの
- `focusInNearMelodyNote()`
- `focusOutMelodyNoteSide()`
- `moveMelodyFocusRange()`
- `removeFocusedMelodyNote()`

配置:
- [melody-range-focus-actions.ts](C:\Users\funny\OneDrive\デスクトップ\rust\scorehack\tauri_app\src\app\melody\melody-range-focus-actions.ts)

## 対応した subgroup

### `holdE`
- focus in
- focus out
- focus note の削除

### `holdShift`
- focus range の開始
- focus range の左右移動

## 整理の意味
今回の helper は pitch 系ほどロジック量が大きいわけではないが、
- focus 状態をどう変更するか
- focusLock をいつ解放するか
- focus range をいつ開始するか

を `melody-input.ts` の分岐から少し切り離せた。

その結果、
- `melody-input.ts` は「どの hold 入力でどの focus 操作を呼ぶか」
- helper 側は「focus 状態をどう変えるか」

に分けて見やすくなっている。

## 今の見立て
`melody-input.ts` の中で、比較的独立しやすい責務はかなり整理できた。
- preview 試聴
- clipboard
- cursor / focus 基礎操作
- pitch 系 subgroup
- focus 操作系 subgroup

次に候補になるのは、
- `holdF` の長さ変更
- `holdD` の横移動

の 2 つ。

## おすすめの次の一手
- まずは `holdF` の長さ変更を整理する

理由:
- 単体 note に閉じた操作で、`holdD` より依存が軽い
- `holdD` は outline 同期や scroll とつながるため、一段重い
