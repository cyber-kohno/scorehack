import Layout from "../../layout/layout-constant";
import PianoBackingState from "../../store/state/data/arrange/piano/piano-backing-state";
import MelodyState from "../../store/state/data/melody-state";
import type RefState from "../../store/state/ref-state";
import type { StoreProps } from "../../store/store";
import ArrangeUtil from "../arrange/arrangeUtil";
import { get } from "svelte/store";
import { controlStore, dataStore, derivedStore, refStore, settingsStore, terminalStore } from "../../store/global-store";

const useReducerRef = () => {
    const control = get(controlStore);
    const ref = get(refStore);
    const cache = get(derivedStore);
    const terminal = get(terminalStore);
    const settings = get(settingsStore);
    const timerKeys = ref.timerKeys;

    const reducerArrange = ArrangeUtil.useReducer(control, get(dataStore));

    const smoothScroll = (
        refs: HTMLElement[],
        target: 'scrollLeft' | 'scrollTop',
        divCnt: number,
        nextValue: number
    ) => {
        const getTargetKey = (ref: HTMLElement) => ref.className + target;

        const include = (key: RefState.RefTimerKey) => refs
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

        if (ref.grid && ref.header) {
            const gridRef = ref.grid;
            const headerRef = ref.header;
            const width = gridRef.getBoundingClientRect().width;

            const left = getLeft(width);
            smoothScrollLeft([gridRef, headerRef], left);
        }
    }

    const adjustGridScrollY = (getTop: ((height: number) => number)) => {
        if (ref.grid && ref.pitch) {
            const gridRef = ref.grid;
            const pitchRef = ref.pitch;
            const height = gridRef.getBoundingClientRect().height;

            const top = getTop(height);
            // gridRef.scrollTo({ top, behavior: "smooth" });
            // pitchRef.scrollTo({ top, behavior: "smooth" });
            smoothScrollTop([gridRef, pitchRef], top);
        }
    }

    const adjustGridScrollXFromNote = (note: MelodyState.Note) => {
        const [pos, len] = [note.pos, note.len]
            .map(size => MelodyState.calcBeat(note.norm, size) * settings.beatWidth);
        adjustGridScrollX((width) => pos + len / 2 - width / 2);
    }

    const adjustGridScrollYFromCursor = (note: MelodyState.Note) => {
        const pos = (Layout.pitch.NUM - note.pitch) * Layout.pitch.ITEM_HEIGHT;
        adjustGridScrollY((height) => pos - height / 2);
    }
    const adjustGridScrollXFromOutline = () => {

        adjustGridScrollX((width) => {
            const focus = control.outline.focus;
            const { lastChordSeq, chordSeq } = cache.elementCaches[focus];
            let pos = 0;
            // 先頭以降�E要素
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

        const outlineRef = ref.outline;
        if (outlineRef) {
            const { height: outlineHeight } = outlineRef.getBoundingClientRect();
            const elementSeq = control.outline.focus;
            const element = cache.elementCaches[elementSeq];
            const elementRef = ref.elementRefs.find(r => r.seq === elementSeq);
            if (elementRef != undefined) {
                const height = elementRef.ref.getBoundingClientRect().height;
                const top = element.outlineTop - outlineHeight / 2 + height / 2;
                // ref.scrollTo({ top, behavior: "smooth" });
                smoothScrollTop([outlineRef], top);
            }
        }
    }
    const adjustHelperScroll = () => {

        const helperRef = ref.helper;
        const helper = terminal?.helper;
        if (helperRef && helper != null) {
            const { height: frameHeight } = helperRef.getBoundingClientRect();
            const itemTop = helper.focus * 26;
            const top = itemTop - frameHeight / 2;
            // ref.scrollTo({ top, behavior: "smooth" });
            smoothScrollTop([helperRef], top);
        }
    }
    const adjustTerminalScroll = () => {
        const terminalRef = ref.terminal;
        if (terminalRef) {
            const top = terminalRef.scrollHeight;
            // ref.scrollTo({ top, behavior: "smooth" });
            smoothScrollTop([terminalRef], top);

        }
    }

    const resetScoreTrackRef = () => {
        ref.trackArr.forEach(arr => {
            arr.length = 0;
        })
    }

    const adjustPEBScrollCol = () => {

        const getColWidth = (col: PianoBackingState.Col) => {
            return PianoBackingState.getColWidthCriteriaBeatWidth(
                col,
                Layout.arrange.piano.DIV1_WIDTH
            );
        };
        const backing = reducerArrange.getPianoEditor().backing;
        const pianoRef = ref.arrange.piano;
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
