import { get } from "svelte/store";
import createPianoArrangeUpdater from "../../../service/arrange/piano/piano-arrange-updater";
import createArrangeSelector from "../../../service/arrange/arrange-selector";
import useScrollService from "../../../service/common/scroll-service";
import { createCommitDataAndRecalculate } from "../../../service/derived/recalculate-derived";
import { controlStore, dataStore, derivedStore, refStore, settingsStore, terminalStore } from "../../../store/global-store";
import type PianoEditorState from "../../../store/state/data/arrange/piano/piano-editor-state";

const createContext = () => {
    const control = get(controlStore);
    const data = get(dataStore);
    const derived = get(derivedStore);
    const ref = get(refStore);
    const settings = get(settingsStore);
    const terminal = get(terminalStore);
    const arrangeSelector = createArrangeSelector({ control, data });
    const arrange = arrangeSelector.getArrange();
    const arrTrack = arrangeSelector.getCurTrack();

    if (arrange.method !== "piano") throw new Error("Piano arrange action requires piano arrange.");
    if (arrTrack.method !== "piano") throw new Error("Piano arrange action requires piano track.");

    const commitControl = () => controlStore.set({ ...control });
    const commitData = () => dataStore.set({ ...data });

    return {
        control,
        pianoUpdater: createPianoArrangeUpdater({ arrange, arrTrack }),
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
        commitDataAndRecalculate: createCommitDataAndRecalculate(commitData),
    };
};

const createPianoArrangeActions = () => {
    const updateControl = (
        update: (updater: ReturnType<typeof createPianoArrangeUpdater>) => void | boolean,
    ) => {
        return () => {
            const ctx = createContext();
            const result = update(ctx.pianoUpdater);

            if (result === false) return;

            ctx.commitControl();
        };
    };

    const updateControlWithArg = <T>(
        update: (updater: ReturnType<typeof createPianoArrangeUpdater>, arg: T) => void | boolean,
    ) => {
        return (arg: T) => {
            const ctx = createContext();
            const result = update(ctx.pianoUpdater, arg);

            if (result === false) return;

            ctx.commitControl();
        };
    };

    const moveFinderBacking = updateControlWithArg<-1 | 1>((updater, dir) => {
        return updater.moveFinderBacking(dir);
    });

    const moveFinderVoicing = updateControlWithArg<-1 | 1>((updater, dir) => {
        return updater.moveFinderVoicing(dir);
    });

    const openFinderFromEditor = updateControl(updater => {
        updater.openFinderFromEditor();
    });

    const moveVoicingCursor = updateControlWithArg<{ x?: -1 | 1; y?: -1 | 1 }>((updater, dir) => {
        updater.moveVoicingCursor(dir);
    });

    const toggleVoicing = updateControl(updater => {
        updater.toggleVoicing();
    });

    const shiftControl = updateControlWithArg<PianoEditorState.Control>((updater, next) => {
        updater.shiftControl(next);
    });

    const applyFinderPattern = () => {
        const ctx = createContext();
        const result = ctx.pianoUpdater.applyFinderPattern();

        if (result.closeArrange) ctx.control.outline.arrange = null;
        if (result.data) ctx.commitDataAndRecalculate();
        if (result.control) ctx.commitControl();
    };

    const applyArrange = () => {
        const ctx = createContext();

        ctx.pianoUpdater.applyArrange();
        ctx.control.outline.arrange = null;
        ctx.commitDataAndRecalculate();
        ctx.commitControl();
    };

    const shiftLayer = () => {
        const ctx = createContext();

        ctx.pianoUpdater.shiftLayer();
        ctx.commitControl();
        ctx.refUpdater.adjustPEBScrollCol();
    };

    return {
        applyArrange,
        applyFinderPattern,
        moveFinderBacking,
        moveFinderVoicing,
        moveVoicingCursor,
        openFinderFromEditor,
        shiftControl,
        shiftLayer,
        toggleVoicing,
    };
};

export default createPianoArrangeActions;
