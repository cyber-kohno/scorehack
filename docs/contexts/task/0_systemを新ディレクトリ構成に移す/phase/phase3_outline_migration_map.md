# Phase 3: Outline 移行マップ

## 目的
このドキュメントは、現行 outline 関連ファイルを新構成のどこへ移す想定かを整理するための移行マップです。

ここでの目的は、今すぐすべてを移すことではなく、
- どのファイルを先に触るべきか
- どれはそのまま移せるか
- どれは分割が必要か
を明確にすることです。

---

## 移行方針の要約
Phase 3 では outline を以下のレイヤに分けて扱います。

- `ui/outline`
  - 見た目
  - outline 領域の構成
  - element の描画
- `app/outline`
  - 入力の入口
  - action / reducer 相当の入口
- `state/ui-state`, `state/session-state`
  - focus, selector, 表示判定, 一時状態
- `domain/outline`
  - outline 要素型
  - 純粋ロジック
- 旧 `system/*`
  - 段階移行中の依存先として暫定維持

---

## ファイル対応表

| 現行ファイル | 想定移行先 | 扱い | 理由 |
| --- | --- | --- | --- |
| `tauri_app/src/system/component/outline/OutlineFrame.svelte` | `tauri_app/src/ui/outline/OutlineFrame.svelte` | そのまま移しやすい | outline UI の最上位コンテナで責務が薄い |
| `tauri_app/src/system/component/outline/ElementCurrentInfo.svelte` | `tauri_app/src/ui/outline/ElementCurrentInfo.svelte` | そのまま移しやすい | 表示責務中心。ただし selector 化は必要 |
| `tauri_app/src/system/component/outline/ElementListFrame.svelte` | `tauri_app/src/ui/outline/ElementList.svelte` | 分割して移す | 可視範囲判定、ref、selector 表示が混在している |
| `tauri_app/src/system/component/outline/element/Element.svelte` | `tauri_app/src/ui/outline/outline-elements/OutlineElement.svelte` | そのまま移しやすい | type ごとの表示スイッチャーとして明快 |
| `tauri_app/src/system/component/outline/element/data/DataInit.svelte` | `tauri_app/src/ui/outline/outline-elements/OutlineInitElement.svelte` | そのまま移しやすい | 表示責務が中心 |
| `tauri_app/src/system/component/outline/element/data/DataSection.svelte` | `tauri_app/src/ui/outline/outline-elements/OutlineSectionElement.svelte` | そのまま移しやすい | 表示責務が中心 |
| `tauri_app/src/system/component/outline/element/data/DataChord.svelte` | `tauri_app/src/ui/outline/outline-elements/OutlineChordElement.svelte` | 分割して移す | cache と theory 依存が強いため selector を切りたい |
| `tauri_app/src/system/component/outline/element/data/DataModulate.svelte` | `tauri_app/src/ui/outline/outline-elements/OutlineModulateElement.svelte` | 分割して移す | cache と theory 依存がある |
| `tauri_app/src/system/component/outline/element/data/DataTempo.svelte` | `tauri_app/src/ui/outline/outline-elements/OutlineTempoElement.svelte` | 保留しつつ移す | UI 未完了だが置き場は先に作れる |
| `tauri_app/src/system/component/outline/item/ChordSelector.svelte` | `tauri_app/src/ui/outline/ChordSelectorOverlay.svelte` | 分割して移す | overlay 的責務として独立させたい |
| `tauri_app/src/system/input/inputOutline.ts` | `tauri_app/src/app/outline/outline-input-router.ts` | 分割して移す | 入力入口として再配置し、内部で既存処理を段階利用する |
| `tauri_app/src/system/store/reducer/reducerOutline.ts` | `tauri_app/src/app/outline/outline-actions.ts` | 分割して移す | reducer と arrange 副作用が混在している |
| `tauri_app/src/system/store/props/storeOutline.ts` | `tauri_app/src/domain/outline/outline-types.ts` + `tauri_app/src/state/ui-state/outline-ui-store.ts` | 分割して移す | control state と domain type を分ける必要がある |
| `tauri_app/src/system/store/reducer/reducerCache.ts` | 当面維持 | 今回は残す | outline 単体では分離コストが高い |
| `tauri_app/src/system/store/reducer/reducerRef.ts` | 当面維持 | 今回は残す | 副作用処理として別タイミングで整理したい |
| `tauri_app/src/system/util/preview/previewUtil.ts` | 当面維持 | 今回は残す | outline 単独の責務ではない |

---

## 最初に着手する単位
### 第1段階: UI 入口の移動
対象:
- `OutlineFrame.svelte`
- `ElementCurrentInfo.svelte`
- `ElementListFrame.svelte`
- `Element.svelte`

狙い:
- `MainWorkspace.svelte` から見た outline の入口を新構成へ移す
- 実際の内部依存はまだ旧ファイルに残っていてもよい

### 第2段階: selector / updater の導入
対象:
- focus 参照
- 現在要素参照
- chord selector 表示判定
- arrange open 状態判定

狙い:
- outline UI が直接巨大 store を読む箇所を減らす

### 第3段階: 入力入口の移動
対象:
- `inputOutline.ts`

狙い:
- `app/outline` に outline 入力の入口を作る
- いきなり完全分解せず、最初は wrapper でもよい

### 第4段階: 型と action の整理
対象:
- `storeOutline.ts`
- `reducerOutline.ts`

狙い:
- 型定義と更新ロジックの責務を分ける
- `tempo / ts` を今後拡張しやすい形へ寄せる

---

## Phase 3 で新規作成する可能性が高いファイル
- `tauri_app/src/ui/outline/OutlineFrame.svelte`
- `tauri_app/src/ui/outline/ElementCurrentInfo.svelte`
- `tauri_app/src/ui/outline/ElementList.svelte`
- `tauri_app/src/ui/outline/ChordSelectorOverlay.svelte`
- `tauri_app/src/ui/outline/outline-elements/OutlineElement.svelte`
- `tauri_app/src/ui/outline/outline-elements/OutlineInitElement.svelte`
- `tauri_app/src/ui/outline/outline-elements/OutlineSectionElement.svelte`
- `tauri_app/src/ui/outline/outline-elements/OutlineChordElement.svelte`
- `tauri_app/src/ui/outline/outline-elements/OutlineModulateElement.svelte`
- `tauri_app/src/ui/outline/outline-elements/OutlineTempoElement.svelte`
- `tauri_app/src/app/outline/outline-input-router.ts`
- `tauri_app/src/app/outline/outline-actions.ts`
- `tauri_app/src/state/ui-state/outline-ui-store.ts`
- `tauri_app/src/state/session-state/outline-session.ts`
- `tauri_app/src/domain/outline/outline-types.ts`
- `tauri_app/src/domain/outline/create-initial-outline-elements.ts`

---

## 今回はまだ触らない前提のもの
- terminal コマンド経由の outline 編集処理
- arrange 系から見た outline 依存
- preview 中の outline focus 同期処理
- timeline 側から見た outline/chord 連携

これらは outline の入口整理後に、依存先として扱いながら順番に切り分ける方が安全です。

---

## 推奨実装順
1. `src/ui/outline/OutlineFrame.svelte` を作る
2. `MainWorkspace.svelte` の参照先を新 outline 入口へ切り替える
3. `src/ui/outline` に current info / list / element を寄せる
4. `outline-ui-store.ts` を作る
5. `inputOutline.ts` の入口 wrapper を `app/outline` に作る
6. その後で `storeOutline.ts` と `reducerOutline.ts` の分割に入る

この順なら、見通しを作りながら壊しにくく進められます。
