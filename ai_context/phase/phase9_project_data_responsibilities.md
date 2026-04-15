# Phase 9 Project Data Responsibilities

## 目的
このドキュメントは、Phase 9 時点での `project data` の責務と、
どこから読む / 更新するかの考え方をまとめるためのメモです。

---

## project data とは何か
Phase 9 時点では、`project data` は `store.data` を指す。

これには次が含まれる。
- outline elements
- scoreTracks
- audioTracks
- arrange data

つまり、曲そのものの設計内容と、
保存対象になる本体データがここに入る。

---

## project data が持たないもの
次は `project data` に含めない。
- terminal の開閉や入力状態
- preview の再生中状態
- keyboard hold
- DOM ref
- cache
- fileHandle
- 一時的な mode / focus 補助情報

---

## 読み取りの責務

### 低レベル
- `src/state/project-data/*`
- project data の生読み取りを担当する

例:
- `getOutlineElements`
- `getScoreTracks`
- `getAudioTracks`

### 上位
- `src/state/ui-state/*`
- UI 表示向けの整形を担当する

例:
- 現在表示すべき track
- 現在要素に基づく表示条件

---

## 更新の責務

### 低レベル
- `src/state/project-data/*`
- project data の基本更新単位を担当する

例:
- `setProjectData`
- `setOutlineElements`
- `setScoreTracks`
- `setAudioTracks`

### 上位
- `src/app/project-data/project-data-actions.ts`
- `createProjectDataActions(lastStore)` の形で束ねる

この層の役割:
- 毎回 store を渡さなくてよい形を作る
- feature から見た「使い心地」を維持する
- 低レベル updater をまとめて公開する

---

## custom hook 的アプローチとの関係
Phase 9 の方針は、
custom hook 的アプローチをやめることではない。

むしろ、
- 低レベルには `selector / updater`
- 上位には `createXxxActions()`
という二段構成にすることで、
元の利点を残しながら責務を分けることを目指している。

つまり、
- グローバル関数を雑に増やさない
- 毎回 store を渡さなくてよい
- ただし責務は混ぜすぎない

という形に寄せている。

---

## Phase 9 時点の実装状態
- `src/state/project-data/project-data-store.ts`
- `src/state/project-data/outline-project-data.ts`
- `src/state/project-data/melody-project-data.ts`
- `src/app/project-data/project-data-actions.ts`

が初期状態として存在する。

また、
- `load-project.ts`
- `reducerMelody.ts`
- `outline-ui-store.ts`
- `melody-ui-store.ts`

では、この新しい入口の利用が始まっている。

---

## 今後の見通し
次に進めるなら、以下が自然。

1. `outline` の更新入口も `createProjectDataActions()` 経由へ寄せる
2. `audio` / `arrange` の project data selector を追加する
3. `data` の物理分割が可能かを次フェーズで判断する
