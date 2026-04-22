# Phase 2: Shell 周辺の責務整理

## 目的
このドキュメントは、Phase 2 で再配置した `shell` 周辺の責務を、後から見返して説明できるように整理するためのものです。

`refer_app` では、起動処理、レイアウト、モード切替、キーボード入力、root reducer 的な処理、store の shell 関連 state 参照が複数箇所に分散していました。
Phase 2 ではそれらを一度に全面再設計するのではなく、`shell` の責務を新構成上で説明できる単位に寄せています。

---

## shell の位置づけ
ここでいう `shell` は、アプリ全体の外枠を担当する層です。

主な役割は以下です。
- アプリ起動時の初期化を行う
- 全体レイアウトを組み立てる
- 現在モードに応じて入力を振り分ける
- shell まわりの UI state を参照する
- editor 本体に入る前の root 制御を担当する

`outline`, `melody`, `terminal`, `arrange`, `playback` のような個別機能そのものではなく、それらを束ねる上位層として扱います。

---

## Phase 2 で整理した責務の対応表

| 責務 | 配置先 | 役割 |
| --- | --- | --- |
| アプリの入口 | `tauri_app/src/App.svelte` | 起動時に初期化を呼び、shell レイアウトを描画する |
| 起動初期化 | `tauri_app/src/app/bootstrap/initialize-app.ts` | cache 再計算、preview context 設定、CSS 変数適用などをまとめる |
| グローバルキーボード登録 | `tauri_app/src/app/bootstrap/bind-global-keyboard.ts` | `window` へのイベント登録と cleanup を担当する |
| shell レイアウト | `tauri_app/src/ui/shell/RootLayout.svelte` | ヘッダ、アウトライン、メイン領域、必要に応じたオーバーレイの配置を担当する |
| shell 作業領域 | `tauri_app/src/ui/shell/MainWorkspace.svelte` | アウトライン以外のメイン作業領域を束ねる |
| ヘッダ UI | `tauri_app/src/ui/header/AppHeader.svelte` | 現在モードの表示など shell 最上部の UI を担当する |
| モードラベル UI | `tauri_app/src/ui/header/ModeLabel.svelte` | mode 表示の見た目を担当する |
| キー入力ルーティング | `tauri_app/src/app/shell/keyboard-router.ts` | 現在 mode に応じて input 系の処理へ振り分ける |
| root 制御 | `tauri_app/src/app/shell/root-control.ts` | mode 切替、hold 状態更新、root レベルの操作制御を担当する |
| timeline の focus 計算 | `tauri_app/src/app/timeline/get-timeline-focus-pos.ts` | shell から必要になる timeline 基本座標計算を切り出す |
| shell state の selector | `tauri_app/src/state/ui-state/shell-ui-store.ts` | shell で使う mode や表示状態を参照する入口を提供する |
| keyboard session updater | `tauri_app/src/state/session-state/keyboard-session.ts` | hold 状態の更新入口を提供する |
| state 境界の定義 | `tauri_app/src/state/store-boundaries.ts` | 巨大 store を今後分割するための分類を明文化する |

---

## データと制御の流れ

### 1. アプリ起動
- `src/main.ts` から `App.svelte` をマウントする
- `App.svelte` が `initializeApp()` を呼ぶ
- その後 `RootLayout.svelte` を描画する

### 2. shell レイアウト表示
- `RootLayout.svelte` がヘッダとメイン領域を組み立てる
- `AppHeader.svelte` は shell 用 selector を通して mode を表示する
- terminal や arrange 系オーバーレイの表示判定も selector を通す

### 3. キーボード入力
- `bind-global-keyboard.ts` が `window` にイベントを登録する
- イベントは `keyboard-router.ts` に渡る
- `keyboard-router.ts` が現在の mode を selector 経由で参照し、適切な入力処理へ振り分ける
- root レベルで必要な更新は `root-control.ts` が担当する

### 4. state 更新
- hold 状態の更新は `keyboard-session.ts` の updater を通す
- mode や表示状態の参照は `shell-ui-store.ts` の selector を通す
- これにより、store 実体が 1 つのままでも shell 側の依存入口を固定できる

---

## store 境界の考え方
Phase 2 の時点では `store.ts` 自体は分割していません。
ただし、今後分割しやすくするために、意味上の境界を先に定義しています。

現在の大まかな分類は以下です。

| 分類 | 内容の例 |
| --- | --- |
| `project` | 曲データ本体、永続対象のデータ |
| `ui` | mode、terminal 表示状態、画面上の表示制御 |
| `session` | input hold、一時状態、現在セッション中だけ必要な状態 |
| `cache` | 再計算可能な派生データ |
| `refs` | DOM 参照や実体参照 |

この分類を `tauri_app/src/state/store-boundaries.ts` に置いています。

重要なのは、Phase 2 では store の形を変えることよりも、
「どの責務がどの境界に属するか」を先に固定することです。

---

## Phase 2 時点でまだ旧構成に残しているもの
以下はまだ旧構成側に残っています。

- `tauri_app/src/system/input/inputOutline.ts`
- `tauri_app/src/system/input/inputMelody.ts`
- `tauri_app/src/system/input/inputTerminal.ts`
- `tauri_app/src/system/store/store.ts`
- 多くの editor 本体コンポーネント

つまり、Phase 2 は shell の外枠整理が中心であり、個別機能の本格移行はまだ始めていません。

---

## この整理で得られたこと
- 起動処理の場所を説明しやすくなった
- レイアウト責務の所在が `ui/shell` に揃った
- mode 表示の UI が `ui/header` に揃った
- root 制御の入口が `app/shell` に揃った
- shell まわりの state 参照と更新の入口を限定できた
- 未来の store 分割で、どこから置換するかが見えやすくなった

---

## 次フェーズへの引き継ぎ
Phase 3 以降では、以下のどちらかから進めるのが自然です。

1. `outline` を機能単位で移し始める
- UI
- input
- reducer 相当
- domain 的な型やロジック

2. `terminal` を機能単位で移し始める
- UI
- command 登録
- command 実行
- project-io 連携

どちらを先に進める場合でも、Phase 2 で作った `shell` の外枠はそのまま土台として使えます。
