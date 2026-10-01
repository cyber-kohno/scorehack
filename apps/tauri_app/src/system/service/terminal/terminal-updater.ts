import TerminalState from "../../store/state/terminal-state";
import type TerminalCommand from "./terminal-command";
import type ControlState from "../../store/state/control-state";
import type DataState from "../../store/state/data/data-state";
import type LibraryState from "../../store/state/library-state";
import type SettingsState from "../../store/state/settings-state";
import type TerminalStateType from "../../store/state/terminal-state";
import useMelodySelector from "../melody/melody-selector";
import useTerminalSelector from "./terminal-selector";
import TerminalShortcutResolver from "./terminal-shortcut-resolver";
import useTerminalLogger from "./terminal-logger";

type Context = {
    control: ControlState.Value;
    data: DataState.Value;
    library: LibraryState.Value | null;
    settings: SettingsState.Value;
    terminal: TerminalStateType.Value;
};

const createTerminalUpdater = (ctx: Context) => {
    const { control, data, library, settings, terminal } = ctx;
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
                if (library != null && outline.arrange == null) {
                    add("library");
                } else if (outline.arrange == null) {
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

    const resolveArg = (args: TerminalCommand.Arg[], index: number) => {
        const arg = args[index];
        if (arg != undefined) return arg;

        const lastArg = args[args.length - 1];
        if (lastArg?.variadic === true) return lastArg;

        return undefined;
    };

    const buildHelper = () => {
        terminal.helper = null;

        const orderItems = terminal.command.split(" ");
        const resolvedCommand = TerminalShortcutResolver.resolve(
            terminal.command,
            settings.terminalShortcuts,
        );
        const resolvedItems = resolvedCommand.split(" ");
        const commandKey = resolvedItems[0];
        const args = resolvedItems.slice(1);
        let list: string[] = [];
        let header = "";
        let overview = "";
        let currentArg: TerminalCommand.Arg | null = null;
        let currentArgs: string[] = [];
        let showEmptyList = false;

        const isInputFunc = orderItems.length === 1;
        const argIndex = args.length - 1;

        // カーソルが終端のアイテムをフォーカスしていない場合表示しない
        if (terminal.focus <= terminal.command.lastIndexOf(" ")) return;
        if (isInputFunc) {
            list = orderItems[0].startsWith("@")
                ? settings.terminalShortcuts.map((shortcut) => shortcut.key)
                : terminal.availableFuncs.map(f => f.key);
            header = orderItems[0].startsWith("@") ? "Shortcut" : "command";
        } else {
            const command = terminal.availableFuncs.find(f => f.key === commandKey);
            if (command == undefined) return;

            if (command.kind === "single") {
                const arg = resolveArg(command.args, argIndex);
                if (arg == undefined) return;

                list = (arg.getCandidate ?? (() => []))(args);
                header = `${command.key} / ${arg.name}`;
                overview = arg.overview ?? "";
                currentArg = arg;
                currentArgs = args;
                showEmptyList = true;
            } else {
                if (args.length <= 1) {
                    list = command.subCommands.map(subCommand => subCommand.key);
                    header = `${command.key} / sub-command`;
                } else {
                    const subCommand = command.subCommands.find(subCommand => subCommand.key === args[0]);
                    if (subCommand == undefined) return;

                    const subArgs = args.slice(1);
                    const arg = resolveArg(subCommand.args, subArgs.length - 1);
                    if (arg == undefined) return;

                    list = (arg.getCandidate ?? (() => []))(subArgs);
                    header = `${command.key} ${subCommand.key} / ${arg.name}`;
                    overview = arg.overview ?? "";
                    currentArg = arg;
                    currentArgs = subArgs;
                    showEmptyList = true;
                }
            }
        }

        const keyword = orderItems[orderItems.length - 1];
        list = list.filter(item => item.indexOf(keyword) !== -1);
        if (list.length > 0 || showEmptyList) {
            // 候補と完全一致した候補しかない場合表示しない
            if (list.length === 1 && list[0] === keyword) return;

            terminal.helper = TerminalState.createHelperInitial();
            terminal.helper.header = header;
            terminal.helper.overview = overview;
            terminal.helper.list = list;
            terminal.helper.keyword = keyword;
            terminal.helper.focus = list.length > 0 ? 0 : -1;
            terminal.helper.isAccept = keyword === ""
                ? true
                : currentArg?.isAccept?.(keyword, currentArgs) ?? true;
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

        const outputCommandReference = (command: TerminalStateType.Value["availableFuncs"][number]) => {
            if (command.kind !== "multi") return;

            terminal.outputs.push({
                type: "table",
                table: {
                    cols: [
                        { headerName: "Command", width: 170, attr: "def" },
                        { headerName: "Usage", width: 420, attr: "sentence" },
                    ],
                    table: command.subCommands.map((subCommand) => {
                        const args = subCommand.args.map(arg => `<${arg.name}>`).join(" ");
                        return [
                            [command.key, subCommand.key, args].filter(item => item !== "").join(" "),
                            subCommand.usage,
                        ];
                    }),
                },
            });
        };

        // コマンドのバックアップを出力する
        backupCommand();

        if (terminal.command !== "") {
            const resolvedCommand = TerminalShortcutResolver.resolve(
                terminal.command,
                settings.terminalShortcuts,
            );
            const orderItems = resolvedCommand.split(" ");
            const commandKey = orderItems[0];
            const args = orderItems.slice(1);

            const command = terminal.availableFuncs.find(f => f.key === commandKey);
            if (command == undefined) {
                undefinedFunction(commandKey);
            } else if (command.kind === "single") {
                command.callback(args);
            } else {
                const subCommandKey = args[0];
                const subCommand = command.subCommands.find(subCommand => subCommand.key === subCommandKey);
                if (subCommand == undefined) {
                    if (subCommandKey == undefined || subCommandKey === "") {
                        outputCommandReference(command);
                    } else {
                        undefinedFunction(`${command.key} ${subCommandKey}`);
                    }
                } else {
                    subCommand.callback(args.slice(1));
                }
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
