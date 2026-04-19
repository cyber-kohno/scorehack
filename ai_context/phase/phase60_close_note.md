# Phase 60 クローズノート

## 完了したこと
- `inputMelody.ts` の cursor 参照を helper 経由へ整理した
- `previewUtil.ts` の cursor 参照も helper 経由へ整理した
- `control.melody.cursor` の direct caller を `melody-cursor-state.ts` に集約した
- check / build / cargo check を通した

## 判断
- `cursor` は melody 編集の中心状態であり、reducer / input / preview / UI の基準点として使われる
- ただし direct caller はもう helper に集約されているため、現段階では dedicated store にしなくても十分に安全
- したがって、ここでは `helper 境界で止める` を採用する

## 今の到達点
- `melody control` は root store に `cursor` のみを残す状態まで整理できた
- その `cursor` も app helper 経由で触る構図になった

## 次の自然な対象
- root store 残件の再評価
- `data / cache / control(cursor)` のどこを次の主要対象にするか判断
