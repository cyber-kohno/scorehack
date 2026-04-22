import Layout from "../../styles/tokens/layout-tokens";
import type { InputCallbacks } from "../../state/session-state/input-store";
import StoreMelody from "../../domain/melody/melody-store";
import useReducerMelody from "./melody-reducer";
import { createOutlineActions } from "../../app/outline/outline-actions";
import { adjustOutlineScroll } from "../../app/outline/outline-scroll";
import { getMelodyCursorState } from "../../app/melody/melody-cursor-state";
import {
  adjustTimelineScrollXFromMelodyNote,
  adjustTimelineScrollYFromMelodyNote,
} from "../../app/melody/melody-scroll";
import { createPlaybackActions } from "../../app/playback/playback-actions";
import { getBeatNoteTail } from "../../state/cache-state/cache-store";
import { getTimelineCurrentBaseCache } from "../../state/cache-state/timeline-cache";
import {
  isPlaybackActive,
} from "../../state/ui-state/playback-ui-store";
import { getMelodyFocusState } from "../../state/session-state/melody-focus-store";
import {
  getMelodyClipboardState,
} from "../../state/session-state/melody-clipboard-store";
import {
  getMelodyOverlapState,
  setMelodyOverlapState,
} from "../../state/session-state/melody-overlap-store";
import type { StoreUtil } from "../../state/root-store";
import { playMelodyPreviewPitch } from "./melody-audition";
import {
  copyFocusedMelodyNotes,
  pasteMelodyClipboardNotesAtCursor,
} from "./melody-clipboard-actions";
import {
  getFocusedMelodyNote,
  isMelodyCursorFocus,
  moveMelodyFocus,
  moveMelodyPitch,
} from "./melody-focus-actions";
import {
  moveMelodyPitchRange,
  moveScaleLockedMelodyPitch,
  moveScaleLockedMelodyPitchRange,
} from "./melody-pitch-actions";
import {
  focusInNearMelodyNote,
  focusOutMelodyNoteSide,
  moveMelodyFocusRange,
  removeFocusedMelodyNote,
} from "./melody-range-focus-actions";
import { scaleFocusedMelodyNoteLength } from "./melody-length-actions";
import {
  moveFocusedMelodyNoteHorizontally,
  moveMelodyCursorSpace,
  moveMelodyNoteRangeHorizontally,
} from "./melody-horizontal-actions";

