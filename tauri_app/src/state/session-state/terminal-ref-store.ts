import { get, writable } from "svelte/store";

export type TerminalRefState = {
  terminal?: HTMLElement;
  helper?: HTMLElement;
  cursor?: HTMLElement;
};

export const terminalRefStore = writable<TerminalRefState>({});

export const getTerminalRefState = () => get(terminalRefStore);

export const getTerminalFrameRef = () => getTerminalRefState().terminal;

export const getTerminalHelperRef = () => getTerminalRefState().helper;

export const getTerminalCursorRef = () => getTerminalRefState().cursor;

export const setTerminalFrameRefState = (ref?: HTMLElement) => {
  const refs = getTerminalRefState();
  if (refs.terminal === ref) return;
  refs.terminal = ref;
  terminalRefStore.set(refs);
};

export const setTerminalHelperRefState = (ref?: HTMLElement) => {
  const refs = getTerminalRefState();
  if (refs.helper === ref) return;
  refs.helper = ref;
  terminalRefStore.set(refs);
};

export const setTerminalCursorRefState = (ref?: HTMLElement) => {
  const refs = getTerminalRefState();
  if (refs.cursor === ref) return;
  refs.cursor = ref;
  terminalRefStore.set(refs);
};

export const touchTerminalRefs = () => {
  terminalRefStore.set(getTerminalRefState());
};

