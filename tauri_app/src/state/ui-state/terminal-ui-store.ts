import type {
  TerminalHelperProps,
  TerminalOutputBlock,
  TerminalState,
} from "../session-state/terminal-store";
import type { StoreProps } from "../../system/store/store";
import { getTerminalStateStore } from "../session-state/terminal-store";

export const getTerminalState = (
  _lastStore: StoreProps,
): TerminalState | null => {
  return getTerminalStateStore();
};

export const getTerminalOutputs = (
  lastStore: StoreProps,
): TerminalOutputBlock[] => {
  return getTerminalState(lastStore)?.outputs ?? [];
};

export const getTerminalHelper = (
  lastStore: StoreProps,
): TerminalHelperProps | null => {
  return getTerminalState(lastStore)?.helper ?? null;
};

export const isTerminalWaiting = (lastStore: StoreProps) => {
  return getTerminalState(lastStore)?.wait ?? false;
};

export const getTerminalTargetPrompt = (lastStore: StoreProps) => {
  const target = getTerminalState(lastStore)?.target ?? "";
  return `$${target}>`;
};

export const getTerminalCommandSegments = (lastStore: StoreProps) => {
  const terminal = getTerminalState(lastStore);
  if (terminal == null) return ["", ""] as const;

  return [
    terminal.command.slice(0, terminal.focus),
    terminal.command.slice(terminal.focus),
  ] as const;
};
