# Phase 60 計画

## 目的
`melody cursor` の残る caller を helper surface 経由へ寄せて、最終的に dedicated 化するかどうかを判断できる状態にする。

## 方針
- `inputMelody.ts` の cursor read/write を helper 経由へ整理する
- `previewUtil.ts` の cursor 参照も helper 経由へ寄せる
- dedicated store 化は、その後の caller 面積を見て判断する

## ゴール
1. `inputMelody.ts` の cursor 参照整理
2. `previewUtil.ts` の cursor 参照整理
3. dedicated 化可否の判断
4. check / build / cargo check を通す
