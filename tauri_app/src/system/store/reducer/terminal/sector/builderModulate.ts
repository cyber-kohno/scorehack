import {
  createTerminalCommandDefault,
  type TerminalCommand,
} from "../../../../../app/terminal/terminal-command-registry";
import { createTerminalLogger } from "../../../../../app/terminal/terminal-logger";
import { createOutlineActions } from "../../../../../app/outline/outline-actions";
import {
  OUTLINE_DOMM_VALUES,
  type OutlineDataModulate,
} from "../../../../../domain/outline/outline-types";
import type { StoreProps } from "../../../store";
import useReducerCache from "../../reducerCache";
import useReducerTermianl from "../../reducerTerminal";

const useBuilderModulate = (lastStore: StoreProps) => {
  const reducer = useReducerTermianl(lastStore);
  const terminal = reducer.getTerminal();
  const logger = createTerminalLogger(terminal);

  const reducerCache = useReducerCache(lastStore);
  const reducerOutline = createOutlineActions(lastStore);

  const get = (): TerminalCommand[] => {
    const defaultProps = createTerminalCommandDefault("modulate");
    const getCurrDispValue = (data: OutlineDataModulate) =>
      `[${data.method}${data.val ? " " + data.val : ""}]`;

    const outputModLog = (prev: string, next: string) => {
      logger.outputInfo(`Modulate method has been changed. [${prev} -> ${next}]`);
    };

    return [
      {
        ...defaultProps,
        funcKey: "domm",
        args: [
          {
            name: "value",
            getCandidate: () => OUTLINE_DOMM_VALUES.map((v) => v.toString()),
          },
        ],
        callback: (args) => {
          const data = reducerOutline.getCurrentModulateData();
          const prev = getCurrDispValue(data);
          const value = args[0];

          if (!OUTLINE_DOMM_VALUES.includes(Number(value) as (typeof OUTLINE_DOMM_VALUES)[number])) {
            logger.outputError(`The specified value[${value}] is invalid.`);
          }
          data.method = "domm";
          data.val = Number(value);
          reducerCache.calculate();
          outputModLog(prev, `domm ${value}`);
        },
      },
      {
        ...defaultProps,
        funcKey: "key",
        args: [
          {
            name: "value",
            getCandidate: () => OUTLINE_DOMM_VALUES.map((v) => v.toString()),
          },
        ],
        callback: (args) => {
          const data = reducerOutline.getCurrentModulateData();
          const prev = getCurrDispValue(data);
          const value = args[0];

          if (!OUTLINE_DOMM_VALUES.includes(Number(value) as (typeof OUTLINE_DOMM_VALUES)[number])) {
            logger.outputError(`The specified value[${value}] is invalid.`);
          }
          data.method = "key";
          data.val = Number(value);
          reducerCache.calculate();
          outputModLog(prev, `key ${value}`);
        },
      },
      {
        ...defaultProps,
        funcKey: "parallel",
        args: [],
        callback: () => {
          const data = reducerOutline.getCurrentModulateData();
          const prev = getCurrDispValue(data);

          data.method = "parallel";
          data.val = undefined;
          reducerCache.calculate();
          outputModLog(prev, "parallel");
        },
      },
      {
        ...defaultProps,
        funcKey: "relative",
        args: [],
        callback: () => {
          const data = reducerOutline.getCurrentModulateData();
          const prev = getCurrDispValue(data);

          data.method = "relative";
          data.val = undefined;
          reducerCache.calculate();
          outputModLog(prev, "relative");
        },
      },
    ];
  };

  return {
    get,
  };
};

export default useBuilderModulate;
