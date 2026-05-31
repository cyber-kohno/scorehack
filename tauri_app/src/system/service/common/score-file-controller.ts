import pako from "pako";
import { get } from "svelte/store";
import { openScoreFilePath, saveScoreFilePath } from "../../infra/tauri/dialog";
import { readUtf8TextFile, writeUtf8TextFile } from "../../infra/tauri/fs";
import { dataStore, fileStore, refStore } from "../../store/global-store";
import type DataState from "../../store/state/data/data-state";
import type FileState from "../../store/state/file-state";
import recalculate from "../derived/recalculate-derived";

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

    const uint8ArrayToBase64 = (buffer: Uint8Array) => {
        let binary = "";
        const bytes = new Uint8Array(buffer);
        const len = bytes.byteLength;
        for (let i = 0; i < len; i++) {
            binary += String.fromCharCode(bytes[i]);
        }
        return window.btoa(binary);
    };

    const zip = (baseStr: string) => {
        const encoder = new TextEncoder();
        const textUint8Array = encoder.encode(baseStr);
        const compressed = pako.gzip(textUint8Array);
        return uint8ArrayToBase64(compressed);
    };

    const unzip = (baseStr: string) => {
        const compressedFromBase64 = Uint8Array.from(atob(baseStr), c => c.charCodeAt(0));
        return pako.inflate(compressedFromBase64, { to: "string" });
    };

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
                await writeUtf8TextFile(storeFileHandle.path, zip(plainData));
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
            await writeUtf8TextFile(handle.path, zip(plainData));
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
                const loadedData = JSON.parse(unzip(fileContents)) as DataState.Value;

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
