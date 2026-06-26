import { get } from "svelte/store";
import InputState from "../store/state/input-state";
import { actionMenuStore, confirmDialogStore, controlStore, floatingTextInputStore, inputStore, libraryStore, mappingStore, playbackStore, terminalStore, trackManagerStore } from "../store/global-store";
import createTrackManagerActions from "../actions/track/track-manager-actions";
import createMappingActions from "../actions/library/mapping-actions";
import useInputActionMenu from "./input-action-menu";
import useInputFloatingTextInput from "./input-floating-text-input";
import useInputLibrary from "./input-library";
import useInputMapping from "./input-mapping";
import useInputMelody from "./input-melody";
import useInputOutline from "./input-outline";
import useInputTerminal from "./input-terminal";
import useInputTrackManager from "./input-track-manager";
import InputRootController from "../service/common/input-root-controller";
import createTerminalActions from "../actions/terminal/terminal-actions";
import ConfirmDialog from "../service/common/confirm-dialog-controller";

const useInputRoot = () => {
    const terminalActions = createTerminalActions();
    const trackManagerActions = createTrackManagerActions();
    const mappingActions = createMappingActions();

    const inputOutline = useInputOutline();
    const inputMelody = useInputMelody();
    const isTerminalActive = () => get(terminalStore) != null;
    const isConfirmDialogActive = () => get(confirmDialogStore) != null;
    const isFloatingTextInputActive = () => get(floatingTextInputStore) != null;
    const isActionMenuActive = () => get(actionMenuStore) != null;
    const isMappingActive = () => get(mappingStore) != null;
    const isArrangeEditorActive = () => {
        const arrange = get(controlStore).outline.arrange;
        return arrange != null && arrange.editor != undefined;
    };
    const isLibraryActive = () => get(libraryStore) != null && !isArrangeEditorActive();
    const isTrackManagerActive = () => get(trackManagerStore) != null;

    const controlKeyHold = (eventKey: string, isDown: boolean) => {

        const set = (key: keyof InputState.Value, isDown: boolean) => {
            InputRootController.setInputHold(key, isDown);
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
            }
        });
    }

    const controlKeyDown = (e: KeyboardEvent) => {
        const normalizedKey = e.key.toLowerCase();
        if (
            e.key === "F5" ||
            (e.ctrlKey && normalizedKey === "r") ||
            (e.ctrlKey && e.shiftKey && normalizedKey === "r")
        ) {
            e.preventDefault();
            e.stopPropagation();
            return;
        }

        if (isConfirmDialogActive()) {
            e.preventDefault();
            e.stopPropagation();
            inputStore.set(InputState.createInitial());
            switch (e.key) {
                case "ArrowLeft": ConfirmDialog.move(-1); break;
                case "ArrowRight": ConfirmDialog.move(1); break;
                case "Enter": ConfirmDialog.apply(); break;
                case "Escape": ConfirmDialog.cancel(); break;
            }
            return;
        }
        if (isFloatingTextInputActive()) {
            e.preventDefault();
            e.stopPropagation();
            inputStore.set(InputState.createInitial());
            useInputFloatingTextInput().control(e.key, { shiftKey: e.shiftKey });
            return;
        }
        if (isActionMenuActive()) {
            e.preventDefault();
            e.stopPropagation();
            inputStore.set(InputState.createInitial());
            useInputActionMenu().control(e.key);
            return;
        }
        if (isTerminalActive()) {
            e.preventDefault();
            e.stopPropagation();
            const input = get(inputStore);
            const inputTerminal = useInputTerminal();
            if (!InputRootController.hasHold(input)) {
                inputTerminal.control(e.key);
                if (e.key === "Shift") controlKeyHold(e.key, true);
                return;
            }
            if (e.key.length === 1) {
                inputTerminal.control(e.key);
                return;
            }
            setHoldControl(inputTerminal.getHoldCallbacks(e.key));
            return;
        }
        if (isMappingActive()) {
            e.preventDefault();
            e.stopPropagation();
            inputStore.set(InputState.createInitial());
            useInputMapping().control(e.key, { shiftKey: e.shiftKey });
            return;
        }
        if (isLibraryActive()) {
            e.preventDefault();
            e.stopPropagation();
            inputStore.set(InputState.createInitial());
            useInputLibrary().control(e.key, { shiftKey: e.shiftKey });
            return;
        }
        if (isTrackManagerActive()) {
            e.preventDefault();
            e.stopPropagation();
            inputStore.set(InputState.createInitial());
            useInputTrackManager().control(e.key);
            return;
        }

        const input = get(inputStore);

        const control = get(controlStore);
        const eventKey = e.key;

        const mode = control.mode;

        const isUseArrange = control.outline.arrange != null;
        const isPlayback = get(playbackStore).timerKeys != null;
        if (e.ctrlKey && normalizedKey === "s") e.preventDefault();

        if (!InputRootController.hasHold(input)) {
            if (isTerminalActive()) {
                const inputTerminal = useInputTerminal();
                inputTerminal.control(eventKey);
                if (eventKey === "Shift") controlKeyHold(e.key, true);
                return;
            }

            if (!isPlayback) {
                switch (eventKey) {
                    case 'r': {
                        if (isUseArrange) break;
                        InputRootController.switchMode();
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
            if (isTerminalActive()) {
                const inputTerminal = useInputTerminal();
                if (eventKey.length === 1) {
                    inputTerminal.control(eventKey);
                    return;
                }
                setHoldControl(inputTerminal.getHoldCallbacks(eventKey));
                return;
            }

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
        if (isConfirmDialogActive()) {
            e.preventDefault();
            e.stopPropagation();
            inputStore.set(InputState.createInitial());
            return;
        }
        if (isFloatingTextInputActive()) {
            e.preventDefault();
            e.stopPropagation();
            inputStore.set(InputState.createInitial());
            return;
        }
        if (isActionMenuActive()) {
            e.preventDefault();
            e.stopPropagation();
            inputStore.set(InputState.createInitial());
            return;
        }
        if (isTerminalActive()) {
            e.preventDefault();
            e.stopPropagation();
            if (e.key === "Shift") controlKeyHold(e.key, false);
            return;
        }
        if (isMappingActive()) {
            e.preventDefault();
            e.stopPropagation();
            inputStore.set(InputState.createInitial());
            return;
        }
        if (isLibraryActive()) {
            e.preventDefault();
            e.stopPropagation();
            inputStore.set(InputState.createInitial());
            return;
        }
        if (isTrackManagerActive()) {
            e.preventDefault();
            e.stopPropagation();
            inputStore.set(InputState.createInitial());
            return;
        }

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
                    InputRootController.saveScore();
                } break;
            }
        };

        callbacks.holdShift = () => {
            if (get(playbackStore).timerKeys != null) return;

            switch (eventKey.toLowerCase()) {
                case "m": {
                    mappingActions.open();
                } break;
                case "r": {
                    trackManagerActions.toggle();
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
