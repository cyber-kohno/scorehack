import { get } from "svelte/store";
import { controlStore } from "../../../store/global-store";
import type ArrangeState from "../../../store/state/data/arrange/arrange-state";
import type { HistoryStatus } from "../../../../types/history-types";
import SnapshotHistory from "./snapshot-history";

namespace ArrangeEditorHistory {
    const STACK_ID = "arrange-editor";

    export type EditorSnapshot = NonNullable<ArrangeState.EditorProps["editor"]>;
    export type HistoryChangeResult = SnapshotHistory.ChangeResult<EditorSnapshot>;

    const clone = <T>(value: T): T => {
        return JSON.parse(JSON.stringify(value)) as T;
    };

    const getEditor = (): EditorSnapshot | null => {
        const editor = get(controlStore).outline.arrange?.editor;
        return editor == undefined ? null : clone(editor);
    };

    const applySnapshot = (snapshot: EditorSnapshot | null) => {
        if (snapshot == null) return;

        const control = get(controlStore);
        const arrange = control.outline.arrange;
        if (arrange == null || arrange.editor == undefined) return;

        arrange.editor = clone(snapshot);
        controlStore.set({ ...control });
    };

    export const reset = async (editor: EditorSnapshot): Promise<HistoryStatus> => {
        return SnapshotHistory.reset(STACK_ID, clone(editor));
    };

    export const resetCurrent = async (): Promise<HistoryStatus | null> => {
        const editor = getEditor();
        if (editor == null) return null;
        return reset(editor);
    };

    export const add = async (editor: EditorSnapshot): Promise<HistoryStatus> => {
        if (!(await SnapshotHistory.exists(STACK_ID))) {
            return reset(editor);
        }

        return SnapshotHistory.add(STACK_ID, clone(editor));
    };

    export const resetThenAdd = async (
        baseEditor: EditorSnapshot,
        editor: EditorSnapshot,
    ): Promise<HistoryStatus> => {
        await reset(baseEditor);
        return add(editor);
    };

    export const addCurrent = async (): Promise<HistoryStatus | null> => {
        const editor = getEditor();
        if (editor == null) return null;
        return add(editor);
    };

    export const undo = async (): Promise<HistoryChangeResult> => {
        if (!(await SnapshotHistory.exists(STACK_ID))) {
            return {
                snapshot: null,
                status: { currentIndex: null, historyLength: 0, canUndo: false, canRedo: false },
            };
        }

        const result = await SnapshotHistory.undo<EditorSnapshot>(STACK_ID);
        applySnapshot(result.snapshot);
        return result;
    };

    export const redo = async (): Promise<HistoryChangeResult> => {
        if (!(await SnapshotHistory.exists(STACK_ID))) {
            return {
                snapshot: null,
                status: { currentIndex: null, historyLength: 0, canUndo: false, canRedo: false },
            };
        }

        const result = await SnapshotHistory.redo<EditorSnapshot>(STACK_ID);
        applySnapshot(result.snapshot);
        return result;
    };

    export const dispose = async (): Promise<void> => {
        if (await SnapshotHistory.exists(STACK_ID)) {
            await SnapshotHistory.dispose(STACK_ID);
        }
    };
}

export default ArrangeEditorHistory;
