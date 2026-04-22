# melody-store の評価

## 結論
`melody-store.ts` は現時点では削除しない。
ただし、type-only import まで façade 経由にする必要は薄いので、直接 `melody-types.ts` に寄せられるものから小さく進める。

## 残す理由
- `StoreMelody.calcBeat` など、値としての集約窓口はまだ広く使われている
- caller 数が多く、一気に分解すると影響が大きい
- `melody-types.ts` と `melody-control.ts` を束ねる façade としては、まだ一定の読みやすさがある

## 先に寄せてよいもの
- `StoreMelody.AudioTrack`
- `StoreMelody.ScoreTrack`
- `StoreMelody.Note`
- `StoreMelody.Norm`

ただし、これは type-only import の場合に限る。
値として
- `calcBeat`
- `calcBeatSide`
- `normalize`
- `validatePitch`
などを使う caller は、当面 `melody-store.ts` を経由してよい。

## 今回の小さい適用例
- `app/project-io/import-audio.ts`
- `app/project-io/project-io-service.ts`
- `app/melody/melody-range-focus-actions.ts`

上の 3 本では、type-only import を `melody-types.ts` へ直接寄せた。

## 当面の方針
1. type-only import は、低リスクなものから `melody-types.ts` へ寄せる
2. value 集約としての `melody-store.ts` は、当面残す
3. caller が十分減った段階で、`melody-store.ts` の再評価を行う

## 2026-04-23 追加の小さい適用例
- `app/melody/melody-audition.ts`
- `app/melody/melody-focus-actions.ts`
- `ui/melody/MelodyUnitDisplay.svelte`
- `ui/melody/score/Factors.svelte`

上の 4 本でも、type-only 部分は `melody-types.ts` に直接寄せた。
値として `StoreMelody.getUnitText()` や `StoreMelody.normalize()` を使う箇所は、引き続き façade 経由のままにしている。
