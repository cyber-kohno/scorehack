import ArrangeState from "./arrange/arrange-state";
import MelodyState from "./melody-state";
import OutlineState from "./outline-state";

namespace DataState {

    export type Value = {
        elements: OutlineState.Element[];
        scoreTracks: MelodyState.ScoreTrack[];
        audioTracks: MelodyState.AudioTrack[];
        arrange: ArrangeState.DataProps;
    }

    export const INITIAL: Value = {
        elements: OutlineState.getInitialElements(),
        scoreTracks: [MelodyState.createMelodyTrackScoreInitial()],
        audioTracks: [],
        arrange: ArrangeState.INITIAL
    }
}
export default DataState;
