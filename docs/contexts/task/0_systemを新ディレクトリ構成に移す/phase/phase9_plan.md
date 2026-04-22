# Phase 9 Plan

## 目的
Phase 9 では、Phase 8 で最有力の本格分割候補と判断した `data` を主要対象として、
`project data` の読み取り入口と更新入口を整理する。

このフェーズの目的は、
`store.ts` から `data` をいきなり物理分割することではなく、
`data` を project data 専用の境界として扱える状態をさらに強めることにある。

---

## なぜ Phase 9 で `data` を扱うのか
- save / load の対象がすでに `data` と一致している
- Phase 8 で `project data = data` という認識を固定できた
- `outline`, `melody`, `playback`, `timeline` など主要機能の整理が進み、
  project data と session state の違いを見やすくなっている
- したがって、次は `data` の読み取りと更新の入口を揃えるのが自然

---

## 対象範囲

### 対象
- `storeData.ts`
- `store.ts` 内の `data` 参照
- `outline`, `melody`, `playback`, `timeline`, `project-io` から見た `data` の読み取り入口
- project data に対する更新入口
- `project data selector`
- `project data updater`

### 対象外
- `data` の物理的な store 分離そのもの
- `cache` の本格分離
- `ref` の本格分離
- `control` の分離
- arrange 機能の本格整理

---

## フェーズの狙い

### 1. `data` を project data 専用境界として扱いやすくする
- feature 側が `store` 全体ではなく `project data` を読む感覚を作る

### 2. 読み取り入口と更新入口を分ける
- selector と updater の責務を明確にする

### 3. 将来の物理分割の置換点を増やす
- `data` を直接深掘りするコードを減らす

### 4. save / load と同じ境界で feature を考えられるようにする
- 「保存されるもの」と「保存されないもの」の違いをコード上でも追いやすくする

---

## 実施ステップ

### Step 1. `data` 参照箇所の洗い出し
- `src` 配下で `store.data` / `$store.data` / `lastStore.data` の参照を整理する
- 読み取りと更新を分けて見る

### Step 2. `project-data` selector 方針を作る
- `src/state/project-data` もしくは近い責務名の配置方針を決める
- 少なくとも
  - outline 系
  - melody 系
  - audio track 系
  - arrange track 系
  - score base / song 構造
  の selector の分け方を決める

### Step 3. `project-data` updater 方針を作る
- どこまでを updater に置くか決める
- reducer を直接置き換えず、まず入口を切る

### Step 4. 読み取り入口を一部導入する
- 最も安全な箇所から `project data selector` を導入する
- 最初は `outline` と `melody` の読み取りが候補

### Step 5. 更新入口を一部導入する
- `project data updater` の最小セットを作る
- save/load/reducer をすぐ置き換えず、 feature 側の入口だけ先に揃える

### Step 6. `project data` の責務メモを作る
- 何が project data で、どこから読む/更新するべきかを説明可能にする

### Step 7. 完了判断
- `data` に対する読み取り/更新の入口が増え、
  次に物理分割へ進めるか判断できる状態になっていること

---

## 完了条件
- `data` 参照箇所の洗い出しがある
- `project data selector` 配置方針がある
- `project data updater` 配置方針がある
- 少なくとも一部機能で selector 導入が始まっている
- 可能なら一部機能で updater 入口が導入されている
- `project data` の責務説明ドキュメントがある

---

## リスクと注意点

### 1. `data` は参照量が非常に多い
- いきなり広範囲を置き換えると壊しやすい

### 2. `data` の中にも editor 的な概念が混じっている可能性がある
- とくに arrange 系は persistent / editor 補助の境界に注意が必要

### 3. reducer 置換を急がない
- まずは入口を揃える
- 中身は legacy reducer のままでもよい

### 4. selector 導入を優先する
- 読み取り入口の整理のほうが安全に進めやすい

---

## 作る可能性が高いファイル
- `ai_context/phase/phase9_project_data_inventory.md`
- `ai_context/phase/phase9_project_data_selector_policy.md`
- `ai_context/phase/phase9_project_data_updater_policy.md`
- `ai_context/phase/phase9_project_data_responsibilities.md`
- `src/state/project-data/project-data-store.ts`
- `src/state/project-data/outline-project-data.ts`
- `src/state/project-data/melody-project-data.ts`
- `src/app/project-data/project-data-actions.ts`

ファイル名は実装しながら調整してよい。

---

## 最初の着手順
1. `data` 参照箇所の洗い出し
2. `project data selector` 方針の作成
3. `outline` / `melody` のどちらかで selector 導入

---

## このフェーズの位置づけ
Phase 9 は、
`store` 本体を大きく書き換えるフェーズではなく、
`project data` を独立境界として扱う準備を進めるフェーズである。

ここで入口整理が十分進めば、
その次のフェーズで `data` の物理分割を検討しやすくなる。
