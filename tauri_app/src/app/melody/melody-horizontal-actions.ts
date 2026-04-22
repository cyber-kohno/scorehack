import StoreMelody from "../../domain/melody/melody-store";
import type { MelodyFocusState } from "../../state/session-state/melody-focus-store";

type MoveFocusedMelodyNoteHorizontallyParams = {
  note: StoreMelody.Note;
  dir: -1 | 1;
  focusState: MelodyFocusState;
  trackNotes: StoreMelody.Note[];
  onMoved: (note: StoreMelody.Note) => void;
};

export const moveFocusedMelodyNoteHorizontally = ({
  note,
  dir,
  focusState,
  trackNotes,
  onMoved,
}: MoveFocusedMelodyNoteHorizontallyParams) => {
  const candidate: StoreMelody.Note = JSON.parse(JSON.stringify(note));
  candidate.pos += dir;

  const otherNotes = trackNotes.slice();
  otherNotes.splice(focusState.focus, 1);
  const overlappedNote = otherNotes.find((item) =>
    StoreMelody.judgeOverlapNotes(item, candidate),
  );
  if (overlappedNote != undefined) return false;

  note.pos = candidate.pos;
  onMoved(note);
  return true;
};

type MoveMelodyNoteRangeHorizontallyParams = {
  trackNotes: StoreMelody.Note[];
  focusState: MelodyFocusState;
  start: number;
  end: number;
  criteria: StoreMelody.Note;
  dir: -1 | 1;
  beatNoteTail: number;
  move: (note: StoreMelody.Note) => void;
  onMoved: (criteria: StoreMelody.Note) => void;
};

export const moveMelodyNoteRangeHorizontally = ({
  trackNotes,
  focusState,
  start,
  end,
  criteria,
  dir,
  beatNoteTail,
  move,
  onMoved,
}: MoveMelodyNoteRangeHorizontallyParams) => {
  if (criteria.norm.tuplets != undefined) return false;

  const clone = (index: number) =>
    JSON.parse(JSON.stringify(trackNotes[index])) as StoreMelody.Note;
  const candidate = clone(dir === -1 ? start : end);
  move(candidate);

  if (dir === -1) {
    if (candidate.pos < 0) return false;
    if (start > 0) {
      const leftNoteSide = StoreMelody.calcBeatSide(trackNotes[start - 1]);
      const leftNoteRight = leftNoteSide.pos + leftNoteSide.len;
      const candidateLeft = StoreMelody.calcBeatSide(candidate).pos;
      if (candidateLeft < leftNoteRight) return false;
    }
  } else {
    const candidateSide = StoreMelody.calcBeatSide(candidate);
    const candidateRight = candidateSide.pos + candidateSide.len;
    if (candidateRight > beatNoteTail) return false;

    if (end < trackNotes.length - 1) {
      const rightNoteLeft = StoreMelody.calcBeatSide(trackNotes[end + 1]).pos;
      if (candidateRight > rightNoteLeft) return false;
    }
  }

  if (
    trackNotes.slice(start, end + 1).find((note) => {
      const tuplets = note.norm.tuplets;
      if (note.norm.div !== criteria.norm.div && tuplets != undefined) {
        if (note.pos % tuplets !== 0) return true;
      }
      return false;
    }) != undefined
  ) {
    return false;
  }

  trackNotes.slice(start, end + 1).forEach((note, index) => {
    move(note);
    if (focusState.focus !== start + index) StoreMelody.normalize(note);
  });
  onMoved(criteria);
  return true;
};

type MoveMelodyCursorSpaceParams = {
  cursor: StoreMelody.Note;
  dir: -1 | 1;
  trackNotes: StoreMelody.Note[];
  beatNoteTail: number;
  onMoved: () => void;
};

export const moveMelodyCursorSpace = ({
  cursor,
  dir,
  trackNotes,
  beatNoteTail,
  onMoved,
}: MoveMelodyCursorSpaceParams) => {
  if (cursor.norm.tuplets != undefined) return false;

  const startIndex = trackNotes.findIndex((note) => {
    const cursorLeft = StoreMelody.calcBeatSide(cursor).pos;
    const noteLeft = StoreMelody.calcBeatSide(note).pos;
    return cursorLeft <= noteLeft;
  });
  if (startIndex === -1) return false;

  const clone = (index: number) =>
    JSON.parse(JSON.stringify(trackNotes[index])) as StoreMelody.Note;
  const candidate = clone(dir === -1 ? startIndex : trackNotes.length - 1);

  const move = (note: StoreMelody.Note) => {
    if (note.norm.div >= cursor.norm.div) {
      const tuplets = note.norm.tuplets ?? 1;
      const rate = (note.norm.div * tuplets) / cursor.norm.div;
      note.pos += dir * rate;
    } else {
      const rate = cursor.norm.div / note.norm.div;
      note.norm.div = cursor.norm.div;
      note.pos *= rate;
      note.len *= rate;
      note.pos += dir;
    }
  };
  move(candidate);

  if (dir === -1) {
    const cursorLeft = StoreMelody.calcBeatSide(cursor).pos;
    const candidateLeft = StoreMelody.calcBeatSide(candidate).pos;
    if (cursorLeft > candidateLeft) return false;
  } else {
    const candidateSide = StoreMelody.calcBeatSide(candidate);
    const candidateRight = candidateSide.pos + candidateSide.len;
    if (candidateRight > beatNoteTail) return false;
  }

  if (
    trackNotes.slice(startIndex).find((note) => {
      const tuplets = note.norm.tuplets;
      if (note.norm.div !== cursor.norm.div && tuplets != undefined) {
        if (note.pos % tuplets !== 0) return true;
      }
      return false;
    }) != undefined
  ) {
    return false;
  }

  trackNotes.slice(startIndex).forEach((note) => {
    move(note);
    StoreMelody.normalize(note);
  });
  onMoved();
  return true;
};
