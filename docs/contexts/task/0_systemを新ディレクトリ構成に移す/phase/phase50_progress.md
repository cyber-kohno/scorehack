# Phase 50 進捗

## 現在の状況
Phase 50 では `input / holdCallbacks` を root store から外す。

## チェックリスト
- [x] 1. `input` 参照を洗い出す
- [x] 2. dedicated input store を追加する
- [x] 3. hold 状態の read / write を dedicated store に切り替える
- [x] 4. root store から `input` と `holdCallbacks` を削除する
- [x] 5. 検証を通す
