import useReducerTerminal from "./terminal-reducer";
import type { RootStoreToken } from "../../state/root-store";

export const createTerminalActions = (rootStoreToken: RootStoreToken) => {
  const reducer = useReducerTerminal(rootStoreToken);

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
