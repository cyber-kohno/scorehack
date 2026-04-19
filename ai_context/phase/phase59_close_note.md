# Phase 59 クローズノート

## 完了したこと
- `melody cursor` の read / write 分布を整理した
- `app/melody/melody-cursor-state.ts` を追加し、cursor の access surface を作った
- `melody-ui-store.ts`, `reducerMelody.ts`, `Cursor.svelte`, `ActiveTrack.svelte` を helper 経由へ寄せた
- check / build / cargo check を通した

## 今の到達点
- `melody control` で root store に残る主要状態は `cursor` のみ
- ただし caller は少しずつ helper 経由に寄ってきている

## 次の自然な対象
- `inputMelody.ts` と `previewUtil.ts` の cursor 参照を helper 経由へ寄せる
- そのうえで dedicated store 化するか、root store のまま helper 境界だけで止めるか判断する
