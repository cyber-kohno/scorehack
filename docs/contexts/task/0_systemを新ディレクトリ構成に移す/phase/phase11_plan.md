# Phase 11 Plan

## 目的
Phase 11 では、Phase 10 で次の最有力候補と判断した
`playback / UI 残件の最終入口整理`
を主要対象として進める。

このフェーズの目的は、
`data` の物理分割に入る前に、
まだ残っている `data` 直参照のうち
比較的安全に整理しやすいものを減らし、
分割前の不安要素をさらに下げることにある。

---

## なぜ Phase 11 が必要か
- Phase 10 の時点で、`data` 直参照の残件はかなり絞れている
- ただし残件の中でも
  - `previewUtil.ts`
  - legacy component の `$store.data` 直参照
は、分割前に整理しておく価値が高い
- 一方で `reducerCache.ts` や深い reducer 残件は、次にまとめて扱った方が安全

そのため、Phase 11 では
`playback / UI`
に限定して最終的な入口整理を行う

---

## 対象範囲

### 対象
- `previewUtil.ts`
- playback の project data 読み取り入口
- legacy melody component の `$store.data` 直参照
- legacy outline component の `$store.data` 直参照
- `ui-state` と `project-data` の連携強化

### 対象外
- `reducerCache.ts` の本格整理
- `cache` 境界の整理本体
- `data` の物理分割
- arrange の本格整理
- input / reducer の全面置換

---

## フェーズの狙い

### 1. playback の project data 入口を明示する
- `previewUtil.ts` が `data` をまとめて読む部分を、
  `project-data` 入口経由に寄せる

### 2. legacy component の直参照を減らす
- `$store.data` を直接読む component を selector 経由へ寄せる

### 3. UI 側の整理を一区切りにする
- 次フェーズで `cache` を主要対象にするとき、
  UI 残件が邪魔しない状態に近づける

### 4. `data` 分割前チェックリストの未完了項目を減らす
- Phase 10 で未完了だった項目に直接効く整理を行う

---

## 実施ステップ

### Step 1. playback 残件の入口整理
- `previewUtil.ts` で直接読んでいる
  - `elements`
  - `scoreTracks`
  - `audioTracks`
  - `arrange`
  を `project-data` 入口経由に寄せる

### Step 2. UI 残件の selector 化
- `ShadeNote.svelte`
- `ShadeTracks.svelte`
- `ChordSelector.svelte`
の `$store.data` 直参照を減らす

### Step 3. 必要なら selector を追加する
- `project-data`
- `ui-state`
のどちらに置くのが自然か判断しながら補う

### Step 4. 進捗と残件確認
- `data` 直参照がどこまで減ったかを確認する

### Step 5. クローズ判断
- `playback / UI` 残件として一区切りにできるかを判断する

---

## 完了条件
- `previewUtil.ts` の project data 入口整理が進んでいる
- legacy component の `$store.data` 直参照が減っている
- `playback / UI` 残件として見えていた部分を説明できる
- 次に `cache` 境界へ進む準備が整っている

---

## リスクと注意点

### 1. playback は実行中 state と結びつく
- project data 読み取り入口の整理だけに集中し、
  再生フローそのものを大きく変えない

### 2. component 側は小さく進める
- まとめて直すと UI 崩れの切り分けがしづらい

### 3. `ui-state` と `project-data` の責務を混ぜない
- 生読み取りは `project-data`
- 表示整形は `ui-state`
の原則を維持する

---

## 作る可能性が高いファイル
- `ai_context/phase/phase11_playback_ui_inventory.md`
- `ai_context/phase/phase11_playback_ui_migration_map.md`
- `ai_context/phase/phase11_close_note.md`
- 必要に応じて `src/state/project-data/*` 追加ファイル
- 必要に応じて `src/state/ui-state/*` の selector 追加

---

## 最初の着手順
1. `previewUtil.ts` の project data 依存を洗い出す
2. UI 残件 component の直参照を確認する
3. playback / UI の移行マップを作る

---

## このフェーズの位置づけ
Phase 11 は、
`data` 分割前の最終入口整理`
のうち、
特に安全に進めやすい `playback / UI` を先に片付けるフェーズである。

ここが終わると、
次に `cache` 境界を主要対象にしても理解が散りにくくなる。
