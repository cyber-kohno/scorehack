# Drum Arrange 2026-06-26 開発進捗メモ

このメモは、2026-06-26 に進めたドラムアレンジ関連の実装差分と、次回作業時の注意点を引き継ぐためのものです。

## 追加した汎用部品

### FloatingSelect

`FloatingTextInput` を参考に、候補選択用の汎用フローティング部品を追加した。

関連ファイル:

- `tauri_app/src/system/store/state/floating-select-state.ts`
- `tauri_app/src/system/service/common/floating-select-controller.ts`
- `tauri_app/src/system/input/input-floating-select.ts`
- `tauri_app/src/system/component/common/FloatingSelectLayer.svelte`
- `tauri_app/src/system/store/global-store.ts`
- `tauri_app/src/system/input/input-root.ts`
- `tauri_app/src/system/component/MainFrame.svelte`

主な仕様:

- item は `value: string`, `label?: string`, `disabled?: boolean`
- `label` が未指定なら `value` を表示
- フィルター対象は表示文字列のみ
- `Enter` でフォーカス item の `value` を callback に渡す
- disabled item はリストに表示されるが確定不可
- disabled item は薄い色と取り消し線で表示
- 値の型変換は呼び出し側の責務。汎用部品側は string 境界を維持する

## MappingDialog 周り

### Sound 編集を FloatingSelect 化

`MappingDialog.svelte` の Sound 編集をテキスト入力から `FloatingSelect` に置き換えた。

関連ファイル:

- `tauri_app/src/system/actions/library/mapping-actions.ts`

仕様:

- 未指定は先頭候補。`value: "-1"`, `label: ""`
- pitch 候補は `0..127`
- 表示は `TonalityTheory.getKey12FullName(pitch)`
- value は `String(pitch)`
- apply 時に `Number(value)` して `record.pitch` に保存
- 他 mapping で使用済みの pitch は disabled
- 現在行の pitch と `-1` は disabled にしない

### Mapping レコード追加時の name 初期値修正

以前は mapping レコード追加時に `name: ""` を入れていたが、Display 空文字は `name` プロパティを delete する方針なので、追加時に `name` を作らないよう修正した。

Display 更新時は既存通り:

- `value.trim()` が空なら `delete record.name`
- 文字があれば `record.name = name`

### Mapping のレコード swap キー変更

MappingDialog のレコード順序入れ替えを `Shift + ArrowUp/Down` から `D hold + ArrowUp/Down` に変更した。

理由:

- `Shift` は他画面では操作対象切り替えに使うことが多い
- `D` は対象物の移動系に使われている

`input-root.ts` で MappingDialog 表示中も `d` の hold 状態を保持するようにしている。

## Drum editor の Record

### Record に mapping key を割り当て可能にした

Record 操作中に `W` で `FloatingSelect` を開き、ドラム mapping から key を選択できる。

関連ファイル:

- `tauri_app/src/system/actions/arrange/drum/drum-arrange-actions.ts`
- `tauri_app/src/system/input/arrange/input-drum-editor.ts`
- `tauri_app/src/system/component/arrange/drum/DERecordFrame.svelte`
- `tauri_app/src/system/store/state/ref-state.ts`

仕様:

- 候補先頭は未指定。`value: ""`, `label: ""`
- mapping 候補は `value: mapping.key`
- 表示は `mapping.name ?? mapping.key`
- 他 Record で使用済みの key は disabled
- 未指定は複数 Record で許容
- Record 表示も `mapping.name ?? mapping.key`
- mapping が見つからない key は key 文字列をそのまま表示

### Record swap

ドラム Record 操作中に `D hold + ArrowUp/Down` で順序入れ替えを追加した。

実装上の注意:

- `records` の順序を入れ替える
- 対象 record に紐づく `hits.recordIndex` も入れ替えに追従させる

## Drum editor の Criteria

### Criteria 表示と編集

Criteria 操作中に `W` で `FloatingSelect` を開き、`criteriaDiv` を選択できる。

関連ファイル:

