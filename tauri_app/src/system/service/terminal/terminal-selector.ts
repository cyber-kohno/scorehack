import type TerminalState from "../../store/state/terminal-state";

type Context = {
    terminal: TerminalState.Value;
};

const useTerminalSelector = (ctx: Context) => {
    const { terminal } = ctx;

    const isWait = () => terminal.wait;
    const hasHelper = () => terminal.helper != null;
    const splitCommand = () => {
        const splitStringAtIndex = (str: string, index: number) => {
            return [str.slice(0, index), str.slice(index)];
        };
        return splitStringAtIndex(terminal.command, terminal.focus);
    };

    return {
        hasHelper,
        isWait,
        splitCommand,
    };
};

export default useTerminalSelector;
