import type InputState from "../store/state/input-state";
import createTerminalActions from "../actions/terminal/terminal-actions";

const useInputTerminal = () => {

    const terminalActions = createTerminalActions();

    const control = (eventKey: string) => {

        switch (eventKey) {
            case 'Backspace': terminalActions.removeCommand(); break;
            case 'ArrowLeft': terminalActions.moveFocus(-1); break;
            case 'ArrowRight': terminalActions.moveFocus(1); break;
        }
        // 単一文字のキーのみ処理する
        if (eventKey.length === 1) {
            terminalActions.inputChar(eventKey);
        }
        if (terminalActions.hasHelper()) {
            switch (eventKey) {
                case 'Escape': terminalActions.closeHelper(); break;
                case 'Enter': terminalActions.applyHelper(); break;
                case 'ArrowUp': terminalActions.moveHelperFocus(-1); break;
                case 'ArrowDown': terminalActions.moveHelperFocus(1); break;
            }
        } else {
            switch (eventKey) {
                case 'Escape': terminalActions.close(); break;
                case 'Enter': terminalActions.registCommand(); break;
            }
        }
    }

    const getHoldCallbacks = (eventKey: string): InputState.Callbacks => {

        const callbacks: InputState.Callbacks = {};
        return callbacks;
    }


    return {
        control,
        getHoldCallbacks
    }
}
export default useInputTerminal;
