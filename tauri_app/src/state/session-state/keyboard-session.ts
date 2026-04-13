import type { StoreProps } from "../../system/store/store";

export type InputHoldKey = keyof StoreProps["input"];

export const setInputHoldState = (
  lastStore: StoreProps,
  key: InputHoldKey,
  isDown: boolean,
) => {
  lastStore.input[key] = isDown;
};

export const hasAnyInputHold = (lastStore: StoreProps) => {
  return Object.values(lastStore.input).some((flag) => flag);
};
