# Phase 3 締めメモ

## 結論
Phase 3 はここで一度完了扱いとする。

## この時点で整理できたこと
- outline UI の入口が `ui/outline` に作られた
- outline selector が `state/ui-state` に作られた
- outline input / action の入口が `app/outline` に作られた
- outline element 型と初期データ生成が `domain/outline` に移った
- `StoreOutline` は control state 互換レイヤー寄りの位置づけになった
- `tempo / ts` は outline の時間軸要素として扱う方針を固定した

## まだ残っているもの
- `tempo` の UI 完成
- `ts` の UI / cache / timeline 反映
- terminal / melody など他機能の本格移行

## 次フェーズ
- Phase 4 では terminal を先に整理する
