# refer_app -> tauri_app 移行マップ

## 目的

この文書は、`refer_app` の現行ファイルを、
`tauri_app` のどこへ移す想定かを整理した対応表である。

ここでの移行先は「今すぐそのまま移動する場所」ではなく、
`最終的に責務としてどこへ属するべきか` を示す。

---

## 1. 移行の前提

### 1.1 そのまま移動しないもの

以下はファイル単位での移動より、分割してから移す前提で考える。

- `refer_app/src/Entry.svelte`
- `refer_app/src/system/MainFrame.svelte`
- `refer_app/src/system/store/store.ts`
- `refer_app/src/system/util/preview/previewUtil.ts`
- `refer_app/src/system/util/fileUtil.ts`
- `refer_app/src/system/store/reducer/reducerRoot.ts`
- `refer_app/src/system/input/inputRoot.ts`

理由:

- 責務が広すぎる
- 複数機能を横断している
- UI / state / 副作用が混在している

### 1.2 比較的そのまま移しやすいもの

- 音楽理論
- 小さい UI コンポーネント
- terminal の一部表示部品
- arrange の一部表示部品

---

## 2. ルートレベル移行

| 現行 | 移行先 | 方針 |
|---|---|---|
| `refer_app/src/Entry.svelte` | `tauri_app/src/app/bootstrap/initialize-app.ts` + `tauri_app/src/App.svelte` + `tauri_app/src/app/bootstrap/bind-global-keyboard.ts` | 分割移行 |
| `refer_app/src/system/MainFrame.svelte` | `tauri_app/src/ui/shell/RootLayout.svelte` | レイアウト責務だけ抽出 |

---

## 3. component 系移行マップ

## 3.1 header

| 現行 | 移行先 | 備考 |
|---|---|---|
| `refer_app/src/system/component/header/RootHeader.svelte` | `tauri_app/src/ui/header/AppHeader.svelte` | ヘッダ外枠 |
| `refer_app/src/system/component/header/ModeSwitch.svelte` | `tauri_app/src/ui/header/ModeLabel.svelte` | 現状は表示中心、切替操作は app 側へ |

## 3.2 outline

| 現行 | 移行先 | 備考 |
|---|---|---|
| `refer_app/src/system/component/outline/OutlineFrame.svelte` | `tauri_app/src/ui/outline/OutlineFrame.svelte` | フレーム |
| `refer_app/src/system/component/outline/ElementCurrentInfo.svelte` | `tauri_app/src/ui/outline/OutlineHeader.svelte` | ヘッダ情報表示へ統合候補 |
| `refer_app/src/system/component/outline/ElementListFrame.svelte` | `tauri_app/src/ui/outline/OutlineElementList.svelte` | リスト責務 |
| `refer_app/src/system/component/outline/element/Element.svelte` | `tauri_app/src/ui/outline/OutlineElementRow.svelte` | 種別分岐を整理 |
| `refer_app/src/system/component/outline/element/data/DataInit.svelte` | `tauri_app/src/ui/outline/outline-elements/InitElementRow.svelte` | 種別別部品 |
| `refer_app/src/system/component/outline/element/data/DataSection.svelte` | `tauri_app/src/ui/outline/outline-elements/SectionElementRow.svelte` | 種別別部品 |
| `refer_app/src/system/component/outline/element/data/DataChord.svelte` | `tauri_app/src/ui/outline/outline-elements/ChordElementRow.svelte` | 種別別部品 |
| `refer_app/src/system/component/outline/element/data/DataModulate.svelte` | `tauri_app/src/ui/outline/outline-elements/ModulationElementRow.svelte` | 種別別部品 |
| `refer_app/src/system/component/outline/element/data/DataTempo.svelte` | `tauri_app/src/ui/outline/outline-elements/TempoElementRow.svelte` | 未完成のため再実装前提 |
| `refer_app/src/system/component/outline/item/ChordSelector.svelte` | `tauri_app/src/ui/outline/ChordSelector.svelte` | outline 専用小部品 |

## 3.3 timeline

