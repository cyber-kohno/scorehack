import { get } from "svelte/store";
import type InputState from "../store/state/input-state";
import { controlStore, inputStore, playbackStore, terminalStore } from "../store/global-store";
import useInputMelody from "./input-melody";
import useInputOutline from "./input-outline";
import useInputTerminal from "./input-terminal";
import StoreUtil from "../service/common/store-util";
import createTerminalActions from "../actions/terminal/terminal-actions";
import FileUtil from "../infra/file/fileUtil";
import { createToast } from "../service/common/toast-service";
import ToastState from "../store/state/toast-state";

const useInputRoot = () => {
    const terminalActions = createTerminalActions();

    const inputOutline = useInputOutline();
    const inputMelody = useInputMelody();
    const isTerminalActive = () => get(terminalStore) != null;

    const controlKeyHold = (eventKey: string, isDown: boolean) => {

        const set = (key: keyof InputState.Value, isDown: boolean) => {
            StoreUtil.setInputHold(key, isDown);
        };
        switch (eventKey) {
            case "e": { set('holdE', isDown) } break;
            case "d": { set('holdD', isDown) } break;
            case "f": { set('holdF', isDown) } break;
            case "c": { set('holdC', isDown) } break;
            case "x": { set('holdX', isDown) } break;
            case "g": { set('holdG', isDown) } break;
            case "Shift": { set('holdShift', isDown) } break;
            case "Control": { set('holdCtrl', isDown) } break;
        }
    }

    const setHoldControl = (callbacks: InputState.Callbacks) => {
        const input = get(inputStore);

        Object.keys(callbacks).some(key => {
            const holdKey = key as keyof typeof input; // キーをタイプアサーションして型を指定
            const callback = callbacks[holdKey];
            if (input[holdKey] && callback != undefined) {
                callback();
                // 1つでも処理したらループを抜ける。
                return 1;
            }
        });
    }

    const controlKeyDown = (e: KeyboardEvent) => {
        const input = get(inputStore);

        const control = get(controlStore);
        const eventKey = e.key;
        const normalizedKey = eventKey.toLowerCase();

        const mode = control.mode;

        const isUseArrange = control.outline.arrange != null;
        const isPlayback = get(playbackStore).timerKeys != null;
        if (e.ctrlKey && normalizedKey === "s") e.preventDefault();

        if (!StoreUtil.hasHold(input)) {
            if (isTerminalActive()) {
                const inputTerminal = useInputTerminal();
                inputTerminal.control(eventKey);
                return;
            }

            if (!isPlayback) {
                switch (eventKey) {
                    case 'r': {
                        if (isUseArrange) break;
                        StoreUtil.switchMode();
                    } break;
                    case 't': {
                        terminalActions.open();
                    } break;
                }
            }

            switch (mode) {
                case 'harmonize': inputOutline.control(eventKey); break;
                case 'melody': inputMelody.control(eventKey); break;
            }

            controlKeyHold(e.key, true);
        } else {
            setHoldControl(getHoldCallbacks(eventKey));

            switch (mode) {
                case 'harmonize': {
                    setHoldControl(inputOutline.getHoldCallbacks(eventKey));
                } break;
                case 'melody': {
                    setHoldControl(inputMelody.getHoldCallbacks(eventKey));
                } break;
            }
        }
    }

    const controlKeyUp = (e: KeyboardEvent) => {
        controlKeyHold(e.key, false);
    }

    // const getHoldCallbacks = (): StoreInput.Callbacks => {
    //     const callbacks: StoreInput.Callbacks = {};

    //     return callbacks;
    // }
    const getHoldCallbacks = (eventKey: string): InputState.Callbacks => {
        const callbacks: InputState.Callbacks = {};

        callbacks.holdCtrl = () => {
            if (get(playbackStore).timerKeys != null) return;

            switch (eventKey.toLowerCase()) {
                case "s": {
                    const fileUtil = FileUtil.getUtil();
                    fileUtil.saveScoreFile({
                        success: (handle) => {
                            createToast({
                                ...ToastState.INITIAL,
                                x: 12,
                                y: 48,
                                width: 280,
                                text: `Saved. [${handle.name}]`,
                            });
                        },
                        cancel: () => {
                            createToast({
                                ...ToastState.INITIAL,
                                x: 12,
                                y: 48,
                                width: 280,
                                text: "Save canceled.",
                            });
                        },
                    });
                } break;
            }
        };

        callbacks.holdE = () => {

            switch (eventKey) {
                case 'ArrowUp': {
                    console.log('holdE + ArrowUp');
                } break;
            }
        }
        return callbacks;
    }

    return {
        controlKeyDown,
        controlKeyUp
    }
}
export default useInputRoot;
