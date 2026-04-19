import { get, writable } from "svelte/store";

export type MelodyFocusState = {
  focus: number;
  focusLock: number;
};

const INITIAL_MELODY_FOCUS_STATE: MelodyFocusState = {
  focus: -1,
  focusLock: -1,
};

export const melodyFocusStore = writable<MelodyFocusState>(
  INITIAL_MELODY_FOCUS_STATE,
);

export const getMelodyFocusState = () => get(melodyFocusStore);

export const touchMelodyFocusState = () => {
  melodyFocusStore.set(getMelodyFocusState());
};

export const setMelodyFocus = (focus: number) => {
  getMelodyFocusState().focus = focus;
};

export const setMelodyFocusLock = (focusLock: number) => {
  getMelodyFocusState().focusLock = focusLock;
};
