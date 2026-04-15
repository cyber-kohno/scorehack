import useCommandHelper from "../../system/store/reducer/terminal/helper/commandHelper";
import type { StoreProps } from "../../system/store/store";

export const createTerminalHelper = (lastStore: StoreProps) => {
  return useCommandHelper(lastStore);
};
