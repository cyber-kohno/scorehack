import { get } from "svelte/store";
import createPianoArrangeUpdater from "../../../service/arrange/piano/piano-arrange-updater";
import createArrangeSelector from "../../../service/arrange/arrange-selector";
import useScrollService from "../../../service/common/scroll-service";
import Toast from "../../../service/common/toast-controller";
import { createCommitDataAndRecalculate } from "../../../service/derived/recalculate-derived";
import playbackPianoEditor from "../../../service/playback/arrange/playback-piano-editor";
import previewArrangeNote from "../../../service/playback/arrange/preview-arrange-note";
import { controlStore, dataStore, derivedStore, refStore, settingsStore, terminalStore } from "../../../store/global-store";
import type PianoEditorState from "../../../store/state/data/arrange/piano/piano-editor-state";
import ToastState from "../../../store/state/toast-state";

const FINDER_BACKING_RECORD_HEIGHT = 71;
const FINDER_VOICING_CELL_WIDTH = 109;

const getFinderVoicingScrollLeft = (frame: HTMLElement, soundsIndex: number) => {
    const rect = frame.getBoundingClientRect();
    const targetCenter = soundsIndex * FINDER_VOICING_CELL_WIDTH + FINDER_VOICING_CELL_WIDTH / 2;
    return Math.max(0, targetCenter - rect.width / 2);
};

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
        arrange,
        control,
        arrTrack,
        ref,
        pianoUpdater: createPianoArrangeUpdater({ arrange, track: arrTrack }),
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
    const playbackPattern = () => {
        const result = playbackPianoEditor();
        if (result.ok || result.reason !== "inst-not-set") return;

        Toast.create({
            ...ToastState.createInitial(),
            x: 24,
            y: 84,
            width: 300,
            text: "Instrument is not assigned.",
        });
    };

    const adjustFinderBackingScroll = (ctx: ReturnType<typeof createContext>) => {
        const finder = ctx.arrange.finder;
        if (finder == undefined) return;

        const ref = ctx.ref.arrange.finder.frame;
        if (ref == undefined) return;

        const rect = ref.getClientRects()[0];
        if (rect == undefined) return;

        const top = -rect.width / 2 + finder.cursor.backing * FINDER_BACKING_RECORD_HEIGHT;
        ref.scrollTo({ top, behavior: "smooth" });
    };

    const adjustFinderVoicingScroll = (ctx: ReturnType<typeof createContext>) => {
        const finder = ctx.arrange.finder;
        if (finder == undefined) return;

        const refProps = ctx.ref.arrange.finder.records.find(record => {
            return record.seq === finder.cursor.backing;
        });
        if (refProps == undefined) return;

        const left = getFinderVoicingScrollLeft(refProps.ref, finder.cursor.sounds);
        refProps.ref.scrollTo({ left, behavior: "smooth" });
    };

    const resetFinderVoicingScroll = (ctx: ReturnType<typeof createContext>, backingIndex: number) => {
        if (backingIndex < 0) return;

        const refProps = ctx.ref.arrange.finder.records.find(record => {
            return record.seq === backingIndex;
        });
        refProps?.ref.scrollTo({ left: 0, behavior: "smooth" });
    };

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

    const moveFinderBacking = (dir: -1 | 1) => {
        const ctx = createContext();
        const finder = ctx.arrange.finder;
        const previousBackingIndex = finder?.cursor.backing ?? -1;
        const moved = ctx.pianoUpdater.moveFinderBacking(dir);
        if (!moved) return;

        resetFinderVoicingScroll(ctx, previousBackingIndex);
        ctx.commitControl();
        adjustFinderBackingScroll(ctx);
        adjustFinderVoicingScroll(ctx);
    };

    const moveFinderVoicing = (dir: -1 | 1) => {
        const ctx = createContext();
        const moved = ctx.pianoUpdater.moveFinderVoicing(dir);
        if (!moved) return;

        ctx.commitControl();
        adjustFinderVoicingScroll(ctx);
    };

    const openFinderFromEditor = () => {
        const ctx = createContext();
        if (ctx.arrange.origin.type === "library") return;

        ctx.pianoUpdater.openFinderFromEditor();
        ctx.commitControl();
    };

    const moveVoicingCursor = updateControlWithArg<{ x?: -1 | 1; y?: -1 | 1 }>((updater, dir) => {
        updater.moveVoicingCursor(dir);
    });

    const toggleVoicing = () => {
        const ctx = createContext();
        const result = ctx.pianoUpdater.toggleVoicing();

        ctx.commitControl();

        if (result.activated && result.pitch != undefined) {
            previewArrangeNote(ctx.arrTrack, result.pitch);
        }
    };

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

        switch (ctx.arrange.origin.type) {
            case "chord-block":
                ctx.pianoUpdater.applyChordBlock();
                ctx.commitDataAndRecalculate();
                break;
            case "library":
                if (ctx.arrange.origin.mode === "add-backing") {
                    const editor = ctx.arrange.editor as PianoEditorState.Value;
                    if (editor.backing == null) {
                        Toast.create({
                            ...ToastState.createInitial(),
                            x: 24,
                            y: 84,
                            width: 340,
                            text: "Create a backing pattern before saving.",
                        });
                        return;
                    }
                }
                const result = ctx.pianoUpdater.applyLibrary();
                if (result.ok === false) {
                    Toast.create({
                        ...ToastState.createInitial(),
                        x: 24,
                        y: 84,
                        width: 360,
                        text: result.message,
                    });
                    return;
                }
                ctx.commitDataAndRecalculate();
                break;
        }
        ctx.control.outline.arrange = null;
        ctx.commitControl();
    };

    const shiftLayer = () => {
        const ctx = createContext();

        ctx.pianoUpdater.shiftLayer();
        ctx.commitControl();
        ctx.refUpdater.adjustPEBScrollCol();
    };

    const moveBackingColCursor = (dir: -1 | 1) => {
        const ctx = createContext();
        const moved = ctx.pianoUpdater.moveBackingColCursor(dir);
        if (!moved) return;

        ctx.commitControl();
        ctx.refUpdater.adjustPEBScrollCol();
    };

    const insertBackingCol = updateControl(updater => {
        return updater.insertBackingCol();
    });

    const deleteBackingCol = updateControl(updater => {
        return updater.deleteBackingCol();
    });

    const setBackingColDiv = updateControlWithArg<number>((updater, div) => {
        return updater.setBackingColDiv(div);
    });

    const toggleBackingColDot = updateControl(updater => {
        return updater.toggleBackingColDot();
    });

    const toggleBackingPedal = updateControl(updater => {
        return updater.toggleBackingPedal();
    });

    const moveBackingRecordCursor = updateControlWithArg<-1 | 1>((updater, dir) => {
        return updater.moveBackingRecordCursor(dir);
    });

    const insertBackingRecord = updateControl(updater => {
        return updater.insertBackingRecord();
    });

    const deleteBackingRecord = updateControl(updater => {
        return updater.deleteBackingRecord();
    });

    const moveBackingNoteCursor = (dir: { x?: -1 | 1; y?: -1 | 1 }) => {
        const ctx = createContext();
        ctx.pianoUpdater.moveBackingNoteCursor(dir);
        ctx.commitControl();
        if (dir.x != undefined) ctx.refUpdater.adjustPEBScrollCol();
    };

    const toggleBackingNote = updateControl(updater => {
        return updater.toggleBackingNote();
    });

    const increaseBackingNoteVelocity = updateControl(updater => {
        return updater.modifyBackingNote((note) => ({
            ...note,
            velocity: Math.min(20, note.velocity + 1),
        }));
    });

    const decreaseBackingNoteVelocity = updateControl(updater => {
        return updater.modifyBackingNote((note) => ({
            ...note,
            velocity: Math.max(1, note.velocity - 1),
        }));
    });

    const decreaseBackingNoteDelay = updateControl(updater => {
        return updater.modifyBackingNote((note) => ({
            ...note,
            delay: Math.max(-3, note.delay - 1),
        }));
    });

    const increaseBackingNoteDelay = updateControl(updater => {
        return updater.modifyBackingNote((note) => ({
            ...note,
            delay: Math.min(3, note.delay + 1),
        }));
    });

    return {
        applyArrange,
        applyFinderPattern,
        decreaseBackingNoteDelay,
        decreaseBackingNoteVelocity,
        deleteBackingCol,
        deleteBackingRecord,
        increaseBackingNoteDelay,
        increaseBackingNoteVelocity,
        insertBackingCol,
        insertBackingRecord,
        moveFinderBacking,
        moveFinderVoicing,
        moveBackingColCursor,
        moveBackingNoteCursor,
        moveBackingRecordCursor,
        moveVoicingCursor,
        openFinderFromEditor,
        playbackPattern,
        setBackingColDiv,
        shiftControl,
        shiftLayer,
        toggleBackingColDot,
        toggleBackingNote,
        toggleBackingPedal,
        toggleVoicing,
    };
};

export default createPianoArrangeActions;
