# Scorehack AI支援・MCP 引継ぎ資料

更新日: 2026-10-04

## 目的と現在地

最終的な目標は、CodexやClaudeなどのエージェントが、Scorehackで編集中の譜面と操作状態をMCP経由で調べ、音楽理論を踏まえてユーザーと会話できるようにすること。例えば、選択した歌メロと前後のセクション・コードを参照して、サビのリハーモナイズを複数案で提案する。将来は案をScorehack内のドラフトに表示し、ユーザーが確認して適用できるようにしたい。

現時点では**読み取り疎通のMVPに続き、音楽構造を照会する読み取りToolを実装**した。概要・操作状態からsnapshotを取得し、指定範囲のアウトライン、譜面トラックのノートとコード/調性の関係を照会できる。新Toolは自動テストで検証済みで、更新したアプリ/アダプタを使う実機確認は未実施。ドラフトと譜面の書き込みは未実装。責務分離と実装仕様は[`MCP_SCORE_QUERY_DESIGN.md`](MCP_SCORE_QUERY_DESIGN.md)、APIの使い方は[`apps/mcp/README.md`](../apps/mcp/README.md)を参照。

### MVPで確認した事実

- Codexから静的MCPアダプタの`ping`、`list_scorehack_sessions`、`get_score_overview`を呼べた。
- Scorehackの公開セッションを検出し、編集中の譜面トラック数・ノート数を取得できた。
- 同一セッションで、編集前はノート数`0`・`dirty: false`、保存前の編集後はノート数`7`・`dirty: true`が返った。保存ファイルではなく、アプリのライブ状態を読めている。
- `mcp start / stop / status`、ヘッダーの公開中バッジは実装済み。バッジは`MCP <displayId>`（セッションUUIDの先頭8文字）を表示し、クリックで完全なセッションIDをコピーする。実際のエージェント経由で確認したのは公開開始と読み取りであり、停止操作とバッジの目視確認は別途行うとよい。

上記のセッションID・ノート数は検証時の値であり、固定データではない。

## 確定した接続方式

完全ローカルアプリを前提とする。接続の骨格は次で確定した。

```text
Codex / Claudeなどのローカルエージェント
    ↕ stdio MCP
apps/mcp の Rust製 scorehack-mcp（静的アダプタ）
    ↕ 認証付き localhost HTTP
apps/tauri_app の Tauri側ブリッジ
    ↕ Tauriイベントと応答コマンド
WebView内の dataStore / fileStore
```

アダプタのTool一覧はScorehackが起動していなくても固定。アプリ側で`mcp start`を実行すると、動的ポートとセッション情報が公開される。アダプタは毎回セッションを検証してからアプリへ照会する。ローカルHTTPはMCPの外部公開用エンドポイントではなく、アダプタとTauri間の内部通信である。

### ディレクトリと担当

| 場所 | 役割 |
| --- | --- |
| [`apps/mcp`](../apps/mcp/) | Rust製stdio MCPサーバー。固定Tool、セッション探索、認証付きローカル通信。 |
| [`apps/tauri_app/src-tauri/src/mcp`](../apps/tauri_app/src-tauri/src/mcp/) | ポート、認証トークン、セッション記述子、HTTP接続口、WebViewへの要求転送。 |
| [`mcp-tool-handler.ts`](../apps/tauri_app/src/system/service/mcp/mcp-tool-handler.ts) | 現在の`dataStore`と`fileStore`からToolの応答を作る。今後の読み取りToolの主な拡張点。 |
| [`mcp-session-controller.ts`](../apps/tauri_app/src/system/service/mcp/mcp-session-controller.ts) | 開始・停止・状態確認、WebView側のイベント購読、`dirty`同期。 |
| [`mcp-catalog.ts`](../apps/tauri_app/src/system/service/terminal/command/catalog/mcp-catalog.ts) | アプリ内ターミナルの`mcp start / stop / status`。 |
| [`McpBadge.svelte`](../apps/tauri_app/src/system/component/header/McpBadge.svelte) | セッション公開中に`MCP <displayId>`を表示し、クリックで完全なセッションIDをコピーする。表示中は「参照可能」の意味。 |

