# outline-input focus helper の整理

## 目的
`outline-input.ts` に残っていた arrange 判定と focus 移動まわりを helper 化し、入力本体の見通しを良くする。

## 今回切り出したもの
- `isOutlineArrangeEditorActive()`
- `isOutlineArrangeFinderActive()`
- `isOutlineArrangeInputActive()`
- `moveOutlineInputFocus()`
- `moveOutlineInputSectionFocus()`
- `moveOutlineInputRangeFocus()`

配置:
- [outline-input-focus-actions.ts](C:\Users\funny\OneDrive\デスクトップ\rust\scorehack\tauri_app\src\app\outline\outline-input-focus-actions.ts)

## 対応した箇所

### `control`
- arrange finder/editor が active かどうかの判定
- focus 移動
- section focus 移動

### `holdShift`
- focus range の開始
- focus range の上下移動

## 整理の意味
これまでは `outline-input.ts` の中で、
- arrange state の判定
- focusLock の解除
- focus 移動
- section focus 移動
- range focus の開始

が直接書かれていた。

今回 helper 化したことで、
- `outline-input.ts` は「どの入力でどの focus 操作を呼ぶか」
- helper 側は「focus 状態をどう動かすか」

に少し分けて読めるようになった。

## 今の見立て
`outline-input.ts` は `melody-input.ts` ほど大きくはないが、
- chord 挿入 / section 挿入 / modulate 挿入
- recalculation
- chord data 修正

のような責務がまだ残っている。

次に候補になるのは、
- element 追加 / 削除系
- chord data 変更系

のどちらか。

## おすすめの次の一手
- element 追加 / 削除系をまとめて見る

理由:
- `recalculate + commit` のパターンが揃っていて、次に切り出しやすい
- chord data 変更系は hold callback も絡むため、一段あとでもよい
