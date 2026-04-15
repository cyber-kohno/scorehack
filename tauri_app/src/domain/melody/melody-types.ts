import Layout from "../../styles/tokens/layout-tokens";

export interface MelodyNorm {
  div: number;
  tuplets?: number;
}

export interface MelodyNote {
  norm: MelodyNorm;
  pos: number;
  len: number;
  pitch: number;
}

export interface MelodyTrackBase {
  name: string;
  isMute: boolean;
  volume: number;
}

export interface MelodyScoreTrack extends MelodyTrackBase {
  soundFont: string;
  notes: MelodyNote[];
}

export interface MelodyAudioTrack extends MelodyTrackBase {
  source: string;
  fileName: string;
  adjust: number;
}

export const createInitialMelodyScoreTrack = (): MelodyScoreTrack => {
  return {
    name: "track0",
    volume: 10,
    isMute: false,
    notes: [],
    soundFont: "",
  };
};

export const calcMelodyBeat = (norm: MelodyNorm, size: number) => {
  return ((1 / norm.div) * size) / (norm.tuplets ?? 1);
};

export const calcMelodyBeatSide = (note: MelodyNote) => {
  const [pos, len] = [note.pos, note.len].map((size) =>
    calcMelodyBeat(note.norm, size),
  );
  return { pos, len };
};

export const judgeMelodyOverlapNotes = (n1: MelodyNote, n2: MelodyNote) => {
  const { pos: n1Pos, len: n1Len } = calcMelodyBeatSide(n1);
  const { pos: n2Pos, len: n2Len } = calcMelodyBeatSide(n2);
  const adj = 0.00001;
  const n1l = n1Pos + adj;
  const n1r = n1Pos + n1Len;
  const n2l = n2Pos + adj;
  const n2r = n2Pos + n2Len;
  return (n1r > n2l && n1r <= n2r) || (n2r > n1l && n2r < n1r);
};

export const calcMelodyAddBeat = (note: MelodyNote, beat: number): MelodyNote => {
  const rate = note.norm.div / 1;
  return {
    ...note,
    pos: note.pos + beat * rate,
  };
};

export const normalizeMelodyNote = (note: MelodyNote) => {
  while (true) {
    if (note.norm.div > 1 && note.len % 2 === 0 && note.pos % 2 === 0) {
      note.norm.div /= 2;
      note.len /= 2;
      note.pos /= 2;
    } else break;
  }
};

export const validateMelodyPitch = (pitchIndex: number) => {
  return pitchIndex >= 0 && pitchIndex <= Layout.pitch.NUM;
};

export const getMelodyUnitText = (note: MelodyNote) => {
  const tuplets = note.norm.tuplets;
  return `1/${note.norm.div * 4} ${!tuplets ? "" : ` ${tuplets}t`}`;
};
