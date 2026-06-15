# export wav 実装メモ

作成日: 2026-06-15

## 目的

tauri_app のターミナルコマンド `export wav` で、譜面データをもとに WAV 音声ファイルを書き出せるようにする。

主な想定ワークフローは、scorehack 上で作成した伴奏やハーモニーに、NEUTRINO / Synthesizer V などで生成したボーカル音声を合わせ、アンサンブル全体を WAV として出力すること。出力した WAV は Suno AI などの参考音源、コンテキスト音源として利用する想定。

MP3 出力は当面不要。WAV から MP3 への変換は外部ツールで対応できるため、アプリ側の FIX 仕様は `export wav` のみでよい。

## 基本方針

既存プレビュー再生は極力触らない。

プレビュー再生は `AudioContext` と `setTimeout` を使ったリアルタイム再生で動いている。一方、WAV 書き出しでは実時間待ちを避けたいので、`OfflineAudioContext` を使って非リアルタイムレンダリングする。

処理の流れは以下。

1. 譜面データから再生イベントを作る
2. `OfflineAudioContext` を作る
3. SoundFont 音源を offline context に接続する
4. 全ノートを `when` 秒指定でスケジューリングする
5. `context.startRendering()` で `AudioBuffer` を生成する
6. `AudioBuffer` を 16bit PCM WAV の `Uint8Array` に変換する
7. Tauri FS で保存する

## 現在の実装場所

WAV 生成本体:

`tauri_app/src/system/service/export/audio/create-score-wav.ts`

ターミナルコマンド:

`tauri_app/src/system/service/terminal/command/catalog/export-catalog.ts`

バイナリ保存ラッパー:

`tauri_app/src/system/infra/tauri/fs.ts`

## 現在のコマンド仕様

ターミナルで以下を実行する。

```txt
export wav
```

保存ダイアログが開き、`.wav` ファイルを書き出す。拡張子が付いていなければ `.wav` を付ける。

`export` の候補は現在 `musicxml` と `wav`。

## 現在対応済みの範囲

`export wav` は以下を WAV に含める。

- builtin 音源が設定されたメロディトラック
- builtin 音源が設定されたハーモニー/アレンジトラック
- ピアノアレンジ
- ギターアレンジ
- mute の反映
- track volume の反映
- テンポ、拍子、スイングの反映
- ピアノバッキングの velocity の反映
- ピアノアレンジの over-length エラーがあるコードブロックは、既存プレビュー同様にスキップ

末尾には SoundFont の release が切れないように 0.5 秒だけ余白を足している。

```ts
const durationSec = lastNoteSec + 0.5;
```

## 動作確認済みのこと

最初に固定音 C4 の実験を行い、`OfflineAudioContext` + `soundfont-player` + WAV エンコードで実際に音が鳴ることを確認済み。

その後、builtin メロディトラックの書き出しを実装し、プレビュー通りに鳴ることを確認済み。

さらに builtin ハーモニー/アレンジトラックを混ぜる対応を追加し、メロディ + ハーモニーがプレビュー通りに鳴ることを確認済み。

`soundfont-player` の `soundfont: "FluidR3_GM"` 指定を入れるとプレビューと音色が少し変わったため削除した。現在は既存プレビューと同じく SoundFont 側のデフォルトに寄せている。

`npm run check` は通過済み。既存 warning は別件で残っている。

## 現在未対応の範囲

以下はまだ未対応。

- user SoundFont (`ref.source === "soundfont"`) の WAV 書き出し
- オーディオトラックの WAV への mix
- 書き出し範囲指定
- 音割れ対策、ノーマライズ、リミッター
- 長時間曲でのパフォーマンス検証
- 書き出し中の進捗表示
- エラー理由の詳細表示

## 次に進めたいこと

次の大きな目標は、オーディオトラックを WAV に mix すること。

オーディオトラックは NEUTRINO / Synthesizer V などで生成したボーカル音声を想定している。アプリ上では既に音声ファイルを読み込み、`track.adjust` でタイミング調整してプレビュー再生している。

WAV 書き出し側では、以下の実装が必要。

1. `data.audioTracks` を走査する
2. mute されているトラックを除外する
3. `pathRef` を `FilePathRef.resolvePath(pathRef, settings.envs.HOME_DIR)` で実パスにする
4. `readBinaryFile` で音声ファイルを読む
5. `OfflineAudioContext.decodeAudioData()` で `AudioBuffer` にする
6. `AudioBufferSourceNode` を作る
7. `track.volume` を GainNode で反映する
8. `track.adjust` を反映して配置する
9. melody / arrange と同じ `OfflineAudioContext` に接続して mix する

注意点として、`track.adjust` が負方向または正方向にずれる場合、開始時刻が 0 秒より前になる可能性がある。その場合は `AudioBufferSourceNode.start(when, offset)` の offset を使って冒頭を切り出す必要がある。

既存プレビュー側では `startPlaybackTimeline.ts` のオーディオ再生部分が参考になる。ただしプレビューは `HTMLAudioElement` と `currentTime` / `setTimeout` で実時間再生しているため、WAV 書き出しでは `AudioBufferSourceNode` ベースに置き換える必要がある。

## 実装上の注意

既存プレビュー再生は触らずに進める方針を維持する。

`create-score-wav.ts` は最初は独立実装として育てる。将来的に安全だと判断できた部分だけ、プレビュー側とイベント生成ロジックを共通化する。

現在は `convertNoteToPlayer` を再利用している。これはテンポ、拍子、スイングを反映したノート開始時刻と持続時間を得るため。

WAV エンコードは `create-score-wav.ts` 内の `encodeWav(buffer)` で自前実装している。形式は 16bit PCM stereo。

`soundfont-player` は `SoundFont.instrument(context as unknown as AudioContext, instrumentName, ...)` のように `OfflineAudioContext` を渡している。型上は `AudioContext` 要求なので cast しているが、実動作は確認済み。

## 現在の制限

builtin 音源だけを対象にしている。user SoundFont は `spessasynth_lib` / `WorkletSynthesizer` を使っており、現行実装は通常の `AudioContext` と `setTimeout` 前提なので、そのまま `OfflineAudioContext` に載せられるかは未検証。

MP3 対応は不要。WAV 固定で進める。

