import type ControlState from "../../store/state/control-state";
import type DataState from "../../store/state/data/data-state";
import type RefState from "../../store/state/ref-state";
import type TerminalState from "../../store/state/terminal-state";
import type useMelodySelector from "../melody/melody-selector";
import type useOutlineSelector from "../outline/outline-selector";
import type useTerminalLogger from "./terminalLogger";

namespace TerminalCommand {
    export type Arg = {
        name: string;
        /** ヘルパー利用時の候補リスト */
        getCandidate?: () => string[];
    };

    export interface PropsDefault {
        sector: string;
        usage: string;
        args: Arg[];
        callback: (args: string[]) => void;
    }

    export interface Props extends PropsDefault {
        funcKey: string;
    }

    export type Context = {
        control: ControlState.Value;
        data: DataState.Value;
        ref: RefState.Value;
        terminal: TerminalState.Value;
        logger: ReturnType<typeof useTerminalLogger>;
        selectors: {
            melody: ReturnType<typeof useMelodySelector>;
            outline: ReturnType<typeof useOutlineSelector>;
        };
        commit: {
            control: () => void;
            data: () => void;
            dataAndRecalculate: () => void;
            ref: () => void;
            terminal: () => void;
        };
    };

    export const createDefaultProps = (sector: string): PropsDefault => ({
        sector,
        usage: "",
        args: [],
        callback: () => [],
    });
}

export default TerminalCommand;
