import useTerminalLogger from "../../system/store/reducer/terminal/terminalLogger";
import type { TerminalState } from "../../state/session-state/terminal-store";

export const createTerminalLogger = (terminal: TerminalState) => {
  return useTerminalLogger(terminal);
};
