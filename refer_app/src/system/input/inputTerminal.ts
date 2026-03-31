import type StoreInput from "../store/props/storeInput";
import useReducerRef from "../store/reducer/reducerRef";
import useReducerTerminal from "../store/reducer/reducerTerminal";
import useCommandHelper from "../store/reducer/terminal/helper/commandHelper";
import type { StoreUtil } from "../store/store";

const useInputTerminal = (storeUtil: StoreUtil) => {
    const { lastStore, commit } = storeUtil;

    const reducerTerminal = useReducerTerminal(lastStore);
    const { build: buildHelper } = useCommandHelper(lastStore);

    const control = (eventKey: string) => {

        const terminal = reducerTerminal.getTerminal();

        // 待機中は操作できない
        if (terminal.wait) return;
        const { adjustHelperScroll } = useReducerRef(lastStore);

        switch (eventKey) {
            case 'Backspace': {
                reducerTerminal.removeCommand();
                buildHelper();
                commit();
            } break;
            case 'ArrowLeft': {
                reducerTerminal.moveFocus(-1);
                buildHelper();
                commit();
            } break;
            case 'ArrowRight': {
                reducerTerminal.moveFocus(1);
                buildHelper();
                commit();
            } break;
        }
        // 単一文字のキーのみ処理する
        if (eventKey.length === 1) {
            reducerTerminal.insertCommand(eventKey);
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
                    reducerTerminal.close();
                    commit();
                } break;
                case 'Enter': {
                    reducerTerminal.registCommand();
                    commit();
                } break;
            }
        }
    }

    const getHoldCallbacks = (eventKey: string): StoreInput.Callbacks => {

        const callbacks: StoreInput.Callbacks = {};
        // callbacks.holdCtrl = () => {
        //     const { build } = useCommandHelper(lastStore);

        //     switch (eventKey) {
        //         case ' ': {
        //             console.log('helper');
        //             build();
        //             commit();
        //         } break;
        //     }
        // }

        return callbacks;
    }


    return {
        control,
        getHoldCallbacks
    }
}
export default useInputTerminal;