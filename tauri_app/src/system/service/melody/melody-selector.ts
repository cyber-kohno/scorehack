import type ControlState from "../../store/state/control-state";
import type DataState from "../../store/state/data/data-state";

type Context = {
    control: ControlState.Value;
    data: DataState.Value;
};

const useMelodySelector = (ctx: Context) => {
    const { control, data } = ctx;

    const getCurrScoreTrack = () => {
        const melody = control.melody;
        return data.scoreTracks[melody.trackIndex];
    }

    const getFocusNote = () => {
        const melody = control.melody;
        return getCurrScoreTrack().notes[melody.focus];
    }

    const getFocusRange = () => {
        const melody = control.melody;
        if (melody.focusLock === -1) return [melody.focus, melody.focus];
        return melody.focus < melody.focusLock
            ? [melody.focus, melody.focusLock]
            : [melody.focusLock, melody.focus];
    };

    return {
        getCurrScoreTrack,
        getFocusNote,
        getFocusRange
    };
};
export default useMelodySelector;
