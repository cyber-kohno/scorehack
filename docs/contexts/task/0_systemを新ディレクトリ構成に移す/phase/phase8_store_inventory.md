# Phase 8 Store Inventory

## 概要
Phase 8 では `store / project-data 境界` を主要対象として扱う。

現行の store は `StoreProps` に多くの責務を抱えているが、
それぞれのフィールドは性質がかなり異なる。

このドキュメントでは、まず現行 store を構成している主要ファイルと役割を棚卸しする。

---

## 中心となるファイル

### 1. `tauri_app/src/system/store/store.ts`
現行 store 全体の定義。

主な責務:
- `StoreProps` の定義
- `writable<StoreProps>` の生成
- `createStoreUtil(lastStore)` による commit 導線の提供

現在の `StoreProps`:
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

現状の特徴:
- 永続対象と非永続対象が混在している
- UI state と session state と ref と cache が同じ箱に入っている
- ただし Phase 1〜7 で selector / updater の入口はかなり分かれ始めている

---

## Props 層

### 2. `tauri_app/src/system/store/props/storeData.ts`
役割:
- project data 本体の型

主な内容:
- `elements`
- `scoreTracks`
- `audioTracks`
- `arrange`

現状の特徴:
- save/load されるのは実質この `data` 全体
- 永続化の中心

### 3. `tauri_app/src/system/store/props/storeControl.ts`
役割:
- editor control state

主な内容:
- `mode`
- `outline`
- `melody`

現状の特徴:
- 編集中の focus / mode / arrange open 状態などを含む
- 永続対象ではなく session / editor ui に近い

### 4. `tauri_app/src/system/store/props/storeInput.ts`
役割:
- hold key 状態

主な内容:
- `holdE / holdD / holdF / holdC / holdX / holdG / holdShift / holdCtrl`
- callback 型

現状の特徴:
- 完全に session input state
- 非永続対象

### 5. `tauri_app/src/system/store/props/storePreview.ts`
役割:
- preview / playback session state と SoundFont catalog

主な内容:
- `timerKeys / intervalKeys`
- `lastTime / progressTime / linePos`
- `audios`
- `sfItems`
- `InstrumentNames`
- `validateSFName()`

現状の特徴:
- preview session state とライブラリメタデータが混在
- 非永続対象
- Phase 6 で `playback-ui-store` / `playback-session` / `domain/playback` / `infra/audio` に寄り始めている

### 6. `tauri_app/src/system/store/props/storeCache.ts`
役割:
- project data から再計算される cache

主な内容:
- `baseCaches`
- `chordCaches`
- `elementCaches`
- `outlineTailPos`

現状の特徴:
- 明確に cache 層
- 原則 save/load 対象ではない
- `reducerCache.calculate()` で再構築される

### 7. `tauri_app/src/system/store/props/storeRef.ts`
役割:
- DOM ref と scroll 補助情報

主な内容:
- `grid / header / pitch / outline / terminal / cursor / helper`
- arrange ref 群
- `elementRefs / trackArr / timerKeys`
- `ScrollLimitProps`

現状の特徴:
- 明確に ref 層
- 非永続対象
- UI 実体に最も近い

### 8. `tauri_app/src/system/store/props/storeTerminal.ts`
役割:
- terminal UI state

主な内容:
- `outputs`
- `command`
- `target`
- `focus`
- `wait`
- `availableFuncs`
- `helper`

現状の特徴:
- shell / terminal ui state
- 非永続対象

---

## Data 配下の詳細

### 9. `tauri_app/src/system/store/props/storeOutline.ts`
役割:
- outline control / outline domain の互換窓口

現状の特徴:
- control 側の `focus / focusLock / trackIndex / arrange`
- domain 側の outline 型再公開
- `elements` 自体は `storeData.ts` の中にいる

### 10. `tauri_app/src/system/store/props/storeMelody.ts`
役割:
- melody control / melody domain の互換窓口

現状の特徴:
- control 側の `cursor / focus / focusLock / trackIndex / clipboard ...`
- domain 側の note / track 型再公開
- `scoreTracks / audioTracks` 自体は `storeData.ts` の中にいる

### 11. `tauri_app/src/system/store/props/arrange/storeArrange.ts`
役割:
- arrange data / editor target 型

現状の特徴:
- `data.arrange.tracks` は project data
- `EditorProps` は control 側や session UI 側で使われる
- data と editor state が近接しているため注意が必要

### 12. `tauri_app/src/system/store/props/arrange/piano/storePianoEditor.ts`
役割:
- piano arrange editor / library / preset 型

現状の特徴:
- `Lib` は project data の一部になりうる
- `Props` は editor session state
- 永続対象と非永続対象が同居しやすい領域

### 13. `tauri_app/src/system/store/props/arrange/piano/storePianoBacking.ts`
役割:
- piano backing data / editor data

現状の特徴:
- `DataProps` は project data の一部になりうる
- `EditorProps` は session editor state

---

## すでに追加された state 入口

### 14. `tauri_app/src/state/ui-state/*`
役割:
- 読み取り selector の入口

現状の対象:
- shell
- outline
- terminal
- melody
- playback
- timeline

特徴:
- 物理 store 分割ではなく、意味境界を先に作る役割

### 15. `tauri_app/src/state/session-state/*`
役割:
- session updater / handle state の入口

現状の対象:
- keyboard
- terminal
- playback
- project file handle

特徴:
- session 限定の更新導線として機能し始めている

---

## Project IO との関係

### 16. `tauri_app/src/app/project-io/project-io-service.ts`
役割:
- save/load/mp3 import のユースケース入口

### 17. `tauri_app/src/app/project-io/save-project.ts`
役割:
- `JSON.stringify(lastStore.data)` を `.sch` として保存

### 18. `tauri_app/src/app/project-io/load-project.ts`
役割:
- `lastStore.data = JSON.parse(text)` を実行
- `ref.trackArr` を再初期化
- `calculate()` で cache を再構築

### 19. `tauri_app/src/state/session-state/project-file-store.ts`
役割:
- 現在の保存先ファイル handle を保持

現状の特徴:
- `project data` と `fileHandle` は明確に別層
- save/load 対象は `data` のみ
- `cache`, `ref`, `preview`, `input`, `terminal`, `fileHandle` は再構築 / 再初期化対象

---

## 初期判断

### 明確に project data 側
- `data`
  - `elements`
  - `scoreTracks`
  - `audioTracks`
  - `arrange.tracks`
  - piano library など track に属する永続情報

### 明確に非 project data 側
- `input`
- `holdCallbacks`
- `preview`
- `cache`
- `ref`
- `fileHandle`
- `terminal`

### 解釈が必要な境界
- `control`
  - mode / focus / cursor は通常 non-persistent と考えるのが自然
  - ただし「最後にどこを見ていたか」を保存したいかは仕様判断余地がある
- `arrange editor props`
  - editor を開いている状態は session
  - relation / library / pattern は project data

---

## 判断メモ
Phase 8 の最初の重要点は、
`store 全体` を見ているつもりで、実際には
- project data
- editor control
- input session
- playback session
- terminal ui
- cache
- refs

が同居していることを明文化すること。

この棚卸しができると、次に state boundary map をかなり具体的に書ける。
