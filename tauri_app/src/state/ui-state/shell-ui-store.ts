import type { StoreProps } from "../../system/store/store";

export type ShellMode = StoreProps["control"]["mode"];

export const getShellMode = (lastStore: StoreProps): ShellMode => {
  return lastStore.control.mode;
};

export const isTerminalVisible = (lastStore: StoreProps) => {
  return lastStore.terminal != null;
};

export const isArrangeInUse = (lastStore: StoreProps) => {
  return lastStore.control.outline.arrange != null;
};

export const isArrangeEditorVisible = (lastStore: StoreProps) => {
  const arrange = lastStore.control.outline.arrange;
  if (arrange == null) return false;
  return arrange.editor != undefined;
};

export const isArrangeFinderVisible = (lastStore: StoreProps) => {
  const arrange = lastStore.control.outline.arrange;
  if (arrange == null) return false;
  return arrange.finder != undefined;
};
