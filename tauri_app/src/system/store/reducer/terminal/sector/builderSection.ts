import {
  createTerminalCommandDefault,
  type TerminalCommand,
} from "../../../../../app/terminal/terminal-command-registry";
import { createTerminalLogger } from "../../../../../app/terminal/terminal-logger";
import { createOutlineActions } from "../../../../../app/outline/outline-actions";
import type { StoreProps } from "../../../store";
import useReducerCache from "../../reducerCache";
import useReducerTermianl from "../../reducerTerminal";

const useBuilderSection = (lastStore: StoreProps) => {
  const reducer = useReducerTermianl(lastStore);
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
          const { getCurrentSectionData, renameSectionData } = createOutlineActions(lastStore);
          const { calculate } = useReducerCache(lastStore);

          const prev = getCurrentSectionData().name;
          const next = args[0];
          renameSectionData(next);
          calculate();

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
