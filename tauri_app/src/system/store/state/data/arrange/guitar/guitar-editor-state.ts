import ArrangeState from "../arrange-state";
import type FinderState from "../finder-state";

namespace GuitarEditorState {
  export const MAX_FRET = 12;

  export type Control = "voicing" | "col" | "pattern";

  export type StringSelection = number | null;

  export type StrokeDirection = "down" | "up";
  export type PickStringNumber = 1 | 2 | 3 | 4 | 5 | 6;
  export type TechniqueSelection =
    | "up"
    | "down"
    | "pick6"
    | "pick5"
    | "pick4"
    | "pick3"
    | "pick2"
    | "pick1";

  export const TECHNIQUES: (TechniqueSelection | "none")[] = [
    "none",
    "down",
    "up",
    "pick6",
    "pick5",
    "pick4",
    "pick3",
    "pick2",
    "pick1",
  ];

  export type Col = {
    div: number;
    dot?: number;
    tuplets?: number;
  };

  export type PlayAction =
    | {
      kind: "stroke";
      direction: StrokeDirection;
      speed: number;
      velocity: number;
    }
    | {
      kind: "pick";
      stringNumber: PickStringNumber;
      velocity: number;
    };

  export type PatternEvent = PlayAction & {
    colIndex: number;
  };

  export type BackingData = {
    cols: Col[];
    items: string[];
  };

  export type BackingEditorProps = {
    cursorX: number;
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
    key?: FinderState.Guitar.VoicingKey;
    frets: StringSelection[];
  }

  export interface BackingPattern extends ArrangeState.Pattern {
    backing: BackingData;
  }

  export type Bank = {
    voicingPatterns: VoicingPattern[];
    backingPatterns: BackingPattern[];
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
  });

  const clone = <T>(value: T): T => {
    return JSON.parse(JSON.stringify(value)) as T;
  };

  const getBackingPatterns = (bank: Bank) => {
    const target = bank as Bank & { backingPatterns?: BackingPattern[] };
    if (target.backingPatterns == undefined) target.backingPatterns = [];
    return target.backingPatterns;
  };

  const DEFAULT_STROKE_SPEED = 1;

  export const getTechniqueSelection = (action: PlayAction): TechniqueSelection => {
    if (action.kind === "stroke") return action.direction;
    return `pick${action.stringNumber}`;
  };

  export const createPlayActionFromTechnique = (
    technique: TechniqueSelection,
    velocity = 10,
  ): PlayAction => {
    switch (technique) {
      case "down":
      case "up":
        return {
          kind: "stroke",
          direction: technique,
          speed: DEFAULT_STROKE_SPEED,
          velocity,
        };
      case "pick6": return { kind: "pick", stringNumber: 6, velocity };
      case "pick5": return { kind: "pick", stringNumber: 5, velocity };
      case "pick4": return { kind: "pick", stringNumber: 4, velocity };
      case "pick3": return { kind: "pick", stringNumber: 3, velocity };
      case "pick2": return { kind: "pick", stringNumber: 2, velocity };
      case "pick1": return { kind: "pick", stringNumber: 1, velocity };
    }
  };

  const getTechniqueCode = (action: PlayAction) => {
    const technique = getTechniqueSelection(action);
    switch (technique) {
      case "down": return "d";
      case "up": return "u";
      case "pick6": return "p6";
      case "pick5": return "p5";
      case "pick4": return "p4";
      case "pick3": return "p3";
      case "pick2": return "p2";
      case "pick1": return "p1";
    }
  };

  const getTechniqueFromCode = (code: string): TechniqueSelection => {
    switch (code) {
      case "d": return "down";
      case "u": return "up";
      case "p6": return "pick6";
      case "p5": return "pick5";
      case "p4": return "pick4";
      case "p3": return "pick3";
      case "p2": return "pick2";
      case "p1": return "pick1";
    }
    throw new Error(`Unsupported guitar technique code. [${code}]`);
  };

  export const formatPatternItem = (event: PatternEvent) => {
    const base = `${event.colIndex}.${getTechniqueCode(event)}`;
    if (event.velocity === 10) return base;
    return `${base}.${event.velocity}`;
  };

  export const convPatternItem = (src: string): PatternEvent => {
    const [colIndexText, techniqueText, velocityText] = src.split(".");
    const colIndex = Number(colIndexText);
    if (!Number.isInteger(colIndex)) throw new Error(`Invalid guitar pattern item. [${src}]`);
    const velocity = velocityText == undefined ? 10 : Number(velocityText);

    return {
      colIndex,
      ...createPlayActionFromTechnique(getTechniqueFromCode(techniqueText), velocity),
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
        .map(formatPatternItem),
    };
  };

  export const createBackingEditorProps = (backing: BackingData): BackingEditorProps => {
    return {
      cursorX: backing.cols.length === 0 ? -1 : 0,
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
    key?: FinderState.Guitar.VoicingKey,
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
      () => false,
      track,
    );
    ArrangeState.deleteUnreferPattern(
      "bkgPatt",
      getBackingPatterns(guitarLib),
      () => false,
      track,
    );
  };
}

export default GuitarEditorState;
