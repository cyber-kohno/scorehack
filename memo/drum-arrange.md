# Drum Arrange 引き継ぎメモ

このメモは、ドラムアレンジ機能の設計方針、実装済み範囲、未実装範囲を別AIへ引き継ぐためのものです。

## 大きな方針

ドラムはピアノ/ギターと同じ「アレンジメソッド」の1つとして扱う。

ただし、ピアノの「バッキング + ボイシング」とは性質が違う。

- ドラムはコード構成音に依存しない。
- ドラムはサステイン/音価を持たず、基本的には「どのタイミングで、どの音を鳴らすか」を扱う。
- 使う音はトラックのドラムバンク内の `mappings` で管理する。
- アレンジエディタでは、マッピングそのものは編集せず、登録済みの mapping key をレコードに割り当てる。
- マッピング編集は専用ダイアログで行う。

## データ構造

ドラム用の状態は以下に定義している。

`tauri_app/src/system/store/state/data/arrange/drum/drum-editor-state.ts`

主な型:

```ts
export type Mapping = {
  key: string;
  pitch: number;
  name?: string;
};

export type Record = {
  key: string;
};

export type ColDiv = {
  index: number;
  div: SplitDiv;
};

export type Hit = {
  colIndex: number;
  recordIndex: number;
  velocity: number;
};

export type PatternData = {
  records: Record[];
  criteriaDiv: CriteriaDiv;
  colDivs: ColDiv[];
  hits: Hit[];
};

export type Bank = {
  mappings: Mapping[];
  patterns: Pattern[];
  regulars: Regular[];
};
```

### Mapping

`Mapping` はドラムトラックのマスタ情報。

- `key`: アレンジパターン側から参照する識別子。例: `kick`, `snare`, `key0`
- `pitch`: 実際に鳴らすMIDIピッチ。未指定は `-1`
- `name`: 画面表示用の任意名。未指定時は `key` を薄く表示する

`key` は当初 `InstrumentKey` のような専用型案もあったが、実態はユーザ入力の文字列なので `string` にしている。

### Record

`Record` は1つのドラムパターン内の行。

現時点では `key` だけを持つ。

将来的には、レコード行で mapping key を選ぶことで、どのドラム音を使うかを決める想定。

### PatternData

ドラムパターンの実体。

- `records`: パターン内で使う音の行
- `criteriaDiv`: 基準分割。`1 | 2 | 4`
- `colDivs`: 基準グリッドに対する追加分割
- `hits`: 実際の発音位置

## グリッド/カラム方針

ピアノのように自由に音価カラムを増減する方式ではなく、ドラムは「基準グリッド + 部分分割」で扱う方針。

例:

- `criteriaDiv: 1` は4分基準
- `criteriaDiv: 2` は8分基準
- `criteriaDiv: 4` は16分基準
- `colDivs` で特定indexを `2 | 3 | 4` 分割できる

最初は `children` のような多段分割は不要。1段分割だけで進める。

`eatHead/eatTail` がある場合は、今後 `criteriaDiv` の選択制約を入れる想定。

## ArrangeState 側

`tauri_app/src/system/store/state/data/arrange/arrange-state.ts`

ドラムは `ArrangeMedhods` に追加済み。

```ts
export const ArrangeMedhods = ["piano", "guitar", "drum"] as const;
```

トラック初期化も追加済み。

```ts
export const createDrumTrackInitial = (name: string): Track => ({
  name,
  method: "drum",
  volume: 10,
  isMute: false,
  relations: [],
  bank: DrumEditorState.createInitialBank(),
});
```

ドラムはコード未指定でも成立するため、`EditorProps` は以下のように分岐している。

- `piano/guitar`: `target: Target` を使う。`compiledChord` 必須
- `drum`: `target: TargetBase` を使う。`compiledChord` なしでも可

```ts
export type TargetBase = {
  scoreBase: ElementState.DataInit;
  beat: DerivedState.BeatCache;
  chordSeq: number;
};

export type Target = TargetBase & {
  compiledChord: DerivedState.CompiledChord;
};
```

この分岐により、ドラムはコードブロックにコードが無い状態でもBキーでエディタを開ける。

## method コマンド

`method` コマンドで `drum` を選択できる。

関連ファイル:

`tauri_app/src/system/service/terminal/command/provider/harmonize-provider.ts`

`method` で既存トラックをドラムトラック初期値へ置き換える処理が入っている。

## ライブラリ検索条件

ライブラリ検索パネルでは、アクティブトラックがドラムの時、表示項目を絞っている。

関連ファイル:

