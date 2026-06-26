import { get } from "svelte/store";
import createArrangeSelector from "../../../service/arrange/arrange-selector";
import Layout from "../../../layout/layout-constant";
import { controlStore, dataStore } from "../../../store/global-store";
import type DrumEditorState from "../../../store/state/data/arrange/drum/drum-editor-state";

const createContext = () => {
    const control = get(controlStore);
    const data = get(dataStore);
    const arrangeSelector = createArrangeSelector({ control, data });
    const arrange = arrangeSelector.getArrange();
    const arrTrack = arrangeSelector.getCurTrack();

    if (arrange.method !== "drum") throw new Error("Drum arrange action requires drum arrange.");
    if (arrTrack.method !== "drum") throw new Error("Drum arrange action requires drum track.");

    return {
        arrange,
        editor: arrangeSelector.getDrumEditor(),
        commitControl: () => controlStore.set({ ...control }),
    };
};

const createDrumArrangeActions = () => {
    const updateControl = (update: (editor: DrumEditorState.Value) => void | boolean) => {
        const ctx = createContext();
        const result = update(ctx.editor);
        if (result === false) return;

        ctx.commitControl();
    };

    const shiftControl = (next: DrumEditorState.Control) => {
        const ctx = createContext();
        ctx.editor.control = next;
        ctx.commitControl();
    };

    const moveRecordCursor = (dir: -1 | 1) => {
        updateControl((editor) => {
            const next = editor.cursorY + dir;
            if (next < 0 || next > editor.records.length - 1) return false;

            editor.cursorY = next;
            return true;
        });
    };

    const insertRecord = () => {
        updateControl((editor) => {
            if (editor.records.length >= Layout.arrange.piano.BACKING_RECORD_MAX) return false;

            if (editor.records.length === 0) {
                editor.records.push({ key: "" });
                editor.cursorY = 0;
                return true;
            }

            editor.records.splice(editor.cursorY + 1, 0, { key: "" });
            editor.hits.forEach((hit) => {
                if (editor.cursorY < hit.recordIndex) hit.recordIndex++;
            });
            return true;
        });
    };

    const deleteRecord = () => {
        updateControl((editor) => {
            if (editor.records.length < 1) return false;

            editor.records.splice(editor.cursorY, 1);
            for (let i = editor.hits.length - 1; i >= 0; i--) {
                const hit = editor.hits[i];
                if (hit.recordIndex === editor.cursorY) editor.hits.splice(i, 1);
            }
            editor.hits.forEach((hit) => {
                if (editor.cursorY < hit.recordIndex) hit.recordIndex--;
            });

            if (editor.records.length === 0) {
                editor.cursorY = -1;
                return true;
            }
            if (editor.cursorY > 0) editor.cursorY--;
            return true;
        });
    };

    return {
        deleteRecord,
        insertRecord,
        moveRecordCursor,
        shiftControl,
    };
};

export default createDrumArrangeActions;
