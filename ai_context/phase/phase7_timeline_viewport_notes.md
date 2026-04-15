# Phase 7 Timeline Viewport Notes

## 概要
Phase 7 における `scroll / viewport` の責務を整理するためのメモ。

timeline は表示機能だが、scroll と viewport の計算は複数レイヤにまたがっているため、
今の時点でどこが何を担っているかを明確にしておく。

---

## 現在の責務分担

### `tauri_app/src/system/store/props/storeRef.ts`
役割:
- DOM ref の保持
- `getScrollLimitProps()` による viewport 情報の取得

主な内容:
- `ref.header`
- `ref.grid`
- `ref.pitch`
- `ref.outline`
- `ScrollLimitProps`
- `getScrollLimitProps(ref)`

位置づけ:
- viewport 情報の最小単位
- DOM 実体に最も近い層

---

### `tauri_app/src/state/ui-state/timeline-ui-store.ts`
役割:
- timeline から見た viewport 読み取り selector

主な内容:
- `getTimelineHeaderScrollLimitProps()`
- `getTimelineGridScrollLimitProps()`
- visible chord 抽出
- progress item 抽出

位置づけ:
- `StoreRef.getScrollLimitProps()` をそのまま UI に露出せず、timeline が必要な意味に変換する層

---

### `tauri_app/src/system/store/reducer/reducerRef.ts`
役割:
- scroll の更新 / 同期 / animation

主な内容:
- `adjustGridScrollXFromOutline()`
- `adjustGridScrollXFromNote()`
- `adjustGridScrollYFromCursor()`
- `adjustOutlineScroll()`
- `smoothScrollLeft()`
- `smoothScrollTop()`

位置づけ:
- viewport を読むのではなく、scroll を動かす副作用層
- timeline だけでなく outline / terminal / arrange にも関わるため、現段階では timeline に吸収しない方が安全

---

## 現時点の判断

### 1. viewport の読み取りは timeline 側でよい
`ScrollLimitProps` をどう使って可視要素を絞るかは timeline 表示責務なので、
`timeline-ui-store.ts` 側に寄せるのが自然。

### 2. scroll の更新はまだ reducerRef に残す
scroll animation や複数 ref の同期は副作用が強く、timeline 専用でもないため、
Phase 7 では `reducerRef.ts` に残す方が安全。

### 3. timeline から見ると「読む」と「動かす」を分けて考える
- 読む: `StoreRef` -> `timeline-ui-store`
- 動かす: `reducerRef`

この分け方で今後も整理を進めると、責務が見えやすい。

---

## 今後の候補
- timeline 側から必要な viewport selector をさらに `timeline-ui-store.ts` に追加する
- `reducerRef.ts` のうち timeline 専用のものだけ、将来的に `app/timeline` 側へ薄く寄せる
- ただし Phase 7 では、scroll 挙動の変更までは行わない

---

## 判断メモ
Phase 7 における `scroll / viewport` 整理は、
実装の置き換えよりも責務の見える化を優先する。

そのため現時点では、
- viewport 読み取りは timeline selector 側
- scroll 更新は reducerRef 側

という境界で固定しておくのが妥当である。
