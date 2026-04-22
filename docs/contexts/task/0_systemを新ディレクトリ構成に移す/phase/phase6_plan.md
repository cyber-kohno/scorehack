# Phase 6 Plan

## 目的
Phase 6 では、次の主要機能単位として `playback` を整理します。

このフェーズの主目的は、現行の preview / audio 再生まわりを単なる utility 群としてではなく、
- 再生開始 / 停止
- progress line 更新
- SoundFont のロードと管理
- audio track 再生
- timeline との接続
- terminal / input からの再生命令

を含む 1 つの機能単位として、新構成で説明できる状態にすることです。

---

## Phase 6 で playback を先に扱う理由
Phase 6 の対象は `playback` を優先します。

理由は以下です。
- Phase 5 の `melody` で preview との接続点が見え始めており、その次の整理対象として自然である
- `previewUtil.ts` と `storePreview.ts` に責務が比較的集約していて、切り出しの起点を作りやすい
- `timeline` 全体を先に扱うよりも、再生線や progress 更新などの責務に絞ったほうが安全に進めやすい
- terminal からの preview 起動や track 再生も関わっており、Phase 4 の成果を活かせる
- 将来 Tauri / Rust 側との連携を考えるうえでも、音声再生基盤の責務分離は先に済ませておく価値が高い

そのため、Phase 6 は `playback を機能単位で整理するフェーズ` として進めます。

---

## 対象範囲

### 対象に含めるもの
- preview / playback の UI 表示入口
- playback state の読み取り入口
- SoundFont 読み込みの入口
- preview 開始 / 停止 / progress 更新の入口
- audio track 再生の入口
- timeline preview line の表示入口
- playback 関連の domain 型 / 純粋ロジック
- terminal / input から playback を呼ぶ導線

### 対象に含めないもの
- melody editor の本格再設計
- outline の tempo / ts 未完成部分の実装完了
- arrange editor の本格整理
- audio engine の全面刷新
- SoundFont ライブラリの変更
- store 全分割

---

## このフェーズで目指す状態
- `playback` まわりの責務を新構成で説明できる
- playback UI の入口が `src/ui/playback` または timeline 側入口に整理される
- playback 操作の入口が `src/app/playback` に揃う
- playback state の読み取り入口が `state/ui-state` または `state/session-state` に切られる
- playback の型や純粋ロジックが `domain/playback` に寄り始める
- Tauri 以外の音声再生依存は `infra/audio` または `infra/preview` に寄り始める
- timeline が playback をどう表示するかを説明しやすくなる

---

## 進め方

### 1. playback 関連ファイルの洗い出し
以下を対象に、現行責務を分類します。
- `tauri_app/src/system/util/preview/*`
- `tauri_app/src/system/store/props/storePreview.ts`
- `tauri_app/src/system/component/timeline/grid/PreviewPosLine.svelte`
- `tauri_app/src/system/component/timeline/*` の preview 表示に関わる部分
- `tauri_app/src/system/input/*` の再生起動に関わる部分
- `tauri_app/src/system/store/reducer/terminal/*` の再生コマンドに関わる部分

### 2. playback の移行マップを作る
playback 関連ファイルを `ui / app / state / domain / infra / timeline 境界 / 保留` の観点で分類します。

### 3. playback UI の入口を整理する
この段階では見た目や仕様を変えるのではなく、playback 表示の入口を新構成で揃えます。

対象候補:
- preview position line
- playback status 表示に関わる要素
- timeline と playback の接続点

### 4. playback state selector / updater を作る
巨大 store を維持したまま、playback で使う state の読み取り入口と更新入口を整理します。

対象例:
- progress time
- last time
- line position
- active timers / intervals
- loaded SoundFont items
- active audio elements

### 5. playback input / action の入口を `src/app/playback` に寄せる
最初は wrapper でもよいので、旧 preview utility を `app/playback` 側の入口から呼ぶ形にします。

対象候補:
- `playback-actions.ts`
- `playback-preview-router.ts`
- `soundfont-loader.ts`

### 6. playback の domain / infra を切り出す
純粋ロジックや型は `domain/playback`、音声ライブラリ依存は `infra/audio` または `infra/preview` に寄せます。

対象例:
- player note 型
- track player 型
- progress 計算
- note -> player 変換のうち純粋部分
- SoundFont load / cache のライブラリ依存部分
- audio element 操作の副作用部分

### 7. timeline との接続を整理する
playback は timeline の preview line と結びついているため、最後に「timeline 側から playback をどう参照するか」を整理します。

この段階では timeline 全面移行ではなく、playback と接している境界だけを対象にします。

---

## 推奨実施順
1. playback 関連ファイルの洗い出し
2. playback の移行マップ作成
3. `ui/playback` または timeline 側入口の整理
4. playback selector / updater 追加
5. `app/playback` の input / action 入口整理
6. `domain/playback` と `infra/audio` への切り出し
7. timeline との接続整理
8. 動作確認と進捗更新

---

## このフェーズで作る可能性が高いファイル
- `tauri_app/src/ui/playback/PreviewPositionLine.svelte`
- `tauri_app/src/app/playback/playback-actions.ts`
- `tauri_app/src/app/playback/playback-preview-router.ts`
- `tauri_app/src/app/playback/soundfont-loader.ts`
- `tauri_app/src/state/ui-state/playback-ui-store.ts`
- `tauri_app/src/state/session-state/playback-session.ts`
- `tauri_app/src/domain/playback/playback-types.ts`
- `tauri_app/src/domain/playback/playback-progress.ts`
- `tauri_app/src/infra/audio/soundfont-player.ts`
- `tauri_app/src/infra/preview/audio-preview.ts`

---

## 完了条件
以下を満たしたら、Phase 6 は完了扱いにできます。

- playback UI の入口が新構成で整理されている
- playback state の selector / updater が追加されている
- playback input / action の入口が `src/app/playback` にある
- playback の型や純粋ロジックが `domain/playback` に寄り始めている
- timeline と playback の接続点を新構成で説明できる
- `npm run check` が通る
- `npm run build` が通る
- `cargo check` が通る
- 進捗が `ai_context/phase` に記録されている

---

## リスクと注意点

### 1. playback は副作用が多い
`playback` は state だけでなく timer, interval, AudioContext, HTMLAudioElement, SoundFont player などの副作用を多く持つため、一気に完全移行すると壊しやすいです。

### 2. util をすぐ消しにいかない
`previewUtil.ts` には純粋ロジックと副作用が混在しているため、最初は `app/playback` の入口を作ってから、domain / infra へ段階的に切り出します。

### 3. timeline 境界を先に固定する
`PreviewPosLine.svelte` のような timeline 側の表示は、playback 全体を移しきる前に入口だけ整理しておくと安全です。

### 4. SoundFont と audio track を分けて考える
score track の SoundFont 再生と audio track の再生は性質が違うため、state / action / infra を分けて考える必要があります。

---

## 前提メモ
- `tempo / ts` は引き続き outline の時間軸要素として扱う
- terminal は Phase 4 で「責務を新構成で説明できる状態」まで整理済み
- melody は Phase 5 で「timeline 上の編集機能」として境界整理済み
- Phase 6 では playback の責務整理を優先し、timeline 全面再設計には入らない

---

## 進捗記録
Phase 6 の実作業を始めたら、以下に記録します。
- `ai_context/phase/phase6_progress.md`

---

## 次の着手
Phase 6 の最初の着手は以下です。

1. playback 関連ファイルの洗い出しを行う
2. その結果をもとに Phase 6 の移行マップを作る

この順で進めると、副作用の多い playback でも安全に責務境界を見極めながら進めやすいです。
