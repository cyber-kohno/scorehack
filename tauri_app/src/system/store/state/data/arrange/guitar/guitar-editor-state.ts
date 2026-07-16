import ArrangeState from "../arrange-state";
import type FinderState from "../finder-state";

namespace GuitarEditorState {
  export const MAX_FRET = 12;

  export type Control = "voicing" | "col" | "pattern";

  export type StringSelection = number | null;

  export type PickStringNumber = 1 | 2 | 3 | 4 | 5 | 6;

  export type Col = {
    div: number;
    dot?: number;
    tuplets?: number;
  };

  export type PatternEvent = {
    colIndex: number;
    fromString: PickStringNumber;
    toString: PickStringNumber;
    velocity: number;
    speed: number;
  };

  export type BackingData = {
    cols: Col[];
    items: string[];
  };

  export type BackingEditorProps = {
    cursorX: number;
    cursorY: number;
    cols: Col[];
    events: PatternEvent[];
  };

  export type Value = {
    control: Control;
    cursorString: number;
    cursorFret: number;
    frets: StringSelection[];
    backing: BackingEditorProps | null;
  };

  export interface VoicingPattern extends ArrangeState.Pattern {
    key: FinderState.Guitar.VoicingKey;
    frets: StringSelection[];
  }

  export interface BackingPattern extends ArrangeState.Pattern {
    backing: BackingData;
    category: FinderState.BackingCategory;
  }

  export type VoicingRegular = {
    voicingNo: number;
    sortNo: number;
  };

  export type BackingRegular = {
    backingNo: number;
    sortNo: number;
  };

  export type Bank = {
    voicingPatterns: VoicingPattern[];
    backingPatterns: BackingPattern[];
    voicingRegulars: VoicingRegular[];
    backingRegulars: BackingRegular[];
  };

  export interface Unit {
    frets: StringSelection[];
    backing?: BackingData | null;
  }

  export type StrokeVoicingValidationResult =
    | { ok: true }
    | {
      ok: false;
      reason: "too-few-sounding-strings" | "split-sounding-strings";
    };

  export const STANDARD_TUNING = [
    { number: 6, openPitchIndex: 28, openNote: "E2" },
    { number: 5, openPitchIndex: 33, openNote: "A2" },
    { number: 4, openPitchIndex: 38, openNote: "D3" },
    { number: 3, openPitchIndex: 43, openNote: "G3" },
    { number: 2, openPitchIndex: 47, openNote: "B3" },
    { number: 1, openPitchIndex: 52, openNote: "E4" },
  ] as const;

  export const createMutedFrets = (): StringSelection[] => {
    return STANDARD_TUNING.map(() => null);
  };

  export const createInitialProps = (): Value => {
    return {
      control: "voicing",
      cursorString: 0,
      cursorFret: 0,
      frets: createMutedFrets(),
      backing: null,
    };
  };

  export const createInitialBackingProps = (): BackingEditorProps => ({
    cursorX: -1,
    cursorY: 0,
    cols: [],
    events: [],
  });

  export const validateStrokeVoicing = (
    frets: StringSelection[],
  ): StrokeVoicingValidationResult => {
    const soundingIndexes = frets
      .map((fret, index) => fret == null ? -1 : index)
      .filter((index) => index !== -1);

    if (soundingIndexes.length < 3) {
      return { ok: false, reason: "too-few-sounding-strings" };
    }

    const first = soundingIndexes[0];
    const last = soundingIndexes[soundingIndexes.length - 1];
    if (last - first + 1 !== soundingIndexes.length) {
      return { ok: false, reason: "split-sounding-strings" };
    }

    return { ok: true };
  };

  export const getDotRate = (dot?: number) => {
    switch (dot ?? 0) {
      case 0: return 1;
      case 1: return 1.5;
      case 2: return 1.75;
    }
    throw new Error(`Unsupported backing column dot. [${dot}]`);
  };

  export const getColWidthCriteriaBeatWidth = (
    col: Col,
    beatWidth: number,
  ) => {
    return Math.floor((beatWidth / col.div) * getDotRate(col.dot));
  };

  export const getBackingBeatLength = (cols: Col[]) => {
    return cols.reduce((total, col) => {
      return total + getDotRate(col.dot) / col.div / (col.tuplets ?? 1);
    }, 0);
  };

  export const createInitialBank = (): Bank => ({
    voicingPatterns: [],
    backingPatterns: [],
    voicingRegulars: [],
    backingRegulars: [],
  });

  const clone = <T>(value: T): T => {
    return JSON.parse(JSON.stringify(value)) as T;
  };

  const getBackingPatterns = (bank: Bank) => {
    const target = bank as Bank & { backingPatterns?: BackingPattern[] };
    if (target.backingPatterns == undefined) target.backingPatterns = [];
    return target.backingPatterns;
  };

  export const DEFAULT_ACTION_VELOCITY = 10;
  export const DEFAULT_STROKE_SPEED = 10;

  const isStringNumber = (value: number): value is PickStringNumber => {
    return Number.isInteger(value) && value >= 1 && value <= 6;
  };

  const formatStringPath = (event: PatternEvent) => {
    if (event.fromString === event.toString) return `${event.fromString}`;
    return `${event.fromString}-${event.toString}`;
  };

  const parseStringPath = (src: string) => {
    const [fromText, toText] = src.split("-");
    const from = Number(fromText);
    const to = toText == undefined ? from : Number(toText);
    if (!isStringNumber(from) || !isStringNumber(to)) {
      throw new Error(`Invalid guitar string path. [${src}]`);
    }
    return { fromString: from, toString: to };
  };

