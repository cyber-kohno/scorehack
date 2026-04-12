# 作曲設計ソフト: 実装マップ（リプレース計画）

## 1. 目的
現行 `refer_app` のプロトタイプ実装を、可読性・保守性・拡張性を重視した構造へ全面リプレースする。

## 2. ターゲット技術
- フロント: Svelte + TypeScript
- デスクトップ: Tauri
- バックエンド連携: Rust（Tauri command）
- データ検証: zod もしくは Rust側 schema

## 3. 推奨リポジトリ構成
- `apps/desktop` (Tauri + Svelte UI)
- `packages/domain` (音楽設計ドメインモデル・ユースケース)
- `packages/application` (コマンド実行、ユースケース調停)
- `packages/ui` (Svelteコンポーネント群)
- `packages/infra-web` (ブラウザ実装: Audio, File)
- `src-tauri` (Rust実装: File, MusicXML, 将来の重処理)

## 4. レイヤー責務
### Domain
- Song/Timeline/OutlineElement の型定義
- ビジネスルール（転調、拍子、テンポ、コード整合）
- 純粋関数で副作用なし

### Application
- キー入力やターミナルコマンドをユースケースに変換
- Undo/Redo、トランザクション境界
- 実行結果を ViewModel として返却

### Infrastructure
- ファイル保存/読込
- プレビュー再生エンジン
- MusicXML 変換
- Tauri-Rust ブリッジ

### UI
- 表示と入力イベントの収集のみ
- ストアは画面状態専用（ドメイン状態は Application 経由で更新）

## 5. 現行からの対応表
| 現行 | 役割 | 移行先 |
|---|---|---|
| `src/system/store/store.ts` | 巨大単一ストア | `packages/application` + UI専用storeに分離 |
| `src/system/store/reducer/*` | 状態更新ロジック | `domain` と `application` へ分割 |
| `src/system/input/*` | キーハンドラ | `application/input-router` |
| `src/system/store/reducer/terminal/*` | コマンド実行 | `application/terminal-command` |
| `src/system/util/preview/*` | プレビュー再生 | `infra-web/audio` + 必要に応じて `src-tauri` |
| `src/system/util/fileUtil.ts` | File System Access API依存 | Tauri File API + Rust I/O |
| `src/system/component/*` | UI | `packages/ui` に整理 |

## 6. 機能別モジュール案
- `domain/song`
- `domain/outline`
- `domain/chord`
- `domain/modulation`
- `domain/tempo`
- `domain/time-signature`
- `domain/melody`
- `domain/arrange-piano`
- `domain/arrange-guitar`
- `application/commands`
- `application/usecases`
- `application/playback`

## 7. コマンド実装マップ
- パーサ: `application/terminal/parse`
- バリデータ: `application/terminal/validate`
- 実行器: `application/terminal/execute`
- ヘルプ生成: `application/terminal/help`
- 履歴/補完: `application/terminal/history` と `application/terminal/completion`

## 8. Tauri移行マップ
- 現行 `window.showOpenFilePicker/showSaveFilePicker` は廃止
- `@tauri-apps/plugin-fs` で保存/読込
- 音源や大型処理は Rust command 化を検討
- MusicXML は Rust 側に export/import API を用意

## 9. フェーズ計画
### Phase 0: 土台
- 新規プロジェクト雛形（Tauri + Svelte）
- lint/format/check/test 基盤
- ドメイン型定義の最小セット

### Phase 1: 編集コア
- outline（section/chord/modulate/tempo/ts）
- melody編集
- キャッシュ再計算エンジン

### Phase 2: ターミナル
- 新コマンド体系
- 補完、ヘルプ、履歴
- 主要ユースケースを全コマンドから実行可能に

### Phase 3: プレビュー
- 再生エンジン抽象化
- melody + arrange の再生
- 再生追従表示

### Phase 4: arrange
- piano editor
- guitar editor
- finder / pattern library

### Phase 5: ファイルと連携
- 保存形式 v1
- import/export（将来 MusicXML 含む）
- AI連携用エクスポート（設計データの参照形式）

## 10. 先に解消すべき現行課題
- 型エラーを出す未完了ファイルの隔離または削除
- 未使用・未実装モジュールの明示管理
- track index/focus 混同の修正
- コマンド引数仕様の不整合解消
- 入力ハンドラのライフサイクル管理を統一

## 11. Done条件（リプレース完了定義）
- 主要機能（outline/melody/modulate/tempo/ts/piano/guitar）が新実装で動作
- コマンド体系が新仕様へ統一
- 旧実装依存なしで保存/読込が完結
- 型チェックとテストがCIで安定
- リファクタ容易な責務分離が維持される
