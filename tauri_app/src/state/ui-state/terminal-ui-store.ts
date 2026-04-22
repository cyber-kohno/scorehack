import type {
  TerminalHelperProps,
  TerminalOutputBlock,
  TerminalState,
} from "../session-state/terminal-store";
import { getTerminalStateStore } from "../session-state/terminal-store";

import type { RootStoreToken } from "../root-store";

export const getTerminalState = (): TerminalState | null => {
  return getTerminalStateStore();
};

export const getTerminalOutputs = (
  rootStoreToken: RootStoreToken,
): TerminalOutputBlock[] => {
  void rootStoreToken;
  return getTerminalState()?.outputs ?? [];
};

export const getTerminalHelper = (
  rootStoreToken: RootStoreToken,
): TerminalHelperProps | null => {
  void rootStoreToken;
  return getTerminalState()?.helper ?? null;
};

export const isTerminalWaiting = (rootStoreToken: RootStoreToken) => {
  void rootStoreToken;
  return getTerminalState()?.wait ?? false;
};

export const getTerminalTargetPrompt = (rootStoreToken: RootStoreToken) => {
  void rootStoreToken;
  const target = getTerminalState()?.target ?? "";
  return `$${target}>`;
};

export const getTerminalCommandSegments = (rootStoreToken: RootStoreToken) => {
  void rootStoreToken;
  const terminal = getTerminalState();
  if (terminal == null) return ["", ""] as const;

  return [
    terminal.command.slice(0, terminal.focus),
    terminal.command.slice(terminal.focus),
  ] as const;
};
