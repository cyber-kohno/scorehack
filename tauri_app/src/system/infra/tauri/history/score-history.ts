import { get } from "svelte/store";
import recalculate from "../../../service/derived/recalculate-derived";
import { controlStore, dataStore, fileStore } from "../../../store/global-store";
import type ControlState from "../../../store/state/control-state";
import type DataState from "../../../store/state/data/data-state";
import FileState from "../../../store/state/file-state";
import type { HistoryStatus } from "../../../../types/history-types";
import SnapshotHistory from "./snapshot-history";

namespace ScoreHistory {
    const STACK_ID = "score";

    export type AddOptions = {
        updateDirty?: boolean;
    };

    export type HistorySnapshot = {
        dataStore: DataState.Value;
        controlStore: ControlState.Value;
    };

    export type HistoryChangeResult = {
        snapshot: HistorySnapshot | null;
        status: HistoryStatus;
    };

    export const create = async (): Promise<void> => {
        await SnapshotHistory.create(STACK_ID);
    };

    export const dispose = async (): Promise<void> => {
        await SnapshotHistory.dispose(STACK_ID);
    };

    export const exists = async (): Promise<boolean> => {
        return SnapshotHistory.exists(STACK_ID);
    };

    export const clear = async (): Promise<HistoryStatus> => {
        return SnapshotHistory.clear(STACK_ID);
    };

    export const reset = async (): Promise<HistoryStatus> => {
        return SnapshotHistory.reset(STACK_ID, createSnapshot());
    };

    const createSnapshot = (): HistorySnapshot => ({
        dataStore: get(dataStore),
        controlStore: get(controlStore),
    });

    export const add = async (options: AddOptions = {}): Promise<HistoryStatus> => {
        const snapshot = createSnapshot();

        if (options.updateDirty ?? true) {
            updateDirty(snapshot.dataStore);
        }

        return SnapshotHistory.add(STACK_ID, snapshot);
    };

    const updateDirty = (data: DataState.Value) => {
        const fingerprint = FileState.createFingerprint(data);
        fileStore.update((file) => FileState.updateDirtyByFingerprint(file, fingerprint));
    };

    const applySnapshot = (snapshot: HistorySnapshot | null) => {
        if (snapshot == null) return;

        dataStore.set(snapshot.dataStore);
        controlStore.set(snapshot.controlStore);
        updateDirty(snapshot.dataStore);
        recalculate();
    };

    export const undo = async (): Promise<HistoryChangeResult> => {
        const result = await SnapshotHistory.undo<HistorySnapshot>(STACK_ID);
        applySnapshot(result.snapshot);
        return result;
    };

    export const redo = async (): Promise<HistoryChangeResult> => {
        const result = await SnapshotHistory.redo<HistorySnapshot>(STACK_ID);
        applySnapshot(result.snapshot);
        return result;
    };
}

export default ScoreHistory;
