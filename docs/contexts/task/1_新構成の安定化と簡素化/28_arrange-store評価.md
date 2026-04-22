# arrange-store 系の評価

## 対象
- `domain/arrange/arrange-store.ts`
- `domain/arrange/piano-editor-store.ts`
- `domain/arrange/piano-backing-store.ts`

## 結論
現時点では、この 3 本は当面残す。
ただし、外部ドメインに依存している type-only 部分は、可能な範囲で直接型参照へ寄せてよい。

## 残す理由
### 1. `arrange-store.ts`
- arrange 全体の型入口としてまだ広く使われている
- `Track`, `Target`, `Pattern`, `DataProps` がまとまっていて、caller 側の読みやすさがある
- 今すぐ分解すると影響面積が広い

### 2. `piano-editor-store.ts`
- editor props / lib / pattern 操作の集約窓口になっている
- 型だけでなく `createInitialProps()` や `getArrangePatternFromRelation()` など値の責務も持つ
- façade というより、まだ実装を持つ domain module に近い

### 3. `piano-backing-store.ts`
- backing editor 専用の型と utility がまとまっている
- `createInitialBackingProps()` や `getColWidthCriteriaBeatWidth()` を含むため、単なる型束ではない

## 先に寄せてよいもの
- 他ドメイン由来の type-only 依存
  - 例: `StoreMelody.Norm` → `MelodyNorm`
- 未使用 import の削除

## 今回の小さい整理
- `piano-backing-store.ts` で `StoreMelody.Norm` を `MelodyNorm` 直接参照へ変更
- `piano-editor-store.ts` の未使用 `StoreMelody` import を削除

## 当面の方針
1. `arrange-store` 系は value 集約 / 実装付き domain module として当面残す
2. type-only な外部依存だけを小さく直接参照へ寄せる
3. caller 数が十分減った段階で、必要なら `arrange-types.ts` のような分離を再評価する
