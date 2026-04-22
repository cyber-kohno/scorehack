import useCommandHelper from "./terminal-command-helper";
import type { RootStoreToken } from "../../state/root-store";

export const createTerminalHelper = (rootStoreToken: RootStoreToken) => {
  return useCommandHelper(rootStoreToken);
};
