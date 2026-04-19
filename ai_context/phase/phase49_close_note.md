# Phase 49 完了メモ

## 完了内容
- root store から `ref` slice を完全に削除した
- `store-boundaries` を現状構成に合わせて更新した
- 検証を通して、既存 warning 以外の問題がないことを確認した

## 到達点
root store から外れた slice は以下になった。
- `fileHandle`
- `terminal`
- `env`
- `preview`
- `ref`

ここまでで、root store の責務はかなり軽くなっている。

## 次の候補
- `control`
- `input`
- `data`
- `cache`

のどれを次の主要整理対象にするかを再評価する。
