import { get } from "svelte/store";
import ChordTheory from "../../domain/theory/chord-theory";
import RhythmTheory from "../../domain/theory/rhythm-theory";
import useScrollService from "../../service/common/scroll-service";
import useDerivedSelector from "../../service/derived/derived-selector";
import { createCommitDataAndRecalculate } from "../../service/derived/recalculate-derived";
import createOutlineUpdater from "../../service/outline/outline-updater";
import { controlStore, dataStore, derivedStore, refStore, settingsStore, terminalStore } from "../../store/global-store";
import ElementState from "../../store/state/data/element-state";
import useOutlineSelector from "../../service/outline/outline-selector";
import { createToast } from "../../service/common/toast-service";
import ToastState from "../../store/state/toast-state";

const createContext = () => {
    const control = get(controlStore);
    const data = get(dataStore);
    const derived = get(derivedStore);
    const ref = get(refStore);
    const settings = get(settingsStore);
    const terminal = get(terminalStore);
    const outline = control.outline;

    const commitControl = () => controlStore.set({ ...control });
    const commitData = () => dataStore.set({ ...data });

    return {
        control,
        data,
        derived,
        outline,
        derivedSelector: useDerivedSelector(derived, control),
        outlineSelector: useOutlineSelector({ data, control }),
        outlineUpdater: createOutlineUpdater({ control, data, derived }),
        refUpdater: useScrollService({
            control,
            data,
            derived,
            ref,
            settings,
            terminal,
            commitRef: () => refStore.set({ ...ref }),
        }),
        commitControl,
        commitData,
        commitDataAndRecalculate: createCommitDataAndRecalculate(commitData),
    };
};

