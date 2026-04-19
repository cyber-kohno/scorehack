import type { InputState } from "./input-store";
import type { StoreProps } from "../../system/store/store";
import { getInputStateStore, setInputHoldValue } from "./input-store";

export type InputHoldKey = keyof InputState;

export const setInputHoldState = (
  _lastStore: StoreProps,
  key: InputHoldKey,
  isDown: boolean,
) => {
  setInputHoldValue(key, isDown);
};

export const hasAnyInputHold = (_lastStore: StoreProps) => {
  return Object.values(getInputStateStore()).some((flag) => flag);
};


