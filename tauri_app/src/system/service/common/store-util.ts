import { get } from "svelte/store";
import { controlStore, dataStore, derivedStore, inputStore, refStore } from "../../store/global-store";
import type InputState from "../../store/state/input-state";
import type DerivedState from "../../store/state/derived-state";
import type ControlState from "../../store/state/control-state";
import createMelodyUpdater from "../melody/melody-updater";

namespace StoreUtil {

    export const switchMode = () => {
        const control = get(controlStore);
        const data = get(dataStore);
        const derived = get(derivedStore);
        const ref = get(refStore);
        const mode = control.mode;
        if (mode === 'harmonize') {
            createMelodyUpdater({ control, data }).syncCursorFromElementSeq(derived);
        }
        control.mode = mode === 'harmonize' ? 'melody' : 'harmonize';
        ref.trackArr.forEach(t => t.length = 0);
        controlStore.set({ ...control });
    };

    export const hasHold = (input: InputState.Value) => {
        return Object.values(input).find(flg => flg) != undefined;
    }

    export const setInputHold = (key: keyof InputState.Value, isDown: boolean) => {
        const input = get(inputStore);
        input[key] = isDown;
        inputStore.set({ ...input });
    }

    export const getTimelineFocusPos = (cache: DerivedState.Value, control: ControlState.Value) => {
        let pos = 0;
        const chordSeq = cache.elementCaches[control.outline.focus].lastChordSeq;
        if (chordSeq !== -1) {
            const chordCache = cache.chordCaches[chordSeq];
            pos = chordCache.viewPosLeft + chordCache.viewPosWidth / 2;
        }
        // if(lastStore.control.mode === 'harmonize') {
        // } else {

        // }
        return pos;
    }
}

export default StoreUtil;
