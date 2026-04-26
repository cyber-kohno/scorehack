# melody-reducer 責務棚卸し

対象:
- [melody-reducer.ts](\tauri_app\src\app\melody\melody-reducer.ts)

## 現状の公開 API
- `syncCursorFromElementSeq`
- `addNote`
- `addNoteFromCursor`
- `judgeOverlap`
- `focusInNearNote`
- `focusOutNoteSide`
- `getCurrScoreTrack`
- `changeScoreTrack`
- `getFocusRange`

## 責務分類

### 1. mutation 寄り
- `addNote`
  - 現在トラックの notes に note を追加
  - 追加後に beat 順へ sort
- `addNoteFromCursor`
  - cursor state のコピーを使って `addNote`
- `changeScoreTrack`
  - melody track index を更新

これらは「状態を変更する」責務が中心。

### 2. selector / accessor 寄り
- `getCurrScoreTrack`
  - 現在の score track を返す
- `getFocusRange`
  - focus / focusLock から範囲を返す

これらは「現在値を返す」責務が中心。

### 3. orchestration 寄り
- `syncCursorFromElementSeq`
  - timeline cache を読み、cursor state を組み直す
  - focus state も更新する
- `judgeOverlap`
  - score track と cursor state を見て overlap state を更新する
- `focusInNearNote`
  - cursor / score track / chord sync / timeline scroll をまとめて扱う
- `focusOutNoteSide`
  - cursor state 更新
  - focus state 更新
  - note normalize
  - overlap 再判定
  - outline sync
  - timeline scroll

これらは「複数 state や他 feature をまたいで整える」責務が中心。

## RootStoreToken 依存の見え方

### 比較的外しやすい
- `getFocusRange`
  - session state のみ
- `addNote`
  - project-data と melody track index への依存
  - root token を直接持たなくても切り出せる可能性が高い
- `getCurrScoreTrack`
  - selector として分離しやすい

### まだ重い
- `focusInNearNote`
- `focusOutNoteSide`
- `syncCursorFromElementSeq`
- `judgeOverlap`

これらは cache / outline / scroll / cursor / focus が混ざっており、今すぐ token を外すより先に責務分解が必要。

## 呼び出し状況の見え方

### input から強く使われている
- `getCurrScoreTrack`
- `getFocusRange`
- `judgeOverlap`
- `addNoteFromCursor`
- `focusInNearNote`
- `focusOutNoteSide`

### 他 feature からも使われている
- `syncCursorFromElementSeq`
  - root-control
  - preview-util
- `getCurrScoreTrack`
  - terminal-reducer
  - terminal builder
- `changeScoreTrack`
  - terminal builder

## 最初の分離候補

### 候補 A. selector/accessor を先に外す
- `getCurrScoreTrack`
- `getFocusRange`

利点:
- caller が多く、読み取り責務を reducer から外す効果が大きい
- `reducer` が更新中心に近づく

### 候補 B. mutation を先に外す
- `addNote`
- `addNoteFromCursor`

利点:
- 更新専用 helper から `RootStoreToken` を外す方向に近い

### 現時点のおすすめ
最初は **候補 A** が安全。

理由:
- `getCurrScoreTrack` と `getFocusRange` は副作用がなく、切り出し事故のリスクが低い
- 先に selector/accessor を外すと、残る reducer の「更新と同期」の輪郭が見えやすくなる

## 次
1. `getCurrScoreTrack` と `getFocusRange` を melody selector 側へ出せるか確認する
2. その後 `addNote` / `addNoteFromCursor` を mutation helper として独立できるか見る

## 実施メモ
- selector/accessor として
  - `getCurrScoreTrack`
  - `getFocusRange`
  は `melody-selectors.ts` へ分離済み
- mutation として
  - `addNote`
  - `addNoteFromCursor`
  は reducer から外し、
  - `appendMelodyNoteSorted()`
  を `melody-mutations.ts`
  - action 側の組み立てを `melody-actions.ts`
  に寄せた
- 判定 + state 更新だった
  - `judgeOverlap`
  は
  - overlap 判定を `melody-selectors.ts`
  - state 更新を `melody-actions.ts`
  に分離した
- `changeScoreTrack`
  は
  - track index 更新を `melody-track-actions.ts`
  - cursor 同期を `melody-actions.ts`
  に分離した
- `focusInNearNote`
  は
  - 近傍ノート index 探索を `melody-selectors.ts`
  - focus 更新と sync / scroll を `melody-actions.ts`
  に分離した
- `focusOutNoteSide`
  は
  - cursor 置換と focus 初期化を reducer
  - cursor 位置調整 / note normalize / sync / scroll を `melody-actions.ts`
  に分離した

現時点で `melody-reducer` に残るのは、主に orchestration 寄りの責務。
