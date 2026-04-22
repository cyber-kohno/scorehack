import useReducerMelody from "./melody-reducer";
import type { RootStoreToken } from "../../state/root-store";

export const createMelodyActions = (rootStoreToken: RootStoreToken) => {
  const reducer = useReducerMelody(rootStoreToken);

  return {
    syncCursorFromElementSeq: reducer.syncCursorFromElementSeq,
    addNote: reducer.addNote,
    addNoteFromCursor: reducer.addNoteFromCursor,
    judgeOverlap: reducer.judgeOverlap,
    focusInNearNote: reducer.focusInNearNote,
    focusOutNoteSide: reducer.focusOutNoteSide,
    getCurrScoreTrack: reducer.getCurrScoreTrack,
    changeScoreTrack: reducer.changeScoreTrack,
    getFocusRange: reducer.getFocusRange,
  };
};
