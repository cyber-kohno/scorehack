import type { StoreProps } from "../store";
import useReducerMelody from "./reducerMelody";

const useReducerRoot = (lastStore: StoreProps) => {

    const reducerMelody = useReducerMelody(lastStore);

    const switchMode = () => {
        const mode = lastStore.control.mode;
        if (mode === 'harmonize') reducerMelody.syncCursorFromElementSeq();
        lastStore.control.mode = mode === 'harmonize' ? 'melody' : 'harmonize';
        lastStore.ref.trackArr.forEach(t => t.length = 0);
    };

    type InputKey = keyof StoreProps['input'];
    const setInputHold = (key: InputKey, isDown: boolean) => {
        lastStore.input[key] = isDown;
    }

    const hasHold = () => {
        return Object.values(lastStore.input).find(flg => flg) != undefined;
    }

    const getTimelineFocusPos = () => {
        let pos = 0;
        const chordSeq = lastStore.cache.elementCaches[lastStore.control.outline.focus].lastChordSeq;
        if (chordSeq !== -1) {
            const chordCache = lastStore.cache.chordCaches[chordSeq];
            pos = chordCache.viewPosLeft + chordCache.viewPosWidth / 2;
        }
        // if(lastStore.control.mode === 'harmonize') {
        // } else {

        // }
        return pos;
    }

    return {
        switchMode,
        setInputHold,
        hasHold,
        getTimelineFocusPos
    };
}

export default useReducerRoot;