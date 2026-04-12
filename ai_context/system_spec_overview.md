# 作曲設計ソフト: システム仕様全貌（再設計ドラフト）

## 1. プロダクト定義
このアプリは「音源制作」ではなく「楽曲設計」を高速に行うためのデスクトップツールである。

対象は以下の設計情報。
- 楽曲構成（イントロ / Aメロ / Bメロ / サビ など）
- コード進行
- 転調（modulate）
- テンポ変更（tempo）
- 拍子変更（ts: time signature）
- 歌メロ（単旋律）
- バッキング（piano / guitar）

成果物はローカルファイルとして保存し、後工程で DTM や AI 音源生成へ受け渡す。

## 2. UX方針
- 全操作をキーボード完結にする。
- メニューを廃し、表示は最小限にする。
- ターミナルを中心に編集・管理を行う。
- プレビュー再生を短いサイクルで回せるレスポンスを維持する。

## 3. 主要ユースケース
- 構成を先に作る: section/chord/modulate/tempo/ts を並べる。
- メロディを入れる: 単旋律を配置・編集する。
- バッキングを当てる: piano または guitar で和声伴奏を設計する。
- 途中から再生する: カーソル位置・セクション位置から即時プレビューする。
- 保存/読込する: ローカルファイルで設計データを管理する。

## 4. ドメインモデル（論理）
- Song
- Timeline
- OutlineElement
- Section
- Chord
- ModulationEvent
- TempoEvent
- TimeSignatureEvent
- MelodyTrack
- ArrangeTrack
- ArrangePattern
- PreviewState

### OutlineElement種別
- init: 初期状態（初期キー、初期テンポ、初期拍子）
- section: 構成ラベル
- chord: コードブロック
- modulate: 転調イベント
- tempo: テンポ変更イベント
- ts: 拍子変更イベント

## 5. モードと画面責務
- Harmonizeモード
- Melodyモード

Harmonizeモード責務。
- outline編集
- chord編集
- modulate/tempo/ts 編集
- arrange編集（piano/guitar）

Melodyモード責務。
- 単旋律編集
- 単位、長さ、範囲、移動、音高編集

共通責務。
- ターミナル
- プレビュー
- 保存/読込

## 6. バッキング要件
### piano
- ボイシング編集
- バッキングパターン編集
- パターン再利用・適用

### guitar
- フレットフォームベースのボイシング
- ストローク等、ギター固有のリズム記法
- piano と異なる編集モデルを持つ

## 7. ターミナル仕様（再設計）
現行の短縮コマンド群は再設計対象とする。

方針。
- 読みやすい動詞 + 名詞に統一する。
- コンテキスト依存は維持しつつ、名前は明示的にする。
- `help` で階層的に発見可能にする。

コマンド体系（案）。
- system
- project.save
- project.load
- preview.play
- preview.stop
- mode.harmonize
- mode.melody
- outline.add.section
- outline.add.chord
- outline.add.modulate
- outline.add.tempo
- outline.add.ts
- outline.delete
- outline.focus.next
- outline.focus.prev
- section.rename
- chord.set.degree
- chord.set.symbol
- chord.set.length
- modulate.set.key
- modulate.set.dominant
- modulate.set.parallel
- modulate.set.relative
- tempo.set.absolute
- tempo.set.rate
- tempo.set.delta
- ts.set
- track.melody.list
- track.melody.create
- track.melody.select
- track.arrange.list
- track.arrange.create
- track.arrange.select
- arrange.open.editor
- arrange.open.finder
- arrange.apply
- sf.set

互換方針。
- 旧コマンドはサポートしない（移行ガイドを提供）。

## 8. プレビュー仕様
- 任意位置再生をサポート。
- メロディ、バッキング、オーディオトラックの合成再生をサポート。
- 再生中にタイムラインとアウトラインのフォーカス追従を行う。
- 将来のオーディオエンジン差し替えを見越し、再生制御を抽象化する。

## 9. ファイル仕様
- ローカル完結。
- バージョン付きのアプリ独自形式を定義する。
- 圧縮有無は実装都合で選べるようにする。
- 将来的な MusicXML 変換（export/import）を前提に内部モデルを整備する。

推奨。
- `schema_version` を必須化する。
- `metadata`（title, author, created_at, updated_at）を持つ。
- イベント列（tempo/ts/modulate）を明示的に保持する。

## 10. 非機能要件
- 高速性: キー入力から画面反映まで体感遅延を最小化する。
- 安定性: クラッシュ時のデータ損失を減らす。
- 保守性: UI層とドメイン層を分離する。
- 拡張性: guitar、MusicXML、AI連携を後から追加しやすくする。

## 11. 再設計で確定した前提
- tempo は必須機能として実装する。
- ts は必須機能として実装する。
- modulate は必須機能として実装する。
- guitar バッキングエディタは実装対象に含める。
- 既存コマンド互換は不要とし、新コマンド体系へ移行する。
