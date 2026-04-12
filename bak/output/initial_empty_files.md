# 作曲設計ソフト: 実際に作る空ファイル一覧

## 1. 方針
最初は「全部の理想形」を作らず、`Phase 1` と `Phase 2` の着手に必要な空ファイルだけを切る。

優先順位は以下。
- アプリ起動に必要
- ドメイン型定義に必要
- ユースケース接続に必要
- UIの最小表示に必要
- 将来拡張の予約席

## 2. まず作る必須ファイル
この一覧は、最初の作業開始時に一気に作ってよい。

```text
apps/desktop/
  package.json
  tsconfig.json
  vite.config.ts
  svelte.config.js
  tauri.conf.json

apps/desktop/src/
  app/
    main.ts
    App.svelte
  ui/
    layout/
      RootLayout.svelte
    outline/
      OutlinePane.svelte
      OutlineList.svelte
      OutlineRow.svelte
    timeline/
      TimelinePane.svelte
    terminal/
      TerminalPane.svelte
    preview/
      PreviewOverlay.svelte
  ui-state/
    app-ui-store.ts
    focus-ui-store.ts
    terminal-ui-store.ts
  entrypoints/
    keyboard-entry.ts
    terminal-entry.ts
  adapters/
    playback-adapter.ts
    file-adapter.ts
    tauri-command-adapter.ts

apps/desktop/src-tauri/src/
  main.rs
  lib.rs
  commands/
    mod.rs
    file.rs
    musicxml.rs

packages/domain/src/
  index.ts
  ids/
    ids.ts
  song/
    song.ts
    song-metadata.ts
    create-empty-song.ts
  outline/
    outline-element.ts
    init-element.ts
    section-element.ts
    chord-element.ts
    modulate-element.ts
    tempo-element.ts
    timesignature-element.ts
  harmony/
    tonality.ts
    time-signature.ts
    degree-chord.ts
    chord-symbol.ts
    beat-length.ts
  melody/
    melody-note.ts
    melody-track.ts
    create-default-melody-track.ts
  arrange/
    arrange-track.ts
    arrange-method.ts
    create-arrange-track.ts
  timeline/
    resolved-song-context.ts
    chord-span.ts
  shared/
    result.ts
    range.ts

packages/application/src/
  index.ts
  state/
    app-state.ts
    selection-state.ts
  usecases/
    create-song.ts
    add-outline-element.ts
    remove-outline-element.ts
    move-outline-focus.ts
    update-chord.ts
    update-modulation.ts
    update-tempo.ts
    update-timesignature.ts
    add-melody-note.ts
    remove-melody-note.ts
  mappers/
    view-model-mapper.ts
  services/
    playback-service.ts
    song-file-service.ts

packages/infra/src/
  index.ts
  file/
    song-file-schema.ts
    song-file-repository.ts
  playback/
    web-playback-engine.ts
```

## 3. 最初の1日で本当に必要な最小ファイル
最小起動だけを目指すなら、このセットでよい。

```text
apps/desktop/src/app/main.ts
apps/desktop/src/app/App.svelte
apps/desktop/src/ui/layout/RootLayout.svelte
apps/desktop/src/ui/outline/OutlinePane.svelte
apps/desktop/src/ui/timeline/TimelinePane.svelte

packages/domain/src/index.ts
packages/domain/src/song/song.ts
packages/domain/src/outline/outline-element.ts
packages/domain/src/harmony/tonality.ts
packages/domain/src/harmony/time-signature.ts
packages/domain/src/melody/melody-track.ts

packages/application/src/index.ts
packages/application/src/usecases/create-song.ts

packages/infra/src/index.ts
packages/infra/src/file/song-file-schema.ts
```

## 4. 最初の週で作るファイル
ここまであると `Song` を作って outline 表示まで進めやすい。