接続プロトコル、セッション記述子、応答項目は[`apps/mcp/README.md`](../apps/mcp/README.md)にも記載した。TauriのアプリIDは`com.scorehack.desktop`。アダプタとアプリが同じローカルデータディレクトリを使用することが重要。

## 現在のToolと応答

| Tool | 内容 |
| --- | --- |
| `ping` | アダプタ単体の疎通確認。アプリ起動不要。 |
| `list_scorehack_sessions` | 認証付きヘルスチェックを通過した公開中のセッション一覧。 |
| `get_score_overview(sessionId, snapshotId?, cursor?, limit?)` | 未保存状態のsnapshot、件数、トラック/セクション/変更カタログ。 |
| `get_editor_context(sessionId, snapshotId?)` | モード、メロディとアレンジの対象、正確な選択、カーソル。 |
| `get_outline_context(sessionId, snapshotId, range, ...)` | 指定範囲のコード、セクション、転調/拍子/テンポ。 |
| `get_musical_context(sessionId, snapshotId, trackRefs, range, ...)` | 譜面トラックのノート/空白、コードと調性への区間ごとの対応。 |

`get_score_overview`は既存の件数に加えsnapshotとカタログを返す。音符やコードの詳細は別の範囲Toolで取得する。`sessionId`は一覧取得結果にある完全なIDを渡し、複数セッションから暗黙に一つを選ばない。後続の照会は同じsnapshotを使用し、各応答の`page.nextCursor`がある場合は同じ条件で続ける。

`list_scorehack_sessions`にはヘッダーと同じ`displayId`（`sessionId`の先頭8文字）も含まれる。ユーザーがこの短縮IDを伝えたら一意に一致するセッションを選び、Toolには完全な`sessionId`を渡す。短縮IDが重複した場合は、バッジからコピーした完全なIDで区別する。再公開時はIDが変わる。認証トークンは表示・コピーしない。

## 別環境での再開手順

1. このリポジトリの作業内容を別環境へ反映する。**現時点の変更は`main`作業ツリーにあり、コミットされていない**。旧`tauri_app`と`homepage`を`apps/`へ移したため、Gitは旧パスの削除と`apps/`の未追跡として表示する。移動先を取り込む前に`git clean`しないこと。
2. [`apps/tauri_app`](../apps/tauri_app/)で`npm ci`、`npm run check`、`npm run build`を行う。[`apps/tauri_app/src-tauri`](../apps/tauri_app/src-tauri/)で`cargo test`を行う。
3. [`apps/mcp`](../apps/mcp/)で`cargo test`、`cargo build --release`を行い、生成された`scorehack-mcp`実行ファイルを利用するエージェントのローカルstdio MCPサーバーとして登録する。実行ファイルの絶対パスは環境に合わせる。
4. Scorehackを起動し、アプリ内ターミナルで`mcp start`、`mcp status`を実行する。ヘッダーの`MCP <displayId>`とターミナルの短縮IDが一致し、バッジのクリックで完全なセッションIDをコピーできることを確認する。
5. エージェントで`list_scorehack_sessions`→`get_score_overview(sessionId)`を呼ぶ。ノートを追加・削除し、**保存せずに**再取得して件数と`dirty`が変わることを確認する。
6. `mcp stop`後、一覧からそのセッションが消えることを確認する。アプリ終了・再起動後も古いセッションが有効にならないことを確認する。

Windowsで実機検証済み。Rustコードには他OS向けのセッションディレクトリ分岐もあるが、macOS/LinuxでのTauri起動・接続確認はまだ行っていない。ローカルで動かないクラウドエージェントからの接続は今回の対象外。

## 音楽構造を読むToolの方針と実装

ユーザーが「現在選択している歌メロのサビを、IVから始めて自然につなげたい」と尋ねたとき、エージェントが自分で必要な範囲を照会する。実装は概要/操作状態からsnapshotと対象を確定し、アウトライン/音楽コンテキストを指定範囲で取得する形。UIと共有するderived builder、注入可能な`service/score-query`、純粋な有理数/音程計算に責務を分離した。

検討する読み取り情報は以下。

