# token 必要性整理

## 基本方針
- `RootStoreToken` は「最新 state 本体」ではなく、feature 横断の読み取り token として扱う
- そのため、`RootStoreToken` を使うべきなのは
  - selector / accessor
  - cache / project-data の合成
  - shell / playback / keyboard の orchestration
  に寄る

## 逆に token を持たない方がよいもの

### 1. 純粋 mutation
- すでに対象 track や note が渡されている
- dedicated store を直接読める
- 他 feature の state 合成をしない

例:
- `appendMelodyNoteSorted(track, note)`

### 2. 単一 feature 内の局所更新
- melody track index 更新
- focus lock 更新
- clipboard 更新

これらは dedicated session-state を直接更新できるため、token を通す意味が薄い。

### 3. token を受けても `void rootStoreToken` になる helper
- これは移行中の名残であり、原則として縮約候補

## 形の決め方

### 読み取り
- token 必須
- `selectors` / `accessors`

### 純粋 mutation
- token 不要
- named export の関数群
- `*-mutations.ts`

### 単一 feature 内の更新 API
- token 不要なら factory にしない
- 普通の関数 export で十分

### orchestration
- token や `CommitContext` を持ってよい
- `input`, `playback`, `shell`, `actions` 側で束ねる

## 今の melody への当てはめ

### token 必須
- `melody-selectors.ts`
- `melody-actions.ts`
  - outline sync
  - timeline scroll
  - cursor sync
  などを束ねる範囲

### token 不要へ寄せる候補
- `melody-mutations.ts`
- `melody-track-actions.ts`

## 実施方針
1. token 不要な更新 API から先に外す
2. その後、`actions` に残るものを
   - orchestration として残す
   - ただの pass-through なら薄くする
3. 最後に `reducer` / `actions` / `helper` の命名を決める
