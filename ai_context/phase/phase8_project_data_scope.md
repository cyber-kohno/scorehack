# Phase 8 Project Data Scope

## 概要
このドキュメントは、現行システムにおいて `project data` とみなす範囲を明文化するためのメモである。

判定基準は、
- save/load 対象か
- 楽曲成果物として意味を持つか
- 再計算できるか
- セッション限定か

の 4 点。

---

## 現在の保存実装

### 保存
`tauri_app/src/app/project-io/project-io-service.ts` では、

- `JSON.stringify(lastStore.data)`

を `.sch` として保存している。

### 読み込み
`tauri_app/src/app/project-io/load-project.ts` では、

- `lastStore.data = JSON.parse(text)`
- `ref.trackArr` の再初期化
- `calculate()` による cache 再構築

を行っている。

---

## 現在の project data 範囲

### 含むもの
- `data.elements`
- `data.scoreTracks`
- `data.audioTracks`
- `data.arrange.tracks`

### 具体例
- 楽曲構成
- コード進行
- 転調
- tempo / ts 要素
- メロディノート列
- audio track の source / adjust / fileName
- arrange track の relation
- piano backing library / sounds pattern / preset

これらはすべて「楽曲設計成果物」として意味があり、保存対象とみなせる。

---

## 含まないもの

### 1. Cache
- `cache.baseCaches`
- `cache.chordCaches`
- `cache.elementCaches`
- `cache.outlineTailPos`

理由:
- `data` から再計算できるため

### 2. Ref
- `ref.*`
- `elementRefs`
- `trackArr`
- `timerKeys`

理由:
- DOM 実体に結びつくため

### 3. Preview session
- `preview.*`

理由:
- 再生中の一時状態だから

### 4. Input session
- `input`
- `holdCallbacks`

理由:
- キー押下状態だから

### 5. Terminal session
- `terminal`

理由:
- 対話ログ / helper 状態だから

### 6. File session
- `fileHandle`

理由:
- 保存先ハンドルであり、楽曲本体ではないから

### 7. Editor control
- `control`

理由:
- 現状では「どこを見ていたか」という編集文脈であり、成果物本体ではないから

### 8. Env
- `env.beatWidth`

理由:
- 表示設定であり、成果物本体ではないから

---

## グレーゾーン

### `control`
現状は project data に含めないのが妥当。

ただし将来、
- 最後に編集していた mode
- 最後に開いていた track
- 最後に見ていた cursor / focus

を復元したい場合は、project data ではなく `workspace/session metadata` のような別保存にする方が望ましい。

### `env`
`beatWidth` のような表示設定は project data に含めない方がよい。

必要なら user preference として別保存にする。

### `fileHandle`
保存先 path を覚えたい場合も、project data に含めるべきではない。

---

## 現時点の結論

### project data
- `lastStore.data`

### project data ではないもの
- `control`
- `terminal`
- `input`
- `holdCallbacks`
- `preview`
- `cache`
- `env`
- `ref`
- `fileHandle`

---

## 今後の方針メモ
- save/load は引き続き `data` 中心でよい
- もし session 復元をしたくなったら、project data と別の保存レイヤを定義する
- Phase 8 では「project data は何か」をまず固定し、後続で store 実体分割の判断材料にする
