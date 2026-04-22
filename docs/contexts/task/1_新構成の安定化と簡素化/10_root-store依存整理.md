# root-store依存整理

## 目的
`src/system` 撤去後も残っている `StoreProps` / `StoreUtil` / `lastStore` の名残を整理し、新構成の理解コストを下げる。

## 現状整理
- `root-store.ts` の `StoreProps` は `Record<string, never)` ではなく `Record<string, never>` の空シェル
- 実体 slice は dedicated store 側へ移っている
- それでも互換的な API 形状として `StoreProps` / `StoreUtil` / `lastStore` が広く残っている

## 分類

### まだ当面必要
- `commit()` を束ねるための `StoreUtil`
- 入力 router や action 生成の入口で、複数 state と commit を一緒に扱う場所
- cache 再計算や複数 helper をまたぐ orchestrator

### 互換名残
- `StoreProps` を受けているが、実際には dedicated store だけを触っている helper
- `_lastStore` という未使用引数が残っている session helper
- `$store` を渡しているが、実際には引数値を使っていない UI 補助

### 次に減らしやすい対象
- `state/session-state/keyboard-session.ts`
- `state/session-state/terminal-session.ts`
- それらを呼ぶ `root-control.ts` と terminal UI

## 今回の見立て
- 一足飛びに `StoreUtil` をなくすのはまだ早い
- 先に「使っていないのに残っている `StoreProps`」を落とす方が安全
- これで API の意味が少しずつ実態に近づく

## 次の候補
1. 未使用 `StoreProps` 引数を持つ session helper の整理
2. その後、`StoreUtil` を受けている入力 router の再分類
3. 最後に、本当に `root-store` が必要な orchestrator だけを残す

## StoreUtil の現時点の分類

### orchestration としてまだ必要
- `keyboard-router`
- `melody-input`
- `outline-input`
- `terminal-input`
- `arrange` 系 input
- `preview-util` / `playback-actions`

### 互換 callback として薄くできる
- `bind-global-keyboard.ts` の `createStoreUtil` 引数
- `initialize-app.ts` の `createStoreUtil` 引数

### 次に狙う方向
- bootstrap まわりの `createStoreUtil` callback をやめる
- そのあと input router を「本当に `commit` が必要か」で再分類する

## 追加整理

### 外せた薄い facade
- `melody-input-router.ts`
- `outline-input-router.ts`
- `terminal-input-router.ts`
- `playback-preview-router.ts`

これらは `StoreUtil` をそのまま下位へ渡すだけの pass-through だったため、直接本体を呼ぶ形へ置き換えた。

### 今の見立て
- `StoreUtil` の残りは、もう「薄い router」より「入力本体 / preview orchestration」に集中している
- ここから先は façade 削除より、`commit` の責務をどう束ねるかの整理が主題になる
