# melody-reducer 解体メモ

## 結論
- `melody-reducer.ts` は削除した。
- melody の責務は、現時点で次の4系統に整理できている。

## 現在の責務配置
### 1. token が必要な読み取り
- [melody-selectors.ts](C:\Users\funny\OneDrive\デスクトップ\rust\scorehack\tauri_app\src\app\melody\melody-selectors.ts)
- `createMelodySelectors(rootStoreToken)`

### 2. token が必要な同期・track 切替
- [melody-sync-actions.ts](C:\Users\funny\OneDrive\デスクトップ\rust\scorehack\tauri_app\src\app\melody\melody-sync-actions.ts)
- `createMelodySyncActions(rootStoreToken)`

### 3. token が必要な focus に伴う outline / scroll 同期
- [melody-focus-factory.ts](C:\Users\funny\OneDrive\デスクトップ\rust\scorehack\tauri_app\src\app\melody\melody-focus-factory.ts)
- `createMelodyFocusActions(rootStoreToken)`

### 4. token 不要な局所更新・helper
- [melody-mutations.ts](C:\Users\funny\OneDrive\デスクトップ\rust\scorehack\tauri_app\src\app\melody\melody-mutations.ts)
- [melody-track-actions.ts](C:\Users\funny\OneDrive\デスクトップ\rust\scorehack\tauri_app\src\app\melody\melody-track-actions.ts)
- [melody-cursor-actions.ts](C:\Users\funny\OneDrive\デスクトップ\rust\scorehack\tauri_app\src\app\melody\melody-cursor-actions.ts)

## 今回の判断
- `syncCursorFromElementSeq` は timeline cache を読むので token 必要
- `focusOutNoteSide` の最小更新は cursor / focus の局所更新なので token 不要
- そのため reducer という中間層に残す理由がなくなった

## 現在の business logic 入口
- `melody-input.ts` は必要な factory を直接組み合わせる
- `preview-util.ts` は selector / sync factory を直接使う
- `root-control.ts` は sync factory を直接使う
- terminal 系は selector / sync factory を直接使う

## 次に見る候補
1. `createMelodyFocusActions()` の中で token 不要にできる部分がまだあるか
2. `melody-cursor-state.ts` の token 必要性が本当に残っているか
3. melody 側の形を task 2 の基準形として固定し、outline に横展開するか判断する
