import type StoreTerminal from "../../system/store/props/storeTerminal";
import type { StoreProps } from "../../system/store/store";

export const getTerminalState = (
  lastStore: StoreProps,
): StoreTerminal.Props | null => {
  return lastStore.terminal;
};

export const getTerminalOutputs = (
  lastStore: StoreProps,
): StoreTerminal.OutputBlock[] => {
  return lastStore.terminal?.outputs ?? [];
};

export const getTerminalHelper = (
  lastStore: StoreProps,
): StoreTerminal.HelperProps | null => {
  return lastStore.terminal?.helper ?? null;
};

export const isTerminalWaiting = (lastStore: StoreProps) => {
  return lastStore.terminal?.wait ?? false;
};

export const getTerminalTargetPrompt = (lastStore: StoreProps) => {
  const target = lastStore.terminal?.target ?? "";
  return `$${target}>`;
};

export const getTerminalCommandSegments = (lastStore: StoreProps) => {
  const terminal = lastStore.terminal;
  if (terminal == null) return ["", ""] as const;

  return [
    terminal.command.slice(0, terminal.focus),
    terminal.command.slice(terminal.focus),
  ] as const;
};
