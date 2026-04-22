# melody horizontal helper の整理

## 目的
`holdD` に混ざっている横移動ロジックのうち、まずは単体 note の移動だけを helper 化して、重い責務を分解し始める。

## 今回切り出したもの
- `moveFocusedMelodyNoteHorizontally()`

配置:
- [melody-horizontal-actions.ts](C:\Users\funny\OneDrive\デスクトップ\rust\scorehack\tauri_app\src\app\melody\melody-horizontal-actions.ts)

## 対応した subgroup

### `holdD`
- 単体 note の横移動
- overlap 判定
- 移動成功後の callback 呼び出し

## 整理の意味
これまでは `holdD` の単体 note 分岐の中で、
- 仮移動
- overlap 判定
- note 反映
- outline 同期
- commit 前処理

が連続して書かれていた。

今回 helper 化したことで、
- `melody-input.ts` は「単体 note を横移動する」
- helper 側は「移動可能か判定して反映する」

に分けて読めるようになった。

## 今の見立て
`holdD` に残っている重い責務は、かなり次の 2 つに絞れた。
- range note の横移動
- cursor space の移動

どちらも beat 計算や境界判定を伴うため、単体 note より一段重い。

## おすすめの次の一手
- 先に range note の横移動を整理する

理由:
- `holdD` の中で outline 同期と commit の意味が最も強いのは range note 側
- cursor space は melody 内だけで閉じやすく、あとで独立させやすい
