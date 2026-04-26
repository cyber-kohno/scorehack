# melody 更新責務棚卸し

## 目的
- `commit()` の全 store touch に依存している箇所を見つける
- melody の主要操作ごとに、実際に変わる state を明示する
- selective update の最初の候補を選ぶ

## 主要 state
### melody 系
- `scoreTracks`
- `melodyCursor`
- `melodyFocus`
- `melodyOverlap`
- `melodyClipboard`
- `melodyTrackIndex`

### 他 feature 連携
- `outlineFocus / outline chord sync`
- `timeline scroll ref`
- `playback session`

## 操作ごとの更新対象
### cursor 移動
- 変更:
  - `melodyCursor`
  - `melodyOverlap`
- 付随:
  - outline chord sync
  - outline scroll
  - timeline scroll

### cursor div 変更
- 変更:
  - `melodyCursor`
  - `melodyOverlap`

### cursor から note 追加
- 変更:
  - `scoreTracks`
  - `melodyFocus`
- 付随:
  - preview 発音

### focus note pitch 変更
- 変更:
  - `scoreTracks`
- 付随:
  - timeline Y scroll
  - preview 発音

### focus 移動
- 変更:
  - `melodyFocus`
- 付随:
  - outline chord sync
  - timeline X/Y scroll
  - preview 発音

### focus note 削除
- 変更:
  - `scoreTracks`
  - `melodyCursor`
  - `melodyFocus`
  - `melodyOverlap`

### focus note 末尾追加
- 変更:
  - `scoreTracks`
  - `melodyFocus`
- 付随:
  - outline chord sync
  - timeline X scroll
  - preview 発音

### focus range pitch 変更
- 変更:
  - `scoreTracks`
- 付随:
  - timeline Y scroll

### focus in / focus out
- 変更:
  - `melodyFocus`
  - 一部 `melodyCursor`
- 付随:
  - outline chord sync
  - timeline scroll

### note length 変更
- 変更:
  - `scoreTracks`
- 付随:
  - timeline X scroll

### horizontal note 移動
- 変更:
  - `scoreTracks`
- 付随:
  - outline chord sync
  - outline scroll
  - timeline X scroll

### cursor space 移動
- 変更:
  - `scoreTracks`
- 付随:
  - なし

### clipboard copy
- 変更:
  - `melodyClipboard`
  - `melodyFocus`

### clipboard paste
- 変更:
  - `scoreTracks`
  - `melodyFocus`
  - `melodyClipboard`

### track 切替
- 変更:
  - `melodyTrackIndex`
  - `melodyCursor`
  - `melodyFocus`

## 見えていること
- `commit()` に頼らずに見ると、操作ごとに更新対象はかなり違う
- 特に `scoreTracks` だけ変わる操作と、
  `cursor / focus / overlap` まで変わる操作は分けて考えられる
- `scroll` や `preview` は state touch ではなく side effect として分けて考える方がよい

## 最初の selective update 候補
### 候補A. clipboard copy
- 更新対象が小さい
  - `melodyClipboard`
  - `melodyFocus`
- `scoreTracks` や `cursor` を触らない

### 候補B. cursor div 変更
- 更新対象が比較的小さい
  - `melodyCursor`
  - `melodyOverlap`
- side effect が少ない

### 候補C. focus 単純移動
- 更新対象は小さい
  - `melodyFocus`
- ただし scroll / outline sync が付くので候補A/Bより一段重い

## 現時点のおすすめ
- 最初は **clipboard copy** か **cursor div 変更** が安全
- どちらも `commit()` 全 touch を外した時の影響範囲が狭い
