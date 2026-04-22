import StoreMelody from "../../domain/melody/melody-store";
import type { MelodyFocusState } from "../../state/session-state/melody-focus-store";

export const isMelodyCursorFocus = (focusState: MelodyFocusState) =>
  focusState.focus === -1;

export const getFocusedMelodyNote = (
  track: StoreMelody.ScoreTrack,
  focusState: MelodyFocusState,
) => track.notes[focusState.focus];

type MoveMelodyFocusParams = {
  track: StoreMelody.ScoreTrack;
  focusState: MelodyFocusState;
  dir: -1 | 1;
  onFocusMoved: (note: StoreMelody.Note) => void;
};

export const moveMelodyFocus = ({
  track,
  focusState,
  dir,
  onFocusMoved,
}: MoveMelodyFocusParams) => {
  const previousNote = getFocusedMelodyNote(track, focusState);
  const nextFocus = focusState.focus + dir;
  if (nextFocus < 0 || nextFocus > track.notes.length - 1) return undefined;

  focusState.focus = nextFocus;
  const nextNote = getFocusedMelodyNote(track, focusState);
  StoreMelody.normalize(previousNote);
  onFocusMoved(nextNote);
  return nextNote;
};

type MoveMelodyPitchParams = {
  note: StoreMelody.Note;
  dir: number;
  maxPitch: number;
  onPitchMoved: (note: StoreMelody.Note) => void;
  onPreviewPitch: (pitchIndex: number) => void;
};

export const moveMelodyPitch = ({
  note,
  dir,
  maxPitch,
  onPitchMoved,
  onPreviewPitch,
}: MoveMelodyPitchParams) => {
  let nextPitch = note.pitch + dir;
  if (nextPitch < 0) nextPitch = 0;
  if (nextPitch > maxPitch) nextPitch = maxPitch;

  note.pitch = nextPitch;
  onPreviewPitch(note.pitch);
  onPitchMoved(note);
};
