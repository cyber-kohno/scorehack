import { invoke } from "@tauri-apps/api/core";
import { get } from "svelte/store";
import recalculate from "../../../service/derived/recalculate-derived";
import { controlStore, dataStore } from "../../../store/global-store";
import type ControlState from "../../../store/state/control-state";
import type DataState from "../../../store/state/data/data-state";

namespace MainHistoryUtil {
    const MAIN_STACK_ID = "main";

    export type HistoryStatus = {
        currentIndex: number | null;
        historyLength: number;
        canUndo: boolean;
        canRedo: boolean;
    };

    type SnapshotStackStatus = {
        currentIndex: number | null;
        stackLength: number;
        canUndo: boolean;
        canRedo: boolean;
    };

    export type HistorySnapshot = {
        dataStore: DataState.Value;
        controlStore: ControlState.Value;
    };

    export type HistoryChangeResult = {
        snapshot: HistorySnapshot | null;
        status: HistoryStatus;
    };

    type SnapshotStackChangeResult = {
        snapshot: HistorySnapshot | null;
        status: SnapshotStackStatus;
    };

    const toHistoryStatus = (status: SnapshotStackStatus): HistoryStatus => ({
        currentIndex: status.currentIndex,
        historyLength: status.stackLength,
        canUndo: status.canUndo,
        canRedo: status.canRedo,
    });

    export const createHistory = async (): Promise<void> => {
        await invoke("create_snapshot_stack", {
            id: MAIN_STACK_ID,
        });
    };

    export const disposeHistory = async (): Promise<void> => {
        await invoke("dispose_snapshot_stack", {
            id: MAIN_STACK_ID,
        });
    };

    export const existsHistory = async (): Promise<boolean> => {
        return invoke<boolean>("exists_snapshot_stack", {
            id: MAIN_STACK_ID,
        });
    };

    export const clearHistory = async (): Promise<HistoryStatus> => {
        const status = await invoke<SnapshotStackStatus>("clear_snapshot_stack", {
            id: MAIN_STACK_ID,
        });
        return toHistoryStatus(status);
    };

    export const resetHistory = async (): Promise<HistoryStatus> => {
        if (await existsHistory()) {
            await disposeHistory();
        }

        await createHistory();
        return addHistory();
    };

    export const addHistory = async (): Promise<HistoryStatus> => {
        const status = await invoke<SnapshotStackStatus>("push_snapshot", {
            id: MAIN_STACK_ID,
            data: {
                dataStore: get(dataStore),
                controlStore: get(controlStore),
            },
        });
        return toHistoryStatus(status);
    };

    const applySnapshot = (snapshot: HistorySnapshot | null) => {
        if (snapshot == null) return;

        dataStore.set(snapshot.dataStore);
        controlStore.set(snapshot.controlStore);
        recalculate();
    };

    export const undoHistory = async (): Promise<HistoryChangeResult> => {
        const result = await invoke<SnapshotStackChangeResult>("undo_snapshot", {
            id: MAIN_STACK_ID,
        });
        applySnapshot(result.snapshot);
        return {
            snapshot: result.snapshot,
            status: toHistoryStatus(result.status),
        };
    };

    export const redoHistory = async (): Promise<HistoryChangeResult> => {
        const result = await invoke<SnapshotStackChangeResult>("redo_snapshot", {
            id: MAIN_STACK_ID,
        });
        applySnapshot(result.snapshot);
        return {
            snapshot: result.snapshot,
            status: toHistoryStatus(result.status),
        };
    };
}

export default MainHistoryUtil;
