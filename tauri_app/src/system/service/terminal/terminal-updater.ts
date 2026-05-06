import TerminalState from "../../store/state/terminal-state";
import type ControlState from "../../store/state/control-state";
import type DataState from "../../store/state/data/data-state";
import type TerminalStateType from "../../store/state/terminal-state";
import useMelodySelector from "../melody/melody-selector";
import useTerminalSelector from "./terminal-selector";
import useTerminalLogger from "./terminalLogger";

type Context = {
    control: ControlState.Value;
    data: DataState.Value;
    terminal: TerminalStateType.Value;
};

const createTerminalUpdater = (ctx: Context) => {
    const { control, data, terminal } = ctx;
    const terminalSelector = useTerminalSelector({ terminal });

    const updateTarget = () => {
        let target = "unknown";
        const set = (v: string) => { target = v; };
        const add = (v: string) => { target += "\\" + v; };

        switch (control.mode) {
            case "harmonize": {
                const outline = control.outline;
                const element = data.elements[control.outline.focus];
                set("harmonize");
                if (outline.arrange == null) {
                    add(element.type);
                } else {
                    add("arrange");
                    add(outline.arrange.method);
                }
            } break;
            case "melody": {
                const { getCurrScoreTrack } = useMelodySelector({ control, data });
                set("melody");
                add(getCurrScoreTrack().name);
            }
        }

        terminal.target = target;
    };

    const removeCommand = () => {
        const [left, right] = terminalSelector.splitCommand();
        if (left.length === 0) return false;

        terminal.command = left.slice(0, left.length - 1) + right;
        terminal.focus--;
        return true;
    };

    const insertCommand = (key: string) => {
        const [left, right] = terminalSelector.splitCommand();

        // 先頭がスペース（区切り文字）と、スペースが連続することを許さない
        const isLastStrSpace = left.slice(-1) === " ";
        const isEmpty = left.length === 0;
        if ((isLastStrSpace || isEmpty) && key === " ") return false;

        terminal.command = left + key + right;
        terminal.focus += key.length;
        return true;
    };

    const moveFocus = (dir: -1 | 1) => {
        const next = terminal.focus + dir;
        if (next < 0 || next > terminal.command.length) return false;

        terminal.focus = next;
        return true;
    };

    const buildHelper = () => {
        terminal.helper = null;

        const orderItems = terminal.command.split(" ");
        const funcKey = orderItems[0];
        const args = orderItems.slice(1);
        let list: string[] = [];

        const isInputFunc = orderItems.length === 1;
        const argIndex = args.length - 1;

        // カーソルが終端のアイテムをフォーカスしていない場合表示しない
        if (terminal.focus <= terminal.command.lastIndexOf(" ")) return;
        if (isInputFunc) {
            list = terminal.availableFuncs.map(f => f.funcKey);
        } else {
            const func = terminal.availableFuncs.find(f => f.funcKey === funcKey);
            if (func == undefined) return;

            const arg = func.args[argIndex];
            if (arg == undefined) return;

            list = (arg.getCandidate ?? (() => []))();
        }

        const keyword = orderItems[orderItems.length - 1];
        list = list.filter(item => item.indexOf(keyword) !== -1);
        if (list.length > 0) {
            // 候補と完全一致した場合表示しない
            if (list[0] === keyword) return;

            terminal.helper = TerminalState.createHelperInitial();
            terminal.helper.list = list;
            terminal.helper.keyword = keyword;
        }
    };

    const closeHelper = () => {
        terminal.helper = null;
    };

    const applyHelper = () => {
        const helper = terminal.helper;
        if (helper == null || helper.focus === -1) return false;

        const items = terminal.command.split(" ");
        items[items.length - 1] = helper.list[helper.focus];
        terminal.command = items.join(" ");
        terminal.focus = terminal.command.length;
        terminal.helper = null;
        return true;
    };

    const moveHelperFocus = (dir: -1 | 1) => {
        const helper = terminal.helper;
        if (helper == null || helper.list.length === 0) return false;

        const lastIndex = helper.list.length - 1;
        let next = helper.focus + dir;
        if (next < 0) next = 0;
        if (next > lastIndex) next = lastIndex;

        helper.focus = next;
        return true;
    };

    /**
     * コマンドを実行する。
     */
    const registCommand = () => {
        const { backupCommand, undefinedFunction } = useTerminalLogger(terminal);

        // コマンドのバックアップを出力する
        backupCommand();

        if (terminal.command !== "") {
            const orderItems = terminal.command.split(" ");
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
        terminal.command = "";
    };

    return {
        applyHelper,
        buildHelper,
        closeHelper,
        insertCommand,
        moveFocus,
        moveHelperFocus,
        registCommand,
        removeCommand,
        updateTarget,
    };
};

export default createTerminalUpdater;
