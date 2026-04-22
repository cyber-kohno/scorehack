# 作曲設計ソフト: MVPスコープ

## 1. MVPの目的
MVPの目的は、「作曲設計」というワークフローが単体で成立し、日常的な試行錯誤に使える状態を作ること。

この段階では、音源制作機能の完成度よりも、以下を優先する。
- 構成、コード、転調、テンポ、拍子を素早く編集できる
- 単旋律メロディをキーボードだけで入力できる
- 設計結果を途中からすぐ再生確認できる
- 保存して再開できる
- 将来の piano / guitar / MusicXML / AI連携へ拡張しやすい内部構造になっている

## 2. MVPで必ず入れる機能
### コアデータ
- Song
- OutlineElement
- `init`
- `section`
- `chord`
- `modulate`
- `tempo`
- `ts`
- `melody track`

### 編集
- outline の追加、削除、移動、フォーカス
- chord の長さ、degree、symbol 編集
- modulate 編集
- tempo 編集
- ts 編集
- melody のカーソル移動、ノート追加、削除、長さ変更、音高変更
- melody の範囲選択とコピー/貼り付け

### 再生
- 現在位置からのプレビュー再生
- melody + chordベースの簡易伴奏再生
- 再生位置ライン表示
- 再生中のフォーカス追従

### ターミナル
- コマンド入力
- 補完
- ヘルプ
- 主要操作のコマンド実行

### ファイル
- 保存
- 読み込み
- スキーマバージョン管理

## 3. MVPでは入れないもの
- guitar editor の完成版
- piano pattern finder の完成版
- arrange pattern library の高度な再利用機能
- audio track の本格対応
- MusicXML import/export
- AI連携の本実装
- 複数プロジェクト管理UI
- 高度な設定画面

## 4. MVPでの arrange 方針
arrange は完全に切らず、将来の拡張に備えて最小限だけ入れる。

- `ArrangeTrack` 型は先に定義する
- 再生時は chord から生成する簡易プレビュー伴奏を用意する
- piano / guitar の専用エディタUIは MVP外でもよい

理由は、設計ツールとしての価値検証に必要なのは「構成 + 和声 + メロディ + 再生」であり、伴奏エディタの完成は次段階でも遅くないため。

## 5. MVP完了条件
- 1曲をゼロから設計して保存できる
- section/chord/modulate/tempo/ts を含む曲を編集できる
- 単旋律メロディを入力できる
- 途中から再生して確認できる
- 次回起動後に再開できる
- 型チェックと最低限のテストが通る

## 6. MVP後の最優先拡張
- piano arrange editor
- guitar arrange editor
- finder / pattern library
- MusicXML export
- AI連携用データ出力
