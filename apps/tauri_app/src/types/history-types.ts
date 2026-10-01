
export type HistoryStatus = {
    currentIndex: number | null;
    historyLength: number;
    canUndo: boolean;
    canRedo: boolean;
};

export type SnapshotStackStatus = {
    currentIndex: number | null;
    stackLength: number;
    canUndo: boolean;
    canRedo: boolean;
};

export const toHistoryStatus = (status: SnapshotStackStatus): HistoryStatus => ({
    currentIndex: status.currentIndex,
    historyLength: status.stackLength,
    canUndo: status.canUndo,
    canRedo: status.canRedo,
});