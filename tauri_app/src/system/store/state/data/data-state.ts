import ArrangeState from "./arrange/arrange-state";
import MelodyState from "./melody-state";
import ElementState from "./element-state";

namespace DataState {

    export type Value = {
        elements: ElementState.Element[];
        scoreTracks: MelodyState.ScoreTrack[];
        audioTracks: MelodyState.AudioTrack[];
        arrange: ArrangeState.DataProps;
    }

    export const INITIAL: Value = {
        elements: ElementState.getInitialElements(),
        scoreTracks: [MelodyState.createMelodyTrackScoreInitial()],
        audioTracks: [],
        arrange: ArrangeState.INITIAL
    }
}
export default DataState;
