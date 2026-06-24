import { get } from "svelte/store";
import { openScoreFilePath, saveScoreFilePath } from "../../infra/tauri/dialog";
import { dataStore, fileStore, refStore } from "../../store/global-store";
import type DataState from "../../store/state/data/data-state";
import type FileState from "../../store/state/file-state";
import recalculate from "../derived/recalculate-derived";
import CompressedJsonFile from "./compressed-json-file";

namespace ScoreFile {
    export type LoadFailureReason = "read-error" | "parse-error" | "invalid-data";

    export interface SaveProps {
        success: (handle: FileState.Handle) => void;
        cancel: () => void;
        defaultDirectory?: string;
    }

    const getFileName = (path: string) => {
        const normalized = path.replaceAll("\\", "/");
        const segments = normalized.split("/");
        return segments[segments.length - 1] || path;
    };

    const toHandle = (path: string): FileState.Handle => ({
        path,
        name: getFileName(path),
    });

    const createSaveText = () => {
        return get(dataStore);
    };

    const restoreRefTracks = (data: DataState.Value) => {
        const trackArr = [];
        const noteRefs = [];
        for (let i = 0; i < data.scoreTracks.length; i++) {
            trackArr.push([]);
            noteRefs.push([]);
        }
        refStore.set({ ...get(refStore), trackArr, noteRefs });
    };

    export const save = (props: SaveProps) => {
        const fileHandle = get(fileStore);
        const plainData = createSaveText();

        if (fileHandle.score) {
            const storeFileHandle = fileHandle.score;
            (async () => {
                await CompressedJsonFile.write(storeFileHandle.path, plainData);
                props.success(storeFileHandle);
            })().catch(() => {
                props.cancel();
            });
            return;
        }

        (async () => {
            const path = await saveScoreFilePath("sch", props.defaultDirectory);
            if (path == null) {
                props.cancel();
                return;
            }

            const handle = toHandle(path);
            await CompressedJsonFile.write(handle.path, plainData);
            fileStore.set({ ...fileHandle, score: handle });
            props.success(handle);
        })().catch(() => {
            props.cancel();
        });
    };

    export const load = (
        success: (handle: FileState.Handle) => void,
        cancel: () => void,
        failure: (reason: LoadFailureReason, error: unknown) => void,
        defaultDirectory?: string,
    ) => {
        (async () => {
            const path = await openScoreFilePath(defaultDirectory);
            if (path == null) {
                cancel();
                return;
            }

            const readResult = await CompressedJsonFile.read<DataState.Value>(path);
            switch (readResult.type) {
                case "read-error":
                    failure("read-error", readResult.error);
                    return;
                case "parse-error":
                    failure("parse-error", readResult.error);
                    return;
            }

            const newFileHandle = toHandle(path);
            const prevFile = get(fileStore);
            const prevData = get(dataStore);
            const prevRef = get(refStore);
            const loadedData = readResult.value;

            try {
                fileStore.set({ score: newFileHandle });
                dataStore.set(loadedData);
                restoreRefTracks(loadedData);
                recalculate();
                success(newFileHandle);
            } catch (error) {
                fileStore.set(prevFile);
                dataStore.set(prevData);
                refStore.set(prevRef);
                failure("invalid-data", error);
            }
        })().catch((error) => {
            failure("read-error", error);
        });
    };
}

export default ScoreFile;
