# Phase 10 Plan

## 目的
Phase 10 では、`data` の物理分割そのものに入る前に、
本格分割へ進むための前提条件を整理し、
どこまで入口を揃えれば安全に次段階へ進めるかを明確にする。

このフェーズは、
`Phase 9 で作った project data 境界を、実際の分割判断へつなぐ準備フェーズ`
という位置づけである。

---

## なぜ Phase 10 が必要か
- Phase 9 で `project data = data` の境界は整理できた
- ただし `data` 参照はまだ各所に残っている
- reducer 本体や playback 周辺、arrange 周辺には legacy な直接参照が残る
- したがって、いま物理分割へ進むと壊しやすい

そのため Phase 10 では、
`物理分割前の最終的な入口整理`
と
`分割してよい条件の確認`
を主要対象にする

---

## 対象範囲

### 対象
- `project data` 入口の残り整理
- `data` 直参照の残件整理
- `cache` を次フェーズ対象にするかの判断
- `data` の物理分割前チェックリスト
- `project data` の依存が強い feature の見直し

### 対象外
- `data` の物理分割そのもの
- `cache` の物理分割そのもの
- arrange の本格整理
- terminal / playback の全面書き換え

---

## フェーズの狙い

### 1. `data` 直参照の残件を把握する
- 「まだどこが直接 `data` を触っているか」を明確にする

### 2. 分割前に揃えるべき入口を決める
- どの selector / updater / action が不足しているかを出す

### 3. 危険箇所を先に見つける
- arrange
- playback
- cache 再計算
- reducer 本体
など、物理分割時に崩れやすい場所を洗い出す

### 4. 次フェーズで何をするかを限定する
- `data` 分割へ進むのか
- 先に `cache` を整理するのか
- さらに入口整理を続けるのか
を判断できるようにする

---

## 実施ステップ

### Step 1. `data` 直参照の再洗い出し
- Phase 9 後の状態で、どこに `lastStore.data` / `$store.data` が残っているか確認する
- 読み取りと更新を分けて整理する

### Step 2. 残件のカテゴリ分け
- outline
- melody
- playback
- terminal
- arrange
- cache / reducer
に分類する

### Step 3. 分割前チェックリストを作る
- 何が揃っていれば `data` の物理分割へ進めるかを明文化する

### Step 4. 次フェーズ候補を比較する
- `data` 物理分割
- `cache` 整理
- arrange 整理
のどれが次に自然かを比較する

### Step 5. Phase 10 の判断メモとクローズ条件を作る
- ここで一度区切ってよいかを判断する

---

## 完了条件
- `data` 直参照の残件一覧がある
- 残件のカテゴリ分けがある
- `data` 分割前チェックリストがある
- 次フェーズ候補の比較メモがある
- Phase 10 を閉じてよいかの判断メモがある

---

## リスクと注意点

### 1. 「整理したつもり」で分割へ進みやすい
- Phase 10 は実装量よりも判断の質が重要

### 2. arrange を軽視しない
- arrange は persistent data と editor 補助概念が混ざりやすい

### 3. cache と data の境界を混同しない
- data を分けても cache 再計算の責務が曖昧だと意味が薄い

### 4. reducer 本体の直接参照は急に消さない
- まずはリスクの見える化を優先する

---

## 作る可能性が高いファイル
- `ai_context/phase/phase10_data_reference_inventory.md`
- `ai_context/phase/phase10_remaining_dependency_map.md`
- `ai_context/phase/phase10_data_split_checklist.md`
- `ai_context/phase/phase10_next_phase_options.md`
- `ai_context/phase/phase10_close_note.md`

---

## 最初の着手順
1. `data` 直参照の再洗い出し
2. 残件のカテゴリ分け
3. 分割前チェックリストの作成

---

## このフェーズの位置づけ
Phase 10 は、
`project data 境界の整理`
から
`本格分割の可否判断`
へ移るための橋渡しフェーズである。

ここで判断材料が揃えば、
次のフェーズで
- `data` の物理分割に進む
または
- `cache` を先に整理する
のどちらが自然かを落ち着いて決められる。
