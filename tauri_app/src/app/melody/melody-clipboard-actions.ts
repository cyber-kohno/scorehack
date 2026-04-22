import StoreMelody from "../../domain/melody/melody-store";
import { setMelodyClipboardNotes } from "../../state/session-state/melody-clipboard-store";
import type { MelodyFocusState } from "../../state/session-state/melody-focus-store";

const getFocusedRange = (focusState: MelodyFocusState) => {
  let start = focusState.focus;
  let count = 1;

  if (focusState.focusLock !== -1) {
    start =
      focusState.focus <= focusState.focusLock
        ? focusState.focus
        : focusState.focusLock;
    count = Math.abs(focusState.focus - focusState.focusLock) + 1;
  }

  return [start, count] as const;
};

export const copyFocusedMelodyNotes = (
  track: StoreMelody.ScoreTrack,
  focusState: MelodyFocusState,
) => {
  const [start, count] = getFocusedRange(focusState);
  const copiedNotes = track.notes.filter(
    (_, index) => index >= start && index < start + count,
  );
  setMelodyClipboardNotes(JSON.parse(JSON.stringify(copiedNotes)));
};

const sortTrackNotes = (track: StoreMelody.ScoreTrack) => {
  track.notes.sort((a, b) => {
    const [aX, bX] = [a, b].map((note) => StoreMelody.calcBeatSide(note).pos);
    return aX - bX;
  });
};

type PasteMelodyClipboardParams = {
  track: StoreMelody.ScoreTrack;
  cursor: StoreMelody.Note;
  clipboardNotes: StoreMelody.Note[] | null;
  focusState: MelodyFocusState;
  moveLen: (note: StoreMelody.Note, len: StoreMelody.Note) => void;
};

export const pasteMelodyClipboardNotesAtCursor = ({
  track,
  cursor,
  clipboardNotes,
  focusState,
  moveLen,
}: PasteMelodyClipboardParams) => {
  if (clipboardNotes == null || focusState.focus !== -1) return false;

  const criteria: StoreMelody.Note = JSON.parse(
    JSON.stringify(clipboardNotes[0]),
  );
  criteria.pos *= -1;

  clipboardNotes.forEach((note) => {
    moveLen(note, criteria);
    moveLen(note, cursor);
    track.notes.push(note);
  });

  sortTrackNotes(track);
  const focusIndex = track.notes.findIndex((note) => note === clipboardNotes[0]);
  focusState.focus = focusIndex;
  focusState.focusLock = focusIndex + clipboardNotes.length - 1;
  setMelodyClipboardNotes(null);
  return true;
};
