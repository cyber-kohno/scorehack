# melody フォルダ分類案

## 目的
- `src/app/melody` 直下の並列ファイル数を減らす
- 新しい API / helper を追加するときの置き場所を判断しやすくする
- `token 必要` と `token 不要` の境界を、フォルダ構造でも読み取りやすくする

## 採用する分類
### input
- business logic の入力入口
- 例:
  - `melody-input.ts`

### selectors
- `RootStoreToken` が必要な読み取り
- 例:
  - `melody-selectors.ts`

### sync
- token 必要な同期・橋渡し
- cursor sync
- focus に伴う outline / scroll sync
- 例:
  - `melody-sync-actions.ts`
  - `melody-focus-sync-actions.ts`
  - `melody-scroll.ts`

### state
- token 不要な local state helper
- local state の最小更新
- 例:
  - `melody-cursor-state.ts`
  - `melody-cursor-actions.ts`
  - `melody-track-actions.ts`

### editing
- note 編集の本体ロジック
- token 不要な mutation / helper
- 例:
  - `melody-mutations.ts`
  - `melody-focus-actions.ts`
  - `melody-range-focus-actions.ts`
  - `melody-pitch-actions.ts`
  - `melody-length-actions.ts`
  - `melody-horizontal-actions.ts`
  - `melody-clipboard-actions.ts`

### preview
- melody 単体の試聴・音出し
- 例:
  - `melody-audition.ts`

## 今回の判断
- `token 必要 / 不要` を最優先の分類軸にしつつ、
  編集ロジックは `editing` にまとめる
- `actions` / `helper` のような曖昧な大箱は作らない
- 深さは 1 段までにして、追跡しやすさを優先する

## 想定構成
```text
src/app/melody/
  input/
    melody-input.ts
  selectors/
    melody-selectors.ts
  sync/
    melody-sync-actions.ts
    melody-focus-sync-actions.ts
    melody-scroll.ts
  state/
    melody-cursor-state.ts
    melody-cursor-actions.ts
    melody-track-actions.ts
  editing/
    melody-mutations.ts
    melody-focus-actions.ts
    melody-range-focus-actions.ts
    melody-pitch-actions.ts
    melody-length-actions.ts
    melody-horizontal-actions.ts
    melody-clipboard-actions.ts
  preview/
    melody-audition.ts
```

## 次
1. この分類に沿って melody を実際に移動する
2. import を付け替えて check / build / cargo check を通す
3. 使い勝手を見て、outline に同じ分類を適用するか判断する
