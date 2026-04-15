import useInputMelody from "../../system/input/inputMelody";
import type { StoreUtil } from "../../system/store/store";

export const createMelodyInputRouter = (storeUtil: StoreUtil) => {
  const input = useInputMelody(storeUtil);

  return {
    control: input.control,
    getHoldCallbacks: input.getHoldCallbacks,
  };
};
