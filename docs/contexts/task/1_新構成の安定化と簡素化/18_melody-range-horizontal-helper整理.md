# melody range horizontal helper の整理

## 目的
`holdD` に残っていた range note の横移動ロジックを helper 化し、`melody-input.ts` の重い責務をさらに分解する。

## 今回切り出したもの
- `moveMelodyNoteRangeHorizontally()`

配置:
- [melody-horizontal-actions.ts](C:\Users\funny\OneDrive\デスクトップ\rust\scorehack\tauri_app\src\app\melody\melody-horizontal-actions.ts)

## 対応した subgroup

### `holdD`
- range note の横移動
- 左右境界の判定
- tail 判定
- tuplets / div 整合性の判定
- 移動成功後の callback 呼び出し

## 整理の意味
これまでは `holdD` の range 分岐の中で、
- 仮移動
- 左右の境界判定
- tail 判定
- tuplets 整合性判定
- 実際の移動
- normalize
- outline 同期
- commit 前処理

が 1 まとまりで書かれていた。

今回 helper 化したことで、
- `melody-input.ts` は「range note を横移動する」
- helper 側は「移動可能か判定して反映する」

に分けて読めるようになった。

## 今の見立て
`holdD` に残っている主要責務は、ほぼ cursor space の移動だけになった。

cursor space は
- cursor 基準の beat 計算
- 右側ノート群の一括移動
- melody 内で閉じた境界判定

が中心なので、`outline 同期` を伴う range note より少し独立しやすい。

## おすすめの次の一手
- cursor space の移動を helper 化する

それが済むと、`holdD` はかなり薄い orchestration だけの形に近づく。
