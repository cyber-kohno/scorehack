# tauri_app 新フォルダ構成案

## 目的

この文書は、`refer_app` の整理結果をもとに、
`tauri_app` を今後どのようなフォルダ構成へ移行するかを具体化したものである。

ポイントは次の4点。

1. 機能単位で理解しやすいこと
2. UI とロジックの責務が混ざらないこと
3. Tauri 依存箇所が閉じ込められること
4. 将来的な `piano / guitar / AI連携 / MusicXML` の拡張に耐えること

---

## 1. 基本方針

`tauri_app` では、現行 `system` のような大きな一塊ではなく、
以下の5層で考える。

1. `ui`
2. `app`
3. `domain`
4. `infra`
5. `state`

それに加えて、Tauri 固有の Rust 側は `src-tauri` に閉じ込める。

---

## 2. 推奨構成

```text
tauri_app/
  src/
    app/
      bootstrap/
      shell/
      outline/
      melody/
      timeline/
      terminal/
      playback/
      arrange/
      project-io/
    ui/
      shell/
      header/
      outline/
      timeline/
      melody/
      terminal/
      arrange/
      common/
    domain/
      song/
      outline/
      melody/
      arrange/
      playback/
      theory/
      project/
    infra/
      tauri/
      audio/
      persistence/
      preview/
    state/
      app-state/
      ui-state/
      session-state/
      refs/
    styles/
      tokens/
      base/
    lib/
      utils/
    assets/
    main.ts
    App.svelte
  src-tauri/
    src/
      commands/
      services/
    capabilities/
```

---

## 3. 各ディレクトリの責務

## 3.1 `src/app`

役割:

- 画面操作やコマンドをユースケースとしてまとめる
- state を更新する
- UI から呼ばれるアクションの入口になる

置くもの:

- モード切替
- アウトライン移動
- メロディ編集操作
- ターミナルコマンド実行
- 再生開始・停止
- save/load/import

置かないもの:

- Svelte コンポーネント
- 純粋な音楽理論計算
- Tauri API 直接呼び出し

### 推奨サブ構成

```text
src/app/bootstrap/
  initialize-app.ts
  bind-global-keyboard.ts
  apply-layout-variables.ts

src/app/shell/
  switch-mode.ts
  open-terminal.ts
  close-terminal.ts

src/app/outline/
  move-outline-focus.ts
  insert-outline-element.ts
  update-chord.ts
  update-modulation.ts
  update-tempo.ts
  update-time-signature.ts

src/app/melody/
  move-melody-cursor.ts
  insert-note.ts
  delete-note.ts
  select-note.ts
  change-note-length.ts
  switch-score-track.ts
  manage-audio-track.ts

src/app/timeline/
  sync-focus-from-outline.ts
  recalc-timeline-cache.ts
  adjust-scroll.ts

src/app/terminal/
  execute-command.ts
  build-command-catalog.ts
  terminal-logger.ts

src/app/playback/
  start-playback.ts
  stop-playback.ts
  load-soundfont.ts
  schedule-playback.ts

src/app/arrange/
  open-arrange-editor.ts
  open-arrange-finder.ts
  update-piano-backing.ts
  update-guitar-backing.ts

src/app/project-io/
  save-project.ts
  load-project.ts
  import-audio.ts
  export-midi.ts
```

---

## 3.2 `src/ui`

役割:

- 見た目を持つ Svelte コンポーネント
- レイアウトと描画
- ユーザー入力イベントの受け口

置くもの:

- frame
- pane
- list
- row
- dialog
- overlay

置かないもの:

- 音楽理論
- Tauri API 呼び出し
- 生の state 更新ロジック

### 推奨サブ構成

```text
src/ui/shell/
  RootLayout.svelte
  MainWorkspace.svelte

src/ui/header/
  AppHeader.svelte
  ModeLabel.svelte

src/ui/outline/
  OutlineFrame.svelte
  OutlineHeader.svelte
  OutlineElementList.svelte
  OutlineElementRow.svelte
  outline-elements/
    InitElementRow.svelte
    SectionElementRow.svelte
    ChordElementRow.svelte
    ModulationElementRow.svelte
    TempoElementRow.svelte
    TimeSignatureElementRow.svelte

src/ui/timeline/
  TimelineFrame.svelte
  TimelineHeader.svelte
  TimelineGrid.svelte
  PitchColumn.svelte
  grid/
    BeatGrid.svelte
    ChordBlock.svelte
    NoteBlock.svelte
    CursorBlock.svelte
    PreviewPositionLine.svelte

src/ui/melody/
  MelodyTrackLayer.svelte
  ActiveTrackView.svelte

src/ui/terminal/
  TerminalWindow.svelte
  TerminalInput.svelte
  TerminalOutput.svelte
  TerminalTable.svelte

src/ui/arrange/
  ArrangeWindow.svelte
  ArrangeFinderWindow.svelte
  piano/
    PianoBackingEditor.svelte
    PianoVoicingSelector.svelte
  guitar/
    GuitarBackingEditor.svelte

src/ui/common/
  FocusCover.svelte
  ScrollContainer.svelte
  HighlightText.svelte
```

