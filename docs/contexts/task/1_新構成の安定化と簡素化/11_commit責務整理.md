# commit責務の整理

## 目的
`StoreUtil` が残っている本体について、`commit` が何のために必要なのかを整理し、次に簡素化しやすい対象を見つける。

## 分類

### 1. 入力 + 局所 mutation + commit
対象:
- `app/terminal/terminal-input.ts`

特徴:
- dedicated store / action を直接更新する
- 1イベントごとに UI 更新を確定するために `commit` を呼ぶ
- hold callback や多段 router はほぼ持たない

見立て:
- 最も単純
- `commit` の責務を分離する最初の候補に向いている
- まずは `commit` 呼び出しを helper にまとめて、確定点を読みやすくするのが有効

### 2. 入力 + cross-feature mutation + scroll + commit
対象:
- `app/melody/melody-input.ts`
- `app/outline/outline-input.ts`
- `app/arrange/*input.ts`

特徴:
- reducer / cache / scroll / preview をまたぐ
- 1イベントの中で複数 state を横断して更新する
- `commit` はまだ orchestration の最後の確定点として意味が大きい

見立て:
- まだ単純には外しづらい
- 先に責務分割が必要

### 3. runtime side effect + commit
対象:
- `app/playback/playback-actions.ts`
- `app/playback/preview-util.ts`

特徴:
- timer / audio / progress / focus など runtime side effect を持つ
- 単なる state 更新ではなく、実行中リソースの制御が絡む

見立て:
- 安定化フェーズでは慎重に扱うべき対象
- 入力系より後ろに回す方が安全

## 今の結論
- 次に一番触りやすいのは `terminal-input.ts`
- `melody-input.ts` と `outline-input.ts` は、今触るなら `commit` 除去ではなく責務整理から入る方が安全
- `preview-util.ts` は今は分類までに留めるのがよい

## 今回の反映
- `terminal-input.ts` に `commitTerminalChange()` を追加
- helper rebuild / helper scroll / commit の組み合わせを 1 箇所にまとめた
- これにより、terminal では「何を更新確定として扱うか」が分かりやすくなった

- `melody-input.ts` では commit 前の代表的な後処理を helper 名へ寄せた
  - `commitMelodyChange()`
  - `commitAfterPitchChange()`
  - `commitAfterHorizontalMelodyChange()`
  - `commitAfterCursorMove()`
- これにより、`melody` では「pitch 更新」「横移動 + outline 追従」「cursor 移動 + overlap 判定」の違いが読み取りやすくなった
- あわせて preview 音出し処理を `app/melody/melody-audition.ts` に分離した
- これにより、`melody-input.ts` の責務から「入力制御ではない試聴ロジック」を 1 つ外せた
- さらに clipboard 操作も `app/melody/melody-clipboard-actions.ts` に分離した
- これにより、`holdCtrl` にまとまっていた copy / paste ロジックを入力制御本体から外せた
## 今回の反映 追記
- `outline-input.ts` では commit 前の代表的な後処理を helper 名へ寄せた
  - `commitOutlineChange()`
  - `commitAfterOutlineScroll()`
  - `commitAfterRecalculate()`
  - `commitAfterRecalculateAndOutlineScroll()`
- これにより、`outline` では「単純更新」「focus移動 + scroll」「recalculateのみ」「recalculate + scroll」の違いが読み取りやすくなった

## 2026-04-23 commit の位置づけ
現状の `CommitContext.commit()` は、必要な store だけを選んで更新する最終形ではない。
役割としては、分割済みの dedicated store 群を旧来の「1回の確定点」でそろえるための互換同期バリアである。

このため、今の commit は多少広く通知してでも挙動を安定させる方を優先している。
今後 selective update に進める場合も、一気に置き換えるのではなく feature 単位で touch 範囲を絞るのが前提になる。
