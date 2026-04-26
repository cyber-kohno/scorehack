# token 軸の再構成方針

## 目的
- `RootStoreToken` が必要な責務と不要な責務を明確に分ける
- `createXXX(...)` を「token が必要な責務だけ」に限定する
- export が散らかりすぎる状態を避けつつ、今後どこに API を追加すべきか判断しやすくする

## 基本方針

### 1. token が必要な責務
- selector / accessor
- cache / project-data / 複数 state の合成
- shell / playback / keyboard などの orchestration
- 他 feature との同期や scroll を伴う更新

これらは `RootStoreToken` を持つ意味がある。

### 2. token が不要な責務
- 純粋 mutation
- 単一 feature 内で閉じる更新
- dedicated store を直接読める局所 helper

これらは `RootStoreToken` を持つ意味が薄い。

## あるべき形

### token が必要な関数群
- `createXXX(rootStoreToken)` や `useXXX(rootStoreToken)` の factory にする
- factory の中で API 関数を直接定義する
- `rootStoreToken` を引数に取る関数を top-level に複数 export するファイルは作らない

例:
- `createMelodySelectors(rootStoreToken)`
- `createOutlineSelectors(rootStoreToken)`
- `createMelodySyncActions(rootStoreToken)`

### token が不要な関数群
- factory にしない
- その責務のファイルに定義した関数を直接呼ぶ
- 直接 export が多くなりすぎる場合は namespace でまとめる

例:
- `melody-mutations.ts`
- `melody-pitch-actions.ts`
- `melody-length-actions.ts`

### 巨大単機能
- 1ファイル1関数
- 直接 export

例:
- cache 再計算
- 大きい変換処理

## 実施ステップ

### ステップ 1
token 不要な関数を factory から外して、あるべき責務のファイルで定義した関数が直接呼ばれるようにする

狙い:
- `createXXX(...)` が token 必要責務だけに寄る
- 更新系の責務が見えやすくなる

### ステップ 2
token が必要な関数群（selector など）は、それ自体を factory 化する

狙い:
- token を使う責務のまとまりを明示する
- `RootStoreToken` を引数に取る top-level 関数の散乱を防ぐ

### ステップ 3
token 不要な関数群を定義したファイルを namespace でまとめるか判断する

狙い:
- グローバル export の汚染を抑える
- 補完で責務が混ざりすぎる問題を和らげる

補足:
- このステップは優先度を下げてよい
- まずはステップ 1 と 2 を優先する

## 今の判断
- 当面の本筋は **ステップ 1 → ステップ 2** の順
- namespace 化は、その後で export 量と補完体験を見て判断する
- したがって、今すぐ namespace を全面導入するのではなく、
  - まず token 不要責務を factory から外す
  - 次に token 必要責務を factory として純化する
 ことを優先する
