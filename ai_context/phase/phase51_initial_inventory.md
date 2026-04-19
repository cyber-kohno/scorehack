# Phase 51 初期棚卸し

## 参照件数の目安
- `control`: 約 80 件
- `data`: 約 10 件
- `cache`: 約 5 件

## control の主な集中箇所
- `reducerMelody.ts`
- `melody-ui-store.ts`
- `outline-navigation.ts`
- `shell-ui-store.ts`
- `reducerOutline.ts`
- `previewUtil.ts`
- `builderMelody.ts`

## 読み取りの性質
- `mode` 判定
- `outline.focus / arrange / trackIndex`
- `melody.cursor / focus / focusLock / trackIndex`

## 次に見るべき分け方
- `mode`
- `outline control`
- `melody control`