---

## 3.3 `src/domain`

役割:

- アプリの中核概念を UI 非依存で表現する
- 純粋な型と関数を持つ

置くもの:

- Song
- OutlineElement
- MelodyNote
- ArrangeTrack
- Tonality
- TimeSignature
- Chord 構造

### 推奨サブ構成

```text
src/domain/song/
  song.ts
  song-section.ts

src/domain/outline/
  outline-element.ts
  outline-sequence.ts

src/domain/melody/
  melody-track.ts
  melody-note.ts
  note-length.ts

src/domain/arrange/
  arrange-track.ts
  piano-backing.ts
  guitar-backing.ts

src/domain/playback/
  playback-plan.ts
  playback-event.ts

src/domain/theory/
  tonality.ts
  time-signature.ts
  chord-symbol.ts
  degree.ts
  music-theory.ts

src/domain/project/
  project-file.ts
```

---

## 3.4 `src/infra`

役割:

- 外部 API や外部ライブラリ依存を閉じ込める

置くもの:

- Tauri dialog / fs
- AudioContext
- SoundFont
- 将来の MusicXML

### 推奨サブ構成

```text
src/infra/tauri/
  dialog.ts
  fs.ts
  commands.ts

src/infra/audio/
  audio-player.ts
  soundfont-loader.ts

src/infra/persistence/
  project-repository.ts
  midi-exporter.ts
  musicxml-repository.ts

src/infra/preview/
  playback-scheduler.ts
```

---

## 3.5 `src/state`

役割:

- store の責務を種類別に分割する

現行 `store.ts` は以下が混ざっている。

- 永続データ
- UI 状態
- 入力状態
- preview 状態
- DOM refs
- file handle

これを最低でも4種類に分ける。

### 推奨サブ構成

```text
src/state/app-state/
  project-store.ts
  outline-store.ts
  melody-store.ts
  arrange-store.ts

src/state/ui-state/
  shell-ui-store.ts
  timeline-ui-store.ts
  terminal-ui-store.ts
  arrange-ui-store.ts

src/state/session-state/
  playback-session-store.ts
  keyboard-store.ts
  command-session-store.ts

src/state/refs/
  dom-refs-store.ts
```

### 分離の考え方

- `app-state`: 保存対象になるデータ
- `ui-state`: 表示やフォーカスなど保存しなくてよい状態
- `session-state`: 再生中やキー押下中の一時状態
- `refs`: DOM ノード参照

---

## 3.6 `src/styles`

役割:

- CSS 変数
- グローバルスタイル
- レイアウトトークン

現行の `disignInitializer.ts` に集まっている CSS 変数は、
最終的に `styles/tokens` と `app/bootstrap/apply-layout-variables.ts` に整理する。

### 推奨サブ構成

```text
src/styles/tokens/
  layout-tokens.ts
  color-tokens.css
  size-tokens.css

src/styles/base/
  reset.css
  app.css
```

---

## 4. `system` からの移行方針

`tauri_app/src/system` は、最終的には残さない方がよい。

ただし一気に消すのではなく、次の段階を踏む。

1. `system` は現行互換層として残す
2. 新しい処理から `app / ui / domain / infra / state` に移す
3. 参照がなくなった `system` 配下を段階削除する

この進め方なら、既存挙動を維持したまま移行できる。

---

## 5. 初期フェーズで先に作るべき場所

最初から全てを移す必要はない。
まずは以下だけ先に整えるとよい。

```text
src/
  app/
    bootstrap/
    shell/
    outline/
    melody/
    terminal/
    playback/
    project-io/
  ui/
    shell/
    header/
    outline/
    timeline/
    terminal/
    common/
  domain/
    theory/
    outline/
    melody/
    project/
  infra/
    tauri/
    audio/
    persistence/
  state/
    app-state/
    ui-state/
    session-state/
    refs/
```

`arrange` は範囲が広いため、MVP 後または中盤から切り出してもよい。

---

## 6. 実装時のルール

### 6.1 命名

- `reducer` という名前は今後使わない
- `util` という名前は純粋関数群に限定し、それ以外では使わない
- `builder` は `command` または `catalog` に置き換える

### 6.2 store

- 1つの巨大 store に戻さない
- 保存対象データと UI 状態を混在させない
- DOM ref を保存対象 state に入れない

### 6.3 UI

- フレームと部品を分ける
- `Frame` は大きな領域
- `Pane` は機能単位の表示領域
- `Row` や `Block` は小部品

### 6.4 infra

- Tauri API 直接呼び出しは `infra` からのみ
- `ui` や `domain` から直接 `@tauri-apps/*` を呼ばない

---

## 7. まとめ

`tauri_app` の新構成は、単なるフォルダ整理ではなく、
以下を達成するための土台である。

- 現行の機能を保ったまま理解しやすくする
- Tauri 依存を閉じ込める
- Svelte 側の責務を明確にする
- 将来の機能追加をしやすくする

最終的な合言葉は次の通り。

- `ui` は描画する
- `app` は操作を実行する
- `domain` は意味を定義する
- `infra` は外部とつなぐ
- `state` は状態を持つ
