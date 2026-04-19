# Phase 51 クローズノート

## 到達点
- `control` の subgroup を `mode / outline / melody` に整理した
- 最初の dedicated 化対象として `mode` を切り出した
- root store の `control` から `mode` を削除した
- `mode` 読み取りは dedicated store 経由に統一した

## 意味合い
今回の整理で、`control` はいきなり一括分離する対象ではなく、
- 横断的で軽い `mode`
- reducer 依存の強い `outline control`
- note editing と密結合な `melody control`
に分けて段階的に外すべき、という見通しがコード上でも明確になった。

## 次にやること
- `outline control` の read / write inventory を作る
- `arrange` を含む outline open state と focus state を subgroup として整理する
- 最初に dedicated 化しやすい下位面を選ぶ