`tauri_app/src/system/component/library/search/LibrarySearchPanel.svelte`

ドラムで必要な検索条件は以下。

- Time Signature
- Beat
- Eat Head
- Eat Tail

ドラムはコード構成音に依存しないため、Root / On / Symbol / Symbol Tones などは非表示。

## マッピングダイアログ

マッピングはドラムトラックの `bank.mappings` を直接リアルタイム更新する。

関連ファイル:

- `tauri_app/src/system/store/state/mapping-state.ts`
- `tauri_app/src/system/actions/library/mapping-actions.ts`
- `tauri_app/src/system/input/input-mapping.ts`
- `tauri_app/src/system/component/library/mapping/MappingDialog.svelte`
- `tauri_app/src/system/store/global-store.ts`
- `tauri_app/src/system/component/MainFrame.svelte`

### 表示

`MappingDialog.svelte` は全体モーダル。

列:

- Key
- Display
- Sound

### 操作

`input-mapping.ts`

- `ArrowUp/ArrowDown`: レコードフォーカス移動
- `ArrowLeft/ArrowRight`: カラムフォーカス移動
- `A`: レコード追加
- `Delete`: レコード削除
- `Shift + ArrowUp/ArrowDown`: レコード順序を上下にスワップ
- `W`: フォーカスセルの編集
- `Space`: 割り当て音をプレビュー
- `Escape`: ダイアログを閉じる

### Key 編集

`W` でフローティングテキストを開く。

制約:

- 半角英数とハイフンのみ
- 1〜12文字
- 自分以外の既存keyと重複不可

レコード追加時は `key0`, `key1`, ... のように未使用keyを自動採番する。

### Display 編集

`W` で編集。

制約:

- 24文字まで
- 空文字で保存した場合は `name` プロパティを `delete`
- 未指定時は `key` と同じ文字列を薄く表示

### Sound 編集

`W` で編集。

入力は `C4`, `D#6` のようなピッチ名。

関連関数:

- `TonalityTheory.parseKey12FullName`
- `TonalityTheory.getKey12FullName`

制約:

- 空文字を許容し、その場合 `pitch = -1`
- 自分以外の既存pitchと重複不可

### プレビュー

`Space` で、フォーカス中レコードの `pitch` をプレビューする。

エラー:

- `pitch === -1`: `Sound is not assigned.`
- `track.instRef == undefined`: `Instrument is not assigned.`

## マッピングダイアログを開く導線

現状、ドラムトラックの時だけ暫定キーで開く。

関連ファイル:

`tauri_app/src/system/input/input-root.ts`

以前の会話では「候補キーは暫定でよい」「ドラムでのみ出せるように制御」「トースト不要」という方針。

現実装では `mappingActions.open()` 側でもアクティブトラックがドラムでなければ何もしない。

## ドラムアレンジエディタ

関連ファイル:

- `tauri_app/src/system/component/arrange/drum/ArrangeDrumEditor.svelte`
- `tauri_app/src/system/component/arrange/drum/DECriteriaFrame.svelte`
- `tauri_app/src/system/component/arrange/drum/DEColFrame.svelte`
- `tauri_app/src/system/component/arrange/drum/DERecordFrame.svelte`
- `tauri_app/src/system/component/arrange/drum/DEPatternFrame.svelte`
- `tauri_app/src/system/actions/arrange/drum/drum-arrange-actions.ts`
- `tauri_app/src/system/input/arrange/input-drum-editor.ts`

### レイアウト

ドラムエディタは `ArrangeDrumEditor.svelte`。

構成:

```text
+----------+----------------------+
| Criteria | Column               |
|          | Measure              |
+----------+----------------------+
| Record   | Pattern              |
|          |                      |
+----------+----------------------+
```

`ChordInfoHeader` は共通利用。

ドラムはコードが無くても成立するため、`ChordInfoHeader` 側では `compiledChord` が無い場合に `-` を表示する。

### メモリ

カラム下のメモリはピアノバッキングと共通化している。

共通部品:

`tauri_app/src/system/component/arrange/common/BackingMeasureFrame.svelte`

ピアノ側:

`tauri_app/src/system/component/arrange/piano/backing/PEBMeasureFrame.svelte`

ドラム側:

`ArrangeDrumEditor.svelte` から以下のように利用。

```svelte
<BackingMeasureFrame ts={target.scoreBase.rhythm.ts} beat={target.beat} />
```

現時点ではドラムのカラム実装が未完成なので、列レンジは渡していない。
そのため、アウトラインの拍子・beat/eat に従った必要範囲のメモリだけ表示している。

