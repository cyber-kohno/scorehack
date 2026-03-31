import { getContext, setContext } from "svelte";
import { derived, type Readable } from "svelte/store";
import store from "./store";
import type StorePianoBacking from "./props/arrange/piano/storePianoBacking";
import type StorePianoEditor from "./props/arrange/piano/storePianoEditor";
import type StoreArrange from "./props/arrange/storeArrange";
import type StoreRef from "./props/storeRef";

namespace ContextUtil {

    // キーと型のマップを定義
    type ContextMap = {
        isPreview: () => boolean;
        preview: boolean;

        arrange: StoreArrange.EditorProps;
        pianoEditor: StorePianoEditor.Props;
        backingProps: {
            backing: StorePianoBacking.EditorProps,
            getCurLayer: () => StorePianoBacking.Layer,
            getBackLayer: () => StorePianoBacking.Layer,
            getColWidth: (col: StorePianoBacking.Col) => number
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