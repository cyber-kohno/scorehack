# Phase 62 進捗

## 現在の状況
`data` を次の主要対象として進めている。

## チェックリスト
- [x] 1. `data` 直参照の再棚卸し
- [x] 2. subgroup ごとの分類
- [x] 3. 最初の dedicated 化候補の決定
- [x] 4. caller の入口整理

## 今回の結果
- `audioTracks` を dedicated store に移し、root `data` から外した
- `arrange` を dedicated store に移し、root `data` から外した
- `scoreTracks` を dedicated store に移し、root `data` から外した
- `elements` を dedicated store に移し、root `data` から外した
- `project-data-store` は save/load 用の組み立て面として機能する形に更新した
- `data` slice 自体を root store から削除した
- root store に残る主要 slice は `control` と `cache`
