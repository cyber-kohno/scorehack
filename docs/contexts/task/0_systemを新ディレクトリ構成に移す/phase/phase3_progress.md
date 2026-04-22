# Phase 3 進捗

## 概要
このファイルは `phase3_plan.md` に対する実施状況を記録するための進捗ログです。

関連ドキュメント:
- `ai_context/phase/phase3_outline_inventory.md`
- `ai_context/phase/phase3_outline_migration_map.md`
- `ai_context/phase/phase3_outline_tempo_ts_notes.md`

---

## 現在の進捗状況
- [x] 1. outline 関連ファイルの洗い出しを行う
- [x] 2. その結果をもとに Phase 3 の移行マップを作る
- [x] 3. `ui/outline` の入口整理に着手する
- [x] 4. outline selector / updater を追加する
- [x] 5. outline input の入口整理に着手する
- [x] 6. outline domain の一部切り出しを行う
- [x] 7. `outline-actions.ts` を作り、`reducerOutline.ts` の入口を `app/outline` 側へ寄せる
- [x] 8. 動作確認と進捗更新を行う

---

## 1. outline 関連ファイルの洗い出しを行う

### 実施内容
- `tauri_app/src/system/component/outline/*` を走査し、outline UI の構成要素を確認
- `tauri_app/src/system/input/inputOutline.ts` を確認し、outline 入力の責務を整理
- `tauri_app/src/system/store/props/storeOutline.ts` を確認し、outline 型と state の責務を整理
- `tauri_app/src/system/store/reducer/reducerOutline.ts` を確認し、更新ロジックの責務を整理
- `tauri_app/src/ui/shell/MainWorkspace.svelte` がまだ旧 `OutlineFrame.svelte` を参照していることを確認

### 成果物
- `ai_context/phase/phase3_outline_inventory.md`

### メモ
- outline は単なる UI ではなく、`cache`, `control`, `ref`, `arrange` に横断依存している
- `tempo` と `ts` は型上は存在するが、UI と操作は未完了の部分がある
- 最初の移行は UI 入口から始め、内部依存は bridge 的に段階移行するのが安全

---

## 2. その結果をもとに Phase 3 の移行マップを作る

### 実施内容
- outline 関連ファイルを `ui / app / state / domain / 保留` に分類
- 各ファイルについて、`そのまま移す / 分割して移す / 当面残す` を整理
- 最初に着手しやすい順番を決定

### 成果物
- `ai_context/phase/phase3_outline_migration_map.md`

### メモ
- 最初の実装対象は `OutlineFrame`, `ElementCurrentInfo`, `ElementListFrame`, `Element.svelte` 系
- `inputOutline.ts` と `reducerOutline.ts` は入口と selector/updater を切ってから分離する
- `storeOutline.ts` は一度に全面移設せず、型と control state を分けながら進めるのが安全

---

## 3. `ui/outline` の入口整理に着手する

### 新しく作成したファイル
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

### 実施内容
- `MainWorkspace.svelte` の outline 参照先を旧 `system/component/outline/OutlineFrame.svelte` から新 `ui/outline/OutlineFrame.svelte` に切り替え
- `ui/outline` 以下に、新構成での outline UI 入口を作成
- `OutlineFrame -> ElementCurrentInfo / ElementList -> OutlineElement` という新しい入口階層を作成
- 内部の詳細な描画要素は、まずは legacy component を包む形にして段階移行可能な状態にした
- `ElementList.svelte` と `OutlineElement.svelte` は新配置側に実装を持たせつつ、要素描画の細部は既存コンポーネントを利用する構成にした

### 確認結果
- `npm run check` 成功
- `npm run build` 成功
- `cargo check` 成功

### メモ
- この段階では見た目や挙動の変更は意図的に行っていない
- `DataTempo.svelte` の未完了 warning など、既存 warning は継続している

---

## 4. outline selector / updater を追加する

### 新しく作成したファイル
- `tauri_app/src/state/ui-state/outline-ui-store.ts`

### 実施内容
- outline header 表示用の selector を追加
- 可視要素リスト算出用の selector を追加
- chord selector 表示判定用の selector を追加
- outline tail position 参照を selector 化
- `ui/outline/ElementCurrentInfo.svelte` を legacy component 依存から外し、selector ベースの実装へ置き換え
- `ui/outline/ElementList.svelte` の可視要素計算と chord selector 表示判定を selector 経由へ変更

### 確認結果
- `npm run check` 成功
- `npm run build` 成功
- `cargo check` 成功

### メモ
- まだ `bind:this={$store.ref.outline}` のような ref バインドは直接 store を触っている
- まずは読み取り側の依存を減らすことを優先した

---

## 5. outline input の入口整理に着手する

### 新しく作成したファイル
- `tauri_app/src/app/outline/outline-input-router.ts`

### 実施内容
- `app/outline` 側に outline 入力の新しい入口を追加
- 現段階では安全性を優先し、内部では既存 `system/input/inputOutline.ts` を利用する wrapper 構成にした
- `keyboard-router.ts` から旧 `useInputOutline` への直接依存を外し、新しい `createOutlineInputRouter` 経由へ変更

### 確認結果
- `npm run check` 成功
- `npm run build` 成功
- `cargo check` 成功

### メモ
- この段階では入力仕様や挙動は変更していない
- 次に `inputOutline.ts` を本格分解する際の差し替え地点を `app/outline` 側へ確保できた

---

## 6. outline domain の一部切り出しを行う

### 新しく作成したファイル
- `tauri_app/src/domain/outline/outline-types.ts`
- `tauri_app/src/domain/outline/create-initial-outline-elements.ts`

