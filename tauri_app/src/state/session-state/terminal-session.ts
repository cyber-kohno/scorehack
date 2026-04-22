import {
  setTerminalCursorRefState,
  setTerminalFrameRefState,
  setTerminalHelperRefState,
} from "./terminal-ref-store";

export const setTerminalFrameRef = (ref: HTMLElement | undefined) => {
  setTerminalFrameRefState(ref);
};

export const setHelperFrameRef = (ref: HTMLElement | undefined) => {
  setTerminalHelperRefState(ref);
};

export const setCursorRef = (ref: HTMLElement | undefined) => {
  setTerminalCursorRefState(ref);
};
