import type TonalityTheory from "../../../domain/theory/tonality-theory";
import Layout from "../../../layout/layout-constant";

namespace MelodyState {

  export interface Norm {
    div: number;
    tuplets?: number;
  }

  export interface Note {
    norm: Norm;
    pos: number;
    len: number;
    pitch: number;
  }

  export interface VocalNote extends Note {
    lyric?: string;
  }

  export interface Track {
    name: string;
    isMute: boolean;
    volume: number;
  }

  export interface ScoreTrack extends Track {
    soundFont: string;
    notes: VocalNote[];
  }
  export const createMelodyTrackScoreInitial = (): ScoreTrack => {
    return {
      name: "track0",
      volume: 10,
      isMute: false,
      notes: [],
      soundFont: "",
    };
  };
  export interface AudioTrack extends Track {
    source: string;
    fileName: string;
    adjust: number;
  }


  export const calcBeat = (norm: MelodyState.Norm, size: number) => {
    return ((1 / norm.div) * size) / (norm.tuplets ?? 1);
  };
  export const calcBeatSide = (note: Note) => {
    const [pos, len] = [note.pos, note.len].map((size) =>
      calcBeat(note.norm, size),
    );
    return { pos, len };
  };
  export const judgeOverlapNotes = (n1: Note, n2: Note) => {
    const { pos: n1Pos, len: n1Len } = MelodyState.calcBeatSide(n1);
    const { pos: n2Pos, len: n2Len } = MelodyState.calcBeatSide(n2);
    const adj = 0.00001;
    const n1l = n1Pos + adj;
    const n1r = n1Pos + n1Len;
    const n2l = n2Pos + adj;
    const n2r = n2Pos + n2Len;
    return (n1r > n2l && n1r <= n2r) || (n2r > n1l && n2r < n1r);
  };

  export const calcAddBeat = (note: Note, beat: number): Note => {
    const norm = note.norm;
    const rate = norm.div / 1;
    const newPos = note.pos + beat * rate;
    return {
      ...note,
      pos: newPos,
    };
  };

  export const compareNotes = (
    aNorm: Norm,
    aSize: number,
    bNorm: Norm,
    bSize: number,
  ) => { };

  export const normalize = (note: Note) => {
    while (true) {
      if (note.norm.div > 1 && note.len % 2 === 0 && note.pos % 2 === 0) {
        note.norm.div /= 2;
        note.len /= 2;
        note.pos /= 2;
      } else break;
    }
  };

  export const validatePitch = (pitchIndex: number) => {
    return pitchIndex >= 0 && pitchIndex <= Layout.pitch.NUM;
  };

  export const getUnitText = (note: Note) => {
    const tuplets = note.norm.tuplets;
    const numerator = note.len;
    const denominator = note.norm.div * 4 * (tuplets ?? 1);
    const fraction = `${numerator}/${denominator}`;
    return !tuplets ? fraction : `${fraction} ${tuplets}t`;
  };
}

export default MelodyState;
