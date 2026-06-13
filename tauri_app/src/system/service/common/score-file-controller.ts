import { get } from "svelte/store";
import { openScoreFilePath, saveScoreFilePath } from "../../infra/tauri/dialog";
import { readUtf8TextFile, writeUtf8TextFile } from "../../infra/tauri/fs";
import { dataStore, fileStore, refStore } from "../../store/global-store";
import type DataState from "../../store/state/data/data-state";
import type FileState from "../../store/state/file-state";
import recalculate from "../derived/recalculate-derived";
import TextCompression from "./text-compression";

namespace ScoreFile {
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
        return JSON.stringify(get(dataStore));
    };

    const restoreRefTracks = (data: DataState.Value) => {
        const ref = get(refStore);
        ref.trackArr.length = 0;
        ref.noteRefs.length = 0;
        for (let i = 0; i < data.scoreTracks.length; i++) {
            ref.trackArr.push([]);
            ref.noteRefs.push([]);
        }
        refStore.set({ ...ref });
    };

    export const save = (props: SaveProps) => {
        const fileHandle = get(fileStore);
        const plainData = createSaveText();

        if (fileHandle.score) {
            const storeFileHandle = fileHandle.score;
            (async () => {
                await writeUtf8TextFile(storeFileHandle.path, TextCompression.zip(plainData));
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
            await writeUtf8TextFile(handle.path, TextCompression.zip(plainData));
            fileStore.set({ ...fileHandle, score: handle });
            props.success(handle);
        })().catch(() => {
            props.cancel();
        });
    };

    export const load = (
        success: (handle: FileState.Handle) => void,
        cancel: () => void,
        defaultDirectory?: string,
    ) => {
        (async () => {
            try {
                const path = await openScoreFilePath(defaultDirectory);
                if (path == null) {
                    cancel();
                    return;
                }

                const newFileHandle = toHandle(path);
                const fileContents = await readUtf8TextFile(path);
                const loadedData = JSON.parse(TextCompression.unzip(fileContents)) as DataState.Value;

                fileStore.set({ score: newFileHandle });
                dataStore.set(loadedData);
                restoreRefTracks(loadedData);
                recalculate();
                success(newFileHandle);
            } catch {
                cancel();
            }
        })();
    };
}

export default ScoreFile;