| 現行 | 移行先 | 備考 |
|---|---|---|
| `refer_app/src/system/component/timeline/TimelineFrame.svelte` | `tauri_app/src/ui/timeline/TimelineFrame.svelte` | 全体フレーム |
| `refer_app/src/system/component/timeline/TimelineTailMargin.svelte` | `tauri_app/src/ui/timeline/TimelineTailMargin.svelte` | 必要なら残す |
| `refer_app/src/system/component/timeline/header/BeatMeasureFrame.svelte` | `tauri_app/src/ui/timeline/TimelineHeader.svelte` | header 統合候補 |
| `refer_app/src/system/component/timeline/header/ChordListFrame.svelte` | `tauri_app/src/ui/timeline/ChordHeaderRow.svelte` | chord 行 |
| `refer_app/src/system/component/timeline/header/MeasureBlock.svelte` | `tauri_app/src/ui/timeline/header/MeasureBlock.svelte` | 小部品 |
| `refer_app/src/system/component/timeline/header/MeasureFocus.svelte` | `tauri_app/src/ui/timeline/header/MeasureFocus.svelte` | 小部品 |
| `refer_app/src/system/component/timeline/header/ProgressInfo.svelte` | `tauri_app/src/ui/timeline/header/ProgressInfo.svelte` | 再生情報表示 |
| `refer_app/src/system/component/timeline/pitch/PitchListFrame.svelte` | `tauri_app/src/ui/timeline/PitchColumn.svelte` | pitch 列 |
| `refer_app/src/system/component/timeline/pitch/PitchFocus.svelte` | `tauri_app/src/ui/timeline/pitch/PitchFocus.svelte` | 小部品 |
| `refer_app/src/system/component/timeline/grid/GridRootFrame.svelte` | `tauri_app/src/ui/timeline/TimelineGrid.svelte` | グリッド全体 |
| `refer_app/src/system/component/timeline/grid/BaseBlock.svelte` | `tauri_app/src/ui/timeline/grid/BaseBlock.svelte` | 小部品 |
| `refer_app/src/system/component/timeline/grid/ChordBlock.svelte` | `tauri_app/src/ui/timeline/grid/ChordBlock.svelte` | 小部品 |
| `refer_app/src/system/component/timeline/grid/GridFocus.svelte` | `tauri_app/src/ui/timeline/grid/GridFocus.svelte` | 小部品 |
| `refer_app/src/system/component/timeline/grid/PianoViewFrame.svelte` | `tauri_app/src/ui/timeline/grid/PianoViewFrame.svelte` | 表示名は再検討余地あり |
| `refer_app/src/system/component/timeline/grid/PreviewPosLine.svelte` | `tauri_app/src/ui/timeline/grid/PreviewPositionLine.svelte` | 命名統一 |
| `refer_app/src/system/component/timeline/grid/arrange/ArrangeNote.svelte` | `tauri_app/src/ui/timeline/grid/arrange/ArrangeNote.svelte` | arrange 表示専用に分離 |
| `refer_app/src/system/component/timeline/grid/arrange/ArrangeTracksManager.svelte` | `tauri_app/src/ui/timeline/grid/arrange/ArrangeTracksManager.svelte` | arrange 表示専用 |

## 3.4 melody

| 現行 | 移行先 | 備考 |
|---|---|---|
| `refer_app/src/system/component/melody/Cursor.svelte` | `tauri_app/src/ui/melody/Cursor.svelte` | 小部品 |
| `refer_app/src/system/component/melody/UnitDisplay.svelte` | `tauri_app/src/ui/melody/UnitDisplay.svelte` | UI 部品 |
| `refer_app/src/system/component/melody/score/ActiveTrack.svelte` | `tauri_app/src/ui/melody/ActiveTrackView.svelte` | 表示名整理 |
| `refer_app/src/system/component/melody/score/Factors.svelte` | `tauri_app/src/ui/melody/Factors.svelte` | UI 部品 |
| `refer_app/src/system/component/melody/score/Note.svelte` | `tauri_app/src/ui/melody/NoteBlock.svelte` | timeline 側へ寄せてもよい |
| `refer_app/src/system/component/melody/score/ShadeNote.svelte` | `tauri_app/src/ui/melody/ShadeNote.svelte` | 補助表示 |
| `refer_app/src/system/component/melody/score/ShadeTracks.svelte` | `tauri_app/src/ui/melody/ShadeTracks.svelte` | 補助表示 |

