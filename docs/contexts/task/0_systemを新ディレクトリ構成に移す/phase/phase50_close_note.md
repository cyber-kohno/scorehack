# Phase 50 完了メモ

## 完了内容
- `input-store.ts` を dedicated session store として追加した
- `keyboard-session.ts` の read / write を dedicated input store に切り替えた
- `keyboard-router.ts` の hold 判定を dedicated input store ベースに変更した
- `outline-ui-store.ts` と `Note.svelte` の hold 読み取りを dedicated input store に変更した
- root store から `input` と `holdCallbacks` を削除した

## 到達点
root store に残る主要 slice は以下になった。
- `control`
- `data`
- `cache`

これで session 系の小さな slice はかなり dedicated store 側へ寄せ切れた。

## 次の候補
- `control` を次の主要対象として整理する
- `data` と `cache` の優先順を再評価する
