# Phase 9 Close Note

## Phase 9 の到達点
Phase 9 では、`data` を `project data` として扱うための入口整理を進めた。

このフェーズでできたことは次の通り。

- `data` 参照箇所の分布を洗い出した
- `project data selector` の配置方針を決めた
- `project data updater` の配置方針を決めた
- `src/state/project-data/*` を新設した
- `src/app/project-data/project-data-actions.ts` を追加した
- `outline`, `melody`, `terminal` の一部が新入口を使い始めた
- `audio`, `arrange` 用の project data 入口も追加した

---

## このフェーズで大事だった判断

### 1. `project data = data`
- これはコード上でも固定して扱ってよい

### 2. 低レベルは selector / updater
- `src/state/project-data/*` に置く

### 3. 上位は action で束ねる
- `createProjectDataActions(lastStore)` の形で扱う
- これにより、従来の custom hook 的な使い心地を保てる

### 4. 物理分割はまだ行わない
- まずは入口整理を優先する

---

## まだ残っていること
- `data` の全参照が新入口へ寄ったわけではない
- reducer 本体にはまだ legacy な直接参照が残る
- arrange 系は persistent / editor 補助の境界確認が継続課題
- `data` の物理分割を行うには、もう一段入口整理が必要

---

## Phase 9 を完了扱いにしてよい理由
- 読み取りと更新の入口方針が定まった
- 実際のコードでも新入口が使われ始めた
- `project data` を独立境界として説明できる
- 次に「物理分割へ進むか」「さらに入口整理を広げるか」を判断できる

---

## 次フェーズへの引き継ぎ候補
1. `data` の物理分割前の最終整理を続ける
2. `cache` 境界を次の主要対象にする
3. `arrange` を独立フェーズで整理する

今の流れでは、
次は `Phase 10 の計画` を作って、
`data` の本格分割前に何を揃えるかを先に決める進め方が自然。
