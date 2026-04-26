# 3_selectorとUI接続の再設計

このタスクでは、`createMelodySelectors` を練習台にして、参照系ユーティリティの在り方を再設計する。

今回の範囲は `melody` の selector に限定する。
`outline` などへの横展開はこのタスクでは行わない。

目的は次の 2 点。

1. `createMelodySelectors` が `RootStoreToken` に依存しているように見えながら、実際には末端で dedicated store を直接読んでいる不整合を解消する
2. selector の caller が、必要な最新値を明示的に渡して再評価される形へ寄せる

完了条件は次の通り。

1. `createMelodySelectors` の再設計が完了している
2. caller 側の接続が新設計に追従している
3. 現行動作を維持したまま `npm run check` / `npm run build` / `cargo check` が通る