```text
apps/desktop/src/ui/outline/OutlineList.svelte
apps/desktop/src/ui/outline/OutlineRow.svelte
apps/desktop/src/ui/terminal/TerminalPane.svelte
apps/desktop/src/ui-state/app-ui-store.ts
apps/desktop/src/entrypoints/keyboard-entry.ts

packages/domain/src/song/create-empty-song.ts
packages/domain/src/outline/init-element.ts
packages/domain/src/outline/section-element.ts
packages/domain/src/outline/chord-element.ts
packages/domain/src/outline/modulate-element.ts
packages/domain/src/outline/tempo-element.ts
packages/domain/src/outline/timesignature-element.ts
packages/domain/src/harmony/degree-chord.ts
packages/domain/src/harmony/chord-symbol.ts
packages/domain/src/harmony/beat-length.ts
packages/domain/src/melody/melody-note.ts
packages/domain/src/melody/create-default-melody-track.ts

packages/application/src/state/app-state.ts
packages/application/src/state/selection-state.ts
packages/application/src/usecases/add-outline-element.ts
packages/application/src/usecases/remove-outline-element.ts
packages/application/src/usecases/move-outline-focus.ts
packages/application/src/mappers/view-model-mapper.ts
```

## 5. 2週目以降で追加する予約ファイル
最初から空で切ってもよいが、未使用のまま増やしすぎないほうがよい。

```text
apps/desktop/src/ui/preview/PreviewOverlay.svelte
apps/desktop/src/ui/terminal/TerminalCommandLine.svelte
apps/desktop/src/ui/terminal/TerminalOutput.svelte
apps/desktop/src/entrypoints/terminal-entry.ts
apps/desktop/src/adapters/playback-adapter.ts
apps/desktop/src/adapters/file-adapter.ts
apps/desktop/src/adapters/tauri-command-adapter.ts

packages/application/src/usecases/update-chord.ts
packages/application/src/usecases/update-modulation.ts
packages/application/src/usecases/update-tempo.ts
packages/application/src/usecases/update-timesignature.ts
packages/application/src/usecases/add-melody-note.ts
packages/application/src/usecases/remove-melody-note.ts
packages/application/src/services/playback-service.ts
packages/application/src/services/song-file-service.ts

packages/domain/src/arrange/arrange-track.ts
packages/domain/src/arrange/arrange-method.ts
packages/domain/src/arrange/create-arrange-track.ts
packages/domain/src/timeline/resolved-song-context.ts
packages/domain/src/timeline/chord-span.ts

packages/infra/src/file/song-file-repository.ts
packages/infra/src/playback/web-playback-engine.ts

apps/desktop/src-tauri/src/commands/file.rs
apps/desktop/src-tauri/src/commands/musicxml.rs
```

## 6. 最初は空でなく雛形を入れるべきファイル
以下は空ファイルより、最小exportだけ入れたほうが後で楽。

- `packages/domain/src/index.ts`
- `packages/application/src/index.ts`
- `packages/infra/src/index.ts`
- `apps/desktop/src/app/main.ts`
- `apps/desktop/src/app/App.svelte`

## 7. 最初にディレクトリだけで十分な場所
以下はファイルをまだ切らず、フォルダだけでもよい。

- `packages/domain/src/arrange/`
- `packages/infra/src/playback/`
- `apps/desktop/src/ui/preview/`
- `apps/desktop/src-tauri/src/domain_bridge/`

## 8. 作成順のおすすめ
### Step 1
- `apps/desktop/src/app/*`
- `packages/domain/src/song/*`
- `packages/domain/src/outline/outline-element.ts`

### Step 2
- `packages/domain/src/harmony/*`
- `packages/domain/src/melody/*`
- `packages/application/src/usecases/create-song.ts`

### Step 3
- `apps/desktop/src/ui/layout/*`
- `apps/desktop/src/ui/outline/*`
- `packages/application/src/state/*`

### Step 4
- `apps/desktop/src/entrypoints/*`
- `apps/desktop/src/ui-state/*`
- `packages/application/src/usecases/add-outline-element.ts`

## 9. 完了判定
この空ファイル一覧を切り終えた段階で、次の状態に入れれば十分。

- import パスの迷いがない
- `Song` 初期化の居場所が決まっている
- outline 描画の入口がある
- UI と domain の依存方向が固定されている

