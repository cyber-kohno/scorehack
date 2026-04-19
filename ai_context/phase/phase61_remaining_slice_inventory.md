# Phase 61 残存 slice 棚卸し

## 対象
- `control.melody.cursor`
- `data`
- `cache`

## 現状
root store に残っている主要状態は、実質この 3 つだけになっている。

## `control.melody.cursor`

### 状態
- root store 内には残っている
- ただし direct caller は helper に集約済み

### 境界
- 読み書き入口
  - [melody-cursor-state.ts](C:\Users\funny\OneDrive\デスクトップ\rust\scorehack\tauri_app\src\app\melody\melody-cursor-state.ts)

### 評価
- feature 境界はかなり整理済み
- 直ちに dedicated store 化しなくても、影響範囲は追いやすい
- 現時点では「root に残っていること」自体の痛みは小さい

## `data`

### 状態
- project 本体として root store に残っている
- `elements / scoreTracks / audioTracks / arrange` を含む

### 境界
- 読み書き入口
  - [project-data-store.ts](C:\Users\funny\OneDrive\デスクトップ\rust\scorehack\tauri_app\src\state\project-data\project-data-store.ts)
  - [project-data-actions.ts](C:\Users\funny\OneDrive\デスクトップ\rust\scorehack\tauri_app\src\app\project-data\project-data-actions.ts)
- subgroup helper
  - [outline-project-data.ts](C:\Users\funny\OneDrive\デスクトップ\rust\scorehack\tauri_app\src\state\project-data\outline-project-data.ts)
  - [melody-project-data.ts](C:\Users\funny\OneDrive\デスクトップ\rust\scorehack\tauri_app\src\state\project-data\melody-project-data.ts)
  - [arrange-project-data.ts](C:\Users\funny\OneDrive\デスクトップ\rust\scorehack\tauri_app\src\state\project-data\arrange-project-data.ts)
  - [audio-project-data.ts](C:\Users\funny\OneDrive\デスクトップ\rust\scorehack\tauri_app\src\state\project-data\audio-project-data.ts)

### 評価
- 専用入口はかなり揃っている
- まだ一部の reducer / input / builder が `lastStore.data` を直接見る
- ただし root から外すための準備は、`cache` より先に進んでいる

## `cache`

### 状態
- 派生 state として root store に残っている
- `baseCaches / chordCaches / elementCaches / outlineTailPos` を持つ

### 境界
- 読み取り入口
  - [cache-store.ts](C:\Users\funny\OneDrive\デスクトップ\rust\scorehack\tauri_app\src\state\cache-state\cache-store.ts)
- 再計算本体
  - [recalculate-cache.ts](C:\Users\funny\OneDrive\デスクトップ\rust\scorehack\tauri_app\src\state\cache-state\recalculate-cache.ts)
- action 入口
  - [cache-actions.ts](C:\Users\funny\OneDrive\デスクトップ\rust\scorehack\tauri_app\src\app\cache\cache-actions.ts)

### 評価
- read helper と recalculation entry はかなり整理済み
- ただし `cache` は `data + env + theory` に強く依存する
- `data` を動かさずに `cache` だけ物理分離すると、再計算契機の扱いが先に難しくなる

## まとめ
- `cursor` は helper 境界で十分安定
- `cache` は入口整理は進んでいるが、今すぐ物理分離するには依存が重い
- 次に主要対象として進めるなら `data` が最も筋がよい
