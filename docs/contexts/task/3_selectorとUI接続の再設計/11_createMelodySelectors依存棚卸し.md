# createMelodySelectors 依存棚卸し

## 対象 API と依存

### getCurrentScoreTrackOrThrow

必要なもの:

- current score track

`RootStoreToken` は不要。

### getCurrentFocusRange

必要なもの:

- current focus range

`RootStoreToken` は不要。

### isCurrentCursorOverlapping

必要なもの:

- current cursor
- current score track

`RootStoreToken` は不要。

### findNearFocusIndex

必要なもの:

- current cursor
- current score track

`RootStoreToken` は不要。

## 現時点の整理

`createMelodySelectors` 全体として見ると、現時点の最小入力は次の 3 つで足りる可能性が高い。

- current score track
- current focus range
- current cursor

## 今後の設計論点

### 案 A

`createMelodySelectors(currentScoreTrack, currentFocusRange, currentCursor)` の形にする。

利点:

- 入力が明快
- 今回の task 3 のスコープに収まりやすい

懸念:

- `currentFocusRange` を使わない関数にも入力として渡すことになる

### 案 B

責務別に分ける。

例:

- `createMelodyTrackSelectors(currentScoreTrack)`
- `createMelodyFocusSelectors(currentFocusRange)`
- `createMelodyCursorSelectors(currentCursor, currentScoreTrack)`

利点:

- 依存がより正確

懸念:

- task 3 の練習台としては分割が早すぎる可能性がある
- caller 側の変更量が増える

## 現時点の判断

最初の実装としては **案 A** が妥当。

まずは `createMelodySelectors` を 1 つのまま、必要な最新値を直接受ける形に変え、そこで得られた知見をもとに分割の必要性を判断する。
