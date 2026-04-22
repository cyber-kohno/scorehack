import type { InputState } from "./input-store";
import { getInputStateStore, setInputHoldValue } from "./input-store";

export type InputHoldKey = keyof InputState;

export const setInputHoldState = (key: InputHoldKey, isDown: boolean) => {
  setInputHoldValue(key, isDown);
};

export const hasAnyInputHold = () => {
  return Object.values(getInputStateStore()).some((flag) => flag);
};
