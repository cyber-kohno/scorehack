# reducer / actions / lastStore 整理

## 問題意識
- レガシーでは `Reducer`, `Store`, `Input` などが広い責務を持ち、`lastStore` を受け取って更新・参照の両方を行っていた
- しかし新構成では state 実体が dedicated store に分割されているため、更新系 helper が root store の「最新状態」を受け取る必然性はかなり薄い
- 一方で表示系 selector や cache/project-data の合成面では、feature をまたいで情報を読むための token がまだ必要

## 現状の見立て

### 1. `lastStore` / `RootStoreToken` が不要に近い層
- session-state の write helper
- 単純な mutation helper
- input から呼ばれる局所操作 helper

これらは dedicated store を直接読む/更新できるため、root store token を受け渡す価値が小さい。

### 2. `RootStoreToken` がまだ意味を持つ層
- project-data accessor
- cache accessor
- 複数 feature の state を束ねる selector
- playback / shell / keyboard などの orchestration

これらは「root state 本体」ではなく、feature 横断の読み取り token として意味がある。

### 3. 今の `reducer` が抱えている混在
- 更新専用 mutation
- 現在値の取得
- scroll 調整
- 他 feature の action 呼び出し

例:
- `melody-reducer.ts`
  - `addNote`, `judgeOverlap` は mutation 寄り
  - `getCurrScoreTrack`, `getFocusRange` は selector 寄り
  - `syncCursorFromElementSeq`, `focusInNearNote`, `focusOutNoteSide` は orchestration 寄り
- `outline-reducer.ts`
  - `insertElement`, `removeFocusElement`, `setChordData` は mutation 寄り
  - `getCurrentChordData`, `getCurrHarmonizeTrack` は selector 寄り
  - `syncChordSeqFromNote`, `openArrangeEditor`, `changeHarmonizeTrack` は orchestration 寄り

## 整理方針

### 方針 1. 更新専用 helper は root store token から切り離す
- dedicated store / project-data / cache helper を直接使えるなら、`RootStoreToken` を引数にしない
- まずは「完全に melody 内で閉じる」「outline 内で閉じる」更新から進める

### 方針 2. 読み取り helper は selector/accessor として明示する
- 表示や判定のための読み取りは、`reducer` に置かず selector/accessor に分ける
- ここでは `RootStoreToken` が残ってもよい

### 方針 3. orchestration は `input` / `playback` / `shell` 側に寄せる
- 複数 state をまたぐ処理
- scroll / preview / sync など副作用を伴う処理
- `commit` の前後整理

これらは reducer ではなく orchestration 層に置く方が自然。

### 方針 4. `actions` は pass-through なら縮約候補
- reducer をそのまま返すだけなら、将来的には統合候補
- ただし今は import 境界の安定化に役立っているため、一気には消さない

## 今後の段階的な進め方

### 段階 A. reducer の責務を 3 分類する
- mutation
- selector/accessor
- orchestration

### 段階 B. mutation を reducer から外に出す
- feature 内で閉じる更新 helper を `*-actions` や `*-mutations` に分ける
- ここでは `RootStoreToken` を使わない方向を優先する

### 段階 C. selector を reducer から外に出す
- `getCurrent...`, `getFocusRange` などを ui-state / feature state selector へ寄せる

### 段階 D. reducer という名前自体を再評価する
- 最後に残った責務が reducer に見合わないなら rename する
- ここで初めて、`actions` / `reducer` / `helper` の命名規約を決める

## 現時点の判断
- ユーザーの指摘どおり、「更新専用ユーティリティに lastStore は不要」という方向はかなり妥当
- ただし現状の `reducer` は更新専用ではないため、まず責務分解が必要
- したがって次の本筋は、命名を先に決めることではなく
  - reducer の責務分解
  - lastStore / RootStoreToken が本当に必要な場所の縮小
  を進めること
