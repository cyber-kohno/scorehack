# Phase 8 State Boundary Map

## 概要
このドキュメントは、現行 `StoreProps` を意味境界ごとに整理したマップである。

Phase 8 では store 実体を分割するのではなく、
まず「各フィールドが何者か」を判断できる状態にすることを目的とする。

---

## 現行 `StoreProps`
- `control`
- `terminal`
- `data`
- `input`
- `holdCallbacks`
- `preview`
- `cache`
- `env`
- `ref`
- `fileHandle`

---

## 境界分類

### 1. Project Data
意味:
- 楽曲成果物として保存対象になる本体データ
- save/load の中心

該当:
- `data`

具体:
- `data.elements`
- `data.scoreTracks`
- `data.audioTracks`
- `data.arrange.tracks`
- arrange track に属する library / relation / pattern 情報

保存:
- する

復元方法:
- file load 時に JSON から直接復元

---

### 2. Editor Control State
意味:
- 編集中の mode / focus / cursor / open 状態など
- project data ではないが、機能操作の中心になる state

該当:
- `control`

具体:
- `control.mode`
- `control.outline.focus`
- `control.outline.focusLock`
- `control.outline.trackIndex`
- `control.outline.arrange`
- `control.melody.cursor`
- `control.melody.focus`
- `control.melody.focusLock`
- `control.melody.trackIndex`
- `control.melody.clipboard`

保存:
- 原則しない

理由:
- 楽曲本体ではなく、編集中の位置や UI 文脈だから

補足:
- 将来的に「最後の編集位置」を保存したいなら別途仕様化する余地はある

---

### 3. Shell / Terminal UI State
意味:
- terminal 表示や helper など、shell の UI と対話状態

該当:
- `terminal`

具体:
- outputs
- command
- target
- focus
- wait
- availableFuncs
- helper

保存:
- しない

理由:
- セッション限定の対話状態だから

---

### 4. Session Input State
意味:
- 現在押しているキーや hold callback など、瞬間的入力状態

該当:
- `input`
- `holdCallbacks`

保存:
- しない

理由:
- 完全にセッション限定だから

---

### 5. Playback Session State
意味:
- preview 中の進行状態と再生リソース

該当:
- `preview`

具体:
- timerKeys
- intervalKeys
- lastTime
- progressTime
- linePos
- audios
- sfItems

保存:
- しない

理由:
- 再生中の一時状態とライブラリロード状態だから

補足:
- `InstrumentNames` のような catalog は session state というより infra / metadata に近い

---

### 6. Derived Cache
意味:
- project data から再計算される導出情報

該当:
- `cache`

具体:
- baseCaches
- chordCaches
- elementCaches
- outlineTailPos

保存:
- しない

理由:
- `calculate()` で再構築できるため

---

### 7. Environment / Display Config
意味:
- 現在の表示スケールや描画補助値

該当:
- `env`

具体:
- `env.beatWidth`

保存:
- 現状しない

理由:
- 楽曲本体ではなく表示設定だから

補足:
- 将来的に user preference として別保存する余地はある

---

### 8. DOM Refs
意味:
- DOM 実体や scroll 同期対象への参照

該当:
- `ref`

具体:
- header / grid / pitch / outline / terminal ...
- elementRefs
- trackArr
- timerKeys
- arrange refs

保存:
- しない

理由:
- DOM 実体は再生成されるため

---

### 9. File Session State
意味:
- 現在どこへ保存するかというセッション情報

該当:
- `fileHandle`

具体:
- `fileHandle.score`

保存:
- 現状しない

理由:
- 楽曲内容ではなくセッション中の保存先ハンドルだから

補足:
- 「直前保存先を覚える」仕様を入れる場合でも、project data とは分ける方がよい

---

## 境界まとめ

### 保存対象
- `data`

### 非保存対象
- `control`
- `terminal`
- `input`
- `holdCallbacks`
- `preview`
- `cache`
- `env`
- `ref`
- `fileHandle`

### 再計算対象
- `cache`

### 再初期化対象
- `preview`
- `input`
- `holdCallbacks`
- `terminal`
- `ref`
- `fileHandle`

### セッション復元がありえるが現状未採用
- `control`
- `env`

---

## 現時点の判断

### 最も安全な次の実体分割候補
1. `data`
2. `cache`
3. `ref`

理由:
- `data` は project data として明確だから
- `cache` は derived として切り分けやすいから
- `ref` は DOM 参照として意味が独立しているから

### まだ慎重に扱うべきもの
- `control`
- `preview`
- `terminal`

理由:
- 機能横断の編集文脈や session 文脈を強く持つため、先に意味整理が必要だから

---

## 判断メモ
`store-boundaries.ts` の今の分類は方向性として正しいが、
`control` を `shell-ui` と `editor-ui` に重複させているため、
今後は
- editor control
- shell ui
- session
- cache
- refs
- project data

のように、もう少し意味がぶれない表現へ寄せる余地がある。
