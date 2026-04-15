import {
  createCommandRegistry,
  createDefaultCommandProps,
  type CommandFunc,
  type CommandFuncArg,
  type CommandFuncDefault,
} from "../../system/store/reducer/terminal/commandRegistUtil";
import type { StoreProps } from "../../system/store/store";

export type TerminalCommandArg = CommandFuncArg;
export type TerminalCommandDefault = CommandFuncDefault;
export type TerminalCommand = CommandFunc;

export const createTerminalCommandDefault = (sector: string) => {
  return createDefaultCommandProps(sector);
};

export const createTerminalCommandRegistry = (lastStore: StoreProps) => {
  return createCommandRegistry(lastStore);
};
