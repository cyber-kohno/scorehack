import MelodyState from "../../store/state/data/melody-state";
import type ControlState from "../../store/state/control-state";
import type DataState from "../../store/state/data/data-state";

const useMelodySelector = (lastControlStore: ControlState.Value, lastDataStore: DataState.Value) => {

    const getCurrScoreTrack = () => {
        const melody = lastControlStore.melody;
        return lastDataStore.scoreTracks[melody.trackIndex];
    }

    const judgeOverlap = () => {
        const melody = lastControlStore.melody;
        const track = getCurrScoreTrack();
        const overlapNote = track.notes.find(n => {
            return MelodyState.judgeOverlapNotes(n, melody.cursor);
        });
        melody.isOverlap = overlapNote != undefined;
    }

    const getFocusRange = () => {
        const melody = lastControlStore.melody;
        if (melody.focusLock === -1) return [melody.focus, melody.focus];
        return melody.focus < melody.focusLock
            ? [melody.focus, melody.focusLock]
            : [melody.focusLock, melody.focus];
    };

    return {
        getCurrScoreTrack,
        judgeOverlap,
        getFocusRange
    };
};
export default useMelodySelector;
