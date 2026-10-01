# Scorehack AI支援・MCP 引継ぎ資料

更新日: 2026-10-01

## 目的と現在地

最終的な目標は、CodexやClaudeなどのエージェントが、Scorehackで編集中の譜面と操作状態をMCP経由で調べ、音楽理論を踏まえてユーザーと会話できるようにすること。例えば、選択した歌メロと前後のセクション・コードを参照して、サビのリハーモナイズを複数案で提案する。将来は案をScorehack内のドラフトに表示し、ユーザーが確認して適用できるようにしたい。

現時点では**読み取り疎通のMVPを達成**した。ドラフト、譜面の書き込み、音楽構造を詳しく返すToolは未実装。まず実際の会話で必要になる情報を調べ、その結果をもとにクエリとドラフトの仕様を決める。

### MVPで確認した事実

- Codexから静的MCPアダプタの`ping`、`list_scorehack_sessions`、`get_score_overview`を呼べた。
- Scorehackの公開セッションを検出し、編集中の譜面トラック数・ノート数を取得できた。
- 同一セッションで、編集前はノート数`0`・`dirty: false`、保存前の編集後はノート数`7`・`dirty: true`が返った。保存ファイルではなく、アプリのライブ状態を読めている。
- `mcp start / stop / status`、ヘッダーの`MCP ON`バッジは実装済み。実際のエージェント経由で確認したのは公開開始と読み取りであり、停止操作とバッジの目視確認は別途行うとよい。

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
| [`McpBadge.svelte`](../apps/tauri_app/src/system/component/header/McpBadge.svelte) | セッション公開中の表示。`MCP ON`は「エージェントが現在Toolを呼んでいる」ではなく「参照可能」の意味。 |

接続プロトコル、セッション記述子、応答項目は[`apps/mcp/README.md`](../apps/mcp/README.md)にも記載した。TauriのアプリIDは`com.scorehack.desktop`。アダプタとアプリが同じローカルデータディレクトリを使用することが重要。

## 現在のToolと応答

| Tool | 内容 |
| --- | --- |
| `ping` | アダプタ単体の疎通確認。アプリ起動不要。 |
| `list_scorehack_sessions` | 認証付きヘルスチェックを通過した公開中のセッション一覧。 |
| `get_score_overview(sessionId)` | 指定セッションの未保存状態を読み取る。 |

`get_score_overview`は現在、`scoreName`、`dirty`、`scoreTrackCount`、`audioTrackCount`、`totalNoteCount`、各譜面トラックの`index`・`name`・`noteCount`を返す。音符やコードそのものはまだ返さない。`sessionId`は一覧取得結果にある完全なIDを渡し、複数セッションから暗黙に一つを選ばない。

## 別環境での再開手順

1. このリポジトリの作業内容を別環境へ反映する。**現時点の変更は`main`作業ツリーにあり、コミットされていない**。旧`tauri_app`と`homepage`を`apps/`へ移したため、Gitは旧パスの削除と`apps/`の未追跡として表示する。移動先を取り込む前に`git clean`しないこと。
2. [`apps/tauri_app`](../apps/tauri_app/)で`npm ci`、`npm run check`、`npm run build`を行う。[`apps/tauri_app/src-tauri`](../apps/tauri_app/src-tauri/)で`cargo test`を行う。
3. [`apps/mcp`](../apps/mcp/)で`cargo test`、`cargo build --release`を行い、生成された`scorehack-mcp`実行ファイルを利用するエージェントのローカルstdio MCPサーバーとして登録する。実行ファイルの絶対パスは環境に合わせる。
4. Scorehackを起動し、アプリ内ターミナルで`mcp start`、`mcp status`を実行する。ヘッダーに`MCP ON`が出ることを確認する。
5. エージェントで`list_scorehack_sessions`→`get_score_overview(sessionId)`を呼ぶ。ノートを追加・削除し、**保存せずに**再取得して件数と`dirty`が変わることを確認する。
6. `mcp stop`後、一覧からそのセッションが消えることを確認する。アプリ終了・再起動後も古いセッションが有効にならないことを確認する。

Windowsで実機検証済み。Rustコードには他OS向けのセッションディレクトリ分岐もあるが、macOS/LinuxでのTauri起動・接続確認はまだ行っていない。ローカルで動かないクラウドエージェントからの接続は今回の対象外。

## 次段階: 音楽構造を読むTool

