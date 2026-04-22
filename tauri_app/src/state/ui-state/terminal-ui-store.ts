import type {
  TerminalHelperProps,
  TerminalOutputBlock,
  TerminalState,
} from "../session-state/terminal-store";
import { getTerminalStateStore } from "../session-state/terminal-store";

import type { StoreProps } from "../root-store";

export const getTerminalState = (): TerminalState | null => {
  return getTerminalStateStore();
};

export const getTerminalOutputs = (
  lastStore: StoreProps,
): TerminalOutputBlock[] => {
  void lastStore;
  return getTerminalState()?.outputs ?? [];
};

export const getTerminalHelper = (
  lastStore: StoreProps,
): TerminalHelperProps | null => {
  void lastStore;
  return getTerminalState()?.helper ?? null;
};

export const isTerminalWaiting = (lastStore: StoreProps) => {
  void lastStore;
  return getTerminalState()?.wait ?? false;
};

export const getTerminalTargetPrompt = (lastStore: StoreProps) => {
  void lastStore;
  const target = getTerminalState()?.target ?? "";
  return `$${target}>`;
};

export const getTerminalCommandSegments = (lastStore: StoreProps) => {
  void lastStore;
  const terminal = getTerminalState();
  if (terminal == null) return ["", ""] as const;

  return [
    terminal.command.slice(0, terminal.focus),
    terminal.command.slice(terminal.focus),
  ] as const;
};
