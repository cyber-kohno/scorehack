import Layout from "../../layout/layout-constant";
import PianoBackingState from "../../store/state/data/arrange/piano/piano-backing-state";
import MelodyState from "../../store/state/data/melody-state";
import type ControlState from "../../store/state/control-state";
import type DataState from "../../store/state/data/data-state";
import type DerivedState from "../../store/state/derived-state";
import type RefState from "../../store/state/ref-state";
import type SettingsState from "../../store/state/settings-state";
import type TerminalState from "../../store/state/terminal-state";
import createArrangeSelector from "../arrange/arrange-selector";
import ArrangeTimelineNoteResolver from "../arrange/arrange-timeline-note-resolver";
import { get } from "svelte/store";
import { controlStore, dataStore, derivedStore, refStore, settingsStore, terminalStore } from "../../store/global-store";

type Context = {
    control: ControlState.Value;
    data: DataState.Value;
    derived: DerivedState.Value;
    ref: RefState.Value;
    settings: SettingsState.Value;
    terminal: TerminalState.Value | null;
    commitRef: () => void;
};

const createDefaultContext = (): Context => {
    const ref = get(refStore);
    return {
        control: get(controlStore),
        data: get(dataStore),
        derived: get(derivedStore),
        ref,
        settings: get(settingsStore),
        terminal: get(terminalStore),
        commitRef: () => refStore.set({ ...ref }),
    };
};

const useScrollService = (ctx: Context = createDefaultContext()) => {
    const { control, data, derived, ref, settings, terminal } = ctx;
    const update = ctx.commitRef;
    const timerKeys = ref.timerKeys;

    const arrangeSelector = createArrangeSelector({ control, data });

    const getScrollTimerKey = (ref: HTMLElement, target: 'scrollLeft' | 'scrollTop') => ref.className + target;

    const clearScrollTimers = (refs: HTMLElement[], target: 'scrollLeft' | 'scrollTop') => {
        const targets = refs.map(r => getScrollTimerKey(r, target));
        timerKeys.forEach(key => {
            if (targets.includes(key.target)) clearTimeout(key.id);
        });

        const next = timerKeys.filter(key => !targets.includes(key.target));
        timerKeys.length = 0;
        timerKeys.push(...next);
    };

    const smoothScroll = (
        refs: HTMLElement[],
        target: 'scrollLeft' | 'scrollTop',
        divCnt: number,
        nextValue: number
    ) => {
        clearScrollTimers(refs, target);

        refs.forEach((ref, i) => {
            const isCriteria = i === 0;
            const divVal = (nextValue - ref[target]) / divCnt;
            for (let j = 0; j < divCnt; j++) {
                const isTail = j === divCnt - 1;
                const id = setTimeout(() => {
                    if (!isCriteria && isTail) ref[target] = refs[0][target];
                    else ref[target] += divVal;

                }, 10 * j);
                timerKeys.push({ target: getScrollTimerKey(ref, target), id });
            }
        });
        update();
    }
    const instantScroll = (
        refs: HTMLElement[],
        target: 'scrollLeft' | 'scrollTop',
        nextValue: number
    ) => {
        clearScrollTimers(refs, target);
        refs.forEach((ref, i) => {
            if (i === 0) ref[target] = nextValue;
            else ref[target] = refs[0][target];
        });
        update();
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

    const adjustGridScrollXInstant = (getLeft: ((width: number) => number)) => {
        if (ref.grid && ref.header) {
            const gridRef = ref.grid;
            const headerRef = ref.header;
            const width = gridRef.getBoundingClientRect().width;
            instantScroll([gridRef, headerRef], 'scrollLeft', getLeft(width));
        }
    }

    const adjustGridScrollYInstant = (getTop: ((height: number) => number)) => {
        if (ref.grid && ref.pitch) {
            const gridRef = ref.grid;
            const pitchRef = ref.pitch;
            const height = gridRef.getBoundingClientRect().height;
            instantScroll([gridRef, pitchRef], 'scrollTop', getTop(height));
        }
    }

    const adjustGridScrollXFromNote = (note: MelodyState.Note) => {
        const [pos, len] = [note.pos, note.len]
            .map(size => MelodyState.calcBeat(note.norm, size) * settings.view.timeline.beatWidth);
        adjustGridScrollX((width) => pos + len / 2 - width / 2);
    }

    const adjustGridScrollYFromCursor = (note: MelodyState.Note) => {
        const pos = (Layout.pitch.NUM - note.pitch) * Layout.pitch.ITEM_HEIGHT;
        adjustGridScrollY((height) => pos - height / 2);
    }
    const adjustGridScrollXFromNoteInstant = (note: MelodyState.Note) => {
        const [pos, len] = [note.pos, note.len]
            .map(size => MelodyState.calcBeat(note.norm, size) * settings.view.timeline.beatWidth);
        adjustGridScrollXInstant((width) => pos + len / 2 - width / 2);
    }

    const adjustGridScrollYFromCursorInstant = (note: MelodyState.Note) => {
        const pos = (Layout.pitch.NUM - note.pitch) * Layout.pitch.ITEM_HEIGHT;
        adjustGridScrollYInstant((height) => pos - height / 2);
    }
    const adjustGridScrollYFromOutlineArrange = () => {
        if (control.mode !== "harmonize") return;

        const element = derived.elementCaches[control.outline.focus];
        if (element == undefined || element.chordSeq === -1) return;

        const track = data.arrange.tracks[control.outline.trackIndex];
        const chordCache = derived.chordCaches[element.chordSeq];
        if (track == undefined || chordCache == undefined) return;

        const notes = ArrangeTimelineNoteResolver.resolveChordTrackNotes(
            track,
            control.outline.trackIndex,
            chordCache,
            derived.baseCaches,
        );
        if (notes.length === 0) return;

        const pitches = notes
            .map(item => item.note.pitch)
            .sort((a, b) => a - b);
        const centerPitch = pitches[Math.floor((pitches.length - 1) / 2)];
        const centerY =
            Layout.pitch.TOP_MARGIN +
            Layout.getPitchTop(centerPitch) +
            Layout.pitch.ITEM_HEIGHT / 2;
        adjustGridScrollY((height) => centerY - height / 2);
    }
    const adjustGridScrollXFromOutline = () => {
        const cache = derived;

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
        const cache = derived;

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
        const backing = arrangeSelector.getPianoEditor().backing;
        const pianoRef = ref.arrange.piano;
        if (pianoRef.col && pianoRef.measure && pianoRef.table && pianoRef.pedal && backing != null) {
            const width = pianoRef.col.getBoundingClientRect().width;

            const currMiddle = backing.layers[backing.layerIndex].cols
                .reduce((total, cur, i) => {
                    const width = getColWidth(cur);
                    if (i < backing.cursorX) total += width;
                    else if (i === backing.cursorX) total += width / 2;
                    return total;
                }, 0);
            const left = currMiddle - width / 2
            smoothScrollLeft([pianoRef.col, pianoRef.measure, pianoRef.table, pianoRef.pedal], left);
        }
    }

    return {
        adjustGridScrollXFromOutline,
        adjustGridScrollYFromOutlineArrange,
        adjustOutlineScroll,
        adjustGridScrollXFromNote,
        adjustGridScrollYFromCursor,
        adjustGridScrollXFromNoteInstant,
        adjustGridScrollYFromCursorInstant,
        adjustTerminalScroll,
        adjustHelperScroll,
        resetScoreTrackRef,
        adjustPEBScrollCol
    };
};

export default useScrollService;
