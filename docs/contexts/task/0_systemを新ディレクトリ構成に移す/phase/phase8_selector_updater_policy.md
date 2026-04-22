# Phase 8 Selector / Updater Placement Policy

## 目的
+このドキュメントは、巨大な `store` をすぐに物理分割しない前提で、
+どの読み取り処理を `selector` として置くか、
+どの更新処理を `updater` として置くか、
+そしてそれらをどこに配置するかを整理するための方針メモです。

---

## 基本方針
- `store.ts` の実体は当面 1 つのまま維持する
- ただし、機能側からの参照入口は少しずつ分ける
- 読み取りは `selector`
- 更新は `updater`
- 機能操作のまとまりは `app/*` の action / router
- 純粋ロジックは `domain/*`
- Tauri や audio など外部依存は `infra/*`

この方針により、
- 機能側は `store` の内部構造を直接知らなくてよい
- 将来 `store` を物理分割するとき、置換範囲を局所化できる
- `Svelte component -> selector`
- `keyboard / command / feature flow -> app action`
という導線を揃えやすくなる

---

## selector の配置方針

### `src/state/ui-state/*`
- UI 表示のための読み取りを置く
- Svelte component が参照する値をまとめる
- 複数の `store` 領域を横断してもよい
- ただし副作用は持たない

例:
- `shell-ui-store.ts`
- `outline-ui-store.ts`
- `terminal-ui-store.ts`
- `melody-ui-store.ts`
- `playback-ui-store.ts`
- `timeline-ui-store.ts`

置くべきもの:
- 現在 mode かどうか
- 現在 focus 中の要素
- UI に表示する配列
- cursor 表示条件
- progress 情報
- timeline header 用の整形済み表示データ

置かないもの:
- DOM 操作
- `lastStore` への書き込み
- preview 再生開始のような命令

---

## session updater の配置方針

### `src/state/session-state/*`
- session 中だけ意味を持つ更新処理を置く
- `preview`
- `fileHandle`
- `keyboard hold`
- terminal cursor ref
- そのほか UI セッション情報
のような永続化しない state を主対象にする

置くべきもの:
- preview 開始/停止中フラグの更新
- terminal 関連 ref の更新
- keyboard hold 状態の更新
- 保存先ファイルパスの更新

置かないもの:
- feature 全体のユースケース実行
- project data の編集ロジック本体

---

## app action / router の配置方針

### `src/app/*`
- 機能としての操作入口を置く
- input, terminal command, UI event から呼ばれる導線をまとめる
- 必要なら legacy reducer / input を内部で呼んでよい
- 段階移行中の wrapper 置き場でもある

例:
- `app/outline/outline-actions.ts`
- `app/outline/outline-input-router.ts`
- `app/terminal/terminal-actions.ts`
- `app/terminal/terminal-input-router.ts`
- `app/melody/melody-actions.ts`
- `app/melody/melody-input-router.ts`
- `app/playback/playback-actions.ts`
- `app/playback/playback-preview-router.ts`

置くべきもの:
- mode ごとの入力振り分け
- reducer の呼び出し入口
- preview 開始/停止 command のまとめ
- terminal builder から見た feature 操作入口

置かないもの:
- 表示専用 selector
- 純粋な音楽理論計算
- Tauri API の直接呼び出し本体

---

## domain の配置方針

### `src/domain/*`
- 純粋型
- 純粋計算
- feature 固有でも UI 非依存のロジック

例:
- `domain/outline/outline-types.ts`
- `domain/melody/melody-types.ts`
- `domain/melody/melody-control.ts`
- `domain/playback/playback-types.ts`
- `domain/playback/playback-progress.ts`
- `domain/theory/music-theory.ts`

置くべきもの:
- 型
- 初期データ生成
- 変換
- 時間や拍の計算
- 正規化

置かないもの:
- `lastStore` 参照
- DOM
- Svelte component
- Tauri plugin 呼び出し

---

## infra の配置方針

### `src/infra/*`
- 外部依存を閉じ込める
- Tauri
- audio
- persistence
などを扱う

例:
- `infra/tauri/dialog.ts`
- `infra/tauri/fs.ts`
- `infra/audio/soundfont-player.ts`

置くべきもの:
- plugin 呼び出し
- SoundFont load
- fs read/write

置かないもの:
- feature の意思決定
- Svelte component 向け表示整形

---

## 実運用ルール

### 1. Svelte component はまず selector を探す
- component 内で `$store` を直接深掘りしない
- まず `state/ui-state/*` に selector を置けるか考える

### 2. command / keyboard / click handler は app action を探す
- `input*.ts` や `builder*.ts` が reducer を直 import しない方向へ寄せる
- `app/*` を feature の入口にする

### 3. 一時 state は project data に混ぜない
- 保存しない値は `data` に入れない
- `preview`, `input`, `terminal`, `fileHandle`, `ref`, `cache` は project data 外に維持する

### 4. 純粋ロジックは domain へ逃がす
- `store` に置く必要がない計算は `domain/*` へ移す

### 5. 物理分割は境界が十分安定してから行う
- 先に selector / updater / action の入口を整える
- その後に `store` 実体の分割を検討する

---

## 現時点の判断
- `ui-state` は読み取り境界として有効に機能し始めている
- `session-state` は preview / terminal / keyboard / file path のような session 値に向いている
- `app/*` は legacy reducer / input を包む段階移行レイヤーとして有効
- したがって、Phase 8 では `store` を急いで割るよりも、
  `selector / updater / action` の配置ルールを固定する方が安全である

---

## 次に見るべきこと
1. `data` を project data 専用の境界として切り出せるか
2. `cache` を project data から独立した派生 state として分離できるか
3. `ref` を UI/session 境界としてより明示できるか
