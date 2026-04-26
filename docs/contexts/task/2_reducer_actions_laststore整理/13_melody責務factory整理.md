# melody 責務 factory 整理

## 目的
- `createMelodyActions()` のような総合入口を前提にせず、business logic が必要な責務の factory を直接呼べる形へ寄せる。
- `RootStoreToken` が必要な責務だけを factory に残し、token 不要な更新は direct call に寄せる。

## 今回の整理
### token 必要な責務
- selector
  - `createMelodySelectors(rootStoreToken)`
- sync / track 切替
  - `createMelodySyncActions(rootStoreToken)`
- focus に伴う outline 同期 / scroll
  - `createMelodyFocusActions(rootStoreToken)`

### token 不要な責務
- 純粋 mutation
  - `appendMelodyNoteSorted(...)`
- 局所 state 更新
  - `setCurrentMelodyTrackIndex(...)`

## caller の変更
### `melody-input.ts`
- `createMelodyActions()` をやめて、必要な責務だけを取得する形に変更
  - `createMelodySelectors(rootStoreToken)`
  - `createMelodySyncActions(rootStoreToken)`
  - `createMelodyFocusActions(rootStoreToken)`

### `preview-util.ts`
- score track 取得は selector factory を使う
- cursor 同期は sync factory を使う

### `root-control.ts`
- mode 切替時の cursor 同期だけを `createMelodySyncActions(rootStoreToken)` から使う

### `terminal` 系
- target 表示や SoundFont 設定は selector factory を使う
- track 切替は sync factory を使う

## 現時点の判断
- `melody-actions.ts` は責務ごとの factory に役割を明け渡したため削除した
- melody の business logic は、今後
  - 必要な selector factory
  - 必要な sync / focus factory
  - token 不要な direct call
  を直接組み合わせる方針で進める

## 次の候補
1. `melody-reducer.ts` に残っている最小更新が、どこまで token 必要かを再評価する
2. `createMelodyFocusActions()` の中で、さらに selector と orchestration の境界を詰める
3. melody の形が固まった段階で `outline` に横展開する
