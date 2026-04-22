# 作曲設計ソフト: 最初のドメイン型一覧

## 1. 方針
最初の型は、MVPに必要なものだけに絞る。

重要なのは、将来の拡張を妨げないこと。
そのため、最初から以下を守る。

- IDを持つ
- UI都合の情報を含めない
- Svelte型やHTMLElementを含めない
- 保存形式に近すぎず、アプリ内部モデルとして定義する

## 2. 最初に必要なトップレベル型
```ts
type Song
type SongMetadata
type OutlineElement
type MelodyTrack
type ArrangeTrack
type Tonality
type TimeSignature
```

## 3. 基本ID型
```ts
export type SongId = string;
export type ElementId = string;
export type MelodyTrackId = string;
export type ArrangeTrackId = string;
```

将来的には branded type にしてもよいが、最初は `string` で十分。

## 4. Song
```ts
export interface Song {
  id: SongId;
  schemaVersion: number;
  metadata: SongMetadata;
  outline: OutlineElement[];
  melodyTracks: MelodyTrack[];
  arrangeTracks: ArrangeTrack[];
}
```

## 5. SongMetadata
```ts
export interface SongMetadata {
  title: string;
  createdAt: string;
  updatedAt: string;
}
```

## 6. TimeSignature
```ts
export interface TimeSignature {
  numerator: number;
  denominator: number;
}
```

## 7. Tonality
```ts
export type ScaleMode = "major" | "minor";

export interface Tonality {
  tonic: number;
  mode: ScaleMode;
}
```

`tonic` は 0-11 の pitch class を表す。

## 8. OutlineElement共通
```ts
export interface OutlineElementBase {
  id: ElementId;
  kind: OutlineElementKind;
}

export type OutlineElementKind =
  | "init"
  | "section"
  | "chord"
  | "modulate"
  | "tempo"
  | "timesignature";
```

## 9. InitElement
```ts
export interface InitElement extends OutlineElementBase {
  kind: "init";
  initialTonality: Tonality;
  initialTempoBpm: number;
  initialTimeSignature: TimeSignature;
}
```

## 10. SectionElement
```ts
export interface SectionElement extends OutlineElementBase {
  kind: "section";
  name: string;
}
```

## 11. ChordElement
```ts
export interface ChordElement extends OutlineElementBase {
  kind: "chord";
  length: BeatLength;
  chord: DegreeChord | null;
}
```

## 12. BeatLength
```ts
export interface BeatLength {
  beats: number;
  pickupOffset16th: number;
  tailOffset16th: number;
}
```

現行の `beat/eat` より意味を明示した名前に寄せる。

## 13. DegreeChord
```ts
export interface DegreePitch {
  degreeIndex: number;
  accidental?: -1 | 1;
}

export type ChordSymbol =
  | ""
  | "m"
  | "sus4"
  | "sus2"
  | "dim"
  | "aug"
  | "m-5"
  | "7"
  | "m7"
  | "M7"
  | "mmaj7"
  | "7sus4"
  | "dim7"
  | "aug7"
  | "6"
  | "m6"
  | "add9"
  | "madd9"
  | "9"
  | "m9"
  | "M9"
  | "11"
  | "m11"
  | "13"
  | "m13";

export interface DegreeChord {
  root: DegreePitch;
  symbol: ChordSymbol;
  slash?: DegreePitch;
}
```

## 14. ModulateElement
```ts
export type ModulationType =
  | "dominant"
  | "parallel"
  | "relative"
  | "direct";

export interface ModulateElement extends OutlineElementBase {
  kind: "modulate";
  modulationType: ModulationType;
  value?: number;
}
```

`value` は dominant 回数や direct key shift などに使う。

## 15. TempoElement
```ts
export type TempoChangeType = "absolute" | "relative" | "rate";

export interface TempoElement extends OutlineElementBase {
  kind: "tempo";
  changeType: TempoChangeType;
  value: number;
}
```

## 16. TimeSignatureElement
```ts
export interface TimeSignatureElement extends OutlineElementBase {
  kind: "timesignature";
  timeSignature: TimeSignature;
}
```

## 17. OutlineElement union
```ts
export type OutlineElement =
  | InitElement
  | SectionElement
  | ChordElement
  | ModulateElement
  | TempoElement
  | TimeSignatureElement;
```

## 18. MelodyNote
```ts
export interface NoteValue {
  denominator: number;
  tuplet?: number;
}

export interface MelodyNote {
  id: string;
  pitch: number;
  startUnit: number;
  lengthUnit: number;
  noteValue: NoteValue;
}
```

最初は現行に近い単位系でよい。
後で `tick` 系へ寄せたくなっても置き換えやすいように独立型にしておく。

## 19. MelodyTrack
```ts
export interface MelodyTrack {
  id: MelodyTrackId;
  name: string;
  mute: boolean;
  volume: number;
  notes: MelodyNote[];
  soundFont?: string;
}
```

## 20. ArrangeTrack
```ts
export type ArrangeMethod = "piano" | "guitar";

export interface ArrangeTrack {
  id: ArrangeTrackId;
  name: string;
  method: ArrangeMethod;
  mute: boolean;
  volume: number;
  soundFont?: string;
}
```

MVPでは詳細 editor data をここにまだ入れなくてよい。

## 21. 最初の派生型
早い段階で必要になるので、完全な実装前でも枠を持っておく。

```ts
export interface ResolvedSongContext {
  activeTonality: Tonality;
  activeTempoBpm: number;
  activeTimeSignature: TimeSignature;
  activeSectionName: string | null;
}

export interface ChordSpan {
  elementId: ElementId;
  startBeat: number;
  lengthBeat: number;
}
```

## 22. 最初は入れない型
以下は後で追加でよい。

- PianoBackingPattern
- GuitarVoicingForm
- FinderPreset
- AudioTrack
- MusicXmlExportOptions
- UndoStackSnapshot

## 23. 最初の初期値生成関数
型だけでなく、初期生成も最初から用意すると実装が進めやすい。

```ts
createEmptySong(): Song
createInitialInitElement(): InitElement
createSectionElement(name: string): SectionElement
createEmptyChordElement(): ChordElement
createDefaultMelodyTrack(): MelodyTrack
createArrangeTrack(method: ArrangeMethod): ArrangeTrack
```

## 24. 最初の型設計で大事な点
- `tempo` と `timesignature` は outline event として持つ
- `init` は必須の先頭要素として扱う
- `chord` は「現在のキーに対する degree 表現」を基本にする
- `modulate` は「次の文脈を作るイベント」として扱う
- `ArrangeTrack` はMVPでは軽く、editor詳細は後続で足す

