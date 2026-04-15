# Phase 10 Data Split Checklist

## 目的
このドキュメントは、`data` の物理分割へ進む前に
何が揃っている必要があるかを確認するためのチェックリストです。

ここでいう物理分割とは、
`store.ts` の中にある `data` を
意味境界だけでなく実体としても切り出すことを指します。

---

## チェック項目

### 1. `project data` の正規入口が揃っている
- [x] `src/state/project-data/*` が存在する
- [x] `project-data-store.ts` がある
- [x] `outline-project-data.ts` がある
- [x] `melody-project-data.ts` がある
- [x] `audio-project-data.ts` がある
- [x] `arrange-project-data.ts` がある
- [x] `createProjectDataActions(lastStore)` がある

判断:
- Phase 10 時点で満たしている

---

### 2. `project data` の責務が説明できる
- [x] `project data = data` が固定されている
- [x] save / load の対象が `data` であると整理済み
- [x] `project data` と `session / cache / ref` の違いが説明できる

判断:
- Phase 10 時点で満たしている

---

### 3. 主要 feature の入口整理が進んでいる
- [x] outline が一部 `project data` 入口を利用している
- [x] melody が一部 `project data` 入口を利用している
- [x] terminal builder が一部 `project data` 入口を利用している
- [ ] playback が `project data` 入口へ十分に寄っている
- [ ] legacy component の直接 `$store.data` 参照が十分減っている

判断:
- まだ未完了

---

### 4. reducer / cache の影響範囲が見えている
- [x] `reducerCache.ts` が重要残件とわかっている
- [x] `arrangeUtil.ts` が注意箇所とわかっている
- [x] `reducerTerminal.ts` / `builderCommon.ts` が残件とわかっている
- [ ] それぞれをどう扱うかの方針が固まっている

判断:
- まだ未完了

---

### 5. playback の project data 入口が見えている
- [x] `previewUtil.ts` が残件とわかっている
- [ ] `elements / scoreTracks / audioTracks / arrange` の読み取り入口を整理済み

判断:
- まだ未完了

---

### 6. arrange の境界が危険箇所として認識されている
- [x] `arrange` は persistent / editor 補助の境界に注意が必要と整理済み
- [ ] 分割前にどこまでを `data` として固定するか最終確認できている

判断:
- まだ未完了

---

## 結論
Phase 10 時点では、
`data` の物理分割へ進むための前提はかなり揃っているが、
まだ即時着手に十分とは言い切れない。

不足している主な条件:
1. playback の project data 入口整理
2. legacy component の直参照削減
3. reducer / cache 残件への扱い方針
4. arrange 境界の最終確認

したがって、
次フェーズで上記を補ってから分割判断するのが安全。
