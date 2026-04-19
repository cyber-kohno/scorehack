import type { StoreProps } from "../../system/store/store";
import {
  setTerminalCursorRefState,
  setTerminalFrameRefState,
  setTerminalHelperRefState,
} from "./terminal-ref-store";

export const setTerminalFrameRef = (
  _lastStore: StoreProps,
  ref: HTMLElement | undefined,
) => {
  setTerminalFrameRefState(ref);
};

export const setHelperFrameRef = (
  _lastStore: StoreProps,
  ref: HTMLElement | undefined,
) => {
  setTerminalHelperRefState(ref);
};

export const setCursorRef = (
  _lastStore: StoreProps,
  ref: HTMLElement | undefined,
) => {
  setTerminalCursorRefState(ref);
};
