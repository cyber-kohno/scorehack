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
import createOutlineBackingActions from "./outline-backing-actions";
import createOutlineEventActions from "./outline-event-actions";
import ScoreHistory from "../../infra/tauri/history/score-history";

const createContext = () => {
    const control = get(controlStore);
    const data = get(dataStore);
    const derived = get(derivedStore);
    const ref = get(refStore);
    const settings = get(settingsStore);
    const terminal = get(terminalStore);
    const outline = control.outline;

    const commitControl = () => controlStore.set({ ...control });
    const commitData = () => {
        dataStore.set({ ...data });
        ScoreHistory.add();
    };

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

export type OutlineActionContext = ReturnType<typeof createContext>;

const createOutlineActions = () => {
    const backingActions = createOutlineBackingActions(createContext);
    const eventActions = createOutlineEventActions(createContext);

    const cloneChordData = (chordData: ElementState.DataChord): ElementState.DataChord => {
        return JSON.parse(JSON.stringify(chordData));
    };

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

        const beforeChordData = cloneChordData(element.data as ElementState.DataChord);
        const afterChordData = cloneChordData(beforeChordData);
        afterChordData.degree = ChordTheory.getDiatonicDegreeChord("major", scaleIndex);

        ctx.outlineUpdater.setChordData(afterChordData);
        backingActions.clearVoicingIfChordChanged(ctx, beforeChordData, afterChordData);
        ctx.commitDataAndRecalculate();
    };

    const modSymbol = (dir: "prev" | "next" | "lower" | "upper") => {
        const ctx = createContext();
        const element = ctx.outlineSelector.getCurrentElement();

        if (element.type !== "chord") {
            throw new Error("modSymbol requires a chord element.");
        }

        const beforeChordData = cloneChordData(element.data as ElementState.DataChord);
        const changed = ctx.outlineUpdater.modSymbol(dir);

        if (!changed) return;

        const afterChordData = element.data as ElementState.DataChord;
        backingActions.clearVoicingIfChordChanged(ctx, beforeChordData, afterChordData);
        ctx.commitDataAndRecalculate();
    };

    const modRoot = (dir: -1 | 1) => {
        const ctx = createContext();
        const element = ctx.outlineSelector.getCurrentElement();

        if (element.type !== "chord") {
            throw new Error("modRoot requires a chord element.");
        }

        const beforeChordData = cloneChordData(element.data as ElementState.DataChord);
        const changed = ctx.outlineUpdater.modRoot(dir);

        if (!changed) return;

        const afterChordData = element.data as ElementState.DataChord;
        backingActions.clearVoicingIfChordChanged(ctx, beforeChordData, afterChordData);
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

        const beforeChordData = cloneChordData(element.data as ElementState.DataChord);
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

        const afterChordData = element.data as ElementState.DataChord;
        backingActions.clearVoicingIfChordChanged(ctx, beforeChordData, afterChordData);
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

    const undoRedu = (dir: -1 | 1) => {
        (async () => {
            if (dir === -1) await ScoreHistory.undo();
            else if (dir === 1) await ScoreHistory.redo();
            const ctx = createContext();
            ctx.refUpdater.adjustOutlineScroll();
        })();
    }

    return {
        ...backingActions,
        ...eventActions,
        insertChord,
        insertSection,
        modBeat,
        modEat,
        modOn,
        modRoot,
        modSymbol,
        moveFocus,
        moveRange,
        moveSection,
        removeFocusElement,
        setDegree,
        undoRedu
    };
};

export default createOutlineActions;