const useInputMelody = (storeUtil: StoreUtil) => {
  const { lastStore, commit } = storeUtil;

  const reducerOutline = createOutlineActions(lastStore);
  const reducerMelody = useReducerMelody(lastStore);
  const { startPreview, stopPreview } = createPlaybackActions(storeUtil);

  const melodyFocus = getMelodyFocusState();
  const melodyClipboard = getMelodyClipboardState();

  const commitMelodyChange = () => {
    commit();
  };

  const commitAfterPitchChange = (note: StoreMelody.Note) => {
    adjustTimelineScrollYFromMelodyNote(lastStore, note);
    commit();
  };

  const commitAfterHorizontalMelodyChange = (note: StoreMelody.Note) => {
    adjustTimelineScrollXFromMelodyNote(lastStore, note);
    adjustOutlineScroll(lastStore);
    commit();
  };

  const commitAfterCursorMove = (cursor: StoreMelody.Note) => {
    adjustTimelineScrollXFromMelodyNote(lastStore, cursor);
    reducerOutline.syncChordSeqFromNote(cursor);
    adjustOutlineScroll(lastStore);
    reducerMelody.judgeOverlap();
    commit();
  };

  const isCursor = () => isMelodyCursorFocus(melodyFocus);
  const getFocusNote = () =>
    getFocusedMelodyNote(reducerMelody.getCurrScoreTrack(), melodyFocus);

  const movePitch = (note: StoreMelody.Note, dir: number) => {
    moveMelodyPitch({
      note,
      dir,
      maxPitch: Layout.pitch.NUM - 1,
      onPreviewPitch: (pitchIndex) =>
        playMelodyPreviewPitch(lastStore, pitchIndex),
      onPitchMoved: commitAfterPitchChange,
    });
  };

  const notes = reducerMelody.getCurrScoreTrack().notes;
  const moveFocus = (dir: -1 | 1) => {
    moveMelodyFocus({
      track: reducerMelody.getCurrScoreTrack(),
      focusState: melodyFocus,
      dir,
      onFocusMoved: (note) => {
        reducerOutline.syncChordSeqFromNote(note);
        adjustTimelineScrollXFromMelodyNote(lastStore, note);
        adjustTimelineScrollYFromMelodyNote(lastStore, note);
      },
    });
  };

  const isPreview = isPlaybackActive();

  const control = (eventKey: string) => {
    const cursor = getMelodyCursorState(lastStore);

    const changeCursorDiv = (div: number) => {
      const prev = cursor.norm.div;
      const rate = div / prev;
      cursor.norm.div = div;
      cursor.norm.tuplets = undefined;
      cursor.pos = Math.floor(cursor.pos * rate);

      reducerMelody.judgeOverlap();
      commitMelodyChange();
    };

    if (isPreview) {
      switch (eventKey) {
        case " ":
          stopPreview();
      }

      return;
    }

    switch (eventKey) {
      case " ":
        startPreview({ target: "all" });
    }
    if (isCursor()) {
      const moveCursor = (dir: -1 | 1) => {
        const temp = cursor.pos + dir;
        const [tempPos, tempLen] = [temp, cursor.len].map((size) =>
          StoreMelody.calcBeat(cursor.norm, size),
        );
        const tailBeatNote = getBeatNoteTail(lastStore);
        if (tempPos < 0 || tempPos + tempLen > tailBeatNote) return;
        cursor.pos = temp;
        commitAfterCursorMove(cursor);
      };
      switch (eventKey) {
        case "ArrowLeft":
          moveCursor(-1);
          break;
        case "ArrowRight":
          moveCursor(1);
          break;
        case "1": {
          changeCursorDiv(4);
          break;
        }
        case "2": {
          changeCursorDiv(2);
          break;
        }
        case "3": {
          changeCursorDiv(1);
          break;
        }
        case "ArrowUp":
          movePitch(cursor, 1);
          break;
        case "ArrowDown":
          movePitch(cursor, -1);
          break;

        case "a": {
          if (!getMelodyOverlapState()) {
            reducerMelody.addNoteFromCursor();
            reducerMelody.focusInNearNote(1);
            playMelodyPreviewPitch(lastStore, getFocusNote().pitch);
            commitMelodyChange();
          }
          break;
        }
      }
    } else {
      const changeFocusNoteDiv = (div: number) => {
        const note = getFocusNote();
        const prev = note.norm.div;
        const rate = div / prev;
        const tempPos = note.pos * rate;
        const tempLen = note.len * rate;
        if (!Number.isInteger(tempPos) || !Number.isInteger(tempLen)) return;
        note.norm.div = div;
        note.pos = tempPos;
        note.len = tempLen;
        commitMelodyChange();
      };

      const moveFocusNormal = (dir: -1 | 1) => {
        moveFocus(dir);
        melodyFocus.focusLock = -1;
        const note = getFocusNote();
        playMelodyPreviewPitch(lastStore, note.pitch);
        commitMelodyChange();
      };

      const movePitchFocusNotes = (dir: -1 | 1) => {
        if (melodyFocus.focusLock === -1) movePitch(getFocusNote(), dir);
        else {
          const [start, end] = reducerMelody.getFocusRange();
          notes.slice(start, end + 1).forEach((n) => {
            n.pitch += dir;
          });
          commitAfterPitchChange(getFocusNote());
        }
      };
      switch (eventKey) {
        case "ArrowLeft":
          moveFocusNormal(-1);
          break;
        case "ArrowRight":
          moveFocusNormal(1);
          break;
        case "ArrowUp":
          movePitchFocusNotes(1);
          break;
        case "ArrowDown":
          movePitchFocusNotes(-1);
          break;
        case "Delete": {
          const [start, end] = reducerMelody.getFocusRange();
          reducerMelody.focusOutNoteSide(notes[start], -1);
          notes.splice(start, end - start + 1);
          setMelodyOverlapState(false);
          melodyFocus.focusLock = -1;
          commitMelodyChange();
          break;
        }
        case "a": {
          const tempNote: StoreMelody.Note = JSON.parse(JSON.stringify(getFocusNote()));
          tempNote.pos += tempNote.len;
          tempNote.len = 1;
          if (!notes.find((n) => StoreMelody.judgeOverlapNotes(n, tempNote))) {
            reducerMelody.addNote(tempNote);
            StoreMelody.normalize(getFocusNote());
            melodyFocus.focus++;

            const note = getFocusNote();
            reducerOutline.syncChordSeqFromNote(note);
            adjustTimelineScrollXFromMelodyNote(lastStore, note);
            playMelodyPreviewPitch(lastStore, note.pitch);
            commitMelodyChange();
          }
          break;
        }
        case "1": {
          changeFocusNoteDiv(4);
          break;
        }
        case "2": {
          changeFocusNoteDiv(2);
          break;
        }
        case "3": {
          changeFocusNoteDiv(1);
          break;
        }
      }
    }
  };

  const getHoldCallbacks = (eventKey: string): InputCallbacks => {
    const callbacks: InputCallbacks = {};
    const cursor = getMelodyCursorState(lastStore);
    const notes = reducerMelody.getCurrScoreTrack().notes;

    const moveLen = (n: StoreMelody.Note, len: StoreMelody.Note) => {
      const dir = len.pos;
      if (n.norm.div >= len.norm.div) {
        const tuplets = n.norm.tuplets ?? 1;
        const rate = (n.norm.div * tuplets) / len.norm.div;
        n.pos += dir * rate;
      } else {
        const rate = len.norm.div / n.norm.div;
        n.norm.div = len.norm.div;
        n.pos *= rate;
        n.len *= rate;
        n.pos += dir;
      }
    };

    callbacks.holdX = () => {
      if (isCursor()) {
        switch (eventKey) {
          case "ArrowUp":
            movePitch(cursor, 12);
            break;
          case "ArrowDown":
            movePitch(cursor, -12);
            break;
        }
      } else {
        if (melodyFocus.focusLock === -1) {
          switch (eventKey) {
            case "ArrowUp":
              movePitch(getFocusNote(), 12);
              break;
            case "ArrowDown":
              movePitch(getFocusNote(), -12);
              break;
          }
        } else {
          const movePitchRange = (dir: number) => {
            const [start, end] = reducerMelody.getFocusRange();
            moveMelodyPitchRange({
              targets: notes.slice(start, end + 1),
              dir,
              onPitchMoved: () => {
                commitAfterPitchChange(getFocusNote());
              },
            });
          };
          switch (eventKey) {
            case "ArrowUp":
              movePitchRange(12);
              break;
            case "ArrowDown":
              movePitchRange(-12);
              break;
          }
        }
      }
    };

    callbacks.holdE = () => {
      const focusInNearNote = (dir: -1 | 1) => {
        focusInNearMelodyNote({
          focusState: melodyFocus,
          dir,
          onFocusChanged: () => reducerMelody.focusInNearNote(dir),
        });
        commitMelodyChange();
      };
      const focusOutNoteSide = (dir: -1 | 1) => {
        focusOutMelodyNoteSide({
          focusState: melodyFocus,
          dir,
          onFocusChanged: () =>
            reducerMelody.focusOutNoteSide(getFocusNote(), dir),
        });
        commitMelodyChange();
      };

      if (isCursor()) {
        switch (eventKey) {
          case "ArrowLeft":
            focusInNearNote(-1);
            break;
          case "ArrowRight":
            focusInNearNote(1);
            break;
        }
      } else {
        switch (eventKey) {
          case "ArrowLeft":
            focusOutNoteSide(-1);
            break;
          case "ArrowRight":
            focusOutNoteSide(1);
            break;
          case "Delete": {
            const removed = removeFocusedMelodyNote({
              track: reducerMelody.getCurrScoreTrack(),
              focusState: melodyFocus,
            });
            if (removed) {
              commitMelodyChange();
            }
            break;
          }
        }
      }
    };

    callbacks.holdF = () => {
      if (!isCursor()) {
        const focusNotes = reducerMelody.getCurrScoreTrack().notes;

        const scaleNote = (note: StoreMelody.Note, dir: -1 | 1) => {
          const scaled = scaleFocusedMelodyNoteLength({
            note,
            dir,
            focusState: melodyFocus,
            trackNotes: focusNotes,
            onLengthChanged: (changedNote) => {
              adjustTimelineScrollXFromMelodyNote(lastStore, changedNote);
            },
          });
          if (scaled) {
            commitMelodyChange();
          }
        };
        switch (eventKey) {
          case "ArrowLeft":
            scaleNote(getFocusNote(), -1);
            break;
          case "ArrowRight":
            scaleNote(getFocusNote(), 1);
            break;
        }
      }
    };

    callbacks.holdD = () => {
      if (!isCursor()) {
        if (melodyFocus.focusLock === -1) {
          const moveNote = (dir: -1 | 1) => {
            moveFocusedMelodyNoteHorizontally({
              note: getFocusNote(),
              dir,
              focusState: melodyFocus,
              trackNotes: notes,
              onMoved: (note) => {
                reducerOutline.syncChordSeqFromNote(note);
                commitAfterHorizontalMelodyChange(note);
              },
            });
          };
          switch (eventKey) {
            case "ArrowLeft":
              moveNote(-1);
              break;
            case "ArrowRight":
              moveNote(1);
              break;
          }
        } else {
          const moveRangeNotes = (dir: 1 | -1) => {
            const [start, end] = reducerMelody.getFocusRange();
            const criteria = getFocusNote();
            moveMelodyNoteRangeHorizontally({
              trackNotes: notes,
              focusState: melodyFocus,
              start,
              end,
              criteria,
              dir,
              beatNoteTail: getBeatNoteTail(lastStore),
              move: (note) => {
                moveLen(note, { ...criteria, pos: dir });
              },
              onMoved: (note) => {
                reducerOutline.syncChordSeqFromNote(note);
                commitAfterHorizontalMelodyChange(note);
              },
            });
          };
          switch (eventKey) {
            case "ArrowLeft":
              moveRangeNotes(-1);
              break;
            case "ArrowRight":
              moveRangeNotes(1);
              break;
          }
        }
      } else {
        const moveSpace = (dir: 1 | -1) => {
          moveMelodyCursorSpace({
            cursor,
            dir,
            trackNotes: notes,
            beatNoteTail: getBeatNoteTail(lastStore),
            onMoved: () => {
              commitMelodyChange();
            },
          });
        };
        switch (eventKey) {
          case "ArrowLeft":
            moveSpace(-1);
            break;
          case "ArrowRight":
            moveSpace(1);
            break;
        }
      }
    };

    callbacks.holdC = () => {
      const tonality = getTimelineCurrentBaseCache(lastStore)?.scoreBase.tonality;
      if (tonality == undefined) return;

      const movePitchLockScale = (note: StoreMelody.Note, dir: -1 | 1) => {
        moveScaleLockedMelodyPitch({
          note,
          dir,
          tonality,
          maxPitch: Layout.pitch.NUM - 1,
          onPreviewPitch: (pitchIndex) =>
            playMelodyPreviewPitch(lastStore, pitchIndex),
          onPitchMoved: commitAfterPitchChange,
        });
      };
      if (isCursor()) {
        switch (eventKey) {
          case "ArrowUp":
            movePitchLockScale(cursor, 1);
            break;
          case "ArrowDown":
            movePitchLockScale(cursor, -1);
            break;
        }
      } else {
        if (melodyFocus.focusLock === -1) {
          switch (eventKey) {
            case "ArrowUp":
              movePitchLockScale(getFocusNote(), 1);
              break;
            case "ArrowDown":
              movePitchLockScale(getFocusNote(), -1);
              break;
          }
        } else {
          const movePitchLockScaleRange = (dir: -1 | 1) => {
            const [start, end] = reducerMelody.getFocusRange();
            moveScaleLockedMelodyPitchRange({
              targets: notes.slice(start, end + 1),
              dir,
              tonality,
              onPitchMoved: () => {
                commitAfterPitchChange(getFocusNote());
              },
            });
          };
          switch (eventKey) {
            case "ArrowUp":
              movePitchLockScaleRange(1);
              break;
            case "ArrowDown":
              movePitchLockScaleRange(-1);
              break;
          }
        }
      }
    };

    callbacks.holdShift = () => {
      const changeCursorTuplets = (tuplets: number) => {
        if (![1, 2].includes(cursor.norm.div)) return;
        const prev = cursor.norm.tuplets ?? 1;
        if (prev === tuplets) tuplets = 1;
        const rate = tuplets / prev;
        cursor.norm.tuplets = tuplets;
        cursor.pos = Math.floor(cursor.pos * rate);

        if (cursor.norm.tuplets === 1) cursor.norm.tuplets = undefined;
        reducerMelody.judgeOverlap();
        commitMelodyChange();
      };
      if (isCursor()) {
        switch (eventKey) {
          case "#":
            changeCursorTuplets(3);
            break;
        }
      } else {
        const moveFocusRange = (dir: -1 | 1) => {
          moveMelodyFocusRange({
            focusState: melodyFocus,
            dir,
            onFocusMoved: moveFocus,
          });
          commitMelodyChange();
        };
        switch (eventKey) {
          case "ArrowLeft":
            moveFocusRange(-1);
            break;
          case "ArrowRight":
            moveFocusRange(1);
            break;
        }
      }
    };

    callbacks.holdCtrl = () => {
      const track = reducerMelody.getCurrScoreTrack();

      switch (eventKey) {
        case "a": {
          break;
        }
        case "c": {
          copyFocusedMelodyNotes(track, melodyFocus);
          melodyFocus.focusLock = -1;
          commitMelodyChange();
          break;
        }
        case "v": {
          const pasted = pasteMelodyClipboardNotesAtCursor({
            track,
            cursor,
            clipboardNotes: melodyClipboard.notes,
            focusState: melodyFocus,
            moveLen,
          });
          if (pasted) {
            commitMelodyChange();
          }
          break;
        }
      }
    };
    return callbacks;
  };

  return {
    control,
    getHoldCallbacks,
  };
};
export default useInputMelody;




