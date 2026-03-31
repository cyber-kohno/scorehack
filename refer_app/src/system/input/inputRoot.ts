import type StoreInput from "../store/props/storeInput";
import useReducerRoot from "../store/reducer/reducerRoot";
import useReducerTermianl from "../store/reducer/reducerTerminal";
import type { StoreProps, StoreUtil } from "../store/store";
import useInputMelody from "./inputMelody";
import useInputOutline from "./inputOutline";
import useInputTerminal from "./inputTerminal";


const useInputRoot = (storeUtil: StoreUtil) => {
    const { lastStore, commit } = storeUtil;
    const reducerRoot = useReducerRoot(lastStore);
    const reducerTerminal = useReducerTermianl(lastStore);

    const inputOutline = useInputOutline(storeUtil);
    const inputMelody = useInputMelody(storeUtil);

    const control = lastStore.control;

    const controlKeyHold = (eventKey: string, isDown: boolean) => {

        const set = (key: keyof StoreProps['input'], isDown: boolean) => {
            reducerRoot.setInputHold(key, isDown);
            commit();
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

    const setHoldControl = (callbacks: StoreInput.Callbacks) => {

        Object.keys(callbacks).some(key => {
            const holdKey = key as keyof typeof lastStore.input; // キーをタイプアサーションして型を指定
            const callback = callbacks[holdKey];
            if (lastStore.input[holdKey] && callback != undefined) {
                callback();
                // 1つでも処理したらループを抜ける。
                return 1;
            }
        });
    }

    const controlKeyDown = (e: KeyboardEvent) => {
        const eventKey = e.key;

        const mode = control.mode;

        const isUseArrange = lastStore.control.outline.arrange != null;

        if (!reducerRoot.hasHold()) {
            if (reducerTerminal.isUse()) {
                const inputTerminal = useInputTerminal(storeUtil);
                inputTerminal.control(eventKey);
                commit();
                return;
            }

            switch (eventKey) {
                case 'r': {
                    if (isUseArrange) break;
                    reducerRoot.switchMode();
                    commit();
                } break;
                case 't': {
                    reducerTerminal.open();
                    commit();
                } break;
            }

            switch (mode) {
                case 'harmonize': {
                    inputOutline.control(eventKey);
                } break;
                case 'melody': {
                    inputMelody.control(eventKey);
                } break;
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
    const getHoldCallbacks = (eventKey: string): StoreInput.Callbacks => {
        const callbacks: StoreInput.Callbacks = {};

        callbacks.holdE = () => {

            switch (eventKey) {
                case 'ArrowUp': {
                    console.log('E押しながら上');
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