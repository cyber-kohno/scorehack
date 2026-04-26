import { getContext, setContext } from "svelte";
import { derived, type Readable } from "svelte/store";
import store from "./store";
import type PianoBackingState from "./state/data/arrange/piano/piano-backing-state";
import type PianoEditorState from "./state/data/arrange/piano/piano-editor-state";
import type ArrangeState from "./state/data/arrange/arrange-state";

namespace ContextUtil {

    // キーと型のマップを定義
    type ContextMap = {
        isPreview: () => boolean;
        preview: boolean;

        arrange: ArrangeState.EditorProps;
        pianoEditor: PianoEditorState.Props;
        backingProps: {
            backing: PianoBackingState.EditorProps,
            getCurLayer: () => PianoBackingState.Layer,
            getBackLayer: () => PianoBackingState.Layer,
            getColWidth: (col: PianoBackingState.Col) => number
            getColFrameWidth: () => number
        }
    };

    type Keys = keyof ContextMap; // キーの型を取得

    export const set = <K extends Keys>(key: K, value: ContextMap[K]) => {
        // console.log(`set: [${key}]`);
        const readableValue = derived(store, () => value)
        setContext(key, readableValue);
    };

    export const get = <K extends Keys>(key: K): Readable<ContextMap[K]> => {
        // console.log(`get: [${key}]`);
        const value = getContext<Readable<ContextMap[K]>>(key);
        if (value == undefined) throw new Error(`key: [${key}]が取得できない。`);
        return value;
    };
}
export default ContextUtil;
