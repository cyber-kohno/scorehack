import { get } from "svelte/store";
import createArrangeUpdater from "../../service/arrange/arrange-updater";
import { controlStore, dataStore } from "../../store/global-store";
import ConfirmDialog from "../../service/common/confirm-dialog-controller";
import PianoEditorState from "../../store/state/data/arrange/piano/piano-editor-state";

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
    };

    const hasUnsavedPianoEditorChanges = () => {
        const control = get(controlStore);
        const arrange = control.outline.arrange;
        if (arrange == null || arrange.method !== "piano" || arrange.editor == undefined) {
            return false;
        }

        const editor = arrange.editor as PianoEditorState.Value;
        return editor.lastSource !== PianoEditorState.createSnapshot(editor);
    };

    const closeArrange = () => {
        if (!hasUnsavedPianoEditorChanges()) {
            closeArrangeImmediately();
            return;
        }

        ConfirmDialog.open({
            tone: "danger",
            title: "Close Arrange Editor",
            messageLines: [
                "There are unapplied changes.",
                "Discard the changes and close the editor?",
            ],
            choices: [
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
