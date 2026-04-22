import {
  createTerminalCommandDefault,
  type TerminalCommand,
} from "../terminal-command-registry";
import { createTerminalLogger } from "../terminal-logger";
import { createOutlineActions } from "../../outline/outline-actions";
import {
  OUTLINE_DOMM_VALUES,
  type OutlineDataModulate,
} from "../../../domain/outline/outline-types";
import type { RootStoreToken } from "../../../state/root-store";
import { createCacheActions } from "../../cache/cache-actions";
import useReducerTermianl from "../terminal-reducer";

const useBuilderModulate = (rootStoreToken: RootStoreToken) => {
  const reducer = useReducerTermianl(rootStoreToken);
  const terminal = reducer.getTerminal();
  const logger = createTerminalLogger(terminal);

  const { recalculate } = createCacheActions(rootStoreToken);
  const reducerOutline = createOutlineActions(rootStoreToken);

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
          recalculate();
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
          recalculate();
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
          recalculate();
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
          recalculate();
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




