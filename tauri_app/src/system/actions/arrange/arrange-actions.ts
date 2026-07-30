import { get } from "svelte/store";
import createArrangeUpdater from "../../service/arrange/arrange-updater";
import { controlStore, dataStore } from "../../store/global-store";
import ConfirmDialog from "../../service/common/confirm-dialog-controller";
import PianoEditorState from "../../store/state/data/arrange/piano/piano-editor-state";
import createPianoArrangeActions from "./piano/piano-arrange-actions";
import GuitarEditorState from "../../store/state/data/arrange/guitar/guitar-editor-state";
import DrumEditorState from "../../store/state/data/arrange/drum/drum-editor-state";
import createGuitarArrangeActions from "./guitar/guitar-arrange-actions";
import createDrumArrangeActions from "./drum/drum-arrange-actions";
import ArrangeEditorHistory from "../../infra/tauri/history/arrange-editor-history";

const createContext = () => {
    const control = get(controlStore);
    const data = get(dataStore);

    const commitControl = () => controlStore.set({ ...control });

    return {
        arrangeUpdater: createArrangeUpdater({ control, data }),
        commitControl,
    };
};

const createArrangeActions = () => {
    const closeArrangeImmediately = () => {
        const ctx = createContext();

        ctx.arrangeUpdater.closeArrange();
        ctx.commitControl();
        void ArrangeEditorHistory.dispose();
    };

    const applyAndCloseArrange = () => {
        const control = get(controlStore);
        const arrange = control.outline.arrange;

        switch (arrange?.method) {
            case "piano":
                createPianoArrangeActions().applyArrange();
                break;
            case "guitar":
                createGuitarArrangeActions().applyArrange();
                break;
            case "drum":
                createDrumArrangeActions().applyArrange();
                break;
        }
    };

    const hasUnsavedArrangeEditorChanges = () => {
        const control = get(controlStore);
        const arrange = control.outline.arrange;
        if (arrange == null || arrange.editor == undefined) {
            return false;
        }

        switch (arrange.method) {
            case "piano": {
                const editor = arrange.editor as PianoEditorState.Value;
                return editor.lastSource !== PianoEditorState.createSnapshot(editor);
            }
            case "guitar": {
                const editor = arrange.editor as GuitarEditorState.Value;
                return editor.lastSource !== GuitarEditorState.createSnapshot(editor);
            }
            case "drum": {
                const editor = arrange.editor as DrumEditorState.Value;
                return editor.lastSource !== DrumEditorState.createSnapshot(editor);
            }
        }
    };

    const closeArrange = () => {
        const arrange = get(controlStore).outline.arrange;
        if (arrange?.origin.type === "library") {
            closeArrangeImmediately();
            return;
        }

        if (!hasUnsavedArrangeEditorChanges()) {
            closeArrangeImmediately();
            return;
        }

        ConfirmDialog.open({
            tone: "danger",
            title: "Close Arrange Editor",
            messageLines: [
                "There are unapplied changes.",
                "How do you want to close the editor?",
            ],
            choices: [
                {
                    label: "Apply and close",
                    role: "neutral",
                    callback: applyAndCloseArrange,
                },
                {
                    label: "Discard and close",
                    role: "proceed",
                    callback: closeArrangeImmediately,
                },
            ],
        });
    };

    const closeFinder = () => {
        const ctx = createContext();

        ctx.arrangeUpdater.closeFinder();
        ctx.commitControl();
    };

    return {
        closeArrange,
        closeFinder,
    };
};

export default createArrangeActions;