const createOutlineActions = () => {
    const getInitialBeat = (ctx: ReturnType<typeof createContext>) => {
        const element = ctx.outlineSelector.getCurrentElement();
        if (element.type === "chord") {
            const data = element.data as ElementState.DataChord;
            return data.beat;
        }

        const scoreBase = ctx.derivedSelector.getCurBase().scoreBase;
        return RhythmTheory.getBarDivBeatCount(scoreBase.ts);
    };

    const insertChord = () => {
        const ctx = createContext();
        const element = ctx.outlineSelector.getCurrentElement();

        if (element.type === "init") return;

        const data: ElementState.DataChord = {
            beat: getInitialBeat(ctx),
            eat: 0,
        };
        ctx.outlineUpdater.insertElement({
            type: "chord",
            data,
        });
        ctx.commitDataAndRecalculate();
    };

    const insertSection = () => {
        const ctx = createContext();
        const data: ElementState.DataSection = {
            name: "section",
        };

        ctx.outlineUpdater.insertElement({
            type: "section",
            data,
        });
        ctx.commitDataAndRecalculate();
    };

    const insertEventMod = () => {
        const ctx = createContext();
        const element = ctx.outlineSelector.getCurrentElement();

        if (element.type === "init") return;

        const data: ElementState.DataModulate = {
            method: "domm",
            val: 1,
        };
        ctx.outlineUpdater.insertElement({
            type: "modulate",
            data,
        });
        ctx.commitDataAndRecalculate();
    };

    const removeFocusElement = () => {
        const ctx = createContext();
        const element = ctx.outlineSelector.getCurrentElement();
        const sectionCount = ctx.data.elements.filter(e => e.type === "section").length;
        const isLastSection = element.type === "section" && sectionCount === 1;

        // 初期値ブロックと、最後の1つのセクションは消せない
        if (element.type === "init" || isLastSection) {
            createToast({ ...ToastState.INITIAL, text: 'test', x: 50, y: 50 });
            return;
        }

        const removed = ctx.outlineUpdater.removeFocusElement();
        if (!removed) return;

        ctx.commitControl();
        ctx.commitDataAndRecalculate();
        ctx.refUpdater.adjustGridScrollXFromOutline();
        ctx.refUpdater.adjustOutlineScroll();
    };

    const moveFocus = (dir: -1 | 1) => {
        const ctx = createContext();
        const moved = ctx.outlineUpdater.moveFocus(dir);

        if (!moved) return;

        ctx.commitControl();
        ctx.refUpdater.adjustGridScrollXFromOutline();
        ctx.refUpdater.adjustOutlineScroll();
    };

    const moveSection = (dir: -1 | 1) => {
        const ctx = createContext();
        const moved = ctx.outlineUpdater.moveSection(dir);

        if (!moved) return;

        ctx.commitControl();
        ctx.refUpdater.adjustGridScrollXFromOutline();
        ctx.refUpdater.adjustOutlineScroll();
    };

    const setDegree = (scaleIndex: number) => {
        const ctx = createContext();
        const element = ctx.outlineSelector.getCurrentElement();

        if (element.type !== "chord") return;

        const chordData: ElementState.DataChord = { ...element.data };
        chordData.degree = ChordTheory.getDiatonicDegreeChord("major", scaleIndex);

        ctx.outlineUpdater.setChordData(chordData);
        ctx.commitDataAndRecalculate();
    };

    const modSymbol = (dir: "prev" | "next" | "lower" | "upper") => {
        const ctx = createContext();
        const element = ctx.outlineSelector.getCurrentElement();

        if (element.type !== "chord") {
            throw new Error("modSymbol requires a chord element.");
        }

        const changed = ctx.outlineUpdater.modSymbol(dir);

        if (!changed) return;

        ctx.commitDataAndRecalculate();
    };

    const modRoot = (dir: -1 | 1) => {
        const ctx = createContext();
        const element = ctx.outlineSelector.getCurrentElement();

        if (element.type !== "chord") {
            throw new Error("modRoot requires a chord element.");
        }

        const changed = ctx.outlineUpdater.modRoot(dir);

        if (!changed) return;

        ctx.commitDataAndRecalculate();
    };

    const modBeat = (dir: -1 | 1) => {
        const ctx = createContext();
        const element = ctx.outlineSelector.getCurrentElement();

        if (element.type !== "chord") {
            throw new Error("modBeat requires a chord element.");
        }

        const changed = ctx.outlineUpdater.modBeat(dir);

        if (!changed) return;

        ctx.commitDataAndRecalculate();
        ctx.refUpdater.adjustGridScrollXFromOutline();
    };

    const modOn = (dir: -1 | 1) => {
        const ctx = createContext();
        const element = ctx.outlineSelector.getCurrentElement();

        if (element.type !== "chord") {
            throw new Error("modOn requires a chord element.");
        }

        const chordData = element.data as ElementState.DataChord;
        const degree = chordData.degree;
        if (degree == undefined) return;

        if (degree.on == undefined) {
            degree.on = ChordTheory.getDegree12Props(dir === 1 ? 0 : 11, dir === -1);
        } else {
            const nextIndex = ChordTheory.getDegree12Index(degree.on) + dir;
            if (nextIndex < 0 || nextIndex > 11) {
                degree.on = undefined;
            } else {
                degree.on = ChordTheory.getDegree12Props(nextIndex, dir === -1);
            }
        }

        ctx.commitDataAndRecalculate();
    };

    const initialTempo = (dir: -1 | 1) => {
        const ctx = createContext();
        const initData = ctx.outlineSelector.getCurrentInitData();
        const nextTempo = initData.tempo + dir;

        if (nextTempo < 1) return;

        initData.tempo = nextTempo;
        ctx.commitDataAndRecalculate();
    };

    const initialScale = () => {
        const ctx = createContext();
        const tonality = ctx.outlineSelector.getCurrentInitData().tonality;
        tonality.scale = tonality.scale === 'major' ? 'minor' : 'major';
        ctx.commitDataAndRecalculate();
    };
    const initialScaleKey = (dir: -1 | 1) => {
        const ctx = createContext();
        const tonality = ctx.outlineSelector.getCurrentInitData().tonality;
        tonality.key12 = (12 + tonality.key12 + dir) % 12;
        ctx.commitDataAndRecalculate();
    };
    const initialTS = (dir: -1 | 1) => {
        const ctx = createContext();
        const initData = ctx.outlineSelector.getCurrentInitData();
        const currentName = RhythmTheory.formatTS(initData.ts);
        const currentIndex = RhythmTheory.TS_DEFS.findIndex(
            ts => RhythmTheory.formatTS(ts) === currentName,
        );

        if (currentIndex === -1) return;

        const nextIndex = (RhythmTheory.TS_DEFS.length + currentIndex + dir) % RhythmTheory.TS_DEFS.length;
        initData.ts = { ...RhythmTheory.TS_DEFS[nextIndex] };
        ctx.commitDataAndRecalculate();
    };

    const insertEventTempo = () => {
        const ctx = createContext();
        const element = ctx.outlineSelector.getCurrentElement();

        if (element.type === "init") return;

        const data: ElementState.DataTempo = {
            method: "addition",
            val: 0,
        };
        ctx.outlineUpdater.insertElement({
            type: "tempo",
            data,
        });
        ctx.commitDataAndRecalculate();
    };

    const insertEventTS = () => {
        const ctx = createContext();
        const element = ctx.outlineSelector.getCurrentElement();

        if (element.type === "init") return;

        const scoreBase = ctx.derivedSelector.getCurBase().scoreBase;
        const data: ElementState.DataTS = {
            newTS: { ...scoreBase.ts },
        };
        ctx.outlineUpdater.insertElement({
            type: "ts",
            data,
        });
        ctx.commitDataAndRecalculate();
    };

    const eventModKind = (dir: -1 | 1) => {
        const ctx = createContext();
        const element = ctx.outlineSelector.getCurrentElement();

        if (element.type !== "modulate") {
            throw new Error("eventModKind requires a modulate element.");
        }

        const data = element.data as ElementState.DataModulate;
        const methods = ElementState.ModulateMedhods;
        const currentIndex = methods.findIndex(method => method === data.method);

        if (currentIndex === -1) return;

        const nextIndex = (methods.length + currentIndex + dir) % methods.length;
        data.method = methods[nextIndex];
        if (data.method === "domm" || data.method === "key") {
            data.val = Math.max(-3, Math.min(3, data.val ?? 0));
        } else {
            data.val = undefined;
        }

        ctx.commitDataAndRecalculate();
    };

    const eventModVal = (dir: -1 | 1) => {
        const ctx = createContext();
        const element = ctx.outlineSelector.getCurrentElement();

        if (element.type !== "modulate") {
            throw new Error("eventModVal requires a modulate element.");
        }

        const data = element.data as ElementState.DataModulate;
        if (data.method !== "domm" && data.method !== "key") return;

        const nextVal = (data.val ?? 0) + dir;
        if (nextVal < -3 || nextVal > 3) return;

        data.val = nextVal;
        ctx.commitDataAndRecalculate();
    };

    const getCurrentTempoEventPrev = (ctx: ReturnType<typeof createContext>) => {
        const tempo = ctx.derived.elementCaches[ctx.outline.focus].tempo;
        if (tempo == undefined) throw new Error("tempo cache must exist.");
        return tempo.prev;
    };

    const getTempoEventNext = (
        prev: number,
        method: ElementState.TempoMedhod,
        val: number,
    ) => {
        switch (method) {
            case "addition": return prev + val;
            case "rate": return Math.floor(prev * (val / 100));
        }
    };

    const eventTempoKind = (dir: -1 | 1) => {
        const ctx = createContext();
        const element = ctx.outlineSelector.getCurrentElement();

        if (element.type !== "tempo") {
            throw new Error("eventTempoKind requires a tempo element.");
        }

        const data = element.data as ElementState.DataTempo;
        const methods = ElementState.TempoMedhods;
        const currentIndex = methods.findIndex(method => method === data.method);

        if (currentIndex === -1) return;

        const nextIndex = (methods.length + currentIndex + dir) % methods.length;
        const nextMethod = methods[nextIndex];
        const nextVal = nextMethod === "rate" ? 100 : 0;

        const prev = getCurrentTempoEventPrev(ctx);
        const nextTempo = getTempoEventNext(prev, nextMethod, nextVal);
        if (nextTempo < 10 || nextTempo > 250) return;

        data.method = nextMethod;
        data.val = nextVal;
        ctx.commitDataAndRecalculate();
    };

    const eventTempoVal = (dir: -1 | 1) => {
        const ctx = createContext();
        const element = ctx.outlineSelector.getCurrentElement();

        if (element.type !== "tempo") {
            throw new Error("eventTempoVal requires a tempo element.");
        }

        const data = element.data as ElementState.DataTempo;
        const prev = getCurrentTempoEventPrev(ctx);
        const nextVal = data.val + dir;
        const nextTempo = getTempoEventNext(prev, data.method, nextVal);

        if (nextTempo < 10 || nextTempo > 250) return;

        data.val = nextVal;
        ctx.commitDataAndRecalculate();
    };

    const eventTS = (dir: -1 | 1) => {
        const ctx = createContext();
        const element = ctx.outlineSelector.getCurrentElement();

        if (element.type !== "ts") {
            throw new Error("eventTS requires a ts element.");
        }

        const data = element.data as ElementState.DataTS;
        const currentName = RhythmTheory.formatTS(data.newTS);
        const currentIndex = RhythmTheory.TS_DEFS.findIndex(
            ts => RhythmTheory.formatTS(ts) === currentName,
        );

        if (currentIndex === -1) return;

        const nextIndex = (RhythmTheory.TS_DEFS.length + currentIndex + dir) % RhythmTheory.TS_DEFS.length;
        data.newTS = { ...RhythmTheory.TS_DEFS[nextIndex] };
        ctx.commitDataAndRecalculate();
    };

    const modEat = (dir: -1 | 1) => {
        const ctx = createContext();
        const element = ctx.outlineSelector.getCurrentElement();

        if (element.type !== "chord") {
            throw new Error("modEat requires a chord element.");
        }

        const changed = ctx.outlineUpdater.modEat(dir);

        if (!changed) return;

        ctx.commitDataAndRecalculate();
        ctx.refUpdater.adjustGridScrollXFromOutline();
    };

    const moveRange = (dir: -1 | 1) => {
        const ctx = createContext();
        const moved = ctx.outlineUpdater.moveRange(dir);

        if (!moved) return;

        ctx.commitControl();
        ctx.refUpdater.adjustGridScrollXFromOutline();
        ctx.refUpdater.adjustOutlineScroll();
    };

    const openArrangeEditor = () => {
        const ctx = createContext();
        const opened = ctx.outlineUpdater.openArrangeEditor();

        if (!opened) return;

        ctx.commitControl();
    };

    const openArrangeFinder = () => {
        const ctx = createContext();
        const element = ctx.outlineSelector.getCurrentElement();

        if (element.type !== "chord") return;

        const opened = ctx.outlineUpdater.openArrangeFinder();
        if (!opened) return;

        ctx.commitControl();
    };

    return {
        insertChord,
        insertEventMod,
        insertEventTempo,
        insertEventTS,
        insertSection,
        modBeat,
        modEat,
        modOn,
        modRoot,
        modSymbol,
        initialTempo,
        initialScale,
        initialScaleKey,
        eventModKind,
        eventModVal,
        eventTempoKind,
        eventTempoVal,
        eventTS,
        initialTS,
        moveFocus,
        moveRange,
        moveSection,
        openArrangeEditor,
        openArrangeFinder,
        removeFocusElement,
        setDegree,
    };
};

export default createOutlineActions;
