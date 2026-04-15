# Phase 8 Next Physical Split Candidate Judgement

## 目的
このドキュメントは、Phase 8 の整理結果を踏まえて、
次に `store` の物理分割を行うとしたら何を候補にするべきかを判断するためのメモです。

---

## 前提
- いまの `store.ts` は 1 つの巨大 store として維持されている
- ただし Phase 2 から Phase 7 にかけて、
  `shell`, `outline`, `terminal`, `melody`, `playback`, `timeline`
  の入口整理はかなり進んでいる
- Phase 8 では、`project data` と `session / ui / cache / ref` の意味境界を整理した

したがって今は、
`いきなり全部を割る` のではなく、
`最も安全に分けやすい塊はどこか`
を判断する段階にある

---

## 候補の比較

### 候補 1: `data`
内容:
- 永続対象の project data
- save / load の対象
- outline, melody, audio track, arrange track などの本体

良い点:
- すでに `project data` として意味が明確
- save / load の対象範囲とも一致している
- session state と切り分けやすい

注意点:
- 既存コードの参照量が最も多い
- `data` の中にも feature ごとの型が広く入っている

判断:
- 最有力候補
- ただし最初の物理分割としては、読み書き入口をさらに揃えてから行うのが安全

---

### 候補 2: `cache`
内容:
- `data` から再計算される派生 state
- timeline / outline / playback 表示に広く使われる

良い点:
- save 対象ではないことが明確
- `reducerCache.ts` という再計算入口がすでに存在する
- `data` より分離方針が説明しやすい

注意点:
- 参照量が多く、UI への影響範囲が広い
- 実体を分けても再計算タイミングの統制が必要

判断:
- `data` の次に安全な候補
- `data` とセットで考えると境界がはっきりする

---

### 候補 3: `ref`
内容:
- DOM ref 群
- track 要素配列
- terminal, outline, timeline の参照

良い点:
- 永続対象でないことが明確
- UI/session 専用で意味がはっきりしている
- project data から完全に独立している

注意点:
- Svelte component の `bind:this` と広く結びついている
- 物理分割しても体感的な改善は小さい

判断:
- 技術的には分けやすい
- ただし優先度は `data` や `cache` より低い

---

### 候補 4: `control`
内容:
- mode
- outline / melody / piano editor などの制御状態

良い点:
- editor control state として意味境界はある

注意点:
- feature 横断の参照が非常に多い
- project data との見た目の結びつきが強い
- ここを早く割ると既存動作を壊しやすい

判断:
- まだ早い
- 本格分割候補としては後回しが安全

---

### 候補 5: `preview`
内容:
- 再生状態
- player
- progress
- source

良い点:
- playback/session state として意味が明確

注意点:
- audio 実行中 state を含むため、物理分割の恩恵より同期リスクが先に出やすい

判断:
- 先に `data` / `cache` の境界を固めてからでよい

---

## 現時点の結論
次の本格分割候補は次の順が最も安全です。

1. `data`
2. `cache`
3. `ref`

この順を推す理由:
- `data` は save / load の対象と一致しており、project data 境界として最も明確
- `cache` は派生 state として project data 外にあることが明確
- `ref` は UI/session 専用で、project data から完全に切り離せる

一方で、
- `control`
- `preview`
- `terminal`
- `input`
は、意味境界はあるが機能横断で密結合しているため、先に物理分割すると壊しやすい

---

## 実務上の推奨順

### Step 1
`data` の読み取り入口と更新入口をさらに揃える

### Step 2
`cache` の再計算責務を `data` 依存としてより明示する

### Step 3
`ref` を UI/session 専用の塊として整理する

### Step 4
その後に初めて `store` 実体の分離を検討する

---

## Phase 8 の判断メモ
- Phase 8 の目的は物理分割そのものではなく、分割判断の土台作りである
- この目的に対しては、
  `project data`, `session`, `cache`, `ref` の境界整理は十分進んでいる
- したがって、Phase 8 の完了条件としては
  `次にどこを分けると安全か説明できる状態`
まで到達できていればよい
