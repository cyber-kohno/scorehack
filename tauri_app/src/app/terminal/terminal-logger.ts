import useTerminalLogger from "./terminal-logger-core";
import type { TerminalState } from "../../state/session-state/terminal-store";

export const createTerminalLogger = (terminal: TerminalState) => {
  return useTerminalLogger(terminal);
};
