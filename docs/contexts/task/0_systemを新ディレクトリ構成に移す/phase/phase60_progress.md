# Phase 60 進捗

## 現在の状況
`inputMelody.ts` と `previewUtil.ts` に残っていた cursor 参照を helper surface 経由へ整理した。

## チェックリスト
- [x] 1. `inputMelody.ts` の cursor 参照整理
- [x] 2. `previewUtil.ts` の cursor 参照整理
- [x] 3. dedicated 化可否の判断
- [x] 4. 検証

## 補足
- `control.melody.cursor` の direct caller は `melody-cursor-state.ts` のみ
- この段階で dedicated 化に進まなくても、境界としては十分に説明可能な状態になった
