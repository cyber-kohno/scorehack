import MidiWriter from 'midi-writer-js';
import pako from 'pako';
import { get } from 'svelte/store';
import { openMp3FilePath, openScoreFilePath, saveScoreFilePath } from '../tauri/dialog';
import { readBinaryFile, readUtf8TextFile, writeUtf8TextFile } from '../tauri/fs';
import { dataStore, fileStore, refStore } from '../../store/global-store';
import MelodyState from '../../store/state/data/melody-state';
import type FileState from '../../store/state/file-state';
import recalculate from '../../service/derived/recalculate-derived';

namespace FileUtil {
    const getFileName = (path: string) => {
        const normalized = path.replaceAll("\\", "/");
        const segments = normalized.split("/");
        return segments[segments.length - 1] || path;
    }

    const toHandle = (path: string): FileState.Handle => ({
        path,
        name: getFileName(path),
    });

    export interface SaveBase {
        success: (handle: FileState.Handle) => void;
        cancel: () => void;
    }

    export interface SaveFile extends SaveBase {
        plainData: string;
        extension: string;
    }

    const uint8ArrayToBase64 = (buffer: Uint8Array) => {
        let binary = '';
        const bytes = new Uint8Array(buffer);
        const len = bytes.byteLength;
        for (let i = 0; i < len; i++) {
            binary += String.fromCharCode(bytes[i]);
        }
        return window.btoa(binary);
    }

    const gZip = (baseStr: string) => {
        const encoder = new TextEncoder();
        const textUint8Array = encoder.encode(baseStr);
        const compressed = pako.gzip(textUint8Array);
        return uint8ArrayToBase64(compressed);
    }

    const unZip = (baseStr: string) => {
        const compressedFromBase64 = Uint8Array.from(atob(baseStr), c => c.charCodeAt(0));
        return pako.inflate(compressedFromBase64, { to: 'string' });
    }

    export const loadMp3 = (
        track: MelodyState.AudioTrack,
        success: (handle: FileState.Handle) => void,
        cancel: () => void
    ) => {
        (async () => {
            try {
                const path = await openMp3FilePath();
                if (path == null) {
                    cancel();
                    return;
                }

                const fileBytes = await readBinaryFile(path);
                track.fileName = getFileName(path);
                track.source = uint8ArrayToBase64(fileBytes);
                success(toHandle(path));
            } catch (error) {
                console.error('Failed to load audio file:', error);
                cancel();
            }
        })();
    }

    export const base64ToBlob = (base64: string, type: string) => {
        const byteString = atob(base64);
        const arrayBuffer = new Uint8Array(byteString.length);
        for (let i = 0; i < byteString.length; i++) {
            arrayBuffer[i] = byteString.charCodeAt(i);
        }
        return new Blob([arrayBuffer], { type });
    }

    export const getUtil = () => {

        const data = get(dataStore);
        const ref = get(refStore);

        const downloadMidi = (fileName: string) => {
            const track = new MidiWriter.Track();
            track.addEvent(new MidiWriter.ProgramChangeEvent({ instrument: 1 }));

            const writer = new MidiWriter.Writer(track);
            const link = document.createElement('a');
            link.href = writer.dataUri();
            link.download = `${fileName}.mid`;
            link.click();
        }

        const getSaveFile = (): string => {
            return JSON.stringify(data);
        }

        const saveFile = (props: SaveFile) => {
            const fileHandle = get(fileStore);

            if (fileHandle.score) {
                const storeFileHandle = fileHandle.score;
                (async () => {
                    const text = gZip(props.plainData);
                    await writeUtf8TextFile(storeFileHandle.path, text);
                    props.success(storeFileHandle);
                })().catch(() => {
                    props.cancel();
                });
                return;
            }

            (async () => {
                const path = await saveScoreFilePath(props.extension);
                if (path == null) {
                    props.cancel();
                    return;
                }

                const handle = toHandle(path);
                const text = gZip(props.plainData);
                await writeUtf8TextFile(handle.path, text);
                fileStore.set({ ...fileHandle, score: handle });
                props.success(handle);
            })().catch(() => {
                props.cancel();
            });
        }

        const saveScoreFile = (props: SaveBase) => {
            const saveFileStr = getSaveFile();
            saveFile({ ...props, plainData: saveFileStr, extension: 'sch' });
        }

        const loadScoreFile = (success: (handle: FileState.Handle) => void, cancel: () => void) => {

            (async () => {
                try {
                    const path = await openScoreFilePath();
                    if (path == null) {
                        cancel();
                        return;
                    }

                    const newFileHandle = toHandle(path);
                    const fileContents = await readUtf8TextFile(path);
                    fileStore.set({ score: newFileHandle });
                    const text = unZip(fileContents);
                    dataStore.set(JSON.parse(text));
                    for (let i = 0; i < data.scoreTracks.length; i++) {
                        ref.trackArr.push([]);
                    }
                    recalculate();
                    success(newFileHandle);
                } catch {
                    cancel();
                }
            })();
        }

        return {
            saveScoreFile,
            loadScoreFile,
            loadMp3,
            downloadMidi,
        }
    }
};

export default FileUtil;
