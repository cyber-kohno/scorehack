# Phase 5 Melody Inventory

## 目的
このドキュメントは、Phase 5 で `melody` を新構成へ移していく前に、現行 `tauri_app` にある melody 関連ファイルと責務を洗い出すためのインベントリです。

---

## melody の基本認識
現行の `melody` は、単旋律データだけを扱うモジュールではなく、以下をまとめて含んでいます。

- melody mode の編集 UI
- cursor / focus / range / clipboard の state
- score track / audio track の操作
- note の追加・削除・移動・長さ変更
- outline との同期
- preview 再生との接続
- timeline grid / header / pitch での表示

つまり、`melody` は timeline 上の編集機能そのものに近い位置づけです。

---

## 1. melody 専用 UI

### 対象ファイル
- `tauri_app/src/system/component/melody/Cursor.svelte`
- `tauri_app/src/system/component/melody/UnitDisplay.svelte`
- `tauri_app/src/system/component/melody/score/ActiveTrack.svelte`
- `tauri_app/src/system/component/melody/score/Factors.svelte`
- `tauri_app/src/system/component/melody/score/Note.svelte`
- `tauri_app/src/system/component/melody/score/ShadeNote.svelte`
- `tauri_app/src/system/component/melody/score/ShadeTracks.svelte`

### 見えている責務
- cursor 表示
- note の描画
- active track の表示
- 非アクティブ track の shade 表示
- 音価や装飾の表示

### メモ
- `Note.svelte` は state / reducer 依存が強く、単純な presentational component ではない
- `Cursor.svelte` と `UnitDisplay.svelte` は比較的先に移しやすい

---

## 2. timeline 側の melody 接続

### 対象ファイル
- `tauri_app/src/system/component/timeline/grid/GridRootFrame.svelte`
- `tauri_app/src/system/component/timeline/grid/BaseBlock.svelte`
- `tauri_app/src/system/component/timeline/header/MeasureFocus.svelte`
- `tauri_app/src/system/component/timeline/header/BeatMeasureFrame.svelte`
- `tauri_app/src/system/component/timeline/pitch/PitchFocus.svelte`
- `tauri_app/src/system/component/timeline/pitch/PitchListFrame.svelte`

### 見えている責務
- melody mode のときだけ cursor / active track / shade を重ねる
- 現在 focus 中の note に応じて measure focus を表示する
- 現在 focus 中の pitch に応じて pitch focus を表示する
- grid 上の block 表示も melody cursor / focus に依存する

### メモ
- `melody` は timeline から独立していない
- Phase 5 では `ui/melody` だけでなく `timeline との境界整理` をセットで扱う必要がある

---

## 3. input

### 対象ファイル
- `tauri_app/src/system/input/inputMelody.ts`

### 見えている責務
- cursor 操作
- focus 操作
- range 選択
- note 追加 / 削除 / 複製
- note pitch / len / pos 編集
- clipboard 操作
- tuplets 操作
- outline 同期
- preview test 再生
- grid / outline スクロール調整

### メモ
- かなり大きい責務が集まっている
- `input root` と `edit action` と `selection control` が混ざっている
- 最初は本体分解より、`app/melody` 入口を切る方が安全

---

## 4. reducer 相当

### 対象ファイル
- `tauri_app/src/system/store/reducer/reducerMelody.ts`

### 見えている責務
- cursor 初期同期
- current score track 参照
- note 追加
- overlap 判定
- focus in / out
- score track 切り替え
- focus range 計算
- outline 同期
- grid scroll 同期

### メモ
- reducer と言いつつ、純粋ロジックだけでなく ref scroll や outline 同期も含む
- `melody action` と `melody view sync` の責務が混ざっている

---

## 5. 型と純粋ロジック

### 対象ファイル
- `tauri_app/src/system/store/props/storeMelody.ts`

### 見えている責務
- melody control state 型
- note / track 型
- beat 計算
- overlap 判定
- normalize
- pitch validation
- unit text 生成
- 初期 track 生成

### メモ
- `domain/melody` に寄せやすい要素が多い
- 一方で `Layout` 依存も含むため、切り出し時は責務を少し分ける必要がある

---

## 6. terminal との接続

### 関連ファイル
- `tauri_app/src/system/store/reducer/terminal/sector/builderMelody.ts`

### 見えている責務
- score track / audio track の作成
- active track の変更
- audio file load
- soundfont 設定
- terminal から melody 系状態を編集

### メモ
- Phase 4 で terminal 側の入口整理は進んでいる
- Phase 5 では melody 側から見て「どの action を terminal へ公開しているか」を説明できるようにするとよい

---

## 7. 現時点の分類

### `ui` に寄せやすいもの
- `system/component/melody/Cursor.svelte`
- `system/component/melody/UnitDisplay.svelte`
- `system/component/melody/score/ActiveTrack.svelte`
- `system/component/melody/score/ShadeTracks.svelte`
- `system/component/melody/score/Note.svelte`

### `app` に入口を作るべきもの
- `system/input/inputMelody.ts`
- `system/store/reducer/reducerMelody.ts`

### `state` に selector / updater を作るべきもの
- `control.melody.*`
- current score track / current audio track
- focus range
- overlap state

### `domain` に寄せやすいもの
- `storeMelody.ts` の note / track 型
- beat 計算
- overlap 判定
- normalize
- validatePitch
- getUnitText

### `timeline 境界` として扱うべきもの
- `GridRootFrame.svelte`
- `MeasureFocus.svelte`
- `PitchFocus.svelte`
- `BaseBlock.svelte`

---

## 8. 最初に触るのが安全な単位
1. `ui/melody` の入口作成
2. `GridRootFrame.svelte` など timeline 側の参照切り替え
3. `melody-ui-store.ts` の selector 追加
4. `app/melody` 入口作成

この順なら、input / reducer の本体をいきなり深く変えずに進めやすい。
