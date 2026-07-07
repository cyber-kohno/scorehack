import { get } from "svelte/store";
import createGuitarArrangeUpdater from "../../../service/arrange/guitar/guitar-arrange-updater";
import createArrangeSelector from "../../../service/arrange/arrange-selector";
import useScrollService from "../../../service/common/scroll-service";
import Toast from "../../../service/common/toast-controller";
import { createCommitDataAndRecalculate } from "../../../service/derived/recalculate-derived";
import playbackGuitarEditor from "../../../service/playback/arrange/playback-guitar-editor";
import previewArrangeNote from "../../../service/playback/arrange/preview-arrange-note";
import { controlStore, dataStore } from "../../../store/global-store";
import GuitarEditorState from "../../../store/state/data/arrange/guitar/guitar-editor-state";
import ToastState from "../../../store/state/toast-state";
import startEditorPreviewProgress from "../common/editor-preview-progress";

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
        arrange,
        control,
        arrTrack,
        guitarUpdater: createGuitarArrangeUpdater({ arrange, arrTrack }),
        commitControl,
        commitDataAndRecalculate: createCommitDataAndRecalculate(commitData),
    };
};

const createGuitarArrangeActions = () => {
    const showEditorToast = (text: string) => {
        Toast.create({
            ...ToastState.createInitial(),
            x: 238,
            y: 56,
            width: 360,
            text,
        });
    };

    const getVoicingValidationMessage = (
        validation: GuitarEditorState.StrokeVoicingValidationResult,
    ) => {
        if (validation.ok) return "";

        switch (validation.reason) {
            case "too-few-sounding-strings":
                return "Voicing must have at least 3 sounding strings.";
            case "split-sounding-strings":
                return "Voicing must use continuous sounding strings.";
        }
    };

    const playbackPattern = () => {
        const ctx = createContext();
        const editor = ctx.arrange.editor as GuitarEditorState.Value | undefined;
        if (editor == undefined) throw new Error("Guitar editor must exist.");

        const validation = GuitarEditorState.validateStrokeVoicing(editor.frets);
        if (!validation.ok) {
            showEditorToast(getVoicingValidationMessage(validation));
            return;
        }

        const result = playbackGuitarEditor();
        if (result.ok) {
            startEditorPreviewProgress(result.durationMs);
            return;
        }
        if (result.reason !== "inst-not-set") return;

        showEditorToast("Instrument is not assigned.");
    };

    const moveFinderPattern = (dir: -1 | 1 | -3 | 3) => {
        const ctx = createContext();
        const moved = ctx.guitarUpdater.moveFinder(dir);
        if (!moved) return;

        ctx.commitControl();
    };

    const applyFinderSelection = () => {
        const ctx = createContext();
        const result = ctx.guitarUpdater.applyFinderSelection();

        if (result.closeArrange) ctx.control.outline.arrange = null;
        if (result.data) ctx.commitDataAndRecalculate();
        if (result.control) ctx.commitControl();
    };

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

    const backFinderSelection = updateControl(updater => {
        return updater.backFinderSelection();
    });

    const moveCursor = updateControlWithArg<{ string?: -1 | 1; fret?: -1 | 1 }>((updater, dir) => {
        updater.moveCursor(dir);
    });

    const toggleFret = () => {
        const ctx = createContext();
        const result = ctx.guitarUpdater.toggleFret();
        if (result === false) return;

        ctx.commitControl();

        if (result.activated && result.pitch != undefined) {
            previewArrangeNote(ctx.arrTrack, result.pitch);
        }
    };

    const muteString = updateControl(updater => {
        updater.muteString();
    });

    const moveBackingColCursor = (dir: -1 | 1) => {
        const ctx = createContext();
        const moved = ctx.guitarUpdater.moveBackingColCursor(dir);
        if (!moved) return;

        ctx.commitControl();
        useScrollService().adjustGEBScrollCol();
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

    const shiftTechnique = updateControlWithArg<-1 | 1>((updater, dir) => {
        return updater.shiftTechnique(dir);
    });

    const setTechnique = updateControlWithArg<GuitarEditorState.TechniqueSelection | "none">((updater, technique) => {
        return updater.setTechnique(technique);
    });

    const shiftControl = updateControlWithArg<GuitarEditorState.Control>((updater, next) => {
        return updater.shiftControl(next);
    });

    const toggleBacking = updateControl(updater => {
        return updater.toggleBacking();
    });

    const applyArrange = () => {
        const ctx = createContext();

        ctx.guitarUpdater.applyArrange();
        ctx.control.outline.arrange = null;
        ctx.commitDataAndRecalculate();
        ctx.commitControl();
    };

    return {
        applyFinderSelection,
        applyArrange,
        backFinderSelection,
        deleteBackingCol,
        insertBackingCol,
        moveCursor,
        moveBackingColCursor,
        moveFinderPattern,
        muteString,
        playbackPattern,
        setBackingColDiv,
        setTechnique,
        shiftControl,
        shiftTechnique,
        toggleBacking,
        toggleBackingColDot,
        toggleFret,
    };
};

export default createGuitarArrangeActions;
