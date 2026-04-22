# refer_app 機能整理と再編成の軸

## 目的

この文書は、`refer_app` を今後整理していく際に、

- 何の機能が存在するか
- どこに責務の混在があるか
- どの単位でフォルダを分け直すべきか
- `component` と `util` をどう切り分けるか

を明確にするための整理メモである。

今回は実装方法の最終決定ではなく、
`機能整理の基礎資料` を目的とする。

---

## 1. 現行の大分類

`refer_app/src/system` は現在、以下の5系統で構成されている。

1. `component`
2. `input`
3. `store`
4. `util`
5. `const`

一見すると責務分離されているが、実際には以下の混在がある。

- `store/reducer` が state 更新だけでなく業務ロジックも持つ
- `input` がキーハンドリングだけでなくモード分岐も持つ
- `util` が純粋関数ではなく store 依存ロジックを持つ
- `component` が UI 表示だけでなく store 前提の振る舞いに強く依存する
- `Entry.svelte` が初期化、イベント登録、変数反映まで持つ

つまり現行は、
`UI / 状態 / 入力 / アプリケーションロジック / 副作用`
が十分に分離されていない。

---

## 2. 現行の機能一覧

### 2.1 アプリケーション外枠

- 起動エントリ
- 初期化
- 画面全体レイアウト
- モード切り替え
- オーバーレイ表示切り替え

主な現行ファイル:

- [Entry.svelte](refer_app\src\Entry.svelte)
- [MainFrame.svelte](refer_app\src\system\MainFrame.svelte)
- [RootHeader.svelte](refer_app\src\system\component\header\RootHeader.svelte)
- [ModeSwitch.svelte](refer_app\src\system\component\header\ModeSwitch.svelte)
- [disignInitializer.ts](refer_app\src\system\util\disignInitializer.ts)

### 2.2 アウトライン編集

- 楽曲全体構成の編集
- `init / section / chord / modulate / tempo / ts` 要素の保持
- アウトライン上のフォーカス移動
- コード要素の編集
- セクションや転調の表示

主な現行ファイル:

- [OutlineFrame.svelte](refer_app\src\system\component\outline\OutlineFrame.svelte)
- [ElementListFrame.svelte](refer_app\src\system\component\outline\ElementListFrame.svelte)
- [Element.svelte](refer_app\src\system\component\outline\element\Element.svelte)
- [DataInit.svelte](refer_app\src\system\component\outline\element\data\DataInit.svelte)
- [DataSection.svelte](refer_app\src\system\component\outline\element\data\DataSection.svelte)
- [DataChord.svelte](refer_app\src\system\component\outline\element\data\DataChord.svelte)
- [DataModulate.svelte](refer_app\src\system\component\outline\element\data\DataModulate.svelte)
- [DataTempo.svelte](refer_app\src\system\component\outline\element\data\DataTempo.svelte)
- [inputOutline.ts](refer_app\src\system\input\inputOutline.ts)
- [reducerOutline.ts](refer_app\src\system\store\reducer\reducerOutline.ts)

### 2.3 メロディ編集

- 単旋律ノートの配置
- カーソル移動
- ノート選択
- リズム単位変更
- トラック切替
- スコアトラックとオーディオトラックの管理

主な現行ファイル:

- [TimelineFrame.svelte](refer_app\src\system\component\timeline\TimelineFrame.svelte)
- [PitchListFrame.svelte](refer_app\src\system\component\timeline\pitch\PitchListFrame.svelte)
- [GridRootFrame.svelte](refer_app\src\system\component\timeline\grid\GridRootFrame.svelte)
- [ActiveTrack.svelte](refer_app\src\system\component\melody\score\ActiveTrack.svelte)
- [Note.svelte](refer_app\src\system\component\melody\score\Note.svelte)
- [Cursor.svelte](refer_app\src\system\component\melody\Cursor.svelte)
- [inputMelody.ts](refer_app\src\system\input\inputMelody.ts)
- [reducerMelody.ts](refer_app\src\system\store\reducer\reducerMelody.ts)

### 2.4 プレビュー再生

- SoundFont 読み込み
- スコア再生
- オーディオトラック再生
- 再生位置追従
- 再生中のフォーカス同期
- アレンジトラック再生

主な現行ファイル:

- [previewUtil.ts](refer_app\src\system\util\preview\previewUtil.ts)
- [pianoArrangePreviewUtil.ts](refer_app\src\system\util\preview\arrange\pianoArrangePreviewUtil.ts)
- [storePreview.ts](refer_app\src\system\store\props\storePreview.ts)

### 2.5 ターミナル

- ターミナル表示
- コマンド入力
- 補完表示
- ヘルプ表示
- 状態更新系コマンド
- save/load/audio import

主な現行ファイル:

- [TerminalFrame.svelte](refer_app\src\system\component\terminal\TerminalFrame.svelte)
- [TerminalOutput.svelte](refer_app\src\system\component\terminal\TerminalOutput.svelte)
- [reducerTerminal.ts](refer_app\src\system\store\reducer\reducerTerminal.ts)
- [commandRegistUtil.ts](refer_app\src\system\store\reducer\terminal\commandRegistUtil.ts)
- `builder*.ts` 一式

