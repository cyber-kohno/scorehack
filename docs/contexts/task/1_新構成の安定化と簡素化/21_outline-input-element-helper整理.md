# outline-input element helper の整理

## 目的
`outline-input.ts` に残っていた element の追加・削除ロジックを helper 化し、`control` 分岐の見通しを良くする。

## 今回切り出したもの
- `insertOutlineChordElement()`
- `insertOutlineSectionElement()`
- `insertOutlineModulateElement()`
- `removeOutlineFocusElementIfAllowed()`

配置:
- [outline-input-element-actions.ts](C:\Users\funny\OneDrive\デスクトップ\rust\scorehack\tauri_app\src\app\outline\outline-input-element-actions.ts)

## 対応した箇所

### `control`
- `a`: chord 追加
- `s`: section 追加
- `m`: modulate 追加
- `Delete`: focus element 削除

## 整理の意味
これまでは `outline-input.ts` の `control` 内で、
- 初期 data の組み立て
- element の挿入
- 最後の section かどうかの判定
- 削除可否の判定

が直接書かれていた。

今回 helper 化したことで、
- `outline-input.ts` は「どの element を追加/削除するか」
- helper 側は「どう組み立てて、削除可能かどうかを判定するか」

に分けて読めるようになった。

## 今の見立て
`outline-input.ts` に残る主要責務は、かなり
- chord data 変更系
- hold callback 系

へ寄ってきた。

特に
- `1` 〜 `7` による degree 設定
- `holdC / holdF / holdG / holdShift`

あたりが次の整理候補になる。

## おすすめの次の一手
- chord data 変更系をまとめて見る

理由:
- `recalculate + commit` の組み合わせが揃っている
- `element` 追加/削除に比べて、まだ入力本体にロジックが残っている比率が高い
