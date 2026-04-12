# 作曲設計ソフト: 最初に作るディレクトリ構成

## 1. 方針
最初の構成は、機能追加よりも責務分離を優先する。

特に以下を最初から分ける。
- UI
- Application
- Domain
- Infrastructure
- Desktop runtime

この分け方にしておくと、Svelte の書き方や Tauri 連携を後から見直しても、音楽設計ロジックを壊しにくい。

## 2. 推奨構成
```text
scorehack/
  apps/
    desktop/
      src/
        app/
          App.svelte
          main.ts
        ui/
          layout/
          outline/
          timeline/
          terminal/
          preview/
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
      src-tauri/
        src/
          main.rs
          commands/
            file.rs
            musicxml.rs
          domain_bridge/
      package.json
      vite.config.ts
      tauri.conf.json
  packages/
    domain/
      src/
        song/
          song.ts
          song-metadata.ts
        outline/
          outline-element.ts
          section.ts
          chord-event.ts
          modulate-event.ts
          tempo-event.ts
          timesignature-event.ts
        harmony/
          tonality.ts
          chord.ts
          degree-chord.ts
        melody/
          melody-note.ts
          melody-track.ts
        arrange/
          arrange-track.ts
          arrange-method.ts
        timeline/
          timeline-cache.ts
          transport.ts
        ids/
          ids.ts
        shared/
          brand.ts
          result.ts
          range.ts
        index.ts
    application/
      src/
        commands/
          command-types.ts
          command-registry.ts
        usecases/
          create-song.ts
          add-outline-element.ts
          update-chord.ts
          update-tempo.ts
          update-timesignature.ts
          update-modulation.ts
          add-melody-note.ts
          move-focus.ts
        services/
          playback-service.ts
          song-file-service.ts
        state/
          app-state.ts
          selection-state.ts
        mappers/
          view-model-mapper.ts
        index.ts
    infra/
      src/
        file/
          song-file-schema.ts
          song-file-repository.ts
        playback/
          web-playback-engine.ts
        musicxml/
          musicxml-exporter.ts
        index.ts
  docs/
    architecture/
    specs/
```

## 3. 最初の実装で本当に必要な最小集合
全部を同時に作る必要はない。

最初の着手は以下で十分。

```text
apps/
  desktop/
    src/
      app/
      ui/
      ui-state/
      entrypoints/
packages/
  domain/
    src/
      song/
      outline/
      harmony/
      melody/
      timeline/
      shared/
  application/
    src/
      usecases/
      state/
      mappers/
  infra/
    src/
      file/
      playback/
```

## 4. ディレクトリごとの責務
### `apps/desktop/src/ui`
Svelte コンポーネントだけを置く。

ここには音楽理論計算や直接的な状態更新ロジックを置かない。

### `apps/desktop/src/ui-state`
スクロール位置、表示中パネル、カーソル表示など、UI固有の状態を置く。

### `apps/desktop/src/entrypoints`
キーボード入力やターミナル入力を受けて、Application に流す入口を置く。

### `packages/domain`
曲データそのものと、音楽設計ルールを置く。

ここは最重要で、Svelte や Tauri に依存させない。

### `packages/application`
ユーザー操作をユースケースとして実行する層。

`add chord`, `change tempo`, `insert note` などをここに置く。

### `packages/infra`
保存、再生、MusicXML などの外部I/Oを扱う。

## 5. 現行構成からの移し先
- 現行 `src/system/component/*`
  - 新 `apps/desktop/src/ui/*`
- 現行 `src/system/input/*`
  - 新 `apps/desktop/src/entrypoints/*`
- 現行 `src/system/store/reducer/*`
  - 新 `packages/application/src/usecases/*` と `packages/domain/src/*`
- 現行 `src/system/util/preview/*`
  - 新 `packages/infra/src/playback/*`
- 現行 `src/system/util/fileUtil.ts`
  - 新 `packages/infra/src/file/*`

## 6. 最初に空で作ってよいもの
最初から詳細実装しなくてよいが、枠だけ先に作ると迷いにくい。

- `packages/domain/src/arrange/`
- `packages/infra/src/musicxml/`
- `apps/desktop/src/adapters/tauri-command-adapter.ts`

## 7. 最初に作らないほうがいいもの
初期段階で作り込みすぎると、むしろ設計を固めにくくなる。

- plugin 系
- 複数 app 構成
- 過度な共通UIコンポーネント層
- 高度な設定画面
- finder / pattern library の詳細階層

## 8. 最初のゴール
この構成で最初に目指す状態は以下。

- `packages/domain` に Song と OutlineElement 群がある
- `packages/application` に `add-outline-element` などのユースケースがある
- `apps/desktop` からユースケースを呼べる
- 画面に outline を表示できる

