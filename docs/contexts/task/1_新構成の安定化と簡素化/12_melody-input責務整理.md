# melody-input の責務整理

## 目的
`melody-input.ts` に残っている責務を見える化し、次にどの単位から切り出すのが安全かを判断しやすくする。

## 現在の主な責務

### 1. 入力制御の本体
- 通常入力 `control(eventKey)`
- hold 入力 `getHoldCallbacks(eventKey)`

### 2. commit 前処理
- `commitMelodyChange()`
- `commitAfterPitchChange()`
- `commitAfterHorizontalMelodyChange()`
- `commitAfterCursorMove()`

### 3. preview 試聴
- `melody-audition.ts` へ分離済み
- pitch 変更後の試聴だけを受け持つ

### 4. clipboard 操作
- `melody-clipboard-actions.ts` へ分離済み
- copy / paste のような入力制御以外の責務を外へ出した

### 5. まだ残っている主要責務
- cursor 操作
- focus note 操作
- hold callback 群
- outline 同期
- overlap 判定

## 今の見立て
- `preview 試聴`
- `clipboard`

は比較的独立していたため、先に外しやすかった。

次に候補になるのは以下の 2 つ。

### A. cursor / focus helper
特徴:
- `isCursor()`
- `getFocusNote()`
- `moveFocus()`
- `movePitch()`

をまとめられる可能性がある。

利点:
- `control` と `hold callbacks` の両方で使っている基本操作が見えやすくなる。

注意:
- `outline 同期`
- `scroll`
- `preview 試聴`
- `commit helper`

とのつながりが強いため、分け方を雑にすると逆に読みにくくなる。

### B. hold callback の subgroup 化
特徴:
- `holdX / holdE / holdF / holdD / holdC / holdShift / holdCtrl`
の責務をグループ単位で外していく。

利点:
- ファイル全体の体積を一気に減らしやすい。

注意:
- 1 callback 内のロジック量が大きく、境界を誤ると helper が薄い wrapper だらけになる。

## 現時点でのおすすめ
- まずは `cursor / focus helper` の棚卸しを優先する
- その後、`holdCtrl` のように独立しやすい subgroup から順に外す

理由:
- `hold callback` を直接割る前に、基礎操作の単位が整理されていた方が全体の見通しが良い
- ただし、`clipboard` のように明らかに独立した責務は先に外してよい
