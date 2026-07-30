import { toHistoryStatus, type HistoryStatus } from "../../../../types/history-types";
import TauriCommands from "../tauri-commands";

namespace SnapshotHistory {
    export type ChangeResult<T> = {
        snapshot: T | null;
        status: HistoryStatus;
    };

    export const create = async (id: string): Promise<void> => {
        await TauriCommands.createSnapshotStack(id);
    };

    export const dispose = async (id: string): Promise<void> => {
        try {
            await TauriCommands.disposeSnapshotStack(id);
        } catch (error) {
            if (typeof error === "string" && error.includes(`snapshot stack does not exist: ${id}`)) {
                return;
            }
            throw error;
        }
    };

    export const exists = async (id: string): Promise<boolean> => {
        return TauriCommands.existsSnapshotStack(id);
    };

    export const clear = async (id: string): Promise<HistoryStatus> => {
        const status = await TauriCommands.clearSnapshotStack(id);
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
        const status = await TauriCommands.pushSnapshot(id, snapshot);
        return toHistoryStatus(status);
    };

    export const undo = async <T>(id: string): Promise<ChangeResult<T>> => {
        const result = await TauriCommands.undoSnapshot<T>(id);
        return {
            snapshot: result.snapshot,
            status: toHistoryStatus(result.status),
        };
    };

    export const redo = async <T>(id: string): Promise<ChangeResult<T>> => {
        const result = await TauriCommands.redoSnapshot<T>(id);
        return {
            snapshot: result.snapshot,
            status: toHistoryStatus(result.status),
        };
    };
}

export default SnapshotHistory;
