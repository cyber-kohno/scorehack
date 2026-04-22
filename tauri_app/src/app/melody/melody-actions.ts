import useReducerMelody from "./melody-reducer";
import type { StoreProps } from "../../state/root-store";

export const createMelodyActions = (lastStore: StoreProps) => {
  const reducer = useReducerMelody(lastStore);

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
