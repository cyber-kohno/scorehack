import type { MelodyNote, MelodyScoreTrack } from "../../../domain/melody/melody-types";
import {
  calcMelodyBeat,
  calcMelodyBeatSide,
  judgeMelodyOverlapNotes,
  normalizeMelodyNote,
} from "../../../domain/melody/melody-types";
import { createOutlineActions } from "../../../app/outline/outline-actions";
import { createProjectDataActions } from "../../../app/project-data/project-data-actions";
import {
  getTimelineFocusChordCache,
  getTimelineFocusElementCache,
} from "../../../state/cache-state/timeline-cache";
import type { StoreProps } from "../store";
import useReducerRef from "./reducerRef";

const useReducerMelody = (lastStore: StoreProps) => {
  const { syncChordSeqFromNote } = createOutlineActions(lastStore);
  const { getScoreTrack, getScoreTracks } = createProjectDataActions(lastStore);
  const { adjustGridScrollXFromNote, adjustGridScrollYFromCursor } = useReducerRef(lastStore);

  const syncCursorFromElementSeq = () => {
    const elementCache = getTimelineFocusElementCache(lastStore);
    if (elementCache == undefined) return;
    const { lastChordSeq, chordSeq } = elementCache;
    let pos = 0;
    if (lastChordSeq !== -1) {
      const chordCache = getTimelineFocusChordCache(lastStore);
      if (chordCache == undefined) return;
      pos = chordCache.startBeatNote;
      if (chordSeq === -1) pos += chordCache.lengthBeatNote;
    }

    const melody = lastStore.control.melody;
    const cursor = melody.cursor;
    cursor.norm.div = 1;
    cursor.norm.tuplets = undefined;
    cursor.pos = pos;
    cursor.len = 1;
    melody.focus = -1;
  };

  const addNote = (note: MelodyNote) => {
    const melody = lastStore.control.melody;
    const layer = getScoreTrack(melody.trackIndex);
    if (layer == undefined) throw new Error();
    const notes = (layer as MelodyScoreTrack).notes;
    notes.push(note);
    notes.sort((n1, n2) => {
      const [n1Pos, n2Pos] = [n1, n2].map((n) => calcMelodyBeat(n.norm, n.pos));
      return n1Pos - n2Pos;
    });
  };

  const addNoteFromCursor = () => {
    addNote(JSON.parse(JSON.stringify(lastStore.control.melody.cursor)));
  };

  const judgeOverlap = () => {
    const melody = lastStore.control.melody;
    const track = getCurrScoreTrack();
    const overlapNote = track.notes.find((n) => {
      return judgeMelodyOverlapNotes(n, melody.cursor);
    });
    melody.isOverlap = overlapNote != undefined;
  };

  const getCurrScoreTrack = () => {
    const melody = lastStore.control.melody;
    const track = getScoreTrack(melody.trackIndex);
    if (track == undefined) throw new Error();
    return track;
  };

  const focusInNearNote = (dir: -1 | 1) => {
    const melody = lastStore.control.melody;
    const cursor = melody.cursor;
    const layer = getCurrScoreTrack();
    const notes = (layer as MelodyScoreTrack).notes;

    const cursorPos = calcMelodyBeat(cursor.norm, cursor.pos);
    const matchIndex = (dir === -1 ? notes.slice().reverse() : notes).findIndex((n) => {
      const side = calcMelodyBeatSide(n);
      const [left, right] = [side.pos, side.pos + side.len];
      return dir === -1 ? cursorPos > left : cursorPos < right;
    });
    if (matchIndex !== -1) {
      melody.focus = dir === -1 ? notes.length - 1 - matchIndex : matchIndex;
      const note = notes[melody.focus];
      syncChordSeqFromNote(note);
      adjustGridScrollXFromNote(note);
      adjustGridScrollYFromCursor(note);
    }
  };

  const focusOutNoteSide = (note: MelodyNote, dir: -1 | 1) => {
    const melody = lastStore.control.melody;
    melody.cursor = JSON.parse(JSON.stringify(note));
    const cursor = melody.cursor;
    cursor.len = 1;
    if (dir === 1) {
      cursor.pos += note.len;
    }
    melody.focus = -1;
    normalizeMelodyNote(note);
    judgeOverlap();
    syncChordSeqFromNote(cursor);
    adjustGridScrollXFromNote(cursor);
  };

  const changeScoreTrack = (nextIndex: number) => {
    const melody = lastStore.control.melody;
    const tracks = getScoreTracks();
    if (tracks[nextIndex] == undefined) throw new Error();
    syncCursorFromElementSeq();
    melody.trackIndex = nextIndex;
  };

  const getFocusRange = () => {
    const melody = lastStore.control.melody;
    if (melody.focusLock === -1) return [melody.focus, melody.focus] as const;
    return melody.focus < melody.focusLock
      ? [melody.focus, melody.focusLock] as const
      : [melody.focusLock, melody.focus] as const;
  };

  return {
    syncCursorFromElementSeq,
    addNote,
    addNoteFromCursor,
    judgeOverlap,
    focusInNearNote,
    focusOutNoteSide,
    getCurrScoreTrack,
    changeScoreTrack,
    getFocusRange,
  };
};
export default useReducerMelody;
