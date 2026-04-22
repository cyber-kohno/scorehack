import useReducerTerminal from "./terminal-reducer";
import type { StoreProps } from "../../state/root-store";

export const createTerminalActions = (lastStore: StoreProps) => {
  const reducer = useReducerTerminal(lastStore);

  return {
    isUse: reducer.isUse,
    open: reducer.open,
    updateTarget: reducer.updateTarget,
    close: reducer.close,
    getTerminal: reducer.getTerminal,
    splitCommand: reducer.splitCommand,
    removeCommand: reducer.removeCommand,
    insertCommand: reducer.insertCommand,
    moveFocus: reducer.moveFocus,
    registCommand: reducer.registCommand,
  };
};