  export const formatPatternItem = (event: PatternEvent) => {
    const base = `${event.colIndex}.${formatStringPath(event)}`;
    const isStroke = event.fromString !== event.toString;
    if (
      event.velocity === DEFAULT_ACTION_VELOCITY &&
      (!isStroke || event.speed === DEFAULT_STROKE_SPEED)
    ) {
      return base;
    }
    if (!isStroke) return `${base}.${event.velocity}`;
    return `${base}.${event.velocity}.${event.speed}`;
  };

  export const convPatternItem = (src: string): PatternEvent => {
    const [colIndexText, stringPathText, velocityText, speedText] = src.split(".");
    const colIndex = Number(colIndexText);
    if (!Number.isInteger(colIndex)) throw new Error(`Invalid guitar pattern item. [${src}]`);
    const velocity = velocityText == undefined ? DEFAULT_ACTION_VELOCITY : Number(velocityText);
    const speed = speedText == undefined ? DEFAULT_STROKE_SPEED : Number(speedText);

    return {
      colIndex,
      ...parseStringPath(stringPathText),
      velocity,
      speed,
    };
  };

  export const createBackingData = (backing: BackingEditorProps): BackingData => {
    const cols = clone(backing.cols);
    return {
      cols,
      items: backing.events
        .filter((event) => {
          return event.colIndex >= 0 && event.colIndex <= cols.length - 1;
        })
        .sort((a, b) => a.colIndex - b.colIndex)
        .map(formatPatternItem),
    };
  };

  export const createBackingEditorProps = (backing: BackingData): BackingEditorProps => {
    return {
      cursorX: backing.cols.length === 0 ? -1 : 0,
      cursorY: 0,
      cols: clone(backing.cols),
      events: backing.items.map(convPatternItem),
    };
  };

  export const getEditorProps = (
    chordSeq: number,
    track: ArrangeState.GuitarTrack,
  ): Value => {
    const props = createInitialProps();
    const relation = track.relations.find((r) => r.chordSeq === chordSeq);
    if (relation == undefined) return props;

    const lib = track.bank;

    const voicing = lib.voicingPatterns.find((p) => p.no === relation.sndsPatt);
    if (voicing == undefined) throw new Error();

    props.frets = clone(voicing.frets);
    if (relation.bkgPatt !== -1) {
      const backing = getBackingPatterns(lib).find((p) => p.no === relation.bkgPatt);
      if (backing == undefined) throw new Error();
      props.backing = createBackingEditorProps(backing.backing);
    }
    return props;
  };

  export const registPattern = (
    frets: StringSelection[],
    bank: Bank,
    key: FinderState.Guitar.VoicingKey,
  ) => {
    const src = JSON.stringify(frets);
    let pattern = bank.voicingPatterns.find((pat) => {
      return JSON.stringify(pat.frets) === src &&
        JSON.stringify(pat.key) === JSON.stringify(key);
    });

    if (pattern == undefined) {
      const maxNo = bank.voicingPatterns.reduce(
        (p, n) => (n.no > p ? n.no : p),
        -1,
      );
      pattern = {
        no: maxNo + 1,
        key,
        frets: JSON.parse(src) as StringSelection[],
      };
      bank.voicingPatterns.push(pattern);
    }

    return pattern.no;
  };

  export const registBackingPattern = (
    category: FinderState.BackingCategory,
    backing: BackingData,
    bank: Bank,
  ) => {
    const src = JSON.stringify(backing);
    const backingPatterns = getBackingPatterns(bank);
    let pattern = backingPatterns.find((pat) => {
      return JSON.stringify(pat.backing) === src;
    });

    if (pattern == undefined) {
      const maxNo = backingPatterns.reduce(
        (p, n) => (n.no > p ? n.no : p),
        -1,
      );
      pattern = {
        no: maxNo + 1,
        category: { ...category },
        backing: JSON.parse(src) as BackingData,
      };
      backingPatterns.push(pattern);
    }

    return pattern.no;
  };

  export const getArrangePatternFromRelation = (
    chordSeq: number,
    track: ArrangeState.GuitarTrack,
  ): Unit | undefined => {
    const relation = track.relations.find((r) => r.chordSeq === chordSeq);
    if (relation == undefined) return undefined;

    const lib = track.bank;
    const voicing = lib.voicingPatterns.find((patt) => patt.no === relation.sndsPatt);
    if (voicing == undefined) throw new Error();
    const backing = relation.bkgPatt === -1
      ? null
      : getBackingPatterns(lib).find((patt) => patt.no === relation.bkgPatt);
    if (relation.bkgPatt !== -1 && backing == undefined) throw new Error();

    return {
      frets: voicing.frets,
      backing: backing?.backing ?? null,
    };
  };

  export const deleteUnreferUnit = (track: ArrangeState.GuitarTrack) => {
    const guitarLib = track.bank;
    ArrangeState.deleteUnreferPattern(
      "sndsPatt",
      guitarLib.voicingPatterns,
      (patt) => guitarLib.voicingRegulars.some(regular => regular.voicingNo === patt.no),
      track,
    );
    ArrangeState.deleteUnreferPattern(
      "bkgPatt",
      getBackingPatterns(guitarLib),
      (patt) => guitarLib.backingRegulars.some(regular => regular.backingNo === patt.no),
      track,
    );
  };
}

export default GuitarEditorState;
