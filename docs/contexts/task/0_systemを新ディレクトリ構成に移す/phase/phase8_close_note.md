# Phase 8 Close Note

## Phase 8 の到達点
Phase 8 では、巨大な `store` をすぐに物理分割するのではなく、
まず `store / project-data 境界` を説明可能な状態にすることを目的として進めた。

このフェーズで整理できたことは次の通り。

- `project data` の実体は `data` である
- save / load の対象は `data` である
- `cache`, `ref`, `preview`, `input`, `terminal`, `fileHandle` は project data 外である
- feature ごとに、どの state 境界へ依存しているかを横断的に説明できる
- `selector / updater / action` の配置方針を決められた
- 次の本格分割候補を `data -> cache -> ref` の順で判断できた

---

## このフェーズでやらなかったこと
- `store.ts` の物理分割
- `data` の feature 単位分解
- `control` の本格分離
- `preview`, `terminal`, `input` の独立 store 化

これらは、Phase 8 の整理結果を前提に次段階で判断する。

---

## 判断として固定してよいこと

### 1. project data は `data`
- まずこの認識を固定してよい

### 2. cache は派生 state
- 保存対象ではなく、再計算で復元される state として扱う

### 3. ref は UI/session 専用
- project data とは切り離して考える

### 4. 物理分割より先に入口整理
- `selector`, `updater`, `app action`
  の入口を整えてから store 実体を割る

---

## 次フェーズへの引き継ぎ
次に進むときは、次のどちらかが自然。

1. `data` 境界の読み取り入口と更新入口をさらに揃える
2. Phase 9 として、最初の物理分割候補に着手する

今の整理度合いを見ると、
先に `Phase 9 の計画` を作ってから着手する進め方が安全。
