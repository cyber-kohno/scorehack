namespace TrackManagerState {
    export type Value = {
        focus: number;
    };

    export const createInitial = (focus = 0): Value => ({
        focus,
    });
}

export default TrackManagerState;
