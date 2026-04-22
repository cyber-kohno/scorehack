# Outline tempo / ts 現状メモ

## 目的
このメモは、Phase 3 時点での `tempo` / `ts` 要素の実装状況を整理し、次の仕様判断をしやすくするためのものです。

---

## 現状
### 型定義
- `domain/outline/outline-types.ts` に `OutlineDataTempo`, `OutlineDataTS` がある
- `OutlineElementType` に `tempo`, `ts` が含まれている

### UI
- `tempo`
  - `system/component/outline/element/data/DataTempo.svelte` は存在する
  - ただし中身は未実装で、表示ロジックがない
- `ts`
  - 専用の表示コンポーネントはまだ存在しない
  - `Element.svelte` / `OutlineElement.svelte` の表示分岐にも `ts` はまだ入っていない

### cache / 計算
- `reducerCache.ts` では `tempo` は処理されている
  - `baseCache.scoreBase.tempo` を更新
  - `elementCache.tempo` を持つ
- `ts` は明示的な処理対象になっていない
  - 少なくとも outline element としての実処理は未着手に近い

### 入力 / コマンド
- `init` の tempo 変更コマンドは存在する
- `tempo` 要素自体を編集する導線はまだ薄い
- `ts` 要素の編集導線は現時点で見当たらない

---

## 解釈
現時点の `tempo / ts` は、
- ドメイン上は必要と認識されている
- 型の器はある
- ただし UI / 入力 / cache の実装粒度が揃っていない
状態です。

特に `tempo` は途中まで入っていて、`ts` は構想先行に近いです。

---

## 次に決めるべきこと
1. `tempo` を先に完成対象にするか
2. `ts` も同フェーズで扱うか
3. `tempo / ts` を独立 element として扱うのか
4. それとも base 変更イベントとして別レイヤに寄せるのか

---

## 今のおすすめ
- Phase 3 では `tempo / ts` の置き場だけ揃えて、完成は急がない
- 次段階で `tempo` を先に完成させる
- `ts` は仕様整理を先にしてから入る

理由:
- `tempo` は既存実装が一部あるので延長しやすい
- `ts` は UI / cache / timeline への影響が広く、仕様整理なしに進めると手戻りしやすい
