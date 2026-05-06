import type ArrangeState from "./data/arrange/arrange-state";
import MelodyState from "./data/melody-state";
import ElementState from "./data/element-state";

namespace ControlState {

    export type Value = {
        mode: "harmonize" | "melody";
        outline: OutlineValue;
        melody: MelodyValue;
    }

    export type OutlineValue = {
        focus: number;
        focusLock: number;
        trackIndex: number;
        arrange: null | ArrangeState.EditorProps;
    }

    export const OUTLINE_INITIAL: OutlineValue = {
        focus: 1,
        focusLock: -1,
        trackIndex: 0,
        arrange: null
    };


    export type MelodyValue = {
        trackIndex: number;

        cursor: MelodyState.Note;
        isOverlap: boolean;
        focus: number;
        focusLock: number;
        clipboard: {
            notes: MelodyState.Note[] | null;
        };
    };

    export const MELODY_INITIAL: MelodyValue = {
        cursor: {
            norm: { div: 1 },
            pos: 0,
            len: 1,
            pitch: 42,
        },
        focus: -1,
        focusLock: -1,
        isOverlap: false,
        trackIndex: 0,
        clipboard: { notes: null },
    };

    export const INITIAL: Value = {
        mode: "harmonize",
        outline: OUTLINE_INITIAL,
        melody: MELODY_INITIAL
    }

}

export default ControlState;
