# Phase 2 計画

## 目的

Phase 2 は、`tauri_app` の新構成に対して、
`shell` と `基本 state` の整理を進めるフェーズである。

Phase 1 で

- `musicTheory`
- `layout`
- `disignInitializer`
- `storeFile`
- `fileUtil`

を切り出したので、Phase 2 では
アプリ全体の起動導線と状態の持ち方を整理する。

---

## Phase 2 の狙い

このフェーズで達成したいことは次の通り。

1. 起動処理を `Entry.svelte` から分離する
2. レイアウト責務を `MainFrame.svelte` から `ui/shell` へ寄せる
3. `inputRoot.ts` と `reducerRoot.ts` を `app/shell` に寄せる
4. 巨大 store をすぐ分割しないまま、分割しやすい境界を作る
5. `shell` まわりの責務を新構成で説明できる状態にする

---

## 対象

Phase 2 の対象は以下。

1. `refer_app/src/Entry.svelte`
2. `refer_app/src/system/MainFrame.svelte`
3. `refer_app/src/system/component/header/RootHeader.svelte`
4. `refer_app/src/system/component/header/ModeSwitch.svelte`
5. `refer_app/src/system/input/inputRoot.ts`
6. `refer_app/src/system/store/reducer/reducerRoot.ts`
7. `refer_app/src/system/store/store.ts`
8. `refer_app/src/system/store/contextUtil.ts`

`tauri_app` では現在、対応する実装がまだ `src/system` 側に残っているため、
このフェーズで新構成側へ移行する。

---

## 対象ごとの移行方針

## 1. Entry.svelte

### 現行

- `tauri_app/src/Entry.svelte`

### 移行先

- `tauri_app/src/App.svelte`
- `tauri_app/src/app/bootstrap/initialize-app.ts`
- `tauri_app/src/app/bootstrap/bind-global-keyboard.ts`

### 方針

- `Entry.svelte` に集中している責務を分離する
- Svelte コンポーネントには描画と最低限の起動フックだけ残す
- 初期化処理は `initialize-app.ts`
- グローバルキーボード登録は `bind-global-keyboard.ts`

### この段階でやること

- `App.svelte` を正式なアプリ入口にする
- `Entry.svelte` の責務を分解する
- `main.ts` の import 先を必要に応じて更新する

### 完了条件

- 起動時の初期化処理が `app/bootstrap` にある
- キーボード登録が `app/bootstrap` にある
- `Entry.svelte` 依存がなくなるか、薄い互換層になる

---

## 2. MainFrame.svelte

### 現行

- `tauri_app/src/system/MainFrame.svelte`

### 移行先

- `tauri_app/src/ui/shell/RootLayout.svelte`
- 必要に応じて `tauri_app/src/ui/shell/MainWorkspace.svelte`

### 方針

- レイアウト責務だけを抽出する
- arrange / terminal の条件分岐も、できる範囲で `shell` 側へまとめる
- UI の外枠と中身の責務を分ける

### この段階でやること

- `RootLayout.svelte` を新しい全体フレームにする
- `MainFrame.svelte` からレイアウト定義を移す
- `system/MainFrame.svelte` を不要化する

### 完了条件

- 画面全体のレイアウト実装が `src/ui/shell` 側にある
- `system/MainFrame.svelte` への依存がなくなる

---

## 3. header コンポーネント

### 現行

- `tauri_app/src/system/component/header/RootHeader.svelte`
- `tauri_app/src/system/component/header/ModeSwitch.svelte`

### 移行先

- `tauri_app/src/ui/header/AppHeader.svelte`
- `tauri_app/src/ui/header/ModeLabel.svelte`

### 方針

- 見た目は維持
- 命名だけ新構成に合わせる
- mode 切替のロジックは `app/shell` 側へ寄せる

### 完了条件

- ヘッダ UI が `src/ui/header` 側にある
- mode の切替処理は UI コンポーネント内に閉じない

---

## 4. inputRoot.ts

### 現行

- `tauri_app/src/system/input/inputRoot.ts`

### 移行先

- `tauri_app/src/app/bootstrap/bind-global-keyboard.ts`
- `tauri_app/src/app/shell/keyboard-router.ts`

### 方針

- キーイベントの購読と、キーイベントのルーティングを分ける
- `inputRoot` は最終的に不要化する
- terminal / harmonize / melody / arrange の分岐点だけをここに置く

