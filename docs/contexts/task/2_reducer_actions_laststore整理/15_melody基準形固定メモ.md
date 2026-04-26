# melody 基準形固定メモ

## 今回の判断
- `factory` は実装形であって責務名ではない
- melody では、token 必要な入口も責務名で読める方を優先する

## naming の整理
### 維持したもの
- [melody-selectors.ts](C:\Users\funny\OneDrive\デスクトップ\rust\scorehack\tauri_app\src\app\melody\melody-selectors.ts)
  - `createMelodySelectors(rootStoreToken)`
- [melody-sync-actions.ts](C:\Users\funny\OneDrive\デスクトップ\rust\scorehack\tauri_app\src\app\melody\melody-sync-actions.ts)
  - `createMelodySyncActions(rootStoreToken)`

### 改名したもの
- [melody-focus-sync-actions.ts](C:\Users\funny\OneDrive\デスクトップ\rust\scorehack\tauri_app\src\app\melody\melody-focus-sync-actions.ts)
  - `createMelodyFocusSyncActions(rootStoreToken)`

変更前:
- `melody-focus-factory.ts`
- `createMelodyFocusActions(rootStoreToken)`

変更後:
- file 名にも責務を入れる
- `focus` に加えて `outline / scroll sync` を伴うことを名前で表す

## 現時点の melody 基準形
### token 必要
- 読み取り
  - `createMelodySelectors(rootStoreToken)`
- cursor / track / overlap 同期
  - `createMelodySyncActions(rootStoreToken)`
- focus に伴う sync
  - `createMelodyFocusSyncActions(rootStoreToken)`

### token 不要
- cursor local state
  - [melody-cursor-state.ts](C:\Users\funny\OneDrive\デスクトップ\rust\scorehack\tauri_app\src\app\melody\melody-cursor-state.ts)
- cursor local action
  - [melody-cursor-actions.ts](C:\Users\funny\OneDrive\デスクトップ\rust\scorehack\tauri_app\src\app\melody\melody-cursor-actions.ts)
- pure mutation
  - [melody-mutations.ts](C:\Users\funny\OneDrive\デスクトップ\rust\scorehack\tauri_app\src\app\melody\melody-mutations.ts)
- local track update
  - [melody-track-actions.ts](C:\Users\funny\OneDrive\デスクトップ\rust\scorehack\tauri_app\src\app\melody\melody-track-actions.ts)

## caller の見え方
- business logic は `melody-actions` のような総合箱を開かない
- 必要な責務の factory を直接取る
- token 不要な局所更新は direct call する

## 次の判断
1. この基準形で十分クリアかを一度評価する
2. 問題なければ outline に横展開する
