import type { StoreProps } from "../../system/store/store";

export const setTerminalFrameRef = (
  lastStore: StoreProps,
  ref: HTMLElement | undefined,
) => {
  lastStore.ref.terminal = ref;
};

export const setHelperFrameRef = (
  lastStore: StoreProps,
  ref: HTMLElement | undefined,
) => {
  lastStore.ref.helper = ref;
};

export const setCursorRef = (
  lastStore: StoreProps,
  ref: HTMLElement | undefined,
) => {
  lastStore.ref.cursor = ref;
};
