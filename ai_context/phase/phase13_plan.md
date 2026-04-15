# Phase 13 Plan

## 目的
Phase 13 では、
`cache の読み取り入口整理`
を主要対象として進める。

このフェーズの目的は、
`cache` を各所で直接深掘りしている状態から、
少しずつ `selector / accessor` 経由の読み取りへ寄せて、
次の `reducerCache` 入口整理へ安全につなぐことにある。

---

## なぜ Phase 13 が必要か
- Phase 12 で `cache` は
  `data + env + theory` の派生 state であり、
  feature 横断の結節点であると整理できた
- 一方で、読み取りはまだ
  - `ui-state`
  - legacy component
  - reducer / util
  - app
  に広く散っている
- ここでいきなり `reducerCache.ts` の入口整理へ入るより、
  まず読み取りの入口を揃えた方が安全

そのため Phase 13 では、
`cache を読む側の整理`
を先行する

---

## 対象範囲

### 対象
- `cache` を直接読む selector / component / app helper
- `src/state/ui-state/*` からの `cache` 読み取り整理
- 必要に応じた `src/state/cache-state/*` の新設
- legacy component の `$store.cache` 直参照の一部整理

### 対象外
- `reducerCache.ts` の再計算入口整理本体
- `cache` の物理分割
- `data` の物理分割
- input の本格整理

---

## フェーズの狙い

### 1. `cache` 読み取りの正規入口を作る
- `cache` を直接深掘りしなくてよい形を増やす

### 2. `ui-state` と `cache selector` の責務を分ける
- cache の生読み取り
- UI 表示向け整形
の境界を見やすくする

### 3. 影響の大きい表示系から安全に寄せる
- outline
- timeline
あたりを優先候補にする

### 4. 次フェーズの `reducerCache` 入口整理をやりやすくする
- 読み取り側が整理されていれば、
  更新契機の整理に集中しやすい

---

## 実施ステップ

### Step 1. `cache` 読み取りの入口方針を作る
- `src/state/cache-state/*` を作るか
- 既存 `ui-state` の中で整理するか
を決める

### Step 2. outline 系の `cache` 読み取り整理
- `outline-ui-store.ts`
- legacy outline component
まわりの接続を見直す

### Step 3. timeline 系の `cache` 読み取り整理
- `timeline-ui-store.ts`
- timeline header / grid / pitch 側の接続を見直す

### Step 4. app / helper 系の読み取り整理
- `apply-layout-variables.ts`
- `get-timeline-focus-pos.ts`
など、表示補助の接点を整理する

### Step 5. 残件確認
- どこまで `cache` 直参照が減ったかを確認する

### Step 6. クローズ判断
- `reducerCache` 入口整理へ進める状態か判断する

---

## 完了条件
- `cache` 読み取り入口の配置方針がある
- outline / timeline の主要読み取りが整理されている
- app / helper 系の主要接点が整理されている
- 直参照残件の再確認がある
- 次に `reducerCache` 入口整理へ進めるか判断できる

---

## リスクと注意点

### 1. `cache` は読み取りだけでも影響が広い
- 一度に広げすぎない

### 2. `ui-state` と `cache-state` を混ぜすぎない
- 生読み取りは `cache` 側
- 表示整形は `ui-state`
の原則を崩さない

### 3. reducer / util の読み取りは後半に回す
- まずは表示系から寄せる

---

## 作る可能性が高いファイル
- `ai_context/phase/phase13_cache_selector_policy.md`
- `ai_context/phase/phase13_cache_read_inventory.md`
- `ai_context/phase/phase13_close_note.md`
- `src/state/cache-state/cache-store.ts`
- `src/state/cache-state/outline-cache.ts`
- `src/state/cache-state/timeline-cache.ts`

---

## 最初の着手順
1. `cache` 読み取り入口方針を作る
2. outline 系から整理する
3. timeline 系へ広げる

---

## このフェーズの位置づけ
Phase 13 は、
`cache 境界の理解`
から
`cache 読み取り入口の整理`
へ進むフェーズである。

ここが進むと、
次のフェーズで `reducerCache` の入口整理を扱いやすくなる。
