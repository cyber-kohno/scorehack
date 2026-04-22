# Phase 3: Outline 関連ファイル洗い出し

## 目的
このドキュメントは、Phase 3 で `outline` を新構成へ移していく前提として、現行の outline 関連ファイルと責務を整理するためのものです。

ここでは、まだコードの全面移行は行わず、
- どのファイルが outline に関係するか
- それぞれが UI / 入力 / state / 更新ロジックのどれに当たるか
- どこに横断依存があるか
を明らかにします。

---

## 主要ファイル一覧

### UI
- `tauri_app/src/system/component/outline/OutlineFrame.svelte`
- `tauri_app/src/system/component/outline/ElementCurrentInfo.svelte`
- `tauri_app/src/system/component/outline/ElementListFrame.svelte`
- `tauri_app/src/system/component/outline/element/Element.svelte`
- `tauri_app/src/system/component/outline/element/data/DataInit.svelte`
- `tauri_app/src/system/component/outline/element/data/DataSection.svelte`
- `tauri_app/src/system/component/outline/element/data/DataChord.svelte`
- `tauri_app/src/system/component/outline/element/data/DataModulate.svelte`
- `tauri_app/src/system/component/outline/element/data/DataTempo.svelte`
- `tauri_app/src/system/component/outline/item/ChordSelector.svelte`

### 入力
- `tauri_app/src/system/input/inputOutline.ts`

### state / 型
- `tauri_app/src/system/store/props/storeOutline.ts`
- `tauri_app/src/system/store/props/storeControl.ts`
- `tauri_app/src/system/store/store.ts`

### 更新ロジック
- `tauri_app/src/system/store/reducer/reducerOutline.ts`
- `tauri_app/src/system/store/reducer/reducerCache.ts`
- `tauri_app/src/system/store/reducer/reducerRef.ts`

### 関連が強い周辺
- `tauri_app/src/ui/shell/MainWorkspace.svelte`
- `tauri_app/src/system/component/arrange/ArrangeFrame.svelte`
- `tauri_app/src/system/store/reducer/terminal/sector/builderChord.ts`
- `tauri_app/src/system/store/reducer/terminal/sector/builderSection.ts`
- `tauri_app/src/system/store/reducer/terminal/sector/builderModulate.ts`
- `tauri_app/src/system/util/preview/previewUtil.ts`

---

## 責務の整理

## 1. UI
### `system/component/outline/OutlineFrame.svelte`
責務:
- outline 領域の最上位 UI コンテナ
- current info と list frame を束ねる

特徴:
- 責務は比較的薄い
- UI の入口として新構成へ移しやすい

### `system/component/outline/ElementCurrentInfo.svelte`
責務:
- 現在 focus 中の要素に対応する情報の上部表示
- `cache.elementCaches` と `control.outline.focus` に依存

特徴:
- 見た目の責務は単純
- ただし selector を介さず store と cache を直接参照している

### `system/component/outline/ElementListFrame.svelte`
責務:
- 可視範囲に応じた outline 要素リスト表示
- chord selector の表示制御
- outline スクロール領域の DOM ref を保持

特徴:
- UI でありながら、表示判定・可視範囲計算・ref バインドが混在している
- 最初に `ui` と `state selector` に分けたくなる箇所

### `system/component/outline/element/Element.svelte`
責務:
- 要素 type ごとに描画コンポーネントを切り替える
- focus 状態やレイアウト位置に応じた表示

特徴:
- outline element の表示スイッチャー
- `section / chord / modulate / tempo` の分岐点になっている

### `system/component/outline/element/data/*`
責務:
- 各 outline 要素 type の見た目を描画する

特徴:
- `DataChord.svelte`, `DataModulate.svelte` は cache と theory 依存が強い
- `DataTempo.svelte` は現時点で未完了
- `DataTS.svelte` はまだ存在していない

### `system/component/outline/item/ChordSelector.svelte`
責務:
- hold 操作中の chord selector 表示
- ref と focus 要素位置に依存

特徴:
- outline list と密結合している
- いずれ `overlay / assist-ui` 的に分ける余地がある

---

## 2. 入力
### `system/input/inputOutline.ts`
責務:
- outline mode 中のキーボード入力処理
- 要素追加、削除、移動
- chord degree / beat / eat の変更
- arrange editor / finder の起動
- preview 開始停止
- hold キーに応じた追加操作

特徴:
- outline 入力の中心だが、責務がかなり広い
- `reducerOutline`, `reducerCache`, `reducerRef`, `PreviewUtil`, `Arrange input` に横断依存している
- Phase 3 では全面分解より、まず入口を `app/outline` に作る方が安全

---

## 3. state / 型
### `system/store/props/storeOutline.ts`
責務:
- outline control state の型
- outline element 型
- init / section / chord / modulate / tempo / ts のデータ型
- 初期要素生成

特徴:
- `control state` と `domain element 型` が同居している
- 将来的には少なくとも以下に分けたい
  - outline UI control state
  - outline element domain type
  - outline 初期データ生成
- `DommVals` のような型の粗い箇所が残っている

---

## 4. 更新ロジック
### `system/store/reducer/reducerOutline.ts`
責務:
- focus 移動
- section 移動
- 要素追加・削除
- chord data 更新
- arrange editor / finder のオープン
- melody note から chord focus へ同期

特徴:
- outline の reducer 相当ロジックがまとまっている
- 一方で arrange の生成や track relation 更新まで持っており、純粋な outline 更新だけではない
- そのまま `app/outline` に移すには大きく、段階的な入口分離が必要

### `system/store/reducer/reducerCache.ts`
責務:
- outline element cache, chord cache などの再計算

特徴:
- outline 表示と入力のたびに強く依存する
- outline 単体で切り出すのは難しいため、Phase 3 では依存先として扱う

### `system/store/reducer/reducerRef.ts`
責務:
- grid / outline スクロール位置調整

特徴:
- outline 入力後の副作用として頻出
- state 更新とは分けて扱う必要がある

---

## 横断依存の要点
outline は以下にまたがっています。

- `control.outline.focus`
- `cache.elementCaches`
- `cache.chordCaches`
- `ref.outline`
- `data.elements`
- `data.arrange.tracks`
- `preview`

そのため、outline は UI だけ移せば終わる構造ではありません。

特に以下の依存が強いです。
- focus と element cache の対応
- chord 要素削除時の arrange relation 更新
- chord 選択と timeline / preview の同期
- hold 入力と chord selector 表示の連動

---

## 現時点での判断
### 先に移しやすいもの
- `OutlineFrame.svelte`
- `ElementCurrentInfo.svelte`
- `ElementListFrame.svelte` の UI 入口
- `Element.svelte` の type 分岐入口

### 分割前提で移すもの
- `inputOutline.ts`
- `storeOutline.ts`
- `reducerOutline.ts`

### 今回は依存先として扱うもの
- `reducerCache.ts`
- `reducerRef.ts`
- `previewUtil.ts`
- arrange 系処理

---

## Phase 3 の第一歩として妥当な進め方
1. `src/ui/outline` に UI 入口を作る
2. `MainWorkspace.svelte` の参照先を新入口へ切り替える
3. outline 用 selector を追加して、UI の直接 store 参照を少しずつ減らす
4. その後に `inputOutline.ts` の入口を `app/outline` に作る

この順番なら、既存動作を大きく壊さずに進めやすいです。
