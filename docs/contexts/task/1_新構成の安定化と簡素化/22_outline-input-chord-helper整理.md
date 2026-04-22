# outline-input chord helper の整理

## 目的
`outline-input.ts` に残っていた chord data 変更系を helper 化し、`control` / hold callback の見通しを良くする。

## 今回切り出したもの
- `setOutlineChordDegreeFromScaleIndex()`
- `modOutlineChordSymbol()`
- `modOutlineChordKey()`
- `modOutlineChordBeat()`
- `modOutlineChordEat()`

配置:
- [outline-input-chord-actions.ts](C:\Users\funny\OneDrive\デスクトップ\rust\scorehack\tauri_app\src\app\outline\outline-input-chord-actions.ts)

## 対応した箇所

### `control`
- `1` 〜 `7` による degree 設定

### hold callback
- `holdC`: symbol 変更
- `holdF`: key / beat 変更
- `holdG`: eat 変更

## 整理の意味
これまでは `outline-input.ts` の中で、
- diatonic degree の組み立て
- symbol の上下左右変化
- key 変更
- beat / eat の増減

が直接書かれていた。

今回 helper 化したことで、
- `outline-input.ts` は「どの入力でどの chord 変更をするか」
- helper 側は「その chord data をどう変更するか」

に分けて読めるようになった。

## 今の見立て
`outline-input.ts` はかなり
- 入力分岐
- commit / recalculate パターン
- arrange 入口

中心の形に近づいている。

残っている主な論点は、
- `recalculate + commit` のパターンをどこまで helper に寄せるか
- hold callback 全体をさらに subgroup 単位で薄くするか

の 2 つ。

## おすすめの次の一手
- ここで一度 `outline-input.ts` 全体の残責務を再評価する

理由:
- 大きな塊はかなり切り出せている
- 次は無理に helper を増やすより、`outline-input` をこれ以上薄くする価値が本当にあるかを見極めたい
