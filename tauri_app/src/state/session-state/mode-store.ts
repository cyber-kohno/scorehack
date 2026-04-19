import { get, writable } from "svelte/store";

export type ControlMode = "harmonize" | "melody";

export const modeStore = writable<ControlMode>("harmonize");

export const getModeState = () => get(modeStore);

export const setModeState = (mode: ControlMode) => {
  modeStore.set(mode);
};

export const touchModeState = () => {
  modeStore.set(getModeState());
};
