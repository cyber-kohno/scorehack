# melody cursor space helper の整理

## 目的
`holdD` に最後まで残っていた cursor space の移動を helper 化し、横移動系の責務を一通り分割する。

## 今回切り出したもの
- `moveMelodyCursorSpace()`

配置:
- [melody-horizontal-actions.ts](C:\Users\funny\OneDrive\デスクトップ\rust\scorehack\tauri_app\src\app\melody\melody-horizontal-actions.ts)

## 対応した subgroup

### `holdD`
- cursor 基準の beat 計算
- 右側ノート群の一括移動
- tail 判定
- tuplets / div 整合性判定
- 移動成功後の callback 呼び出し

## 整理の意味
これまでは `holdD` の cursor 分岐の中で、
- 開始 index の探索
- 仮移動
- tail 判定
- tuplets 整合性判定
- 実移動
- normalize

がまとめて書かれていた。

今回 helper 化したことで、
- `melody-input.ts` は「cursor space を移動する」
- helper 側は「移動可能か判定して反映する」

に分けて読めるようになった。

## 今の見立て
`holdD` の主要責務は、
- 単体 note 横移動
- range note 横移動
- cursor space 移動

の 3 つすべてを helper に寄せられた。

そのため `melody-input.ts` は、かなり
- 入力分岐
- helper 呼び出し
- commit 前処理

に寄った形になっている。

## おすすめの次の一手
- `melody-input.ts` 全体の残責務を再評価する
- 次に触るなら `outline-input.ts` へ戻るか、`melody-input.ts` の hold callback 構造をさらに薄くするかを判断する