- `tauri_app/src/system/component/arrange/drum/DECriteriaFrame.svelte`
- `tauri_app/src/system/actions/arrange/drum/drum-arrange-actions.ts`
- `tauri_app/src/system/store/state/data/arrange/drum/drum-editor-state.ts`

現在の整理:

- `criteriaDiv` は「1拍あたりの分割数」
- 基準音価は保存しない
- 拍子コンテキストから表示と候補を算出する

4分系拍子:

- `1 -> 4n`
- `2 -> 8n`
- `4 -> 16n`

8分系複合拍子:

- `1 -> 4n.`
- `3 -> 8n`
- `6 -> 16n`

`criteriaDiv` 型は `1 | 2 | 3 | 4 | 6` に拡張済み。

### シンコペーション制約

`beat.eatHead/eatTail` の単位を考慮して、選択できない Criteria は disabled にしている。

計算は `DrumEditorState` に寄せた。

主な helper:

- `getAvailableCriteriaDivs(ts)`
- `getCriteriaDivLabel(div, ts)`
- `getMinCriteriaDiv(beat, ts)`
- `getEffectiveCriteriaDiv(div, beat, ts)`
- `getColumnCount(div, beat, ts)`

## Drum editor の Column

### Criteria に応じた Column 表示

`DEColFrame.svelte` で Criteria に応じた基準カラムを表示するようにした。

仕様:

- Column 表示は基準カラムのみ
- `colDivs` による分割は Column 表示にはまだ反映しない
- focus は Column 操作中のみ表示
- `ArrowLeft/ArrowRight` で `cursorX` 移動

### Column 分割

Column 操作中に `W` で分割 select を開ける。

関連ファイル:

- `tauri_app/src/system/actions/arrange/drum/drum-arrange-actions.ts`
- `tauri_app/src/system/input/arrange/input-drum-editor.ts`
- `tauri_app/src/system/component/arrange/drum/DEColFrame.svelte`
- `tauri_app/src/system/store/state/ref-state.ts`

`colDivs` は差分定義として扱う。

- 該当 index がない: 未分割
- `{ index, div }` がある: その基準カラムだけ分割
- select で `-` を選ぶ: 該当 index の定義を削除

分割候補:

- 基準 `16n`: select を出さない
- 基準 `8n`: `2`, `3`
- 基準 `4n`: `2`, `3`, `4`
- 複合拍子の `4n.`: `3` のみ

## Drum editor の Pattern matrix

### セル枠表示

`DEPatternFrame.svelte` に、Record x Column のマトリクスセルを表示するようにした。

見た目はピアノ backing table に寄せている。

- 行高さは `--ap-backing-record-height`
- 行間は `margin-top: 1px`
- セル間は `margin-left: 1px`
- セル色はピアノ側に近い紫系

### colDivs の反映

Column 表示には分割を反映しないが、Pattern matrix には `colDivs` を反映する。

- 分割された基準カラムは `div` 個のセルとして表示
- 子セルの色差はつけない

### Pattern focus

Pattern 操作中に以下で focus 移動できる。

- `ArrowLeft/ArrowRight`: 分割反映後の matrix column を移動
- `ArrowUp/ArrowDown`: record を移動

`cursorX` は Pattern 操作中、分割反映後の matrix column index として使っている。

### Hit toggle

Pattern 操作中に `A` で Hit を ON/OFF できる。

関連ファイル:

- `tauri_app/src/system/component/arrange/drum/DEPatternFrame.svelte`
- `tauri_app/src/system/component/arrange/drum/DEHitMark.svelte`
- `tauri_app/src/system/actions/arrange/drum/drum-arrange-actions.ts`

仕様:

- Hit がなければ追加
- Hit があれば削除
- 初期 velocity は `100`
- `hit.colIndex` は分割反映後の matrix column index
- `hit.recordIndex` は Record index

表示:

- `DEHitMark.svelte` を追加
- 現時点では左端の緑の縦棒を表示
- 将来 mapping key に応じた見た目へ拡張する想定

