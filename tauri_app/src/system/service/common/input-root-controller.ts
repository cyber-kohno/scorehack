import { get } from "svelte/store";
import { controlStore, dataStore, derivedStore, inputStore, refStore, settingsStore } from "../../store/global-store";
import type InputState from "../../store/state/input-state";
import FileUtil from "../../infra/file/fileUtil";
import createMelodyUpdater from "../melody/melody-updater";
import Toast from "./toast-controller";
import ToastState from "../../store/state/toast-state";

namespace InputRootController {

    export const switchMode = () => {
        const control = get(controlStore);
        const data = get(dataStore);
        const derived = get(derivedStore);
        const ref = get(refStore);
        const mode = control.mode;
        if (mode === 'harmonize') {
            createMelodyUpdater({ control, data }).syncCursorFromElementSeq(derived);
        }
        control.outline.focusLock = -1;
        control.melody.focusLock = -1;
        control.mode = mode === 'harmonize' ? 'melody' : 'harmonize';
        ref.trackArr.forEach(t => t.length = 0);
        ref.noteRefs.forEach(t => t.length = 0);
        controlStore.set({ ...control });
    };

    export const hasHold = (input: InputState.Value) => {
        return Object.values(input).find(flg => flg) != undefined;
    }

    export const setInputHold = (key: keyof InputState.Value, isDown: boolean) => {
        const input = get(inputStore);
        inputStore.set({ ...input, [key]: isDown });
    }

    export const saveScore = () => {
        const fileUtil = FileUtil.getUtil();
        fileUtil.saveScoreFile({
            defaultDirectory: get(settingsStore).envs.SCH_FILE_DIR,
            success: (handle) => {
                Toast.create({
                    ...ToastState.createInitial(),
                    x: 12,
                    y: 48,
                    width: 280,
                    text: `Saved. [${handle.name}]`,
                });
            },
            cancel: () => {
                Toast.create({
                    ...ToastState.createInitial(),
                    x: 12,
                    y: 48,
                    width: 280,
                    text: "Save canceled.",
                });
            },
        });
    };

}

export default InputRootController;
