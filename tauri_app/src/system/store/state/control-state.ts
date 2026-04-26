import MelodyState from "./data/melody-state";
import OutlineState from "./data/outline-state";

namespace ControlState {
    export type Value = {
        mode: "harmonize" | "melody";
        outline: OutlineState.Value;
        melody: MelodyState.Value;
    }

    export const INITIAL: Value = {
        mode: "harmonize",
        outline: OutlineState.INITIAL,
        melody: MelodyState.INITIAL
    }
}

export default ControlState;
