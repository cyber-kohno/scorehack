import useLegacyInputOutline from "./outline-input";
import type { InputCallbacks } from "../../state/session-state/input-store";
import type { StoreUtil } from "../../system/store/store";

export type OutlineInputRouter = {
  control: (eventKey: string) => void;
  getHoldCallbacks: (eventKey: string) => InputCallbacks;
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



