import {
  createTerminalCommandDefault,
  type TerminalCommand,
} from "../terminal-command-registry";
import { createTerminalLogger } from "../terminal-logger";
import { createOutlineActions } from "../../outline/outline-actions";
import type { RootStoreToken } from "../../../state/root-store";
import { createCacheActions } from "../../cache/cache-actions";
import useReducerTermianl from "../terminal-reducer";

const useBuilderSection = (rootStoreToken: RootStoreToken) => {
  const reducer = useReducerTermianl(rootStoreToken);
  const terminal = reducer.getTerminal();
  const logger = createTerminalLogger(terminal);

  const get = (): TerminalCommand[] => {
    const defaultProps = createTerminalCommandDefault("section");
    return [
      {
        ...defaultProps,
        funcKey: "ren",
        usage: "Change the section name.",
        args: [],
        callback: (args) => {
          const { getCurrentSectionData, renameSectionData } = createOutlineActions(rootStoreToken);
          const { recalculate } = createCacheActions(rootStoreToken);

          const prev = getCurrentSectionData().name;
          const next = args[0];
          renameSectionData(next);
          recalculate();

          logger.outputInfo(`The section name has been changed. [${prev} to ${next}]`);
        },
      },
    ];
  };
  return {
    get,
  };
};
export default useBuilderSection;



