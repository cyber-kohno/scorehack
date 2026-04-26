# createMelodySelectors 現状整理

## 現在の公開 API

- `getCurrentScoreTrackOrThrow`
- `getCurrentFocusRange`
- `isCurrentCursorOverlapping`
- `findNearFocusIndex`

## 現在の見かけ上の入力

- `RootStoreToken`

## 実際に読んでいるもの

- current melody score track
- current melody focus range
- melody cursor

## 現状の問題

`RootStoreToken` を受けているが、依存の中身としては dedicated store の最新値が必要なだけであり、入力の意味が API から読み取りづらい。

また、selector 内で dedicated store を直接読む構成は、caller 側の reactive 依存を不明瞭にする。

## このタスクで目指す形

- selector factory の入力を `RootStoreToken` から必要な最新値へ置き換える
- caller 側が「何を最新値として渡しているか」を明示できるようにする
- その結果、`createMelodySelectors` の依存境界を明確にする