### 完了条件

- `window.onkeydown/onkeyup` の設定が `Entry.svelte` から消える
- キー入力のルーティング実装が `src/app/shell` 側にある

---

## 5. reducerRoot.ts

### 現行

- `tauri_app/src/system/store/reducer/reducerRoot.ts`

### 移行先

- `tauri_app/src/app/shell/switch-mode.ts`
- `tauri_app/src/app/shell/keyboard-state.ts`
- `tauri_app/src/app/timeline/get-timeline-focus-pos.ts`

### 方針

- 1ファイルのまま移動しない
- 責務ごとに分割する

分ける対象:

- mode 切替
- hold 状態更新
- hold 状態判定
- focus 位置計算

### 完了条件

- `reducerRoot.ts` の責務が新ファイル群へ分散される
- `reducerRoot.ts` が不要になるか、薄い橋渡しになる

---

## 6. store.ts

### 現行

- `tauri_app/src/system/store/store.ts`

### 移行先

- すぐには全面分割しない
- ただし次の入口を作る
  - `tauri_app/src/state/app-state/`
  - `tauri_app/src/state/ui-state/`
  - `tauri_app/src/state/session-state/`
  - `tauri_app/src/state/refs/`

### 方針

- Phase 2 では store の全面分割はしない
- 代わりに、`StoreProps` のどこがどの種類の state なのかを明文化する
- 可能なら type alias を新配置へ逃がし始める

### この段階でやること

- 現行 `StoreProps` の分類表を作る
- `control / data / preview / cache / ref / fileHandle` の役割を整理する
- `store.ts` を今後分割しやすい状態にする

### 完了条件

- `store.ts` の責務一覧が整理されている
- 少なくとも `shell` まわりで使う state の境界が見える

---

## 7. contextUtil.ts

### 現行

- `tauri_app/src/system/store/contextUtil.ts`

### 移行先

- `tauri_app/src/app/bootstrap/context.ts`
  または削除

### 方針

- まず必要性を再評価する
- `isPreview` だけのために必要なら最小形で `bootstrap/context.ts` へ移す
- 不要なら削除する

### 完了条件

- `contextUtil.ts` の必要性が判断されている
- 継続利用するなら新配置へ移行済み

---

## 実施順

依存関係を考えると、順番は以下がよい。

1. `header` の移行
2. `MainFrame.svelte` のレイアウト移行
3. `Entry.svelte` の分解
4. `inputRoot.ts` の分解
5. `reducerRoot.ts` の分解
6. `store.ts` の分類整理
7. `contextUtil.ts` の要否判断

---

## 作業単位の目安

### Day 1

- `header`
- `MainFrame.svelte`

### Day 2

- `Entry.svelte`
- `bind-global-keyboard.ts`

### Day 3

- `inputRoot.ts`
- `reducerRoot.ts`

### Day 4

- `store.ts` の分類整理
- `contextUtil.ts` の判断
- 動作確認

---

## このフェーズでやらないこと

Phase 2 では、以下は扱わない。

- `outline / melody / terminal` の本格移行
- command 群の全面整理
- cache ロジックの再設計
- arrange 系の再編成
- store の全面分割

---

## 完了判定

Phase 2 は、次の状態になったら完了とする。

1. アプリ起動処理が `src/app/bootstrap` にある
2. 全体レイアウトが `src/ui/shell` にある
3. ヘッダ UI が `src/ui/header` にある
4. キー入力登録が `src/app/bootstrap` にある
5. ルート入力分岐が `src/app/shell` にある
6. mode 切替など root ロジックが `src/app/shell` 側に整理される
7. `store.ts` の state 境界が文書化または型整理されている
8. 以下が通る
   - `npm run check`
   - `npm run build`
   - `cargo check`
   - `npm run tauri dev`

---

## 現在の前提

- Phase 1 の主要項目は完了済み
- `src/domain/theory`
- `src/styles/tokens`
- `src/app/bootstrap`
- `src/state/session-state`
- `src/app/project-io`
- `src/infra/tauri`

はすでに使い始めている

---

## 次に着手する候補

1. `header` の移行
2. `MainFrame.svelte` の `ui/shell` への移行
3. `Entry.svelte` の bootstrap 分解
