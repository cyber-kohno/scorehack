import StoreMelody from "../../domain/melody/melody-store";
import type { MelodyFocusState } from "../../state/session-state/melody-focus-store";

type ScaleFocusedMelodyNoteLengthParams = {
  note: StoreMelody.Note;
  dir: -1 | 1;
  focusState: MelodyFocusState;
  trackNotes: StoreMelody.Note[];
  onLengthChanged: (note: StoreMelody.Note) => void;
};

export const scaleFocusedMelodyNoteLength = ({
  note,
  dir,
  focusState,
  trackNotes,
  onLengthChanged,
}: ScaleFocusedMelodyNoteLengthParams) => {
  if (focusState.focusLock !== -1) return false;

  const candidate: StoreMelody.Note = JSON.parse(JSON.stringify(note));
  candidate.len += dir;
  if (candidate.len === 0) return false;

  const otherNotes = trackNotes.slice();
  otherNotes.splice(focusState.focus, 1);
  const overlappedNote = otherNotes.find((item) =>
    StoreMelody.judgeOverlapNotes(item, candidate),
  );
  if (overlappedNote != undefined) return false;

  note.len = candidate.len;
  onLengthChanged(note);
  return true;
};
