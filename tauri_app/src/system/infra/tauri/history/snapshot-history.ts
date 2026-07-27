import { invoke } from "@tauri-apps/api/core";
import { toHistoryStatus, type HistoryStatus, type SnapshotStackStatus } from "../../../../types/history-types";

namespace SnapshotHistory {
    export type ChangeResult<T> = {
        snapshot: T | null;
        status: HistoryStatus;
    };

    export type SnapshotStackChangeResult<T> = {
        snapshot: T | null;
        status: SnapshotStackStatus;
    };

    export const create = async (id: string): Promise<void> => {
        await invoke("create_snapshot_stack", { id });
    };

    export const dispose = async (id: string): Promise<void> => {
        await invoke("dispose_snapshot_stack", { id });
    };

    export const exists = async (id: string): Promise<boolean> => {
        return invoke<boolean>("exists_snapshot_stack", { id });
    };

    export const clear = async (id: string): Promise<HistoryStatus> => {
        const status = await invoke<SnapshotStackStatus>("clear_snapshot_stack", { id });
        return toHistoryStatus(status);
    };

    export const reset = async <T>(id: string, snapshot: T): Promise<HistoryStatus> => {
        if (await exists(id)) {
            await dispose(id);
        }

        await create(id);
        return add(id, snapshot);
    };

    export const add = async <T>(id: string, snapshot: T): Promise<HistoryStatus> => {
        const status = await invoke<SnapshotStackStatus>("push_snapshot", {
            id,
            data: snapshot,
        });
        return toHistoryStatus(status);
    };

    export const undo = async <T>(id: string): Promise<ChangeResult<T>> => {
        const result = await invoke<SnapshotStackChangeResult<T>>("undo_snapshot", { id });
        return {
            snapshot: result.snapshot,
            status: toHistoryStatus(result.status),
        };
    };

    export const redo = async <T>(id: string): Promise<ChangeResult<T>> => {
        const result = await invoke<SnapshotStackChangeResult<T>>("redo_snapshot", { id });
        return {
            snapshot: result.snapshot,
            status: toHistoryStatus(result.status),
        };
    };
}

export default SnapshotHistory;
