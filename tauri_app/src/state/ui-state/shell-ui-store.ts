import type { RootStoreToken } from "../root-store";
import { getTerminalStateStore } from "../session-state/terminal-store";
import { getModeState, type ControlMode } from "../session-state/mode-store";
import { getOutlineArrangeState } from "../session-state/outline-arrange-store";

export type ShellMode = ControlMode;

export const getShellMode = (rootStoreToken: RootStoreToken): ShellMode => {
  void rootStoreToken;
  return getModeState();
};

export const isTerminalVisible = (rootStoreToken: RootStoreToken) => {
  void rootStoreToken;
  return getTerminalStateStore() != null;
};

export const isArrangeInUse = (rootStoreToken: RootStoreToken) => {
  void rootStoreToken;
  return getOutlineArrangeState() != null;
};

export const isArrangeEditorVisible = (rootStoreToken: RootStoreToken) => {
  void rootStoreToken;
  const arrange = getOutlineArrangeState();
  if (arrange == null) return false;
  return arrange.editor != undefined;
};

export const isArrangeFinderVisible = (rootStoreToken: RootStoreToken) => {
  void rootStoreToken;
  const arrange = getOutlineArrangeState();
  if (arrange == null) return false;
  return arrange.finder != undefined;
};
