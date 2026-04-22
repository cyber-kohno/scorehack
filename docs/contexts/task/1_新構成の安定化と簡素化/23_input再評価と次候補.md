# input 再評価と次候補

## 現在の状態

### melody-input
helper 化がかなり進み、主に次の責務が外へ寄った。
- preview 試聴
- clipboard
- cursor / focus 基礎操作
- pitch 系 subgroup
- focus 操作系 subgroup
- length 変更
- horizontal 移動

その結果、`melody-input.ts` はかなり
- 入力分岐
- helper 呼び出し
- commit 前処理

中心の形に近づいている。

### outline-input
helper 化で次が外へ寄った。
- arrange 判定
- focus 移動
- element 追加 / 削除
- chord data 変更系

その結果、`outline-input.ts` もかなり
- 入力分岐
- arrange 入口
- recalculate / commit パターン

中心の形に近づいている。

## 今回確認したこと
- [preview-util.ts](C:\Users\funny\OneDrive\デスクトップ\rust\scorehack\tauri_app\src\app\playback\preview-util.ts) に古い import パス
  - `../../store/store`
  が残っていた
- これは現在の構成上不自然なので
  - `../../state/root-store`
  に修正した

## 次候補の比較

### 1. `melody-input` をさらに薄くする
利点:
- ここまでの流れをそのまま継続できる
- helper 分割の方針が揃っている

懸念:
- これ以上は helper が薄い wrapper に近づく可能性がある
- 今の時点でかなり十分整理できている

### 2. `outline-input` をさらに薄くする
利点:
- `recalculate + commit` のパターンをもう少し整理できる可能性がある

懸念:
- ここから先は細かい helper が増えやすい
- 今の段階でも読みやすさはかなり改善している

### 3. `root-store` 型名 / 互換命名を次の論点にする
利点:
- `StoreProps = Record<string, never>` という現状とのズレを整理できる
- あなたが気にしていた
  - `lastStore`
  - `StoreProps`
  - `StoreUtil`
  の違和感に直接つながる

懸念:
- 影響範囲が広い
- 先に棚卸しと方針整理が必要

## 今のおすすめ
- 次の主要論点は **`root-store` 型名 / 互換命名の整理** に移るのがよい

理由:
- `melody-input` と `outline-input` は、保守性の観点でかなり良い地点まで来ている
- これ以上 helper を増やすより、次は構成理解に直接効く
  - `StoreProps`
  - `StoreUtil`
  - `lastStore`
  の整理に着手する価値が高い

## おすすめの次の一手
1. `StoreProps` / `StoreUtil` / `lastStore` の現存箇所を用途別に棚卸しする
2. 「本当に state 実体を指しているのか」「commit ハブなのか」「互換名だけ残っているのか」を分類する
3. そのうえで、最初の小さな命名整理対象を 1 つ選ぶ
