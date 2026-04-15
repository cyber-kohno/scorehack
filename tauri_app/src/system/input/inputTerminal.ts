import { createTerminalActions } from "../../app/terminal/terminal-actions";
import { createTerminalHelper } from "../../app/terminal/terminal-helper";
import type StoreInput from "../store/props/storeInput";
import useReducerRef from "../store/reducer/reducerRef";
import type { StoreUtil } from "../store/store";

const useInputTerminal = (storeUtil: StoreUtil) => {
    const { lastStore, commit } = storeUtil;

    const terminalActions = createTerminalActions(lastStore);
    const { build: buildHelper } = createTerminalHelper(lastStore);

    const control = (eventKey: string) => {
        const terminal = terminalActions.getTerminal();

        if (terminal.wait) return;
        const { adjustHelperScroll } = useReducerRef(lastStore);

        switch (eventKey) {
            case 'Backspace': {
                terminalActions.removeCommand();
                buildHelper();
                commit();
            } break;
            case 'ArrowLeft': {
                terminalActions.moveFocus(-1);
                buildHelper();
                commit();
            } break;
            case 'ArrowRight': {
                terminalActions.moveFocus(1);
                buildHelper();
                commit();
            } break;
        }
        if (eventKey.length === 1) {
            terminalActions.insertCommand(eventKey);
            buildHelper();
            commit();
        }
        if (terminal.helper) {
            const helper = terminal.helper;

            const focusMove = (dir: -1 | 1) => {
                if (helper.list.length === 0) return;
                const lastIndex = helper.list.length - 1;
                let temp = helper.focus;
                temp += dir;
                if (temp < 0) temp = 0;
                if (temp > lastIndex) temp = lastIndex;
                helper.focus = temp;
                adjustHelperScroll();
                commit();
            }
            switch (eventKey) {
                case 'Escape': {
                    terminal.helper = null;
                    commit();
                } break;
                case 'Enter': {
                    if (helper.focus === -1) break;
                    const items = terminal.command.split(' ');
                    items[items.length - 1] = helper.list[helper.focus];
                    terminal.command = items.join(' ');
                    terminal.focus = terminal.command.length;
                    terminal.helper = null;
                    commit();
                } break;
                case 'ArrowUp': focusMove(-1); break;
                case 'ArrowDown': focusMove(1); break;
            }
        } else {
            switch (eventKey) {
                case 'Escape': {
                    terminalActions.close();
                    commit();
                } break;
                case 'Enter': {
                    terminalActions.registCommand();
                    commit();
                } break;
            }
        }
    }

    const getHoldCallbacks = (_eventKey: string): StoreInput.Callbacks => {
        const callbacks: StoreInput.Callbacks = {};
        return callbacks;
    }

    return {
        control,
        getHoldCallbacks
    }
}
export default useInputTerminal;