## 3.5 terminal

| 現行 | 移行先 | 備考 |
|---|---|---|
| `refer_app/src/system/component/terminal/TerminalFrame.svelte` | `tauri_app/src/ui/terminal/TerminalWindow.svelte` | ウィンドウ |
| `refer_app/src/system/component/terminal/HelperFrame.svelte` | `tauri_app/src/ui/terminal/TerminalHelper.svelte` | 補助表示 |
| `refer_app/src/system/component/terminal/CommandCursor.svelte` | `tauri_app/src/ui/terminal/CommandCursor.svelte` | 入力補助 |
| `refer_app/src/system/component/terminal/TerminalOutput.svelte` | `tauri_app/src/ui/terminal/TerminalOutput.svelte` | 出力表示 |
| `refer_app/src/system/component/terminal/output/TBRecord.svelte` | `tauri_app/src/ui/terminal/output/TerminalRecordRow.svelte` | 命名整理 |
| `refer_app/src/system/component/terminal/output/TBTable.svelte` | `tauri_app/src/ui/terminal/output/TerminalTable.svelte` | 命名整理 |

## 3.6 arrange

| 現行 | 移行先 | 備考 |
|---|---|---|
| `refer_app/src/system/component/arrange/ArrangeFrame.svelte` | `tauri_app/src/ui/arrange/ArrangeWindow.svelte` | arrange 全体 |
| `refer_app/src/system/component/arrange/ChordInfoHeader.svelte` | `tauri_app/src/ui/arrange/ChordInfoHeader.svelte` | 共通ヘッダ |
| `refer_app/src/system/component/arrange/FocusableContent.svelte` | `tauri_app/src/ui/arrange/FocusableContent.svelte` | 共通部品 |
| `refer_app/src/system/component/arrange/status/ArrangeStatusBar.svelte` | `tauri_app/src/ui/arrange/ArrangeStatusBar.svelte` | status 表示 |
| `refer_app/src/system/component/arrange/status/SideItemLabel.svelte` | `tauri_app/src/ui/arrange/SideItemLabel.svelte` | 小部品 |
| `refer_app/src/system/component/arrange/finder/ArrangeFinderFrame.svelte` | `tauri_app/src/ui/arrange/ArrangeFinderWindow.svelte` | finder 本体 |
| `refer_app/src/system/component/arrange/finder/condition/*` | `tauri_app/src/ui/arrange/finder/condition/*` | ほぼそのまま |
| `refer_app/src/system/component/arrange/finder/list/piano/*` | `tauri_app/src/ui/arrange/finder/list/piano/*` | ほぼそのまま |
| `refer_app/src/system/component/arrange/piano/ArrangePianoEditor.svelte` | `tauri_app/src/ui/arrange/piano/PianoBackingEditor.svelte` | ピアノ専用化 |
| `refer_app/src/system/component/arrange/piano/backing/*` | `tauri_app/src/ui/arrange/piano/backing/*` | ピアノ backing UI |
| `refer_app/src/system/component/arrange/piano/backing/table/*` | `tauri_app/src/ui/arrange/piano/backing/table/*` | テーブル UI |
| `refer_app/src/system/component/arrange/piano/voicing/*` | `tauri_app/src/ui/arrange/piano/voicing/*` | ボイシング UI |

## 3.7 common

| 現行 | 移行先 | 備考 |
|---|---|---|
| `refer_app/src/system/component/common/FocusCover.svelte` | `tauri_app/src/ui/common/FocusCover.svelte` | 共通部品 |
| `refer_app/src/system/component/common/HighlightText.svelte` | `tauri_app/src/ui/common/HighlightText.svelte` | 共通部品 |
| `refer_app/src/system/component/common/ScrollRateFrame.svelte` | `tauri_app/src/ui/common/ScrollContainer.svelte` | 命名再考推奨 |

---

## 4. input 系移行マップ

`input` は最終的に `app` 側へ吸収する。
理由は、入力自体が独立機能ではなく「操作の入口」だからである。

