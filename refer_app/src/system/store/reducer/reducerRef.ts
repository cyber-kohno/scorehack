import Layout from "../../const/layout";
import StorePianoBacking from "../props/arrange/piano/storePianoBacking";
import StoreMelody from "../props/storeMelody";
import type StoreRef from "../props/storeRef";
import type { StoreProps } from "../store";
import ArrangeUtil from "./arrangeUtil";

const useReducerRef = (lastStore: StoreProps) => {

    const timerKeys = lastStore.ref.timerKeys;

    const reducerArrange = ArrangeUtil.useReducer(lastStore);

    const smoothScroll = (
        refs: HTMLElement[],
        target: 'scrollLeft' | 'scrollTop',
        divCnt: number,
        nextValue: number
    ) => {
        const getTargetKey = (ref: HTMLElement) => ref.className + target;

        const include = (key: StoreRef.RefTimerKey) => refs
            .map(r => getTargetKey(r)).includes(key.target);

        timerKeys.forEach(key => {
            if (include(key)) clearTimeout(key.id);
        });
        const next = timerKeys.filter(key => !include(key));
        // console.log(`next${next.length}, timerKeys${timerKeys.length}`);
        timerKeys.length = 0;
        timerKeys.push(...next);

        refs.forEach((ref, i) => {
            const isCriteria = i === 0;
            const divVal = (nextValue - ref[target]) / divCnt;
            for (let j = 0; j < divCnt; j++) {
                const isTail = j === divCnt - 1;
                const id = setTimeout(() => {
                    if (!isCriteria && isTail) ref[target] = refs[0][target];
                    else ref[target] += divVal;

                }, 10 * j);
                timerKeys.push({ target: getTargetKey(ref), id });
            }
        });
    }
    const smoothScrollLeft = (refs: HTMLElement[], nextValue: number) => {
        smoothScroll(refs, 'scrollLeft', 15, nextValue);
    }
    const smoothScrollTop = (refs: HTMLElement[], nextValue: number) => {
        smoothScroll(refs, 'scrollTop', 15, nextValue);
    }

    const adjustGridScrollX = (getLeft: ((width: number) => number)) => {

        if (lastStore.ref.grid && lastStore.ref.header) {
            const gridRef = lastStore.ref.grid;
            const headerRef = lastStore.ref.header;
            const width = gridRef.getBoundingClientRect().width;

            const left = getLeft(width);
            smoothScrollLeft([gridRef, headerRef], left);
        }
    }

    const adjustGridScrollY = (getTop: ((height: number) => number)) => {
        if (lastStore.ref.grid && lastStore.ref.pitch) {
            const gridRef = lastStore.ref.grid;
            const pitchRef = lastStore.ref.pitch;
            const height = gridRef.getBoundingClientRect().height;

            const top = getTop(height);
            // gridRef.scrollTo({ top, behavior: "smooth" });
            // pitchRef.scrollTo({ top, behavior: "smooth" });
            smoothScrollTop([gridRef, pitchRef], top);
        }
    }

    const adjustGridScrollXFromNote = (note: StoreMelody.Note) => {
        const [pos, len] = [note.pos, note.len]
            .map(size => StoreMelody.calcBeat(note.norm, size) * lastStore.env.beatWidth);
        adjustGridScrollX((width) => pos + len / 2 - width / 2);
    }

    const adjustGridScrollYFromCursor = (note: StoreMelody.Note) => {
        const pos = (Layout.pitch.NUM - note.pitch) * Layout.pitch.ITEM_HEIGHT;
        adjustGridScrollY((height) => pos - height / 2);
    }
    const adjustGridScrollXFromOutline = () => {

        adjustGridScrollX((width) => {
            const focus = lastStore.control.outline.focus;
            const cache = lastStore.cache;
            const { lastChordSeq, chordSeq } = cache.elementCaches[focus];
            let pos = 0;
            // 先頭以降の要素
            if (lastChordSeq !== -1) {
                const chordCache = cache.chordCaches[lastChordSeq];

                // コード要素
                if (chordSeq !== -1) {
                    pos = chordCache.viewPosLeft + chordCache.viewPosWidth / 2 - width / 2;
                } else {
                    pos = chordCache.viewPosLeft + chordCache.viewPosWidth - width / 2;
                }
            }
            return pos;
        });
    }

    const adjustOutlineScroll = () => {

        const ref = lastStore.ref.outline;
        if (ref) {
            const { height: outlineHeight } = ref.getBoundingClientRect();
            const elementSeq = lastStore.control.outline.focus;
            const element = lastStore.cache.elementCaches[elementSeq];
            const elementRef = lastStore.ref.elementRefs.find(r => r.seq === elementSeq);
            if (elementRef != undefined) {
                const height = elementRef.ref.getBoundingClientRect().height;
                const top = element.outlineTop - outlineHeight / 2 + height / 2;
                // ref.scrollTo({ top, behavior: "smooth" });
                smoothScrollTop([ref], top);
            }
        }
    }
    const adjustHelperScroll = () => {

        const ref = lastStore.ref.helper;
        const helper = lastStore.terminal?.helper;
        if (ref && helper != null) {
            const { height: frameHeight } = ref.getBoundingClientRect();
            const itemTop = helper.focus * 26;
            const top = itemTop - frameHeight / 2;
            // ref.scrollTo({ top, behavior: "smooth" });
            smoothScrollTop([ref], top);
        }
    }
    const adjustTerminalScroll = () => {
        const ref = lastStore.ref.terminal;
        if (ref) {
            const top = ref.scrollHeight;
            // ref.scrollTo({ top, behavior: "smooth" });
            smoothScrollTop([ref], top);

        }
    }

    const resetScoreTrackRef = () => {
        lastStore.ref.trackArr.forEach(arr => {
            arr.length = 0;
        })
    }


    const adjustPEBScrollCol = () => {

        const getColWidth = (col: StorePianoBacking.Col) => {
            return StorePianoBacking.getColWidthCriteriaBeatWidth(
                col,
                Layout.arrange.piano.DIV1_WIDTH
            );
        };
        const backing = reducerArrange.getPianoEditor().backing;
        const pianoRef = lastStore.ref.arrange.piano;
        if (pianoRef.col && pianoRef.table && pianoRef.pedal && backing != null) {
            const width = pianoRef.col.getBoundingClientRect().width;

            const currMiddle = backing.layers[backing.layerIndex].cols
                .reduce((total, cur, i) => {
                    const width = getColWidth(cur);
                    if (i < backing.cursorX) total += width;
                    else if (i === backing.cursorX) total += width / 2;
                    return total;
                }, 0);
            const left = currMiddle - width / 2
            smoothScrollLeft([pianoRef.col, pianoRef.table, pianoRef.pedal], left);
        }
    }

    return {
        adjustGridScrollXFromOutline,
        adjustOutlineScroll,
        adjustGridScrollXFromNote,
        adjustGridScrollYFromCursor,
        adjustTerminalScroll,
        adjustHelperScroll,
        resetScoreTrackRef,
        adjustPEBScrollCol
    };
};

export default useReducerRef;