# Phase 5 Melody Migration Map

## 目的
このドキュメントは、現行 `tauri_app` の melody 関連ファイルを、Phase 5 でどこへ移す想定かを整理するための移行マップです。

---

## 方針
Phase 5 では melody を次の 5 つの観点で整理します。

- `ui/melody`
- `app/melody`
- `state/ui-state`, `state/session-state`
- `domain/melody`
- `timeline との境界`

Phase 4 と同様に、最初は本体を一気に作り直すのではなく、入口を切ってから段階的に寄せます。

---

## 1. UI

### そのまま入口を作りやすいもの
- `tauri_app/src/system/component/melody/Cursor.svelte`
  - 移行先候補: `tauri_app/src/ui/melody/MelodyCursor.svelte`
  - 方針: 最初は wrapper でもよい

- `tauri_app/src/system/component/melody/UnitDisplay.svelte`
  - 移行先候補: `tauri_app/src/ui/melody/MelodyUnitDisplay.svelte`
  - 方針: 先に presentational component として移しやすい

- `tauri_app/src/system/component/melody/score/ActiveTrack.svelte`
  - 移行先候補: `tauri_app/src/ui/melody/score/ActiveTrack.svelte`
  - 方針: selector 導入前は legacy wrapper でもよい

- `tauri_app/src/system/component/melody/score/ShadeTracks.svelte`
  - 移行先候補: `tauri_app/src/ui/melody/score/ShadeTracks.svelte`
  - 方針: timeline 表示入口として先に寄せる

### 分割前提のもの
- `tauri_app/src/system/component/melody/score/Note.svelte`
  - 移行先候補: `tauri_app/src/ui/melody/score/Note.svelte`
  - 方針: 最初は wrapper、後で selector / action に分離

- `tauri_app/src/system/component/melody/score/Factors.svelte`
  - 移行先候補: `tauri_app/src/ui/melody/score/Factors.svelte`
  - 方針: `Note.svelte` の周辺として後追い

- `tauri_app/src/system/component/melody/score/ShadeNote.svelte`
  - 移行先候補: `tauri_app/src/ui/melody/score/ShadeNote.svelte`
  - 方針: `ShadeTracks` の後に整理

---

## 2. app 入口

### 入口を先に切る対象
- `tauri_app/src/system/input/inputMelody.ts`
  - 移行先候補: `tauri_app/src/app/melody/melody-input-router.ts`
  - 方針: terminal や outline と同様に wrapper 入口を先に作る

- `tauri_app/src/system/store/reducer/reducerMelody.ts`
  - 移行先候補: `tauri_app/src/app/melody/melody-actions.ts`
  - 方針: current track, add note, overlap, focus range などの入口を先に切る

### 将来分けたい責務
- selection / range
- cursor sync
- note edit
- track switch
- preview test

---

## 3. state

### selector を先に作る対象
- `control.melody.cursor`
- `control.melody.focus`
- `control.melody.focusLock`
- `control.melody.isOverlap`
- `control.melody.trackIndex`
- `control.melody.clipboard`
- current score track
- current audio track
- focus range

### 移行先候補
- `tauri_app/src/state/ui-state/melody-ui-store.ts`
- `tauri_app/src/state/session-state/melody-session.ts`

### メモ
- store 実体はまだ分割しない
- まずは melody で使う state の読み取りと ref / session 的な更新入口を切る

---

## 4. domain

### 切り出しやすいもの
- `storeMelody.ts` の `Norm`, `Note`, `Track`, `ScoreTrack`, `AudioTrack`
- `calcBeat`
- `calcBeatSide`
- `judgeOverlapNotes`
- `normalize`
- `validatePitch`
- `getUnitText`
- `createMelodyTrackScoreInitial`

### 移行先候補
- `tauri_app/src/domain/melody/melody-types.ts`
- `tauri_app/src/domain/melody/melody-note.ts`
- `tauri_app/src/domain/melody/melody-track.ts`

### 保留事項
- `Layout` 依存をどこに置くかは切り出し時に判断する

---

## 5. timeline との境界

### melody 側から見て重要な接続点
- `tauri_app/src/system/component/timeline/grid/GridRootFrame.svelte`
- `tauri_app/src/system/component/timeline/grid/BaseBlock.svelte`
- `tauri_app/src/system/component/timeline/header/MeasureFocus.svelte`
- `tauri_app/src/system/component/timeline/pitch/PitchFocus.svelte`

### 方針
- timeline 全面移行はしない
- ただし、melody を表示している接続点だけは新入口へ寄せる
- `ui/timeline` と `ui/melody` の境界が説明できることを目標にする

---

## 6. terminal との接続

### 対象ファイル
- `tauri_app/src/system/store/reducer/terminal/sector/builderMelody.ts`

### 方針
- Phase 4 で terminal 側入口は整っている
- Phase 5 では melody 側 action ができた段階で、terminal builder から melody action を呼ぶ形へ寄せる余地がある
- ただし最初からそこまで広げず、melody 本体の入口整理を優先する

---

## 7. 実施順
1. `ui/melody` の入口作成
2. timeline 側の melody 参照を新入口へ切り替える
3. `melody-ui-store.ts` の selector 追加
4. `app/melody` の input / action 入口作成
5. `storeMelody.ts` から domain 型 / 純粋ロジック切り出し
6. terminal builder の melody 接続を必要に応じて見直す

---

## 8. 最初に分離しやすい単位
### 最優先
- `Cursor.svelte`
- `UnitDisplay.svelte`
- `ActiveTrack.svelte`
- `ShadeTracks.svelte`
- `GridRootFrame.svelte` からの melody 参照入口

### 次点
- `inputMelody.ts` の入口
- `reducerMelody.ts` の入口
- `storeMelody.ts` の domain 化

### 後回しでよいもの
- `Note.svelte` の本格分解
- `Factors.svelte`, `ShadeNote.svelte`
- terminal builder から melody action を直接呼ぶ整理

---

## まとめ
Phase 5 では、melody を `timeline 上の編集機能` として捉え、

- melody UI
- melody action
- melody state
- melody domain
- timeline 境界

の順で整理していくのが安全でわかりやすい。
