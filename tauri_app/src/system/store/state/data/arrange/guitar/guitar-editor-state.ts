import ArrangeState from "../arrange-state";

namespace GuitarEditorState {
  export const MAX_FRET = 12;

  export type Control = "voicing" | "col" | "pattern";

  export type StringSelection = number | null;

  export type StrokeDirection = "down" | "up";
  export type Technique =
    | "up"
    | "down"
    | "pick6"
    | "pick5"
    | "pick4"
    | "pick3"
    | "pick2"
    | "pick1";

  export const TECHNIQUES: (Technique | "none")[] = [
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

  export type GuitarStrokeProps = {
    strokeDelayBeat: number;
    strokeDirection: StrokeDirection;
    velocity: number;
    decayRate: number;
  };

  export type Col = {
    div: number;
    dot?: number;
    tuplets?: number;
  };

  export type PatternEvent = {
    colIndex: number;
    technique: Technique;
    velocity: number;
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

  export const createDefaultStrokeProps = (): GuitarStrokeProps => ({
    strokeDelayBeat: 0.015,
    strokeDirection: "down",
    velocity: 10,
    decayRate: 0.92,
  });

  export const STANDARD_TUNING = [
    { number: 6, openMidi: 40, openNote: "E2" },
    { number: 5, openMidi: 45, openNote: "A2" },
    { number: 4, openMidi: 50, openNote: "D3" },
    { number: 3, openMidi: 55, openNote: "G3" },
    { number: 2, openMidi: 59, openNote: "B3" },
    { number: 1, openMidi: 64, openNote: "E4" },
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

  const getTechniqueCode = (technique: Technique) => {
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

  const getTechniqueFromCode = (code: string): Technique => {
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
    const base = `${event.colIndex}.${getTechniqueCode(event.technique)}`;
    if (event.velocity === 10) return base;
    return `${base}.${event.velocity}`;
  };

  export const convPatternItem = (src: string): PatternEvent => {
    const [colIndexText, techniqueText, velocityText] = src.split(".");
    const colIndex = Number(colIndexText);
    if (!Number.isInteger(colIndex)) throw new Error(`Invalid guitar pattern item. [${src}]`);

    return {
      colIndex,
      technique: getTechniqueFromCode(techniqueText),
      velocity: velocityText == undefined ? 10 : Number(velocityText),
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
  ) => {
    const src = JSON.stringify(frets);
    let pattern = bank.voicingPatterns.find((pat) => {
      return JSON.stringify(pat.frets) === src;
    });

    if (pattern == undefined) {
      const maxNo = bank.voicingPatterns.reduce(
        (p, n) => (n.no > p ? n.no : p),
        -1,
      );
      pattern = {
        no: maxNo + 1,
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
