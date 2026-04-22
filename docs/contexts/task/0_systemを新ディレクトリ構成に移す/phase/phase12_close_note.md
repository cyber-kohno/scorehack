# Phase 12 Close Note

## Phase 12 の到達点
Phase 12 では、
`cache 境界の整理`
を主要対象として進めた。

このフェーズで整理できたことは次の通り。

- `cache` 関連ファイルの inventory を作成した
- `cache` の責務を
  - `baseCaches`
  - `chordCaches`
  - `elementCaches`
  - `outlineTailPos`
  に分けて整理した
- `data -> cache` 再計算フローを整理した
- `cache` 依存マップを作成した
- 次フェーズ候補を比較した

---

## このフェーズの判断

### 1. `cache` は `data + env + theory` の派生 state と見てよい
これは今後の整理の前提として固定してよい。

### 2. `cache` は feature 横断の結節点
特に
- `chordCaches`
- `elementCaches`
は多くの機能から参照される

### 3. まだ物理分割より入口整理を優先するべき
理由:
- 依存先がまだ広い
- 再計算契機も整理途中

### 4. 次に自然なのは `cache` の読み取り入口整理
理由:
- 既存動作を壊しにくい
- 小さく進めやすい
- 次に `reducerCache` 入口へ進む土台になる

---

## このフェーズを閉じてよい理由
- `cache` をどう見るべきかがかなり明確になった
- 次の主要対象を説明できる
- 無理に `reducerCache` 本体へ入る前に、理解の土台が揃った

---

## 次フェーズへの引き継ぎ
次は `Phase 13` として、
`cache の読み取り入口整理`
を主要対象にするのが最も自然。