### 操作対象

`DrumEditorState.Control`

```ts
export type Control = "criteria" | "col" | "record" | "hits";
```

ステータス表示では以下のように表示される。

- Criteria
- Column
- Record
- Pattern

### 操作対象切り替え

`input-drum-editor.ts`

`Shift + 方向キー` で切り替え。

- Criteria -> Right: Column
- Criteria -> Down: Record
- Column -> Left: Criteria
- Column -> Down: Pattern
- Record -> Up: Criteria
- Record -> Right: Pattern
- Pattern -> Up: Column
- Pattern -> Left: Record

### レコード操作

レコード操作は実装済み。

Record 操作中のみ:

- `A`: レコード追加
- `Delete`: フォーカス中レコード削除
- `ArrowUp`: 上方向へフォーカス移動
- `ArrowDown`: 下方向へフォーカス移動

ピアノのバッキングレコード操作に合わせている。

実装:

`tauri_app/src/system/actions/arrange/drum/drum-arrange-actions.ts`

注意:

- 初期状態は `records: []`, `cursorY: -1`
- 1件目を追加すると `cursorY = 0`
- 削除して0件になったら `cursorY = -1`
- 削除時は、対象recordIndexの `hits` を削除し、後続の `hit.recordIndex` を詰める

### レコード表示

`DERecordFrame.svelte`

ピアノの `PEBRecordFrame.svelte` に見た目を寄せている。

重要:

`inline-block` の縦揃え由来の余白差が出るため、`.frame * { vertical-align: top; }` を入れている。

## まだ未実装のこと

### Criteria

表示枠だけ。

今後必要:

- `criteriaDiv` の表示
- `criteriaDiv` の選択操作
- `eatHead/eatTail` による選択制約

### Column

表示枠だけ。

今後必要:

- 基準グリッドの表示
- `colDivs` に基づく分割表示
- カラムフォーカス移動
- `2 | 3 | 4` キーで分割
- 分割解除/親単位へ戻す操作
- 分割時に後続 `hit.colIndex` をずらす処理

### Record の中身設定

レコード増減とフォーカスだけ実装済み。

今後必要:

- レコードに `Mapping.key` を割り当てる
- mapping一覧から選択するUI/操作
- key未割当時の表示ルール
- mapping削除時に既存パターンのrecord keyが不正になる可能性への対応

### Pattern/Hits

表示枠だけ。

今後必要:

- マトリクス表示
- hitのON/OFF
- velocity変更
- cursorX/cursorY の整合
- record削除/column分割時のhit補正

### 保存/適用

ドラムのエディタを開いて閉じる土台はあるが、パターンとして `bank.patterns` に保存/更新する処理は未実装。

ピアノ側の `piano-arrange-updater.ts` 相当を参考にすることになるが、最初はドラム用updaterを新規に作る方が安全。

候補:

`tauri_app/src/system/service/arrange/drum/drum-arrange-updater.ts`

### Finder/Library

ドラム用の検索条件は表示を絞っただけ。

今後必要:

- `bank.patterns` から、TS/Beat/Eat条件に合うパターンを検索
- `regulars` の扱い
- ライブラリエディタでドラムパターンを表示/編集
- プリセット/バンクのexport/importでdrum対応

## 注意点

### 既存コメントの文字化け

過去にPowerShell/文字コード絡みで日本語コメントが文字化けしたことがある。

日本語コメントを編集する時は注意。

### 1ファイル複数export禁止ルール

プロジェクト方針として、1ファイルで複数のexportを避ける。

複数APIが必要な場合は namespace default export か、ファクトリ関数1つのdefault exportに寄せる。

### ドラムはコード非依存

ドラムでは `compiledChord` が無いケースを許容する。

ピアノ/ギター側まで `compiledChord` optional として扱うのではなく、`TargetBase` と `Target` の分岐を維持する。

### マッピングはトラックBankに属する

マッピングはグローバルではなく、現時点ではドラムトラックの `bank.mappings` に属する。

ライブラリエディタから管理したいが、データ上はトラックのBankに保持している。

### ドラムアレンジの実音再生

マッピングの単音プレビューは `previewArrangeNote(track, pitch)` で実装済み。

パターン再生・タイムライン再生への統合は未実装。

## 次に実装しやすい順

1. Record の key 割り当て
2. Column の基準グリッド表示
3. Pattern マトリクス表示
4. hit ON/OFF
5. ドラム用 updater 作成
6. apply時に `bank.patterns` へ保存
7. Finder/Library 検索対応
8. 再生/エクスポートへの統合