### 2.6 Arrange 系

- ピアノバッキングエディタ
- ボイシング選択
- Finder
- Arrange トラック状態表示
- 将来のギター用導線

主な現行ファイル:

- [ArrangeFrame.svelte](refer_app\src\system\component\arrange\ArrangeFrame.svelte)
- [ArrangePianoEditor.svelte](refer_app\src\system\component\arrange\piano\ArrangePianoEditor.svelte)
- [ArrangeFinderFrame.svelte](refer_app\src\system\component\arrange\finder\ArrangeFinderFrame.svelte)
- [inputArrange.ts](refer_app\src\system\input\arrange\inputArrange.ts)
- [inputPianoEditor.ts](refer_app\src\system\input\arrange\inputPianoEditor.ts)
- [inputFinder.ts](refer_app\src\system\input\arrange\finder\inputFinder.ts)
- [inputGuitarEditor.ts](refer_app\src\system\input\arrange\inputGuitarEditor.ts)
- `store/props/arrange/*`

### 2.7 ファイル入出力

- スコア保存
- スコア読込
- mp3 読み込み
- MIDI 書き出し

主な現行ファイル:

- [fileUtil.ts](refer_app\src\system\util\fileUtil.ts)

### 2.8 音楽理論

- スケール
- 調性
- 度数
- コードシンボル
- 構成音
- 拍子関連計算

主な現行ファイル:

- [musicTheory.ts](refer_app\src\system\util\musicTheory.ts)

---

## 3. 現行の責務混在ポイント

### 3.1 Bootstrap と runtime が混ざっている

[Entry.svelte](refer_app\src\Entry.svelte) は、

- 初期化
- キャッシュ計算
- キー入力イベント登録
- CSS変数反映
- preview 状態の context 登録

を1ファイルで持っている。

これは将来的に最低でも以下へ分離したい。

- `bootstrap`
- `keyboard binding`
- `layout shell`
- `runtime sync`

### 3.2 store が巨大な mutable object になっている

[store.ts](refer_app\src\system\store\store.ts) は、

- 永続データ
- UI 状態
- 入力状態
- プレビュー状態
- DOM 参照
- ファイルハンドル

を全部同居させている。

その結果、

- どこが保存対象か分かりにくい
- どこが UI 専用 state か分かりにくい
- どこが副作用の一時 state か分かりにくい

という問題がある。

### 3.3 reducer が application service と domain service を兼ねている

`reducerOutline.ts`, `reducerMelody.ts`, `reducerTerminal.ts`, `arrangeUtil.ts` は、
単純な state 更新ではなく、

- 編集ルール
- バリデーション
- トラック変更
- フォーカス同期
- ターミナルコマンド解釈

まで含んでいる。

名前は reducer だが、実体は `use case / command handler / state mutator` の混合体である。

### 3.4 util が純粋関数ライブラリになっていない

`util` の中には性質の異なるものが混在している。

- `musicTheory.ts`: 純粋ドメイン関数
- `fileUtil.ts`: インフラ + I/O
- `previewUtil.ts`: アプリケーションサービス + 外部ライブラリ依存
- `disignInitializer.ts`: UI runtime 初期化

つまり `util` という名前では粗すぎて、今後の保守単位として弱い。

### 3.5 component が「表示部品」と「画面の部分実装」で混ざっている

たとえば `component/outline`, `component/timeline`, `component/arrange` の中には、

- 単純な見た目部品
- store を直接読む大きなフレーム
- フォーカスやスクロール前提の UI

が混在している。

今後は最低でも以下に分けたい。

- `frames`: 画面の大きな領域
- `panes`: 機能単位の表示領域
- `parts`: 小部品
- `overlays`: 一時表示 UI

---

## 4. 再編成のための機能単位

今後の整理は `技術別フォルダ` ではなく、
まず `機能別の境界` を定める方が理解しやすい。

推奨する機能単位は以下。

### 4.1 shell

責務:

- 起動
- 初期化
- 全体レイアウト
- モード表示
- オーバーレイ表示制御

### 4.2 outline

責務:

- 楽曲構成
- 要素選択
- コード進行
- 転調
- テンポ変更
- 拍子変更

### 4.3 melody

責務:

- 単旋律トラック
- カーソル
- ノート編集
- リズム単位
- メロディトラック管理

### 4.4 timeline

責務:

- 拍表示
- 小節表示
- コードヘッダ表示
- 音高軸表示
- グリッド表示

`melody` と密接だが、見た目の構成要素としては独立性が高い。

### 4.5 terminal

責務:

- 入出力 UI
- コマンド解析
- コマンド実行
- ログ整形

### 4.6 playback

責務:

- SoundFont 管理
- 再生スケジューリング
- 再生位置更新
- 停止処理
- オーディオトラック再生

