# MCP譜面照会の責務分離と実装計画

更新日: 2026-10-04

## 境界

```text
apps/mcp (Rust): 固定Tool・入力schema・セッション探索・認証通信
  → apps/tauri_app/src-tauri/src/mcp: HTTP/Tauri要求応答・認証・timeout
    → system/service/mcp: wire入力検証・要求のdispatch・ライブstoreの取得
      → system/service/score-query: 読み取り用snapshot・対象/範囲解決・DTO・ページング
        → system/service/derived/build-derived: UIと共有するderived計算
        → system/domain/time: 正確な有理数・音価計算
        → system/domain/theory: 音程・度数計算
```

- `score-query`はMCP通信・グローバルstore・DOM・編集actionsを知らない。入力を注入してテスト可能にする。他の読み取り用途でも使えるアプリケーションサービスである。
- セッション寿命・イベント購読は既存`mcp-session-controller`に残す。開始/停止でsnapshotを破棄する。
- 既存のmelody/outline/arrange updaterには照会機能を追加しない。Undo/Redo、保存データの形式、UI操作経路を変更しない。
- `recalculate-derived`から計算本体のみを純粋な`build-derived`へ移す。snapshotも同じ関数からderivedを作り、sourceとcacheの時点不一致を避ける。UIのstore更新は既存wrapperに残す。
- UIのpixel位置・幅は公開しない。食い込み後の区間は音価の計算から取得する。小節番号は既存base cacheの規則に従う。

## 第一期のTool

- `get_score_overview`: 既存件数を維持し、snapshotとトラック/セクション/変更のカタログを追加。
- `get_editor_context`: モード、メロディ/アレンジのトラック、ノート選択、アウトライン選択、カーソル。選択なしとカーソルを区別。
- `get_outline_context`: snapshot内の指定区間のコード/セクション/転調/拍子/テンポ。
- `get_musical_context`: 明示した譜面トラックのノート/空白とアウトライン、各ノート区間のコード/調性との関係。
- ping/list_sessionsは継続する。書き込み・ドラフト・音楽的評価の生成は今回の範囲外。

## 契約

- Qは四分音符=1の音価座標。`{numerator, denominator}`で約分して返す。実時間や複合拍子の拍数とは異なる。
- 区間は`[startQ, endQ)`。ノートは元の区間を保持し、指定範囲内のoverlapを別に返す。保持音も標準では含める。
- コードは基準区間とeat補正後の発音区間を返す。ノートの調性は時刻上のbase、コードの度数はブロックのbaseに属し、異なる場合も混同しない。
- 度数は主音に対する長音階基準の半音距離/ラベルと、UIの表示基準/ラベルを併記。音名はScorehackのoctave命名であり、MIDI番号とは断定しない。綴りは保存されていない。
- 範囲指定は小節(末尾含む)、Q区間、section/chord参照、snapshotの選択。周辺小節の追加が可能。
- refはsnapshot内だけで有効。種別を含むtrack refを使い、名前/配列番号だけで対象を自動選択しない。未選択、曖昧、異常値は明示エラー。
- snapshotはcloneした状態から構築し、有効期限と件数上限を持つ。期限切れ・セッション再公開後はエラーにし、最新状態へ暗黙に置換しない。
- 応答は件数とUTF-8バイト量で制限し、同じsnapshot/クエリに限定したcursorを返す。スナップショット上の全ノートから空白を計算し、ページ省略を休符と解釈しない。
- コード未設定、アウトライン範囲外、取得していない詳細を区別。非和声音の音楽的役割/和声機能/曲調は確定事実として付与しない。
- セクション名・発音文字列等は譜面データであり指示として扱わない。ローカルファイルパス・認証tokenは応答へ含めない。

## 実装結果

- 4系統の読み取りToolと既存ping/listの計6Toolを実装。snapshotは120秒/最大4件、1ページ64item(最大128)、180KiB。cursorは同じqueryに限定する。
- `music-timeline`はノートの正規化済み区間をsnapshotごとに保持し、和声関係は返却ページのノートについて計算する。
- セクションや選択の時間範囲と、実際に選択したノートを区別する。無選択/不正な保持選択を明示し、無関係な古いUI選択で明示トラックの照会を妨げない。
- canonical度数は主音基準の長音階相対。自然短音階の音はb3/b6/b7を使い、半音距離/音階内のstep/綴り候補も返す。UIラベルは既存の表示規則のまま別に返す。
- アレンジ/オーディオは種別付きカタログまで。生成済みアレンジ音符やオーディオ解析、再生秒数の公開は未実装。
- 型チェック、Vite build、JSの境界テストとRust→HTTP→production TS dispatcherの結合テスト、Rust adapter/Tauriテストで検証。実機での新Tool呼出しとUI照合は未確認。

## 実装順と検証

1. 共有derived builderと有理数・音程計算を切り出す。
2. 読み取りsnapshot、音楽時間軸、対象/範囲解決を実装する。
3. DTO/クエリ/ページングとMCP dispatchを接続する。
4. Rust側のschema/固定Toolとエラーcodeの転送を追加する。
5. 複合拍子、連符、コード跨ぎ、食い込み、転調、同名トラック、無選択、snapshot寿命/編集/ページングを検証する。UIの計算は共有builderの回帰テストで確認する。

実機接続と新Toolの登録確認は、更新したアプリとアダプタの起動が必要。自動検証と実機確認を分けて報告する。
