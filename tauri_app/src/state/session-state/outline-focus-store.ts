import { get, writable } from "svelte/store";

export type OutlineFocusState = {
  focus: number;
  focusLock: number;
};

const INITIAL_OUTLINE_FOCUS_STATE: OutlineFocusState = {
  focus: 1,
  focusLock: -1,
};

export const outlineFocusStore = writable<OutlineFocusState>(
  INITIAL_OUTLINE_FOCUS_STATE,
);

export const getOutlineFocusState = () => get(outlineFocusStore);

export const touchOutlineFocusState = () => {
  outlineFocusStore.set(getOutlineFocusState());
};

export const setOutlineFocus = (focus: number) => {
  getOutlineFocusState().focus = focus;
};

export const setOutlineFocusLock = (focusLock: number) => {
  getOutlineFocusState().focusLock = focusLock;
};
