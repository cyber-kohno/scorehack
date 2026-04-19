# Phase 53 trackIndex 棚卸し

## 対象の見立て
`outline control.trackIndex` は、主に harmonize track の選択状態として使われていた。
`focus / focusLock` と比べると利用箇所は少なく、shape も単純だったため、次の dedicated 化対象として安全だった。

## 主な責務
- active harmonize track の選択
- arrange target track の決定
- terminal builder の active track 表示と変更
- preview の arrange layer 対象判定

## 主な利用箇所
- `src/app/outline/outline-navigation.ts`
- `src/app/outline/outline-arrange.ts`
- `src/app/arrange/arrange-state.ts`
- `src/system/store/reducer/terminal/sector/builderHarmonize.ts`
- `src/system/util/preview/previewUtil.ts`

## 判断
- `arrange open state` そのものは重いが、`trackIndex` はそこから独立した selection state として扱える
- UI component より app/helper/reducer 側に利用が寄っており、 dedicated 化しやすい
- `focus / focusLock` の後に着手する順序として妥当

## 今回の結果
- `trackIndex` は dedicated store に移行した
- `StoreOutline.Props` に残る責務は `arrange` だけになった
- `outline control` は実質的に
  - selection state
  - active track state
  - arrange open state
の 3 つへ分解できた
