import StoreArrange from "./arrange/storeArrange";
import StoreMelody from "./storeMelody";
import StoreOutline from "./storeOutline";

namespace StoreData {

    export type Props = {
        elements: StoreOutline.Element[];
        scoreTracks: StoreMelody.ScoreTrack[];
        audioTracks: StoreMelody.AudioTrack[];
        arrange: StoreArrange.DataProps;
    }

    export const INITIAL: Props = {
        elements: StoreOutline.getInitialElements(),
        scoreTracks: [StoreMelody.createMelodyTrackScoreInitial()],
        audioTracks: [],
        arrange: StoreArrange.INITIAL
    }
}
export default StoreData;