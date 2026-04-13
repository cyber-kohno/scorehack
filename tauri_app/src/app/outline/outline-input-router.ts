import useLegacyInputOutline from "../../system/input/inputOutline";
import type StoreInput from "../../system/store/props/storeInput";
import type { StoreUtil } from "../../system/store/store";

export type OutlineInputRouter = {
  control: (eventKey: string) => void;
  getHoldCallbacks: (eventKey: string) => StoreInput.Callbacks;
};

export const createOutlineInputRouter = (
  storeUtil: StoreUtil,
): OutlineInputRouter => {
  const legacyInputOutline = useLegacyInputOutline(storeUtil);

  return {
    control: (eventKey: string) => {
      legacyInputOutline.control(eventKey);
    },
    getHoldCallbacks: (eventKey: string) => {
      return legacyInputOutline.getHoldCallbacks(eventKey);
    },
  };
};
