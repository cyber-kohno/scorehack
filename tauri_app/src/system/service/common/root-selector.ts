import { get } from "svelte/store";
import { controlStore, derivedStore, inputStore } from "../../store/global-store";

const useRootSelector = () => {

    const control = get(controlStore);
    const input = get(inputStore);
    const cache = get(derivedStore);

    const hasHold = () => {
        return Object.values(input).find(flg => flg) != undefined;
    }

    const getTimelineFocusPos = () => {
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

    return {
        hasHold,
        getTimelineFocusPos
    };
}

export default useRootSelector;
