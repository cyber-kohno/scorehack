import ArrangeState from "../arrange-state";

namespace GuitarEditorState {
  export const MAX_FRET = 12;

  export type StringSelection = number | null;

  export type StrokeDirection = "down" | "up";

  export type GuitarStrokeProps = {
    strokeDelayBeat: number;
    strokeDirection: StrokeDirection;
    velocity: number;
    decayRate: number;
  };

  export type Value = {
    cursorString: number;
    cursorFret: number;
    frets: StringSelection[];
  };

  export interface VoicingPattern extends ArrangeState.Pattern {
    frets: StringSelection[];
  }

  export type Lib = {
    voicingPatterns: VoicingPattern[];
  };

  export interface Unit {
    frets: StringSelection[];
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
      cursorString: 0,
      cursorFret: 0,
      frets: createMutedFrets(),
    };
  };

  export const createInitialLib = (): Lib => ({
    voicingPatterns: [],
  });

  export const getEditorProps = (
    chordSeq: number,
    track: ArrangeState.Track,
  ): Value => {
    const props = createInitialProps();
    const relation = track.relations.find((r) => r.chordSeq === chordSeq);
    if (relation == undefined) return props;

    const lib = track.guitarLib;
    if (lib == undefined) throw new Error();

    const voicing = lib.voicingPatterns.find((p) => p.no === relation.sndsPatt);
    if (voicing == undefined) throw new Error();

    props.frets = JSON.parse(JSON.stringify(voicing.frets));
    return props;
  };

  export const registPattern = (
    frets: StringSelection[],
    lib: Lib,
  ) => {
    const src = JSON.stringify(frets);
    let pattern = lib.voicingPatterns.find((pat) => {
      return JSON.stringify(pat.frets) === src;
    });

    if (pattern == undefined) {
      const maxNo = lib.voicingPatterns.reduce(
        (p, n) => (n.no > p ? n.no : p),
        -1,
      );
      pattern = {
        no: maxNo + 1,
        frets: JSON.parse(src),
      };
      lib.voicingPatterns.push(pattern);
    }

    return pattern.no;
  };

  export const getArrangePatternFromRelation = (
    chordSeq: number,
    track: ArrangeState.Track,
  ): Unit | undefined => {
    const relation = track.relations.find((r) => r.chordSeq === chordSeq);
    if (relation == undefined) return undefined;

    const lib = track.guitarLib as GuitarEditorState.Lib;
    const voicing = lib.voicingPatterns.find((patt) => patt.no === relation.sndsPatt);
    if (voicing == undefined) throw new Error();

    return {
      frets: voicing.frets,
    };
  };

  export const deleteUnreferUnit = (track: ArrangeState.Track) => {
    const guitarLib = track.guitarLib as GuitarEditorState.Lib;
    ArrangeState.deleteUnreferPattern(
      "sndsPatt",
      guitarLib.voicingPatterns,
      () => false,
      track,
    );
  };
}

export default GuitarEditorState;
