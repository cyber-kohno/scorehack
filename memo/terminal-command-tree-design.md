# Terminal Command Tree Design

## 背景

ターミナルの補完ヘルパーに、現在入力中の引数名を表示する対応を入れた。
これにより、補完候補が「何の候補なのか」は分かりやすくなった。

一方で、現状のコマンド定義は `args: Arg[]` のフラットな配列であり、サブコマンドや分岐を正確に表現できない。
そのため、`track use track0` のようなコマンドでは、実際には `trackName` が必須であるにもかかわらず、定義上は `trackName?: string` のような表示になってしまう。

このメモは、ターミナル入力支援を恒久的に改善するための要件と設計イメージを残すもの。

## 現状

現在のコマンド定義はおおむね以下の形。

```ts
type Arg = {
  name: string;
  getCandidate?: (args: string[]) => string[];
};

type Command = {
  funcKey: string;
  usage: string;
  args: Arg[];
  callback: (args: string[]) => void;
};
```

`Arg.name` は実行時には使われておらず、表示用の文字列としてのみ使われている。
必須チェックや数値チェックは、各コマンドの `callback` 内で `validateRequired()` や `validateNumber()` を呼んで個別に行っている。

## 課題

### 補完候補がない引数でガイドが出ない

例: `volume `

`volume` は数値を入力する必要があるが、候補リストがないため補完ヘルパーが表示されない。
その結果、`volume` で完結しているのか、次に値を入れる必要があるのかが分かりにくい。

### フラットな args ではサブコマンドを表現できない

例: `track`

```text
track list
track create <trackName?>
track use <trackName>
track delete <trackName>
track copy <sourceTrackName> <newTrackName?>
```

`track` は第一引数によって後続の引数構造が変わる。
しかし現状は `args[0]`, `args[1]`, `args[2]` の固定配列しかないため、`trackName` が必須か任意かを機械的に判断できない。

### 第一引数をサブコマンドと決め打てない

コマンドによって第一引数の意味は異なる。

```text
volume 8          // 第一引数は値
tempo 120         // 第一引数は値
method guitar     // 第一引数は値
track use track0  // 第一引数はサブコマンド
save              // 引数なし、または任意引数
shortcut create key command... // 可変長
```

したがって、全コマンドに対して「第一引数 = action」と決める設計は避ける。

## 目指す体験

ターミナル入力中に、補完候補の有無に関係なく、現在のコマンドシグネチャと入力位置が分かる。

例:

```text
volume(value)
track(use, trackName)
track(copy, sourceTrackName, newTrackName?)
shortcut(create, shortcut, command...)
```

現在入力中の引数を強調表示できるとよい。
補完候補が存在する場合は、シグネチャ表示に加えて候補リストを表示する。
候補が存在しない数値や自由入力でも、シグネチャだけは表示する。

## 設計イメージ

フラットな `args` ではなく、コマンドごとに入力トークンを消費するツリーを持つ。

```ts
type CommandNode =
  | {
      kind: "literal";
      value: string;
      label?: string;
      children?: CommandNode[];
    }
  | {
      kind: "argument";
      name: string;
      optional?: boolean;
      repeat?: boolean;
      candidates?: CandidateSource;
      children?: CommandNode[];
    };
```

`track` の例:

```text
track
├─ list
├─ create
│  └─ trackName?
├─ use
│  └─ trackName
├─ delete
│  └─ trackName
└─ copy
   ├─ sourceTrackName
   └─ newTrackName?
```

`volume` の例:

```text
volume
└─ value
```

`shortcut` の例:

```text
shortcut
├─ list
├─ create
│  ├─ shortcut
│  └─ command...
├─ update
│  ├─ shortcut
│  └─ command...
└─ delete
   └─ shortcut
```

## 共通処理で算出したいもの

ツリー定義から、コマンド個別実装なしで以下を算出できるようにする。

- 現在入力中のノード
- 現在入力中の引数名
- 候補リスト
- 入力済みか未入力か
- 必須か任意か
- 入力が完了しているか
- まだ後続引数が必要か
- 入力途中では総引数数が未確定であること
- 可変長引数かどうか

## 移行方針

すぐに全コマンドを置き換えるとコストが大きいため、段階移行が望ましい。

1. 既存の `args` は単純コマンド用の互換レイヤーとして残す。
2. 新しく `tree` または `signatureTree` のような定義を追加する。
3. `tree` があるコマンドはツリー解析でガイドと候補を出す。
4. `tree` がないコマンドは既存の `args` から簡易シグネチャを生成する。
5. `track`, `shortcut`, `inst`, `audio`, `preset` など、分岐が多いコマンドから順に移行する。

## 注意点

- `Arg.name` に `: string` や `?` を埋め込む方式は、表示と仕様が混ざるため避ける。
- 型情報はターミナル利用者には不要。表示上は `trackName` や `value` のような意味名を優先する。
- 必須/任意は文字列ではなく構造で持つ。
- 候補リストとシグネチャ表示は別概念として扱う。
- 候補がない場合でも、未完了の引数があればガイドは表示する。

## 当面の扱い

現時点では恒久対応は行わない。
ターミナル補完ヘルパーを本格的な入力ガイドへ拡張するタイミングで、この設計をもとに再検討する。
