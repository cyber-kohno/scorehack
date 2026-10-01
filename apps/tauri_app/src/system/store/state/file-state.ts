import DataState from "./data/data-state";

namespace FileState {

    export type Value = {
        score?: Handle;
        savedFingerprint: string;
        isDirty: boolean;
    }

    const stableStringify = (value: unknown): string | undefined => {
        if (value == null || typeof value !== "object") {
            return JSON.stringify(value);
        }

        if (Array.isArray(value)) {
            return `[${value.map((item) => stableStringify(item) ?? "null").join(",")}]`;
        }

        const entries = Object.entries(value)
            .map(([key, entryValue]) => [key, stableStringify(entryValue)] as const)
            .filter(([, serialized]) => serialized != undefined);

        return `{${entries
            .sort(([left], [right]) => left.localeCompare(right))
            .map(([key, serialized]) => `${JSON.stringify(key)}:${serialized}`)
            .join(",")}}`;
    };

    export const createFingerprint = (data: DataState.Value): string => {
        return stableStringify(data) ?? "";
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
