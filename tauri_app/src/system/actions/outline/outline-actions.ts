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
import Toast from "../../service/common/toast-controller";
import ToastState from "../../store/state/toast-state";
import createOutlineBackingActions from "./outline-backing-actions";
import createOutlineEventActions from "./outline-event-actions";
import ScoreHistory from "../../infra/tauri/history/score-history";
import useMelodySelector from "../../service/melody/melody-selector";
import FloatingTextInput from "../../service/common/floating-text-input-controller";

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
        melodySelector: useMelodySelector({ data, control }),
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
        return RhythmTheory.getBarDivBeatCount(scoreBase.rhythm.ts);
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
            Toast.create({ ...ToastState.createInitial(), text: 'test', x: 50, y: 50 });
            return;
        }

        const selectedChordLength = ctx.outlineSelector.getSelectedChordLengthBeatNote(ctx.derived);
        if (selectedChordLength > 0) {
            const nextTail = ctx.derivedSelector.getBeatNoteTail() - selectedChordLength;
            const melodyTail = ctx.melodySelector.getAllScoreTracksTailBeatNote();
            if (melodyTail > nextTail + 1e-9) {
                Toast.create({
                    ...ToastState.createInitial(),
                    x: 12,
                    y: 48,
                    width: 320,
                    text: "Cannot delete: melody notes exceed the new score length.",
                });
                return;
            }
        }

        const removed = ctx.outlineUpdater.removeFocusElement();
        if (!removed) return;

        ctx.commitControl();
        ctx.commitDataAndRecalculate();
        ctx.refUpdater.adjustGridScrollXFromOutline();
        ctx.refUpdater.adjustOutlineScroll();
    };

    const renameSection = (value: string) => {
        const ctx = createContext();
        const element = ctx.outlineSelector.getCurrentElement();
        if (element.type !== "section") return;

        const name = value.trim();
        if (name.length === 0) return;

        ctx.outlineUpdater.setSectionName(name);
        ctx.commitDataAndRecalculate();
    };

    const openSectionNameInput = () => {
        const ctx = createContext();
        const element = ctx.outlineSelector.getCurrentElement();
        if (element.type !== "section") return;

        const sectionData = element.data as ElementState.DataSection;
        const elementRef = get(refStore).elementRefs.find((item) => item.seq === ctx.outline.focus)?.ref;
        if (elementRef == undefined) return;

        const rect = elementRef.getBoundingClientRect();
        FloatingTextInput.open({
            value: sectionData.name,
            cursor: sectionData.name.length,
            left: rect.left,
            top: rect.bottom + 10,
            width: Math.max(120, rect.width),
            apply: renameSection,
        });
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
        openSectionNameInput,
        renameSection,
        removeFocusElement,
        setDegree,
        undoRedu
    };
};

export default createOutlineActions;
