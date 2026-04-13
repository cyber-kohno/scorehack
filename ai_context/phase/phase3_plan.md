# Phase 3 計画

## 目的
Phase 3 では、Phase 1 と Phase 2 で整えた基盤の上に、最初の機能単位を新構成へ移し始めます。

この段階の主目的は、単にファイルを移すことではなく、
- `shell` の外側にある具体的な機能を
- `ui / app / state / domain / infra` の責務で説明できる形に分けながら
- 既存動作を維持して段階移行する
ことです。

---

## Phase 3 の基本方針
Phase 3 では `outline` を先に移行対象にします。

理由は以下です。
- `outline` はアプリの中心機能のひとつであり、仕様理解の起点にしやすい
- `terminal` よりも UI とデータ構造の対応が見えやすい
- `melody` や `arrange` よりも依存範囲が比較的限定されている
- `section / chord / modulate / tempo / ts` という、今後も重要な設計要素を含んでいる
- 将来の仕様整理にも直結する

そのため、Phase 3 は `outline を機能単位で移すフェーズ` として進めます。

---

## 対象範囲
### 対象に含めるもの
- outline フレーム UI
- outline 要素表示 UI
- outline の選択状態や基本的な UI state
- outline 関連の入力導線
- outline 関連の reducer 相当ロジックのうち、分離しやすい部分
- outline が参照する domain 的な型・純粋ロジック

### 対象に含めないもの
- terminal コマンド体系の再設計
- melody の本格移行
- playback の再設計
- arrange editor の本格移行
- store 全分割
- data モデル全面再設計

---

## このフェーズで目指す状態
- `outline` まわりの責務を新構成で説明できる
- outline UI の入口が `src/ui/outline` に揃う
- outline 操作の入口が `src/app/outline` に揃う
- outline 用 state 参照の入口を限定できる
- 旧 `system/component/outline` 依存を段階的に減らし始める
- 今後 `modulate / tempo / ts` を扱いやすい基盤になる

---

## 進め方
Phase 3 は以下の順で進めます。

### 1. outline の責務を再分類する
現行 `refer_app` / `tauri_app` にある outline 関連コードを、まず以下で分類します。
- 表示
- 入力
- 状態参照
- 状態更新
- データ定義
- 純粋ロジック

ここではまだ大きく書き換えず、移しやすい単位を見極めます。

### 2. outline UI の入口を `src/ui/outline` に揃える
対象候補:
- outline フレーム
- outline リスト
- outline 要素のコンテナ
- section / chord / modulate / tempo / ts の描画単位

この段階では見た目や挙動を変えるより、UI の置き場を揃えることを優先します。

### 3. outline 用の selector / updater を作る
巨大 store の実体はまだ維持したまま、outline で使う state の読み取り入口と更新入口を切ります。

対象例:
- 現在選択中の outline 要素
- outline のカーソル位置
- 要素の追加・削除・更新
- 種類ごとの表示条件

### 4. outline 入力の root 入口を `src/app/outline` に寄せる
まだ旧 `system/input` を使う部分が残っていても構いません。
まずは、outline に関する入力の入口を `app/outline` にまとめ、今後の分離の起点を作ります。

### 5. outline 関連の純粋ロジックを `domain` に寄せる
対象例:
- outline 要素型
- section / chord / modulate / tempo / ts のデータ型
- outline 要素判定ロジック
- element 変換や整形ロジック

### 6. 最後に import の流れを整理する
- `ui/outline` は `app/outline` と `state/*` を参照する
- `app/outline` は `domain/outline` と必要な store updater を参照する
- `domain/outline` は UI や Svelte に依存しない

この形に近づけます。

---

## 実施ステップ
### Step 1. 現行 outline 関連ファイルの洗い出し
候補:
- `tauri_app/src/system/component/outline/*`
- `tauri_app/src/system/input/inputOutline.ts`
- `tauri_app/src/system/store/reducer/*` の outline 関連処理
- `tauri_app/src/system/store/props/storeOutline.ts`

### Step 2. outline 移行マップを作る
各ファイルについて、以下を決めます。
- そのまま移せるか
- 分割が必要か
- どこへ移すか
- 今回はまだ移さないか

### Step 3. UI の入口から先に移す
まずは `ui/outline` 側の入口を整えます。
この段階では、内部で旧コンポーネントを呼ぶ bridge 的な構成でも問題ありません。

### Step 4. state の入口を切る
`outline-ui-store.ts` や `outline-session.ts` のような selector / updater を追加し、直接 store 参照を減らします。

### Step 5. input 入口を切る
`app/outline` 側に `outline-input-router.ts` のような入口を作り、旧 `inputOutline.ts` への依存を整理します。

### Step 6. domain 化できる部分を移す
純粋ロジックや型から先に `domain/outline` へ寄せます。

---

## 完了条件
以下を満たしたら、Phase 3 は完了扱いにできます。

- `outline` UI の入口が `src/ui/outline` に揃っている
- outline の state 参照に selector / updater が導入されている
- outline 入力の入口が `src/app/outline` にできている
- `section / chord / modulate / tempo / ts` の基本責務を新構成で説明できる
- `npm run check` が通る
- `npm run build` が通る
- `cargo check` が通る
- 進捗が `ai_context/phase` に記録されている

---

## リスクと注意点
### 1. outline は見た目以上に store 依存が強い
UI を動かすだけでも cache や control に依存している可能性があるため、いきなり完全移行は避けます。

### 2. tempo / ts は未完了要素がある
現行実装に未完了部分があるため、Phase 3 では「責務の置き場を作る」ことを優先し、完成度向上は次段階でもよいです。

### 3. reducer 的な処理は一気に分離しない
入力、状態更新、cache 再計算を同時に触ると壊しやすいため、入口を切ることを優先します。

### 4. 見た目の差分は最小にする
このフェーズではデザイン改善より、責務整理を優先します。

---

## 推奨実施順
1. outline 関連ファイルの洗い出し
2. outline の移行マップ作成
3. `ui/outline` の入口整理
4. outline selector / updater 追加
5. outline input の入口整理
6. outline domain の一部切り出し
7. 動作確認と進捗更新

---

## このフェーズで作る可能性が高いファイル
- `tauri_app/src/ui/outline/OutlineFrame.svelte`
- `tauri_app/src/ui/outline/OutlineList.svelte`
- `tauri_app/src/ui/outline/outline-elements/*`
- `tauri_app/src/app/outline/outline-input-router.ts`
- `tauri_app/src/app/outline/outline-actions.ts`
- `tauri_app/src/state/ui-state/outline-ui-store.ts`
- `tauri_app/src/state/session-state/outline-session.ts`
- `tauri_app/src/domain/outline/outline-element.ts`
- `tauri_app/src/domain/outline/outline-types.ts`

---

## 進捗記録
Phase 3 の実作業を始めたら、以下のファイルに記録します。
- `ai_context/phase/phase3_progress.md`

---

## 次の着手
Phase 3 の最初の着手は以下です。

1. outline 関連ファイルの洗い出しを行う
2. その結果をもとに Phase 3 の移行マップを作る

この順で進めると、手戻りが少なく安全です。
