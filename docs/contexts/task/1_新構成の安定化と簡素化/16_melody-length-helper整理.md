# melody length helper の整理

## 目的
`holdF` に残っていた長さ変更ロジックを helper 化し、`melody-input.ts` の hold 分岐をさらに薄くする。

## 今回切り出したもの
- `scaleFocusedMelodyNoteLength()`

配置:
- [melody-length-actions.ts](C:\Users\funny\OneDrive\デスクトップ\rust\scorehack\tauri_app\src\app\melody\melody-length-actions.ts)

## 対応した subgroup

### `holdF`
- focus 中 note の長さ変更
- overlap 判定
- 長さ 0 の防止

## 整理の意味
これまでは `holdF` の中で、
- focus lock 中は変更しない
- 長さを仮変更して overlap を判定する
- 問題なければ note に反映する

という手順が直接書かれていた。

今回 helper 化したことで、
- `melody-input.ts` は「長さ変更を試みる」
- helper 側は「変更可能か判定して反映する」

に分けて読めるようになった。

## 今の見立て
`melody-input.ts` に残る重い責務は、かなり `holdD` に集約されてきた。

特に `holdD` は、
- 単体 note の横移動
- range note の横移動
- cursor 時の空間移動
- outline 同期
- scroll 調整

が混ざっていて、次に見る価値が高い。

## おすすめの次の一手
- `holdD` を単体 note / range note / cursor space の 3 つに分けて棚卸しする
- そのうえで、単体 note の横移動から先に helper 化する
