import { invoke } from "@tauri-apps/api/core";
import { get } from "svelte/store";
import recalculate from "../../../service/derived/recalculate-derived";
import { controlStore, dataStore } from "../../../store/global-store";
import type ControlState from "../../../store/state/control-state";
import type DataState from "../../../store/state/data/data-state";
import { toHistoryStatus, type HistoryStatus, type SnapshotStackStatus } from "../../../../types/history-types";

namespace ScoreHistory {
    const STACK_ID = "score";

    export type HistorySnapshot = {
        dataStore: DataState.Value;
        controlStore: ControlState.Value;
    };

    export type HistoryChangeResult = {
        snapshot: HistorySnapshot | null;
        status: HistoryStatus;
    };

    export type SnapshotStackChangeResult = {
        snapshot: HistorySnapshot | null;
        status: SnapshotStackStatus;
    };

    export const create = async (): Promise<void> => {
        await invoke("create_snapshot_stack", {
            id: STACK_ID,
        });
    };

    export const dispose = async (): Promise<void> => {
        await invoke("dispose_snapshot_stack", {
            id: STACK_ID,
        });
    };

    export const exists = async (): Promise<boolean> => {
        return invoke<boolean>("exists_snapshot_stack", {
            id: STACK_ID,
        });
    };

    export const clear = async (): Promise<HistoryStatus> => {
        const status = await invoke<SnapshotStackStatus>("clear_snapshot_stack", {
            id: STACK_ID,
        });
        return toHistoryStatus(status);
    };

    export const reset = async (): Promise<HistoryStatus> => {
        if (await exists()) {
            await dispose();
        }

        await create();
        return add();
    };

    export const add = async (): Promise<HistoryStatus> => {
        const status = await invoke<SnapshotStackStatus>("push_snapshot", {
            id: STACK_ID,
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

    export const undo = async (): Promise<HistoryChangeResult> => {
        const result = await invoke<SnapshotStackChangeResult>("undo_snapshot", {
            id: STACK_ID,
        });
        applySnapshot(result.snapshot);
        return {
            snapshot: result.snapshot,
            status: toHistoryStatus(result.status),
        };
    };

    export const redo = async (): Promise<HistoryChangeResult> => {
        const result = await invoke<SnapshotStackChangeResult>("redo_snapshot", {
            id: STACK_ID,
        });
        applySnapshot(result.snapshot);
        return {
            snapshot: result.snapshot,
            status: toHistoryStatus(result.status),
        };
    };
}

export default ScoreHistory;
