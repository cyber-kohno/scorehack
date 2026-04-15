import useTerminalLogger from "../../system/store/reducer/terminal/terminalLogger";
import type StoreTerminal from "../../system/store/props/storeTerminal";

export const createTerminalLogger = (terminal: StoreTerminal.Props) => {
  return useTerminalLogger(terminal);
};
