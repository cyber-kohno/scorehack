import MidiWriter from 'midi-writer-js';
import { get } from 'svelte/store';
import FilePathRef from './file-path-ref';
import { openAudioFilePath, saveTextFilePath } from '../tauri/dialog';
import { writeUtf8TextFile } from '../tauri/fs';
import { settingsStore } from '../../store/global-store';
import MelodyState from '../../store/state/data/melody-state';
import type FileState from '../../store/state/file-state';

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

    interface SaveBase {
        success: (handle: FileState.Handle) => void;
        cancel: () => void;
        defaultDirectory?: string;
    }

    interface SaveTextFile extends SaveBase {
        plainData: string;
        extension: string;
        filterName: string;
    }

    export const loadMp3 = (
        track: MelodyState.AudioTrack,
        success: (handle: FileState.Handle) => void,
        cancel: () => void
    ) => {
        (async () => {
            try {
                const path = await openAudioFilePath();
                if (path == null) {
                    cancel();
                    return;
                }

                track.pathRef = FilePathRef.createPathRef(path, get(settingsStore).envs.HOME_DIR);
                success(toHandle(path));
            } catch (error) {
                console.error('Failed to load audio file:', error);
                cancel();
            }
        })();
    }

    export const downloadMidi = (fileName: string) => {
        const track = new MidiWriter.Track();
        track.addEvent(new MidiWriter.ProgramChangeEvent({ instrument: 1 }));

        const writer = new MidiWriter.Writer(track);
        const link = document.createElement('a');
        link.href = writer.dataUri();
        link.download = `${fileName}.mid`;
        link.click();
    }

    export const saveTextFile = (props: SaveTextFile) => {
        (async () => {
            const path = await saveTextFilePath({
                extension: props.extension,
                name: props.filterName,
                defaultDirectory: props.defaultDirectory,
            });
            if (path == null) {
                props.cancel();
                return;
            }

            const exportPath = path.toLowerCase().endsWith(`.${props.extension}`)
                ? path
                : `${path}.${props.extension}`;
            const handle = toHandle(exportPath);
            await writeUtf8TextFile(handle.path, props.plainData);
            props.success(handle);
        })().catch(() => {
            props.cancel();
        });
    }
};

export default FileUtil;
