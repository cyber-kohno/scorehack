# Phase 7 Plan

## 目的
Phase 7 では、次の主要対象として `timeline` 全体の責務を整理します。

このフェーズの主目的は、現行の timeline を単なる表示領域としてではなく、
- header
- pitch column
- grid
- focus 表示
- melody 表示
- outline 由来の chord / beat 表示
- playback line 表示
- scroll / viewport

を束ねる 1 つの機能単位として、新構成で説明できる状態にすることです。

---

## Phase 7 で timeline を扱う理由
Phase 7 の対象は `timeline` を優先します。

理由は以下です。
- Phase 3 の `outline`
- Phase 5 の `melody`
- Phase 6 の `playback`

がいずれも timeline と接続しており、次に全体の境界を整理する対象として自然だからです。

- `outline / melody / playback` の入口はかなり新構成へ寄っており、timeline 側の責務を整理しやすい段階に来ている
- 現状の timeline は `header / pitch / grid / focus / overlay` が `system/component/timeline` に密集していて、見通しを改善する効果が大きい
- timeline を整理すると、今後の `tempo / ts` 実装や arrange 表示整理にもつながる
- 逆に store 全体の境界整理を先に深掘りすると、timeline の描画責務が見えにくいままになりやすい

そのため、Phase 7 は `timeline を機能単位で整理するフェーズ` として進めます。

---

## 対象範囲

### 対象に含めるもの
- timeline frame の UI 入口
- timeline header の UI 入口
- timeline pitch の UI 入口
- timeline grid の UI 入口
- focus / cursor / overlay 表示の timeline 境界
- timeline の scroll / viewport 関連参照
- melody / outline / playback が timeline に差し込まれる接続点
- timeline 用 selector の追加

### 対象に含めないもの
- melody editor の本格再設計
- playback engine 本体の deeper split
- arrange editor の全面整理
- tempo / ts の未完了実装
- store 実体の分割
- terminal command 体系の再設計

---

## このフェーズで目指す状態
- `timeline` まわりの責務を新構成で説明できる
- timeline UI の入口が `src/ui/timeline` 配下に整理される
- timeline が `outline / melody / playback` をどう受けるかを説明できる
- timeline state の読み取り入口が selector ベースに寄る
- `system/component/timeline` 直参照が減り、`ui/timeline` の入口から見える構造になる
- 今後 `tempo / ts` を timeline に反映するための土台が整う

---

## 進め方

### 1. timeline 関連ファイルの洗い出し
以下を対象に、現行責務を分類します。
- `tauri_app/src/system/component/timeline/*`
- `tauri_app/src/system/component/timeline/header/*`
- `tauri_app/src/system/component/timeline/pitch/*`
- `tauri_app/src/system/component/timeline/grid/*`
- `tauri_app/src/ui/melody/*` との接続点
- `tauri_app/src/ui/playback/*` との接続点
- `tauri_app/src/ui/outline/*` との接続点

### 2. timeline の移行マップを作る
timeline 関連ファイルを `ui / state / boundary / keep legacy / postpone` の観点で分類します。

### 3. `ui/timeline` の入口を整理する
この段階では見た目や仕様を変えるのではなく、timeline 全体の入口を新構成で揃えます。

対象候補:
- `TimelineFrame`
- `header`
- `pitch`
- `grid`

### 4. timeline selector を追加する
巨大 store を維持したまま、timeline で使う state の読み取り入口を整理します。

対象例:
- beatWidth
- scroll limit props
- current mode に応じた表示状態
- preview active 判定
- visible caches
- focus / cursor 関連の timeline 表示条件

### 5. timeline と各機能の接続点を整理する
- outline -> chord / measure / section 表示
- melody -> note / cursor / focus 表示
- playback -> preview line 表示

を timeline 側から見て整理します。

### 6. scroll / viewport 関連の責務を整理する
`StoreRef` や `reducerRef` と timeline 表示の接続点を把握し、timeline 側でどこまで持つかを明確にします。

### 7. 進捗確認と責務メモを残す
Phase 7 の終盤で、timeline の責務整理メモとクローズノートを追加します。

---

## 推奨実施順
1. timeline 関連ファイルの洗い出し
2. timeline の移行マップ作成
3. `ui/timeline` の入口整理
4. timeline selector 追加
5. outline / melody / playback 接続点整理
6. scroll / viewport 境界整理
7. 動作確認と進捗更新

---

## このフェーズで作る可能性が高いファイル
- `tauri_app/src/ui/timeline/TimelineFrame.svelte`
- `tauri_app/src/ui/timeline/header/TimelineHeader.svelte`
- `tauri_app/src/ui/timeline/pitch/TimelinePitchColumn.svelte`
- `tauri_app/src/ui/timeline/grid/TimelineGrid.svelte`
- `tauri_app/src/state/ui-state/timeline-ui-store.ts`
- `tauri_app/src/state/session-state/timeline-session.ts`
- `ai_context/phase/phase7_timeline_inventory.md`
- `ai_context/phase/phase7_timeline_migration_map.md`
- `ai_context/phase/phase7_timeline_responsibilities.md`

---

## 完了条件
以下を満たしたら、Phase 7 は完了扱いにできます。

- timeline 関連ファイルの洗い出しができている
- timeline の移行マップが作られている
- `ui/timeline` の入口が整理されている
- timeline 用 selector が追加されている
- outline / melody / playback の timeline 接続点を説明できる
- `npm run check` が通る
- `npm run build` が通る
- `cargo check` が通る
- 進捗が `ai_context/phase` に記録されている

---

## リスクと注意点

### 1. timeline は結節点である
`timeline` は単独機能ではなく、outline / melody / playback / cache / ref の結節点なので、一気に全面移行すると壊しやすいです。

### 2. 描画入口とロジック入口を分けて考える
最初から `BaseBlock` や `ChordBlock` の内部まで深掘りせず、まずは frame / header / pitch / grid の入口を整理する方が安全です。

### 3. scroll / viewport は副作用と密接
scroll 調整は `reducerRef` に寄っているため、Phase 7 では責務整理までに留め、挙動変更は避けます。

### 4. tempo / ts は後続仕様に効く
未完成の `tempo / ts` が timeline に影響する余地はあるが、Phase 7 では実装完了を目的にせず、受け皿を整理することを優先します。

---

## 前提メモ
- `outline` は Phase 3 で責務整理済み
- `terminal` は Phase 4 で責務整理済み
- `melody` は Phase 5 で timeline 上の編集機能として境界整理済み
- `playback` は Phase 6 で UI / state / app / domain / infra の土台整理済み
- Phase 7 ではこれらを束ねる timeline 側の見通しを整える

---

## 進捗記録
Phase 7 の実作業を始めたら、以下に記録します。
- `ai_context/phase/phase7_progress.md`

---

## 次の着手
Phase 7 の最初の着手は以下です。

1. timeline 関連ファイルの洗い出しを行う
2. その結果をもとに Phase 7 の移行マップを作る

この順で進めると、timeline のような結節点でも安全に責務を見極めながら進めやすいです。
