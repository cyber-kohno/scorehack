import type StoreMelody from "../../domain/melody/melody-store";
import type { MelodyFocusState } from "../../state/session-state/melody-focus-store";

type ChangeMelodyFocusSideParams = {
  focusState: MelodyFocusState;
  dir: -1 | 1;
  onFocusChanged: () => void;
};

export const focusInNearMelodyNote = ({
  dir,
  onFocusChanged,
}: ChangeMelodyFocusSideParams) => {
  onFocusChanged();
};

export const focusOutMelodyNoteSide = ({
  focusState,
  onFocusChanged,
}: ChangeMelodyFocusSideParams) => {
  onFocusChanged();
  focusState.focusLock = -1;
};

type MoveMelodyFocusRangeParams = {
  focusState: MelodyFocusState;
  dir: -1 | 1;
  onFocusMoved: (dir: -1 | 1) => void;
};

export const moveMelodyFocusRange = ({
  focusState,
  dir,
  onFocusMoved,
}: MoveMelodyFocusRangeParams) => {
  if (focusState.focusLock === -1) focusState.focusLock = focusState.focus;
  onFocusMoved(dir);
};

type RemoveFocusedMelodyNoteParams = {
  track: StoreMelody.ScoreTrack;
  focusState: MelodyFocusState;
};

export const removeFocusedMelodyNote = ({
  track,
  focusState,
}: RemoveFocusedMelodyNoteParams) => {
  const focus = focusState.focus;
  if (focus < 1) return false;

  track.notes.splice(focus, 1);
  focusState.focus--;
  return true;
};