### 4.7 arrange

責務:

- アレンジトラック
- ピアノバッキング
- ギターバッキング
- Finder
- ボイシング候補

### 4.8 project-io

責務:

- save/load
- mp3 import
- MIDI export
- 将来的な MusicXML

### 4.9 music-theory

責務:

- 調性
- 拍子
- 度数
- コード構造
- 音高計算

これは UI から切り離して持つべき。

---

## 5. `component` と `util` の分離基準

今後は `component` と `util` を名前で切るのではなく、
以下の基準で切ると理解しやすい。

## 5.1 Component に入れるもの

条件:

- Svelte コンポーネントである
- DOM を描画する
- 見た目やレイアウトを持つ
- イベントを受け取る
- props や store を受けて表示を変える

例:

- `OutlineFrame`
- `TimelineFrame`
- `TerminalFrame`
- `MeasureBlock`
- `ChordSelector`

## 5.2 Util に入れない方がよいもの

以下は `util` ではなく、より具体名で持つ方がよい。

- preview のような再生制御
- file 操作
- bootstrap 時の UI 変数設定
- store 前提の更新ロジック

## 5.3 純粋関数だけを `lib` または `domain` へ

条件:

- store を参照しない
- DOM を触らない
- I/O をしない
- 同じ入力なら同じ出力を返す

例:

- 音楽理論計算
- 拍子換算
- コード構成音取得
- base64 変換のような純粋変換

## 5.4 副作用を持つものは `services` または `infra` へ

条件:

- AudioContext を触る
- ファイルを読む
- タイマーを張る
- dialog を開く
- SoundFont をロードする

例:

- preview
- save/load
- mp3 import

---

## 6. フォルダ再編成時の推奨ルール

### 6.1 UI は機能別にまとめる

例:

- `ui/shell`
- `ui/outline`
- `ui/timeline`
- `ui/melody`
- `ui/terminal`
- `ui/arrange`

### 6.2 状態更新は機能別ユースケースに寄せる

例:

- `app/outline`
- `app/melody`
- `app/terminal`
- `app/playback`
- `app/arrange`

ここには、

- コマンド実行
- 編集操作
- フォーカス変更
- モード切替

などを置く。

### 6.3 永続対象と UI 状態を分ける

最低でも以下を分離する。

- `project data`
- `editor ui state`
- `playback session state`
- `ephemeral refs`

### 6.4 domain は UI 非依存にする

置く対象:

- 曲全体構造
- outline element 型
- melody note 型
- arrange track 型
- theory 計算

### 6.5 infra は外部 API 依存だけにする

置く対象:

- Tauri dialog/fs
- SoundFont
- Audio
- 将来の MusicXML

---

## 7. 現行ファイルの再配置イメージ

### shell

- `Entry.svelte`
- `MainFrame.svelte`
- `RootHeader.svelte`
- `ModeSwitch.svelte`
- `disignInitializer.ts`

### outline

- `component/outline/*`
- `inputOutline.ts`
- `reducerOutline.ts`
- `storeOutline.ts`

### melody

- `component/melody/*`
- `inputMelody.ts`
- `reducerMelody.ts`
- `storeMelody.ts`

### timeline

- `component/timeline/*`
- `storeCache.ts`
- `reducerCache.ts`
- `pianoViewUtil.ts`

### terminal

- `component/terminal/*`
- `inputTerminal.ts`
- `reducerTerminal.ts`
- `terminalLogger.ts`
- `commandRegistUtil.ts`
- `builder*.ts`

### arrange

- `component/arrange/*`
- `input/arrange/*`
- `store/props/arrange/*`
- `arrangeUtil.ts`
- `pianoArrangePreviewUtil.ts`

### playback

- `previewUtil.ts`
- `storePreview.ts`

### project-io

- `fileUtil.ts`
- `storeFile.ts`

### music-theory

- `musicTheory.ts`

---

## 8. 最初に分離しやすい単位

実装の理解負債を増やさずに整理を始めるなら、次の順が安全。

1. `musicTheory` を完全に独立した domain に出す
2. `fileUtil` を project-io に出す
3. `previewUtil` を playback service に出す
4. `Entry/MainFrame` の bootstrap 責務を shell に分離する
5. `terminal builder` を command 群として独立させる
6. `outline / melody / arrange` を機能別に束ね直す
7. 最後に巨大 store を分割する

---

## 9. 今回の整理から見える判断

`refer_app` は「未整理な試作」ではあるが、機能自体はすでにかなり揃っている。
問題の中心は、機能不足ではなく `責務配置の曖昧さ` にある。

したがって次の方針がよい。

1. まずは現行機能を `shell / outline / melody / timeline / terminal / playback / arrange / project-io / music-theory` に整理して理解する
2. その上で、各機能の中を `ui / app / domain / infra / state` に分ける
3. `util` と `reducer` という曖昧な名前は徐々にやめる

この順番なら、フォルダ構成の再設計が「見た目の整理」ではなく、
責務の整理として進めやすい。
