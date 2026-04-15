import {
  type MelodyAudioTrack,
  type MelodyNorm,
  type MelodyNote,
  type MelodyScoreTrack,
  type MelodyTrackBase,
  calcMelodyAddBeat,
  calcMelodyBeat,
  calcMelodyBeatSide,
  createInitialMelodyScoreTrack,
  getMelodyUnitText,
  judgeMelodyOverlapNotes,
  normalizeMelodyNote,
  validateMelodyPitch,
} from "../../../domain/melody/melody-types";
import {
  INITIAL_MELODY_CONTROL_STATE,
  type MelodyControlState,
} from "../../../domain/melody/melody-control";

namespace StoreMelody {
  export type Props = MelodyControlState;
  export const INITIAL = INITIAL_MELODY_CONTROL_STATE;

  export type Norm = MelodyNorm;
  export type Note = MelodyNote;
  export type Track = MelodyTrackBase;
  export type ScoreTrack = MelodyScoreTrack;
  export type AudioTrack = MelodyAudioTrack;

  export const calcBeat = calcMelodyBeat;
  export const calcBeatSide = calcMelodyBeatSide;
  export const judgeOverlapNotes = judgeMelodyOverlapNotes;
  export const calcAddBeat = calcMelodyAddBeat;
  export const normalize = normalizeMelodyNote;
  export const validatePitch = validateMelodyPitch;
  export const getUnitText = getMelodyUnitText;
  export const createMelodyTrackScoreInitial = createInitialMelodyScoreTrack;

  export const compareNotes = (
    _aNorm: Norm,
    _aSize: number,
    _bNorm: Norm,
    _bSize: number,
  ) => {};
}

export default StoreMelody;
