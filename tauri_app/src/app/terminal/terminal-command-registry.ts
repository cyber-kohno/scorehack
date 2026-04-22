import {
  createCommandRegistry,
  createDefaultCommandProps,
  type CommandFunc,
  type CommandFuncArg,
  type CommandFuncDefault,
} from "./terminal-command-registry-util";
import type { RootStoreToken } from "../../state/root-store";

export type TerminalCommandArg = CommandFuncArg;
export type TerminalCommandDefault = CommandFuncDefault;
export type TerminalCommand = CommandFunc;

export const createTerminalCommandDefault = (sector: string) => {
  return createDefaultCommandProps(sector);
};

export const createTerminalCommandRegistry = (rootStoreToken: RootStoreToken) => {
  return createCommandRegistry(rootStoreToken);
};