| 現行 | 移行先 | 備考 |
|---|---|---|
| `refer_app/src/system/input/inputRoot.ts` | `tauri_app/src/app/bootstrap/bind-global-keyboard.ts` + `tauri_app/src/app/shell/keyboard-router.ts` | ルーティングへ分解 |
| `refer_app/src/system/input/inputOutline.ts` | `tauri_app/src/app/outline/outline-keyboard.ts` | outline 操作に統合 |
| `refer_app/src/system/input/inputMelody.ts` | `tauri_app/src/app/melody/melody-keyboard.ts` | melody 操作に統合 |
| `refer_app/src/system/input/inputTerminal.ts` | `tauri_app/src/app/terminal/terminal-keyboard.ts` | terminal 操作に統合 |
| `refer_app/src/system/input/arrange/inputArrange.ts` | `tauri_app/src/app/arrange/arrange-keyboard.ts` | arrange 操作へ |
| `refer_app/src/system/input/arrange/inputPianoEditor.ts` | `tauri_app/src/app/arrange/piano-editor-keyboard.ts` | ピアノ専用へ |
| `refer_app/src/system/input/arrange/inputGuitarEditor.ts` | `tauri_app/src/app/arrange/guitar-editor-keyboard.ts` | 将来実装前提 |
| `refer_app/src/system/input/arrange/finder/inputFinder.ts` | `tauri_app/src/app/arrange/finder-keyboard.ts` | finder 操作へ |

---

## 5. store / reducer / props 系移行マップ

## 5.1 ルート store

| 現行 | 移行先 | 備考 |
|---|---|---|
| `refer_app/src/system/store/store.ts` | `tauri_app/src/state/app-state/*` + `tauri_app/src/state/ui-state/*` + `tauri_app/src/state/session-state/*` + `tauri_app/src/state/refs/*` | 分割前提 |
| `refer_app/src/system/store/contextUtil.ts` | `tauri_app/src/app/bootstrap/context.ts` または削除 | 必要性再評価 |

## 5.2 props

| 現行 | 移行先 | 備考 |
|---|---|---|
| `refer_app/src/system/store/props/storeData.ts` | `tauri_app/src/state/app-state/project-store.ts` | 永続データ |
| `refer_app/src/system/store/props/storeControl.ts` | `tauri_app/src/state/ui-state/shell-ui-store.ts` + `tauri_app/src/state/ui-state/outline-ui-store.ts` + `tauri_app/src/state/ui-state/melody-ui-store.ts` | 分割前提 |
| `refer_app/src/system/store/props/storeInput.ts` | `tauri_app/src/state/session-state/keyboard-store.ts` | キー押下状態 |
| `refer_app/src/system/store/props/storePreview.ts` | `tauri_app/src/state/session-state/playback-session-store.ts` | 再生セッション |
| `refer_app/src/system/store/props/storeCache.ts` | `tauri_app/src/state/ui-state/timeline-cache-store.ts` | 表示キャッシュ |
| `refer_app/src/system/store/props/storeRef.ts` | `tauri_app/src/state/refs/dom-refs-store.ts` | DOM ref 専用 |
| `refer_app/src/system/store/props/storeFile.ts` | `tauri_app/src/state/session-state/project-file-store.ts` | 保存先参照 |
| `refer_app/src/system/store/props/storeTerminal.ts` | `tauri_app/src/state/ui-state/terminal-ui-store.ts` | terminal UI 状態 |

## 5.3 arrange props

| 現行 | 移行先 | 備考 |
|---|---|---|
| `refer_app/src/system/store/props/arrange/storeArrange.ts` | `tauri_app/src/state/app-state/arrange-store.ts` | arrange 永続状態 |
| `refer_app/src/system/store/props/arrange/arrangeLibrary.ts` | `tauri_app/src/domain/arrange/arrange-library.ts` | domain 化候補 |
| `refer_app/src/system/store/props/arrange/piano/storePianoBacking.ts` | `tauri_app/src/domain/arrange/piano-backing.ts` + `tauri_app/src/state/app-state/arrange-store.ts` | 型と状態を分離 |
| `refer_app/src/system/store/props/arrange/piano/storePianoEditor.ts` | `tauri_app/src/state/ui-state/arrange-ui-store.ts` | editor UI 状態 |

## 5.4 reducer

`reducer` は名前を変えて `actions / use-cases / services` に再配置する。

