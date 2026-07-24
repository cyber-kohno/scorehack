import DataState from "./data/data-state";

namespace FileState {

    export type Value = {
        score?: Handle;
        savedFingerprint: string;
        isDirty: boolean;
    }

    export const createFingerprint = (data: DataState.Value): string => {
        return JSON.stringify(data);
    };

    export const createInitial = (): Value => ({
        savedFingerprint: createFingerprint(DataState.createInitial()),
        isDirty: false,
    });

    export const updateDirtyByFingerprint = (file: Value, currentFingerprint: string): Value => ({
        ...file,
        isDirty: currentFingerprint !== file.savedFingerprint,
    });

    export const markSaved = (
        file: Value,
        score = file.score,
        savedFingerprint = file.savedFingerprint,
    ): Value => ({
        ...file,
        score,
        savedFingerprint,
        isDirty: false,
    });

    export type Handle = {
        path: string;
        name: string;
    }
}
export default FileState;