### 実施内容
- outline element 型、`init / section / chord / modulate / tempo / ts` の型、定数群を `domain/outline` へ移設
- 初期 outline 要素生成を `create-initial-outline-elements.ts` に移設
- `system/store/props/storeOutline.ts` は、outline control state を持ちつつ、domain 側の型と初期生成を再公開する互換レイヤーへ整理

### メモ
- 既存の import 参照範囲が広いため、この段階では `StoreOutline` 自体は残している
- まずは domain 側に本体を置き、既存コードは `StoreOutline` 経由でも動く状態を維持している
- 次の段階で、参照先を少しずつ `domain/outline` へ直接寄せていける状態になった

---

## 7. `outline-actions.ts` を作り、`reducerOutline.ts` の入口を `app/outline` 側へ寄せる

### 新しく作成したファイル
- `tauri_app/src/app/outline/outline-actions.ts`

### 実施内容
- `app/outline` 側に outline action の入口を追加
- 現段階では `reducerOutline.ts` の本体をそのまま利用する wrapper 構成にした
- `system/input/inputOutline.ts` からの `reducerOutline.ts` 直接依存を外し、`createOutlineActions()` 経由へ変更
- `system/input/inputMelody.ts` でも `createOutlineActions()` を利用するよう変更
- `system/input/arrange/inputPianoEditor.ts` でも `createOutlineActions()` を利用するよう変更
- `system/store/reducer/reducerMelody.ts` でも `createOutlineActions()` を利用するよう変更
- terminal builder のうち `builderHarmonize.ts`, `builderInit.ts`, `builderModulate.ts`, `builderSection.ts` でも `createOutlineActions()` を利用するよう変更

### メモ
- `melody`, `arrange`, terminal builder の主要利用側まで入口差し替えを広げた
- terminal builder の一部や legacy component はまだ旧 `reducerOutline.ts` を直接参照している箇所が残るが、outline 操作の主要入口はかなり `app/outline` 側へ寄せられた

---

## 8. 動作確認と進捗更新を行う

### 確認結果
- `npm run check` 成功
- `npm run build` 成功
- `cargo check` 成功

### 補足
- 途中で `reducerMelody.ts` の import パス誤りにより `build` が一度失敗したが、修正後に再実行して成功
- 途中で `builderHarmonize.ts` の壊れた文字列リテラルが表面化したため、`item.isMute ? "on" : ""` に最小修正して再実行し、成功
- 途中で `reducerOutline.ts` の壊れた `throw new Error(...)` 文字列が表面化したため、エラーメッセージを最小修正して再実行し、成功
- `build` 時の既存 warning は継続

---

## 追加で進めた整理

### `ui/outline` 側の型参照を `domain/outline` へ寄せる
#### 変更したファイル
- `tauri_app/src/ui/outline/outline-elements/OutlineInitElement.svelte`
- `tauri_app/src/ui/outline/outline-elements/OutlineSectionElement.svelte`
- `tauri_app/src/ui/outline/outline-elements/OutlineChordElement.svelte`
- `tauri_app/src/ui/outline/outline-elements/OutlineModulateElement.svelte`
- `tauri_app/src/ui/outline/outline-elements/OutlineTempoElement.svelte`
- `tauri_app/src/state/ui-state/outline-ui-store.ts`
- `tauri_app/src/system/component/outline/element/data/DataInit.svelte`
- `tauri_app/src/system/component/outline/element/data/DataSection.svelte`
- `tauri_app/src/system/component/outline/element/data/DataChord.svelte`
- `tauri_app/src/system/component/outline/element/data/DataModulate.svelte`
- `tauri_app/src/system/component/outline/element/data/DataTempo.svelte`
- `tauri_app/src/system/component/outline/item/ChordSelector.svelte`
- `tauri_app/src/system/component/outline/ElementListFrame.svelte`
- `tauri_app/src/system/store/reducer/terminal/commandRegistUtil.ts`
- `tauri_app/src/system/store/reducer/terminal/sector/builderModulate.ts`
- `tauri_app/src/system/store/reducer/reducerCache.ts`
- `tauri_app/src/system/store/reducer/reducerOutline.ts`

#### 実施内容
- `ui/outline` の element wrapper 群の型参照を `StoreOutline` から `domain/outline/outline-types.ts` へ切り替え
- `outline-ui-store.ts` の chord data 型参照も `domain/outline` へ切り替え
- legacy outline component 本体でも、段階的に `domain/outline` の型を使うよう変更
- terminal command 登録や modulate builder でも、outline element 型や定数の参照を `domain/outline` へ寄せた
- `reducerCache.ts` でも `StoreOutline` 依存を外し、outline 型と定数を `domain/outline` から参照するよう変更
- `reducerOutline.ts` でも outline data 型を `domain/outline` から参照するよう変更

#### メモ
- `StoreOutline` は control state 互換レイヤーとして残しつつ、型本体は `domain/outline` 側へかなり移った
- 現時点で `StoreOutline` / `reducerOutline` が強く残っている中心は `reducerOutline.ts` 本体そのものではなく、outline control state の互換レイヤー寄りの役割になってきている

---

## `tempo / ts` 現状メモ
- `ai_context/phase/phase3_outline_tempo_ts_notes.md` を追加
- `tempo` は型と cache 側の器はあるが UI 未完了
- `ts` は型はあるが UI / 入力 / cache の実装がほぼ未着手
- 次段階では `tempo` を先に完成対象にするのが現実的

---

## 次の候補
1. `tempo / ts` を含めた outline element の扱い整理と、未完了要素の方針決め
2. Phase 3 を一度締めて、次に `terminal` か `melody` のどちらを先に移すか決める
3. `StoreOutline` の control state 側をどこまで独立させるか検討する
