import { get, writable } from "svelte/store";

export type InputState = {
  holdE: boolean;
  holdD: boolean;
  holdF: boolean;
  holdC: boolean;
  holdX: boolean;
  holdG: boolean;
  holdShift: boolean;
  holdCtrl: boolean;
};

export const INPUT_INITIAL_STATE: InputState = {
  holdE: false,
  holdD: false,
  holdF: false,
  holdC: false,
  holdX: false,
  holdG: false,
  holdShift: false,
  holdCtrl: false,
};

export type InputCallbacks = {
  [K in keyof InputState]?: () => void;
};

export const inputStore = writable<InputState>(INPUT_INITIAL_STATE);

export const getInputStateStore = () => get(inputStore);

export const setInputStateStore = (nextInput: InputState) => {
  inputStore.set(nextInput);
};

export const touchInputState = () => {
  inputStore.set(getInputStateStore());
};

export const setInputHoldValue = (
  key: keyof InputState,
  isDown: boolean,
) => {
  getInputStateStore()[key] = isDown;
};

export const getInputHoldValue = (key: keyof InputState) => {
  return getInputStateStore()[key];
};
