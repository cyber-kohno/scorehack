import { get } from "svelte/store";
import createGuitarArrangeUpdater from "../../../service/arrange/guitar/guitar-arrange-updater";
import createArrangeSelector from "../../../service/arrange/arrange-selector";
import { createCommitDataAndRecalculate } from "../../../service/derived/recalculate-derived";
import { controlStore, dataStore } from "../../../store/global-store";

const createContext = () => {
    const control = get(controlStore);
    const data = get(dataStore);
    const arrangeSelector = createArrangeSelector({ control, data });
    const arrange = arrangeSelector.getArrange();
    const arrTrack = arrangeSelector.getCurTrack();

    if (arrange.method !== "guitar") throw new Error("Guitar arrange action requires guitar arrange.");
    if (arrTrack.method !== "guitar") throw new Error("Guitar arrange action requires guitar track.");

    const commitControl = () => controlStore.set({ ...control });
    const commitData = () => dataStore.set({ ...data });

    return {
        control,
        guitarUpdater: createGuitarArrangeUpdater({ arrange, arrTrack }),
        commitControl,
        commitDataAndRecalculate: createCommitDataAndRecalculate(commitData),
    };
};

const createGuitarArrangeActions = () => {
    const updateControlWithArg = <T>(
        update: (updater: ReturnType<typeof createGuitarArrangeUpdater>, arg: T) => void | boolean,
    ) => {
        return (arg: T) => {
            const ctx = createContext();
            const result = update(ctx.guitarUpdater, arg);

            if (result === false) return;

            ctx.commitControl();
        };
    };

    const updateControl = (
        update: (updater: ReturnType<typeof createGuitarArrangeUpdater>) => void | boolean,
    ) => {
        return () => {
            const ctx = createContext();
            const result = update(ctx.guitarUpdater);

            if (result === false) return;

            ctx.commitControl();
        };
    };

    const moveCursor = updateControlWithArg<{ string?: -1 | 1; fret?: -1 | 1 }>((updater, dir) => {
        updater.moveCursor(dir);
    });

    const toggleFret = updateControl(updater => {
        updater.toggleFret();
    });

    const muteString = updateControl(updater => {
        updater.muteString();
    });

    const applyArrange = () => {
        const ctx = createContext();

        ctx.guitarUpdater.applyArrange();
        ctx.control.outline.arrange = null;
        ctx.commitDataAndRecalculate();
        ctx.commitControl();
    };

    return {
        applyArrange,
        moveCursor,
        muteString,
        toggleFret,
    };
};

export default createGuitarArrangeActions;
