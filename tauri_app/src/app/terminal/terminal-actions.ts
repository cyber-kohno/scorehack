import useReducerTerminal from "../../system/store/reducer/reducerTerminal";
import type { StoreProps } from "../../system/store/store";

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
