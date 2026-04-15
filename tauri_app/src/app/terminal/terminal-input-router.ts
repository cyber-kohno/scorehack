import useInputTerminal from "../../system/input/inputTerminal";
import type { StoreUtil } from "../../system/store/store";

export const createTerminalInputRouter = (storeUtil: StoreUtil) => {
  const input = useInputTerminal(storeUtil);

  return {
    control: input.control,
    getHoldCallbacks: input.getHoldCallbacks,
  };
};