| 現行 | 移行先 | 備考 |
|---|---|---|
| `refer_app/src/system/store/reducer/reducerRoot.ts` | `tauri_app/src/app/shell/switch-mode.ts` + `tauri_app/src/app/shell/keyboard-router.ts` + `tauri_app/src/app/timeline/get-timeline-focus-pos.ts` | 分割移行 |
| `refer_app/src/system/store/reducer/reducerOutline.ts` | `tauri_app/src/app/outline/*` | outline 操作群へ |
| `refer_app/src/system/store/reducer/reducerMelody.ts` | `tauri_app/src/app/melody/*` | melody 操作群へ |
| `refer_app/src/system/store/reducer/reducerTerminal.ts` | `tauri_app/src/app/terminal/*` | terminal 操作群へ |
| `refer_app/src/system/store/reducer/reducerRef.ts` | `tauri_app/src/app/timeline/adjust-scroll.ts` + `tauri_app/src/state/refs/*` | ref 操作へ分離 |
| `refer_app/src/system/store/reducer/reducerCache.ts` | `tauri_app/src/app/timeline/recalc-timeline-cache.ts` | cache 再計算 |
| `refer_app/src/system/store/reducer/arrangeUtil.ts` | `tauri_app/src/app/arrange/*` | arrange 操作へ |

---

## 6. terminal command 系移行マップ

terminal command は `state/reducer` 配下に置かず、
`app/terminal` の command 群へ移すのがよい。

| 現行 | 移行先 | 備考 |
|---|---|---|
| `refer_app/src/system/store/reducer/terminal/commandRegistUtil.ts` | `tauri_app/src/app/terminal/build-command-catalog.ts` | command 定義生成 |
| `refer_app/src/system/store/reducer/terminal/terminalLogger.ts` | `tauri_app/src/app/terminal/terminal-logger.ts` | terminal ログ整形 |
| `refer_app/src/system/store/reducer/terminal/helper/commandHelper.ts` | `tauri_app/src/app/terminal/command-helper.ts` | 共通補助 |
| `refer_app/src/system/store/reducer/terminal/sector/builderCommon.ts` | `tauri_app/src/app/terminal/commands/system-commands.ts` | カテゴリ単位へ |
| `refer_app/src/system/store/reducer/terminal/sector/builderInit.ts` | `tauri_app/src/app/terminal/commands/init-commands.ts` | カテゴリ単位へ |
| `refer_app/src/system/store/reducer/terminal/sector/builderSection.ts` | `tauri_app/src/app/terminal/commands/section-commands.ts` | カテゴリ単位へ |
| `refer_app/src/system/store/reducer/terminal/sector/builderChord.ts` | `tauri_app/src/app/terminal/commands/chord-commands.ts` | カテゴリ単位へ |
| `refer_app/src/system/store/reducer/terminal/sector/builderModulate.ts` | `tauri_app/src/app/terminal/commands/modulation-commands.ts` | カテゴリ単位へ |
| `refer_app/src/system/store/reducer/terminal/sector/builderMelody.ts` | `tauri_app/src/app/terminal/commands/melody-commands.ts` | カテゴリ単位へ |
| `refer_app/src/system/store/reducer/terminal/sector/builderHarmonize.ts` | `tauri_app/src/app/terminal/commands/harmonize-commands.ts` | カテゴリ単位へ |
| `refer_app/src/system/store/reducer/terminal/sector/builderPianoEditor.ts` | `tauri_app/src/app/terminal/commands/piano-editor-commands.ts` | arrange 側 command |

---

## 7. util / const 系移行マップ

## 7.1 util

