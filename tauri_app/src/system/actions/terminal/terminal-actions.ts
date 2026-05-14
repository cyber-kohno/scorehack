import { get } from "svelte/store";
import useScrollService from "../../service/common/scroll-service";
import createCommandRegistry from "../../service/terminal/command-registry";
import { createCommitDataAndRecalculate } from "../../service/derived/recalculate-derived";
import useMelodySelector from "../../service/melody/melody-selector";
import useOutlineSelector from "../../service/outline/outline-selector";
import useTerminalLogger from "../../service/terminal/terminalLogger";
import useTerminalSelector from "../../service/terminal/terminal-selector";
import createTerminalUpdater from "../../service/terminal/terminal-updater";
import { controlStore, dataStore, derivedStore, refStore, settingsStore, terminalStore } from "../../store/global-store";
import type TerminalState from "../../store/state/terminal-state";

const createInitialTerminal = (): TerminalState.Value => ({
    outputs: [],
    target: "",
    command: "",
    wait: false,
    focus: 0,
    availableFuncs: [],
    helper: null,
});

const createContext = () => {
    const control = get(controlStore);
    const data = get(dataStore);
    const derived = get(derivedStore);
    const ref = get(refStore);
    const settings = get(settingsStore);
    const terminal = get(terminalStore);

    if (terminal == null) {
        throw new Error("terminal is not active.");
    }

    const commitData = () => dataStore.set({ ...data });
    const commitTerminal = () => terminalStore.set({ ...terminal });

    return {
        control,
        data,
        ref,
        terminal,
        logger: useTerminalLogger(terminal),
        selectors: {
            melody: useMelodySelector({ control, data }),
            outline: useOutlineSelector({ data, control }),
        },
        commit: {
            control: () => controlStore.set({ ...control }),
            data: commitData,
            dataAndRecalculate: createCommitDataAndRecalculate(commitData),
            ref: () => refStore.set({ ...ref }),
            terminal: commitTerminal,
        },
        refUpdater: useScrollService({
            control,
            data,
            derived,
            ref,
            settings,
            terminal,
            commitRef: () => refStore.set({ ...ref }),
        }),
        terminalSelector: useTerminalSelector({ terminal }),
        terminalUpdater: createTerminalUpdater({ control, data, terminal }),
        commitTerminal,
    };
};

const createTerminalActions = () => {
    const rebuildAvailableFunctions = (ctx: ReturnType<typeof createContext>) => {
        ctx.terminalUpdater.updateTarget();
        createCommandRegistry(ctx).buildAvailableFunctions();
    };

    const open = () => {
        terminalStore.set(createInitialTerminal());

        const ctx = createContext();
        rebuildAvailableFunctions(ctx);
        ctx.commitTerminal();
    };

    const close = () => {
        const ctx = createContext();
        if (ctx.terminalSelector.isWait()) return;

        terminalStore.set(null);
    };

    const removeCommand = () => {
        const ctx = createContext();
        if (ctx.terminalSelector.isWait()) return;

        const changed = ctx.terminalUpdater.removeCommand();
        if (!changed) return;

        ctx.terminalUpdater.buildHelper();
        ctx.commitTerminal();
    };

    const moveFocus = (dir: -1 | 1) => {
        const ctx = createContext();
        if (ctx.terminalSelector.isWait()) return;

        const moved = ctx.terminalUpdater.moveFocus(dir);
        if (!moved) return;

        ctx.terminalUpdater.buildHelper();
        ctx.commitTerminal();
    };

    const inputChar = (key: string) => {
        const ctx = createContext();
        if (ctx.terminalSelector.isWait()) return;

        const changed = ctx.terminalUpdater.insertCommand(key);
        if (!changed) return;

        ctx.terminalUpdater.buildHelper();
        ctx.commitTerminal();
    };

    const closeHelper = () => {
        const ctx = createContext();
        if (ctx.terminalSelector.isWait()) return;

        ctx.terminalUpdater.closeHelper();
        ctx.commitTerminal();
    };

    const applyHelper = () => {
        const ctx = createContext();
        if (ctx.terminalSelector.isWait()) return;

        const applied = ctx.terminalUpdater.applyHelper();
        if (!applied) return;

        ctx.commitTerminal();
    };

    const moveHelperFocus = (dir: -1 | 1) => {
        const ctx = createContext();
        if (ctx.terminalSelector.isWait()) return;

        const moved = ctx.terminalUpdater.moveHelperFocus(dir);
        if (!moved) return;

        ctx.refUpdater.adjustHelperScroll();
        ctx.commitTerminal();
    };

    const registCommand = () => {
        const ctx = createContext();
        if (ctx.terminalSelector.isWait()) return;

        rebuildAvailableFunctions(ctx);
        ctx.terminalUpdater.registCommand();
        ctx.commitTerminal();
    };

    const hasHelper = () => {
        const ctx = createContext();
        return ctx.terminalSelector.hasHelper();
    };

    return {
        applyHelper,
        close,
        closeHelper,
        hasHelper,
        inputChar,
        moveFocus,
        moveHelperFocus,
        open,
        registCommand,
        removeCommand,
    };
};

export default createTerminalActions;
