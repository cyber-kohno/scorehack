# melody selective update 1

## 対象
- `melody-input.ts`
- `holdCtrl + c`
- clipboard copy

## 変更前
- `copyFocusedMelodyNotes(...)`
- `melodyFocus.focusLock = -1`
- その後に `commit()`

このため、実際には
- `melodyClipboard`
- `melodyFocus`
だけが変わる操作でも、全 store touch に依存していた。

## 変更後
- `copyFocusedMelodyNotes(...)`
- `melodyFocus.focusLock = -1`
- `touchMelodyClipboardState()`
- `touchMelodyFocusState()`

`commit()` は呼ばない。

## 意味
- `clipboard copy` は selective update の最初の候補として適していた
- 変更対象が小さいため、
  - `melodyClipboard`
  - `melodyFocus`
 だけを touch する形に安全に置き換えられた

## 現時点の判断
- `commit()` 全 touch から外す最初の一歩として妥当
- 今後も
  - 更新対象が 1〜2 store に閉じる
  - scroll / preview / cross-feature sync がない
操作から順に selective update を広げるのがよい

## 次候補
1. cursor div 変更
2. 単純 focus 移動
3. overlap 判定を伴う cursor 移動
