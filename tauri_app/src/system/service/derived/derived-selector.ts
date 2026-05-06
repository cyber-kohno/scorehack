
import type DerivedState from "../../store/state/derived-state";
import type ControlState from "../../store/state/control-state";

const useDerivedSelector = (derivedStore: DerivedState.Value, controlStore: ControlState.Value) => {

    const {baseCaches, elementCaches, chordCaches} = derivedStore;
    const {outline} = controlStore;

    const getChordInfoFromElementSeq = (elementSeq: number) => {
        const chordSeq = elementCaches[elementSeq].chordSeq;
        if (chordSeq === -1) throw new Error("elementSeq does not point to a chord.");
        return chordCaches[chordSeq];
    }

    const getChordTail = () => {
        return chordCaches[chordCaches.length - 1];
    }
    const getBeatNoteTail = () => {
        const tail = getChordTail();
        return tail.startBeatNote + tail.lengthBeatNote;
    }
    const getChordBlockRight = () => {
        if (chordCaches.length === 0) return 0;
        const chordCache = chordCaches[chordCaches.length - 1];
        return chordCache.viewPosLeft + chordCache.viewPosWidth;
    }

    const getCurElement = () => {
        const focus = outline.focus;
        if (elementCaches[focus] == undefined) throw new Error("elementCache must exist.");
        return elementCaches[focus];
    }
    const getCurBase = () => {
        const element = getCurElement();
        return baseCaches[element.baseSeq];
    }
    const getBaseFromBeat = (pos: number) => {
        const base = baseCaches.find(b => {
            return b.startBeatNote <= pos && pos < b.startBeatNote + b.lengthBeatNote;
        });
        if (base == undefined) throw new Error();
        return base;
    }
    const getChordFromBeat = (pos: number) => {
        const chord = chordCaches.find(c => {
            return c.startBeatNote <= pos && pos < c.startBeatNote + c.lengthBeatNote;
        });
        if (chord == undefined) throw new Error();
        return chord;
    }
    const getCurChord = () => {
        const element = getCurElement();
        if (element.chordSeq === -1) throw new Error("Current element is not a chord.");
        const chordCache = chordCaches[element.chordSeq];
        return chordCache;
    }

    const getFocusInfo = () => {
        const elementCache = elementCaches[outline.focus];

        const lastChordSeq = elementCache.lastChordSeq;
        const chordSeq = elementCache.chordSeq;
        let left = 0;
        let width = 20;
        let isChord = false;
        if (chordSeq === -1) {

            if (lastChordSeq !== -1) {
                const chordCache = chordCaches[lastChordSeq];
                left = chordCache.viewPosLeft + chordCache.viewPosWidth;
            }
        } else {
            const chordCache = chordCaches[chordSeq];
            left = chordCache.viewPosLeft;
            width = chordCache.viewPosWidth;
            isChord = true;
        }
        return { left, width, isChord };
    }

    return {
        getChordInfoFromElementSeq,
        getBeatNoteTail,
        getChordBlockRight,
        getCurElement,
        getCurBase,
        getCurChord,
        getBaseFromBeat,
        getChordFromBeat,
        getFocusInfo
    };
}

export default useDerivedSelector;
