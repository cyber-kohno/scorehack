import type { StoreProps } from "../../system/store/store";
import { getTerminalStateStore } from "../session-state/terminal-store";
import { getModeState, type ControlMode } from "../session-state/mode-store";
import { getOutlineArrangeState } from "../session-state/outline-arrange-store";

export type ShellMode = ControlMode;

export const getShellMode = (lastStore: StoreProps): ShellMode => {
  return getModeState();
};

export const isTerminalVisible = (lastStore: StoreProps) => {
  return getTerminalStateStore() != null;
};

export const isArrangeInUse = (lastStore: StoreProps) => {
  return getOutlineArrangeState() != null;
};

export const isArrangeEditorVisible = (lastStore: StoreProps) => {
  const arrange = getOutlineArrangeState();
  if (arrange == null) return false;
  return arrange.editor != undefined;
};

export const isArrangeFinderVisible = (lastStore: StoreProps) => {
  const arrange = getOutlineArrangeState();
  if (arrange == null) return false;
  return arrange.finder != undefined;
};
