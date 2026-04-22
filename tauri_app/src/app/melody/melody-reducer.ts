import type { MelodyNote, MelodyScoreTrack } from "../../domain/melody/melody-types";
import {
  calcMelodyBeat,
  calcMelodyBeatSide,
  judgeMelodyOverlapNotes,
  normalizeMelodyNote,
} from "../../domain/melody/melody-types";
import { createOutlineActions } from "../outline/outline-actions";
import {
  copyMelodyCursorState,
  getMelodyCursorState,
  replaceMelodyCursorState,
} from "./melody-cursor-state";
import { createProjectDataActions } from "../project-data/project-data-actions";
import {
  getTimelineFocusChordCache,
  getTimelineFocusElementCache,
} from "../../state/cache-state/timeline-cache";
import {
  adjustTimelineScrollXFromMelodyNote,
  adjustTimelineScrollYFromMelodyNote,
} from "./melody-scroll";
import {
  getMelodyTrackIndex,
  setMelodyTrackIndex,
} from "../../state/session-state/melody-track-store";
import {
  getMelodyFocusState,
  setMelodyFocus,
} from "../../state/session-state/melody-focus-store";
import { setMelodyOverlapState } from "../../state/session-state/melody-overlap-store";
import type { StoreProps } from "../../state/root-store";

const useReducerMelody = (lastStore: StoreProps) => {
  const { syncChordSeqFromNote } = createOutlineActions(lastStore);
  const { getScoreTrack, getScoreTracks } = createProjectDataActions(lastStore);
  const melodyFocus = getMelodyFocusState();
  
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

    const cursor = getMelodyCursorState(lastStore);
    cursor.norm.div = 1;
    cursor.norm.tuplets = undefined;
    cursor.pos = pos;
    cursor.len = 1;
    setMelodyFocus(-1);
  };

  const addNote = (note: MelodyNote) => {
    const layer = getScoreTrack(getMelodyTrackIndex());
    if (layer == undefined) throw new Error();
    const notes = (layer as MelodyScoreTrack).notes;
    notes.push(note);
    notes.sort((n1, n2) => {
      const [n1Pos, n2Pos] = [n1, n2].map((n) => calcMelodyBeat(n.norm, n.pos));
      return n1Pos - n2Pos;
    });
  };

  const addNoteFromCursor = () => {
    addNote(copyMelodyCursorState(lastStore));
  };

  const judgeOverlap = () => {
    const track = getCurrScoreTrack();
    const overlapNote = track.notes.find((n) => {
      return judgeMelodyOverlapNotes(n, getMelodyCursorState(lastStore));
    });
    setMelodyOverlapState(overlapNote != undefined);
  };

  const getCurrScoreTrack = () => {
    const track = getScoreTrack(getMelodyTrackIndex());
    if (track == undefined) throw new Error();
    return track;
  };

  const focusInNearNote = (dir: -1 | 1) => {
    const cursor = getMelodyCursorState(lastStore);
    const layer = getCurrScoreTrack();
    const notes = (layer as MelodyScoreTrack).notes;

    const cursorPos = calcMelodyBeat(cursor.norm, cursor.pos);
    const matchIndex = (dir === -1 ? notes.slice().reverse() : notes).findIndex((n) => {
      const side = calcMelodyBeatSide(n);
      const [left, right] = [side.pos, side.pos + side.len];
      return dir === -1 ? cursorPos > left : cursorPos < right;
    });
    if (matchIndex !== -1) {
      melodyFocus.focus = dir === -1 ? notes.length - 1 - matchIndex : matchIndex;
      const note = notes[melodyFocus.focus];
      syncChordSeqFromNote(note);
      adjustTimelineScrollXFromMelodyNote(lastStore, note);
      adjustTimelineScrollYFromMelodyNote(lastStore, note);
    }
  };

  const focusOutNoteSide = (note: MelodyNote, dir: -1 | 1) => {
    replaceMelodyCursorState(lastStore, note);
    const cursor = getMelodyCursorState(lastStore);
    cursor.len = 1;
    if (dir === 1) {
      cursor.pos += note.len;
    }
    setMelodyFocus(-1);
    normalizeMelodyNote(note);
    judgeOverlap();
    syncChordSeqFromNote(cursor);
    adjustTimelineScrollXFromMelodyNote(lastStore, cursor);
  };

  const changeScoreTrack = (nextIndex: number) => {
    const tracks = getScoreTracks();
    if (tracks[nextIndex] == undefined) throw new Error();
    syncCursorFromElementSeq();
    setMelodyTrackIndex(nextIndex);
  };

  const getFocusRange = () => {
    if (melodyFocus.focusLock === -1) {
      return [melodyFocus.focus, melodyFocus.focus] as const;
    }
    return melodyFocus.focus < melodyFocus.focusLock
      ? [melodyFocus.focus, melodyFocus.focusLock] as const
      : [melodyFocus.focusLock, melodyFocus.focus] as const;
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