Svelte のリアクティブ注意:

- `hasHit()` 関数内で `editor.hits` を見るだけだと再描画されなかった
- 現在は `$: hitKeys = new Set(editor.hits.map(...))` を作って表示側で参照している

### colDivs 変更時の Hit 補正

Column 分割・解除時に `hits.colIndex` を補正するようにした。

分割時:

- 対象カラム上の Hit はそのまま先頭セルに残す
- 対象カラムより後ろの Hit は、増えたセル数ぶん後ろへ移動

解除時:

- 対象カラム内は先頭セルの Hit だけ残す
- 2つ目以降の子セル上の Hit は削除
- 対象カラムより後ろの Hit は、減ったセル数ぶん前へ移動

補正 helper は `drum-arrange-actions.ts` 内にある。

## 現時点の操作まとめ

ドラムエディタ操作対象の切り替え:

- `Shift + Arrow`
- Criteria / Column / Record / Pattern を移動

Criteria:

- `W`: Criteria select

Column:

- `ArrowLeft/ArrowRight`: Column focus 移動
- `W`: 分割 select

Record:

- `A`: Record 追加
- `Delete`: Record 削除
- `ArrowUp/ArrowDown`: Record focus 移動
- `W`: mapping key select
- `D hold + ArrowUp/Down`: Record swap

Pattern:

- `ArrowLeft/ArrowRight`: matrix column focus 移動
- `ArrowUp/ArrowDown`: Record focus 移動
- `A`: Hit ON/OFF

MappingDialog:

- `D hold + ArrowUp/Down`: mapping record swap

## 注意点・未解決

### cursorX の意味が操作対象で変わる

現状:

- Column 操作中: `cursorX` は基準カラム index
- Pattern 操作中: `cursorX` は分割反映後の matrix column index

これは当面動くが、今後 Pattern と Column を行き来する時に、基準カラム index と matrix column index の変換 helper が必要になる可能性が高い。

### colDivs と hits の保存設計

現時点では `hit.colIndex` は分割反映後 matrix index として扱っている。

将来的に保存/再適用/検索/再生を実装する時に、以下を改めて整理する必要がある。

- `hit.colIndex` を matrix index のまま保存するか
- `{ baseColIndex, splitIndex }` のように構造化するか
- `colDivs` 変更時の補正ルールをどこまで保証するか

今の実装は、既存の `Hit` 型を変えずに進めるための暫定寄りの実装。

### Criteria 変更時の Hit 補正は未実装

Criteria を変更するとカラム数・解釈が変わるが、現時点では `hits` の補正はしていない。

今後必要:

- Criteria 変更時に hits/colDivs をどう扱うか決める
- 安全策として hits/colDivs をクリアするか
- 位置を変換して維持するか

### Column 表示には分割を反映していない

仕様未確定のため、`colDivs` は Pattern matrix にだけ反映している。

### 保存/適用は未実装

ドラムエディタ内で編集はできるが、`bank.patterns` への保存/更新処理はまだ未実装。

候補:

- `tauri_app/src/system/service/arrange/drum/drum-arrange-updater.ts`

### Finder/Library/再生/エクスポートは未実装

まだ必要:

- `bank.patterns` から TS/Beat/Eat 条件検索
- `regulars` の扱い
- ライブラリエディタでのドラムパターン表示/編集
- パターン再生
- タイムライン再生
- MIDI/WAV export 反映

## 次にやるとよさそうなこと

1. Criteria 変更時の `colDivs` / `hits` 補正方針を決める
2. Pattern の `hit.colIndex` 保存形式を再検討する
3. Hit velocity 編集を入れる
4. ドラム用 updater を作る
5. apply 時に `bank.patterns` へ保存
6. パターン再生に接続
7. Finder/Library 検索へ接続

## 確認済み

以下を実行し、エラーなし。

```powershell
cmd /c npm run check
```

既存 warning は以下の2件が残っている。

- `ArrangeStatusBar.svelte` の unused CSS selector `.margin`
- `ChordBlock.svelte` の unused export property `index`
