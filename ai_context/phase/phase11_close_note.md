# Phase 11 Close Note

## Phase 11 の到達点
Phase 11 では、
`playback / UI 残件の最終入口整理`
を主要対象として進めた。

このフェーズでできたことは次の通り。

- `previewUtil.ts` の project data 読み取りを `project-data` 入口経由へ寄せた
- `ShadeTracks.svelte` の `$store.data.scoreTracks` 直参照を外した
- `ShadeNote.svelte` の `$store.data.scoreTracks[...]` 直参照を外した
- `ChordSelector.svelte` の `$store.data.elements[...]` 直参照を外した
- 直参照の再確認を行い、残件が `input / reducer / cache / 正規接点` に絞られた

---

## このフェーズの判断

### 1. `playback / UI` 残件としては一区切りでよい
理由:
- Phase 10 で主要残件と見ていた `previewUtil.ts` と legacy component 群に着手できた
- 再確認でも `playback / UI` 系の直接参照は消えている

### 2. 残る中心課題は `input / reducer / cache`
理由:
- 現在残っている直接参照は
  - `inputMelody.ts`
  - `inputOutline.ts`
  - `arrangeUtil.ts`
  - `reducerCache.ts`
  - `reducerTerminal.ts`
  - `builderCommon.ts`
  に集中している

### 3. 次に `cache` 境界を主要対象にする判断がかなり自然
理由:
- `reducerCache.ts` が最重要の核として残っているから
- `data` 分割前チェックリストの未完了項目に直結しているから

---

## このフェーズを閉じてよい理由
- Phase 11 の目的だった `playback / UI` 残件整理は達成できた
- 次に何を主要対象にすべきか明確になった
- 無理に `input` や `reducer` まで同じフェーズで触らず、区切った方が理解しやすい

---

## 次フェーズへの引き継ぎ
次は `Phase 12` として、
`cache 境界の整理`
を主要対象にするのが最も自然。
