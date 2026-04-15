# Phase 13 Close Note

## Phase 13 の到達点
Phase 13 では、
`cache の読み取り入口整理`
を主要対象として進めた。

このフェーズでできたことは次の通り。

- `src/state/cache-state/*` を新設した
- `cache-store.ts` を低レベル入口として追加した
- `outline-cache.ts` を追加し、outline 系の生読み取りを寄せた
- `timeline-cache.ts` を追加し、timeline 系の生読み取りを寄せた
- `App.svelte`, `apply-layout-variables.ts`, `get-timeline-focus-pos.ts` など
  app / helper 側の軽い `cache` 直読みも整理した
- `outline-ui-store.ts`, `timeline-ui-store.ts` を
  `cache-state` の上に乗る形へ寄せ始めた

---

## このフェーズの判断

### 1. `cache-state` という層を置く方針は有効
理由:
- `cache` の生読み取りと UI 表示整形を分けやすい
- `ui-state` の責務が見やすくなる

### 2. 表示系の主要接点はかなり整理できた
理由:
- outline
- timeline
- app / helper
の読み取りは、かなり `cache-state` 経由へ寄った

### 3. 残る中心課題は `legacy data component` と `reducer / util`
再確認時点の主な残件:
- `system/component/outline/element/data/DataChord.svelte`
- `system/component/outline/element/data/DataModulate.svelte`
- `system/store/reducer/reducerCache.ts`
- `system/store/reducer/reducerMelody.ts`
- `system/store/reducer/reducerOutline.ts`
- `system/store/reducer/reducerRef.ts`
- `system/util/preview/previewUtil.ts`

---

## このフェーズを閉じてよい理由
- Phase 13 の目的だった「読む側の整理」は十分進んだ
- `cache` 直読みは、表示系よりも core な reducer / util 側へ集約されてきた
- 次にどこへ進むべきかが明確になった

---

## 次フェーズへの引き継ぎ
次は、
`reducer / util 側の cache 読み取り整理`
を主要対象にするのが自然。

特に優先候補は次の順。
1. `previewUtil.ts`
2. `reducerRef.ts`
3. `reducerMelody.ts` / `reducerOutline.ts`
4. `reducerCache.ts` 本体
