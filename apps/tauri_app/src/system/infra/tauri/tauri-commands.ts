import { invoke } from "@tauri-apps/api/core";
import type { SnapshotStackStatus } from "../../../types/history-types";

namespace TauriCommands {
    export type SnapshotStackChangeResult<T> = {
        snapshot: T | null;
        status: SnapshotStackStatus;
    };

    export const showMainWindow = async (): Promise<void> => {
        await invoke("show_main_window");
    };

    export const restartApp = async (): Promise<void> => {
        await invoke("restart_app");
    };

    export const createSnapshotStack = async (id: string): Promise<void> => {
        await invoke("create_snapshot_stack", { id });
    };

    export const disposeSnapshotStack = async (id: string): Promise<void> => {
        await invoke("dispose_snapshot_stack", { id });
    };

    export const existsSnapshotStack = async (id: string): Promise<boolean> => {
        return invoke<boolean>("exists_snapshot_stack", { id });
    };

    export const clearSnapshotStack = async (id: string): Promise<SnapshotStackStatus> => {
        return invoke<SnapshotStackStatus>("clear_snapshot_stack", { id });
    };

    export const pushSnapshot = async <T>(
        id: string,
        data: T,
    ): Promise<SnapshotStackStatus> => {
        return invoke<SnapshotStackStatus>("push_snapshot", { id, data });
    };

    export const undoSnapshot = async <T>(
        id: string,
    ): Promise<SnapshotStackChangeResult<T>> => {
        return invoke<SnapshotStackChangeResult<T>>("undo_snapshot", { id });
    };

    export const redoSnapshot = async <T>(
        id: string,
    ): Promise<SnapshotStackChangeResult<T>> => {
        return invoke<SnapshotStackChangeResult<T>>("redo_snapshot", { id });
    };
}

export default TauriCommands;