| 現行 | 移行先 | 備考 |
|---|---|---|
| `refer_app/src/system/util/disignInitializer.ts` | `tauri_app/src/app/bootstrap/apply-layout-variables.ts` + `tauri_app/src/styles/tokens/layout-tokens.ts` | CSS 変数の責務分離 |
| `refer_app/src/system/util/fileUtil.ts` | `tauri_app/src/app/project-io/*` + `tauri_app/src/infra/tauri/*` + `tauri_app/src/infra/persistence/*` | 分割移行 |
| `refer_app/src/system/util/musicTheory.ts` | `tauri_app/src/domain/theory/music-theory.ts` | かなりそのまま移しやすい |
| `refer_app/src/system/util/pianoViewUtil.ts` | `tauri_app/src/app/timeline/piano-view.ts` または `tauri_app/src/ui/timeline/grid/piano-view.ts` | 性質を見て判断 |
| `refer_app/src/system/util/preview/previewUtil.ts` | `tauri_app/src/app/playback/*` + `tauri_app/src/infra/audio/*` + `tauri_app/src/infra/preview/*` | 分割移行 |
| `refer_app/src/system/util/preview/arrange/pianoArrangePreviewUtil.ts` | `tauri_app/src/app/arrange/piano-arrange-preview.ts` または `tauri_app/src/domain/arrange/piano-preview.ts` | 純粋性を見て判断 |

## 7.2 const

| 現行 | 移行先 | 備考 |
|---|---|---|
| `refer_app/src/system/const/layout.ts` | `tauri_app/src/styles/tokens/layout-tokens.ts` | レイアウトトークン化 |

---

## 8. 優先度つき移行順

### Phase 1: 先に分離すると理解しやすい

1. `refer_app/src/system/util/musicTheory.ts`
2. `refer_app/src/system/const/layout.ts`
3. `refer_app/src/system/util/disignInitializer.ts`
4. `refer_app/src/system/util/fileUtil.ts`
5. `refer_app/src/system/store/props/storeFile.ts`

### Phase 2: shell と基本 state

1. `refer_app/src/Entry.svelte`
2. `refer_app/src/system/MainFrame.svelte`
3. `refer_app/src/system/component/header/*`
4. `refer_app/src/system/store/store.ts`
5. `refer_app/src/system/input/inputRoot.ts`
6. `refer_app/src/system/store/reducer/reducerRoot.ts`

### Phase 3: outline / timeline / melody

1. `refer_app/src/system/component/outline/*`
2. `refer_app/src/system/input/inputOutline.ts`
3. `refer_app/src/system/store/reducer/reducerOutline.ts`
4. `refer_app/src/system/component/timeline/*`
5. `refer_app/src/system/component/melody/*`
6. `refer_app/src/system/input/inputMelody.ts`
7. `refer_app/src/system/store/reducer/reducerMelody.ts`
8. `refer_app/src/system/store/reducer/reducerCache.ts`

### Phase 4: terminal

1. `refer_app/src/system/component/terminal/*`
2. `refer_app/src/system/input/inputTerminal.ts`
3. `refer_app/src/system/store/reducer/reducerTerminal.ts`
4. `refer_app/src/system/store/reducer/terminal/**/*`

### Phase 5: playback

1. `refer_app/src/system/util/preview/previewUtil.ts`
2. `refer_app/src/system/store/props/storePreview.ts`
3. `refer_app/src/system/store/reducer/reducerRef.ts`

### Phase 6: arrange

1. `refer_app/src/system/component/arrange/**/*`
2. `refer_app/src/system/input/arrange/**/*`
3. `refer_app/src/system/store/props/arrange/**/*`
4. `refer_app/src/system/store/reducer/arrangeUtil.ts`
5. `refer_app/src/system/util/preview/arrange/pianoArrangePreviewUtil.ts`

---

## 9. 移行時の判断ルール

### 9.1 1ファイルに複数責務がある場合

そのまま移動しない。

以下の順で分ける。

1. UI
2. state
3. app logic
4. infra

### 9.2 store 依存ファイル

現行 store を直接読んでいるファイルは、
移動前に「どの種類の state を見ているか」を確認する。

分類先:

- 永続データ
- UI 状態
- セッション状態
- DOM ref

### 9.3 util ファイル

`util` という名前のまま新構成へ入れない。

必ず次のいずれかへ振り分ける。

- `domain`
- `app`
- `infra`
- `lib`

---

## 10. まとめ

移行マップとして重要なのは、単に `A を B に移す` ことではない。

本質は次の通り。

- 現行の `component / input / store / util` という技術別分けをやめる
- `shell / outline / melody / timeline / terminal / playback / arrange / project-io / theory` の機能軸で理解する
- その上で `ui / app / domain / infra / state` の責務軸に落とす

この考え方で進めれば、`tauri_app` は
現行仕様を維持しながら、理解しやすい構造へ段階的に移行できる。
