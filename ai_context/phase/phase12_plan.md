# Phase 12 Plan

## 目的
Phase 12 では、
`cache 境界の整理`
を主要対象として進める。

このフェーズの目的は、
`data` から再計算される派生 state としての `cache` を
説明可能な状態にし、
次の本格分割判断に向けて
`data -> cache`
の依存関係を見えるようにすることにある。

---

## なぜ Phase 12 が必要か
- Phase 11 の時点で、`playback / UI` 側の `data` 直参照はかなり減った
- 一方で、残っている重要課題は
  - `reducerCache.ts`
  - `arrangeUtil.ts`
  - `reducerTerminal.ts`
  - `builderCommon.ts`
  など、`cache` と強く関わる箇所に集中している
- `data` の物理分割を考えるなら、
  `cache` が何に依存し、どこから読まれ、いつ再計算されるか
  を先に整理しておく必要がある

そのため、Phase 12 では
`cache を独立境界として説明できる状態`
を作る

---

## 対象範囲

### 対象
- `reducerCache.ts`
- `storeCache.ts`
- `cache` を読む主要 selector / component / utility
- `data -> cache` の再計算フロー
- `cache` の責務分類

### 対象外
- `cache` の物理分割そのもの
- `data` の物理分割そのもの
- `arrange` の全面整理
- `input` の本格整理

---

## フェーズの狙い

### 1. `cache` の責務を分解して理解できるようにする
- element cache
- base cache
- chord cache
- arrange 系 cache
- tail position / line position
などをどう見るか整理する

### 2. `data -> cache` の再計算入口を明確にする
- どこで calculate が走るか
- 何を前提に再計算するか
を整理する

### 3. `cache` 読み取りの主要接点を整理する
- outline
- timeline
- playback
- arrange
など、どこで何を読んでいるかを見える化する

### 4. 次フェーズで `cache` に手を入れてよいか判断できるようにする
- 物理分割
- selector 化
- app 経由の再計算
のどこへ進むか判断できる状態にする

---

## 実施ステップ

### Step 1. `cache` 関連ファイルの洗い出し
- `storeCache.ts`
- `reducerCache.ts`
- `cache` を直接読む主要箇所
を確認する

### Step 2. `cache` の責務マップを作る
- `cache` 内の各プロパティが何を表すか整理する

### Step 3. `data -> cache` 再計算フローを整理する
- 誰が calculate を呼ぶか
- 何の後に再計算が必要か
を整理する

### Step 4. `cache` 依存マップを作る
- outline
- timeline
- playback
- terminal
- arrange
がどの cache に依存するかを見る

### Step 5. 次の実装候補を判断する
- `cache` selector を先に増やすか
- `reducerCache` の入口整理を先にするか
- 本格分割へ進めるか
を比較する

### Step 6. クローズ条件と判断メモを作る
- Phase 12 をどこまでで閉じるかを決める

---

## 完了条件
- `cache` 関連ファイルの inventory がある
- `cache` の責務マップがある
- `data -> cache` 再計算フローが整理されている
- `cache` 依存マップがある
- 次の候補比較がある
- クローズ判断メモがある

---

## リスクと注意点

### 1. `cache` は影響範囲が広い
- いきなり実装変更を急がない

### 2. `data` と `cache` を混ぜて考えない
- `cache` は派生 state であり、保存対象ではない

### 3. arrange 系 cache は慎重に扱う
- `data` 側の複雑さがそのまま反映されやすい

### 4. 再計算タイミングの整理を軽視しない
- `cache` の価値は構造だけでなく更新契機にもある

---

## 作る可能性が高いファイル
- `ai_context/phase/phase12_cache_inventory.md`
- `ai_context/phase/phase12_cache_responsibility_map.md`
- `ai_context/phase/phase12_cache_recalculation_flow.md`
- `ai_context/phase/phase12_cache_dependency_map.md`
- `ai_context/phase/phase12_next_phase_options.md`
- `ai_context/phase/phase12_close_note.md`

---

## 最初の着手順
1. `cache` 関連ファイルの洗い出し
2. `cache` の責務マップ作成
3. `data -> cache` 再計算フロー整理

---

## このフェーズの位置づけ
Phase 12 は、
`data` 分割前の最重要リスクである `cache` を
理解し、境界として説明可能にするフェーズである。

ここが整理できると、
その次に
- `cache` 本体へ手を入れる
- `data` 分割へ進む
のどちらが自然かをかなり高い精度で判断できる。