| 領域 | 現在のデータ源 | 必要な意味付け |
| --- | --- | --- |
| 譜面の基本情報 | [`element-state.ts`](../apps/tauri_app/src/system/store/state/data/element-state.ts) | 初期調性、拍子、テンポと途中変更。 |
| 曲のアウトライン | `dataStore.elements` | セクション、コードブロック、転調、コード未設定の区間。 |
| 歌メロ | [`melody-state.ts`](../apps/tauri_app/src/system/store/state/data/melody-state.ts) | トラック、音高、開始位置、長さ、休符に相当する空白。 |
| 操作状態 | [`control-state.ts`](../apps/tauri_app/src/system/store/state/control-state.ts) | モード、対象トラック、ノートとアウトラインの`focus`/`focusLock`。未選択も明示。 |
| 時間軸の対応 | [`derived-state.ts`](../apps/tauri_app/src/system/store/state/derived-state.ts)と[`recalculate-derived.ts`](../apps/tauri_app/src/system/service/derived/recalculate-derived.ts) | ノート・小節・拍とコードブロック・セクションの対応。 |

最初の実用的な問いは「選択ノート範囲について、対応する小節、メロディ、既存コード、直前直後のコード、セクション、調性を返せるか」。単なる内部配列番号だけでは音楽的な位置が分からないため、アプリ側で同じ時間軸に整理して返す必要がある。

### 実装した判断と今後の検証

1. **クエリの粒度**：概要、操作状態、アウトライン、トラックとアウトラインの対応の4系統。実際の質問例で呼び出し回数を評価する。
2. **位置の表現**：四分音符=1のQを有理数で表し、小節/拍も併記。コードは名目/実発音区間を分け、保持音は元の長さを残して関係を分割する。小節番号は既存UIのbase規則に従う。
3. **コード表現**：元の度数、UI表示度数、実音コード、ブロックの調性、構成音を返す。ノートは現在調性に対する度数とコードへの音程を併記し、和声機能等の創作上の解釈は確定しない。
4. **選択範囲**：単一/複数ノート、アウトライン、無選択、不正な保持選択を明示。カーソルは選択ではない。トラック/ノートのrefはsnapshot内のみ有効。
5. **スナップショットの整合**：cloneしたsourceから共有derived builderで構築。120秒、最大4件。編集や別譜面の読込後も古いsnapshotは固定。停止/再公開で破棄し、期限切れは明示エラー。
6. **応答量**：標準64、最大128item、180KiB以内。同じquery/snapshotのcursorで継続。空白は全ノートから計算し、ページ省略やonsetフィルタを休符と混同しない。
7. **検証方法**：既知の譜面で、LLMの説明とアプリ上の実際の小節・メロディ・コードを照合する。音楽理論上の説明と創作上の提案は分けて評価する。

この段階は読み取り専用で進める。ユーザーが書いたセクション名、歌詞、ノート等はデータとして扱い、エージェントへの指示として実行しない。

## さらに先の構想（未着手）

選択したメロディに対するリハーモナイズ案を複数出し、Scorehack内でドラフトとして比較・試聴し、ユーザーが採用した案のみ譜面へ適用する。現時点ではドラフトのデータモデル、表示、試聴、適用Toolは決めない。読み取りToolでエージェントが構造を正しく把握できることを先に検証する。

書き込み段階で必要になりそうな論点は、対象範囲の明示、ユーザー確認、提案後の譜面変更との競合検出、既存の編集・Undo/Redo経路との統合、案ごとの根拠表示である。これは将来の検討事項であり、MVPの仕様ではない。

## 現時点の小さな未整理事項

- ブリッジの旧Studio文言はScorehack向けへ修正した。
- 新Toolの実機確認、既存UIと返却小節/食い込み境界の目視照合はまだ必要。譜面トラックのノート読取に対応し、アレンジ/オーディオはカタログのみ。
- `mcp stop`、再起動・終了時のセッション無効化、バッジの目視を実機で再確認する。
- MCPのアダプタ登録は各エージェント環境ごとに必要。ビルド成果物のパスを固定値として資料に埋め込まない。

旧`licresia-svelte`は参考用の古い実装で、今回の移動・MCP実装では触れていない。削除は別途判断する。