次の目的は、ユーザーが「現在選択している歌メロのサビを、IVから始めて自然につなげたい」と尋ねたとき、エージェントが自分で必要な範囲を照会できること。全譜面を一度に大量のJSONで渡すより、概要から選択範囲と前後へ進めるクエリを検討する。Tool名やレスポンス形式はまだ確定しない。

検討する読み取り情報は以下。

| 領域 | 現在のデータ源 | 必要な意味付け |
| --- | --- | --- |
| 譜面の基本情報 | [`element-state.ts`](../apps/tauri_app/src/system/store/state/data/element-state.ts) | 初期調性、拍子、テンポと途中変更。 |
| 曲のアウトライン | `dataStore.elements` | セクション、コードブロック、転調、コード未設定の区間。 |
| 歌メロ | [`melody-state.ts`](../apps/tauri_app/src/system/store/state/data/melody-state.ts) | トラック、音高、開始位置、長さ、休符に相当する空白。 |
| 操作状態 | [`control-state.ts`](../apps/tauri_app/src/system/store/state/control-state.ts) | モード、対象トラック、ノートとアウトラインの`focus`/`focusLock`。未選択も明示。 |
| 時間軸の対応 | [`derived-state.ts`](../apps/tauri_app/src/system/store/state/derived-state.ts)と[`recalculate-derived.ts`](../apps/tauri_app/src/system/service/derived/recalculate-derived.ts) | ノート・小節・拍とコードブロック・セクションの対応。 |

最初の実用的な問いは「選択ノート範囲について、対応する小節、メロディ、既存コード、直前直後のコード、セクション、調性を返せるか」。単なる内部配列番号だけでは音楽的な位置が分からないため、アプリ側で同じ時間軸に整理して返す必要がある。

### これから決める設計判断

1. **クエリの粒度**：譜面全体の短い概要、現在の選択と周辺、指定小節範囲、特定トラックのノート、アウトライン範囲をどのToolに分けるか。実際の質問例を数件用意して必要な呼び出し回数で判断する。
2. **位置の表現**：小節番号、拍、内部の`beatNote`、ノートの`norm/pos/len`をどう対応付けるか。途中の拍子・テンポ・調性変更、食い込み・先行、跨ぎを確認する。
3. **コード表現**：度数、実音コード、現在調性、転調・借用和音などをどこまでアプリ側で確定して返し、どこからエージェントの解釈に任せるか。コード未設定と情報未取得を区別する。
4. **選択範囲**：単一ノート、複数ノート、アウトラインブロック、選択なしを明示する。`focus`と`focusLock`は配列上の位置であり、恒久的なIDとして扱わない。
5. **スナップショットの整合**：複数Tool呼び出しの間にユーザーが編集した場合、異なる時点の結果を混ぜないための`revision`や取得時刻を検討する。MVPには未実装。
6. **応答量**：長い曲でノート全件を返さないよう、範囲指定、件数上限、切り詰め表示を検討する。
7. **検証方法**：既知の譜面で、LLMの説明とアプリ上の実際の小節・メロディ・コードを照合する。音楽理論上の説明と創作上の提案は分けて評価する。

この段階は読み取り専用で進める。ユーザーが書いたセクション名、歌詞、ノート等はデータとして扱い、エージェントへの指示として実行しない。

## さらに先の構想（未着手）

選択したメロディに対するリハーモナイズ案を複数出し、Scorehack内でドラフトとして比較・試聴し、ユーザーが採用した案のみ譜面へ適用する。現時点ではドラフトのデータモデル、表示、試聴、適用Toolは決めない。読み取りToolでエージェントが構造を正しく把握できることを先に検証する。

書き込み段階で必要になりそうな論点は、対象範囲の明示、ユーザー確認、提案後の譜面変更との競合検出、既存の編集・Undo/Redo経路との統合、案ごとの根拠表示である。これは将来の検討事項であり、MVPの仕様ではない。

## 現時点の小さな未整理事項

- Tauri側ブリッジのタイムアウト文言に、参照元実装の`Studio did not answer within 5 seconds.`が残っている。動作には影響しないが、Scorehack向けに直す。
- `mcp stop`、再起動・終了時のセッション無効化、バッジの目視を実機で再確認する。
- MCPのアダプタ登録は各エージェント環境ごとに必要。ビルド成果物のパスを固定値として資料に埋め込まない。

旧`licresia-svelte`は参考用の古い実装で、今回の移動・MCP実装では触れていない。削除は別途判断する。
