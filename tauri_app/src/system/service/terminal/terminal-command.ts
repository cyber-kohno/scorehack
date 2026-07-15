import type ControlState from "../../store/state/control-state";
import type DataState from "../../store/state/data/data-state";
import type RefState from "../../store/state/ref-state";
import type SettingsState from "../../store/state/settings-state";
import type TerminalState from "../../store/state/terminal-state";
import type useDerivedSelector from "../derived/derived-selector";
import type useMelodySelector from "../melody/melody-selector";
import type useOutlineSelector from "../outline/outline-selector";
import type useTerminalLogger from "./terminal-logger";

namespace TerminalCommand {
    export type Arg = {
        name: string;
        overview?: string;
        variadic?: boolean;
        /** Candidate list for terminal helper. */
        getCandidate?: (args: string[]) => string[];
        isAccept?: (value: string, args: string[]) => boolean;
    };

    export interface CommandBase {
        key: string;
        usage: string;
    }

    export interface CommandUnit extends CommandBase {
        args: Arg[];
        callback: (args: string[]) => void;
    }

    export interface SingleCommandDef extends CommandUnit {
        sector: string;
        kind: "single";
    }

    export interface MultiCommandDef extends CommandBase {
        sector: string;
        kind: "multi";
        subCommands: CommandUnit[];
    }

    export type Props = SingleCommandDef | MultiCommandDef;

    export type Context = {
        control: ControlState.Value;
        data: DataState.Value;
        ref: RefState.Value;
        settings: SettingsState.Value;
        terminal: TerminalState.Value;
        logger: ReturnType<typeof useTerminalLogger>;
        selectors: {
            derived: ReturnType<typeof useDerivedSelector>;
            melody: ReturnType<typeof useMelodySelector>;
            outline: ReturnType<typeof useOutlineSelector>;
        };
        commit: {
            control: () => void;
            data: () => void;
            dataAndRecalculate: () => void;
            ref: () => void;
            settings: () => void;
            terminal: () => void;
        };
    };

    export const createDefaultProps = (sector: string) => ({
        sector,
        kind: "single" as const,
        usage: "",
        args: [],
        callback: () => [],
    });
}

export default TerminalCommand;
