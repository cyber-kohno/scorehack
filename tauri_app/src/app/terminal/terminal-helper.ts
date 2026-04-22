import useCommandHelper from "./terminal-command-helper";
import type { StoreProps } from "../../state/root-store";

export const createTerminalHelper = (lastStore: StoreProps) => {
  return useCommandHelper(lastStore);
};
