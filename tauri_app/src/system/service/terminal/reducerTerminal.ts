import type { StoreProps } from "../../store/store";
import useMelodyUpdater from "../melody/melody-updater";
import useReducerRef from "../common/reducerRef";
import CommandRegistUtil from "./commandRegistUtil";
import useTerminalLogger from "./terminalLogger";
import { get } from "svelte/store";
import { controlStore, dataStore } from "../../store/global-store";
import useMelodySelector from "../melody/melody-selector";

const useReducerTerminal = (lastStore: StoreProps) => {
    const control = get(controlStore);
    lastStore.control = control;

    const { getCurrScoreTrack } = useMelodySelector(control, get(dataStore));

    const updateTarget = () => {
        const terminal = getTerminal();
        const data = lastStore.data;
        let ret = 'unknown';
        const set = (v: string) => { ret = v };
        const add = (v: string) => { ret += '\\' + v };
        switch (control.mode) {
            case 'harmonize': {
                const outline = control.outline;
                const element = data.elements[control.outline.focus];
                set('harmonize');
                if (outline.arrange == null) {
                    add(element.type);
                    switch (element.type) {
                        case 'chord': {
                        } break;
                    }
                } else {
                    add('arrange');
                    add(outline.arrange.method);
                }
            } break;
            case 'melody': {
                set('melody');
                add(getCurrScoreTrack().name);
            }
        }
        terminal.target = ret;
    }

    const open = () => {
        lastStore.terminal = {
            outputs: [],
            target: '',
            command: '',
            wait: false,
            focus: 0,
            availableFuncs: [],
            helper: null
        };
        updateTarget();
        CommandRegistUtil.useCommandRegister(lastStore).buildAvailableFunctions();
    };
    const close = () => {
        lastStore.terminal = null;
    };

    const getTerminal = () => {
        const terminal = lastStore.terminal;
        if (terminal == null) throw new Error('terminalがnullでgetTerminalを呼び出さしてはならない。');
        return terminal;
    }


    const setCommand = (callback: (prev: string) => string) => {
        const terminal = getTerminal();
        terminal.command = callback(terminal.command);
    }

    const splitCommand = () => {
        const terminal = getTerminal();
        const splitStringAtIndex = (str: string, index: number) => {
            return [str.slice(0, index), str.slice(index)];
        }
        return splitStringAtIndex(terminal.command, terminal.focus);
    }

    const removeCommand = () => {
        const [left, right] = splitCommand();
        if (left.length === 0) return;
        setCommand(() => left.slice(0, left.length - 1) + right);
        getTerminal().focus--;
    }

    const insertCommand = (key: string) => {
        const [left, right] = splitCommand();

        // 先頭がスペース（区切り文字）と、スペースが連続することを許さない
        const isLastStrSpace = left.slice(-1) === ' ';
        const isEmpty = left.length === 0;
        if ((isLastStrSpace || isEmpty) && key === ' ') return;

        setCommand(() => left + key + right);
        getTerminal().focus += key.length;
    }
    const moveFocus = (dir: -1 | 1) => {
        const terminal = getTerminal();
        const newFocus = terminal.focus + dir;
        const command = terminal.command;
        if (newFocus >= 0 && newFocus <= command.length) terminal.focus = newFocus;
    }

    /**
     * コマンドを実行する。
     */
    const registCommand = () => {

        const terminal = getTerminal();
        const { backupCommand, undefinedFunction } = useTerminalLogger(terminal);


        // コマンドのバックアップを出力する
        backupCommand();

        if (terminal.command !== '') {
            const orderItems = terminal.command.split(' ');
            const funcKey = orderItems[0];
            const args = orderItems.slice(1);

            const func = terminal.availableFuncs.find(f => f.funcKey === funcKey);
            if (func == undefined) {
                undefinedFunction(funcKey);
            } else {
                func.callback(args);
            }
        }
        terminal.focus = 0;
        terminal.command = '';

        // const { adjustTerminalScroll } = useReducerRef(lastStore);
        // adjustTerminalScroll();
    }
    return {
        open,
        updateTarget,
        close,
        getTerminal,
        splitCommand,
        removeCommand,
        insertCommand,
        moveFocus,
        registCommand,
    };
}

export default useReducerTerminal;
