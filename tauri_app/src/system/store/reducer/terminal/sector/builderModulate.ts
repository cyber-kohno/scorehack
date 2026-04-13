import {
  OUTLINE_DOMM_VALUES,
  type OutlineDataModulate,
} from "../../../../../domain/outline/outline-types";
import { createOutlineActions } from "../../../../../app/outline/outline-actions";
import { type StoreProps } from "../../../store";
import useReducerCache from "../../reducerCache";
import useReducerTermianl from "../../reducerTerminal";
import CommandRegistUtil from "../commandRegistUtil";
import useTerminalLogger from "../terminalLogger";

const useBuilderModulate = (lastStore: StoreProps) => {
  const reducer = useReducerTermianl(lastStore);
  const terminal = reducer.getTerminal();
  const logger = useTerminalLogger(terminal);

  const reducerCache = useReducerCache(lastStore);
  const reducerOutline = createOutlineActions(lastStore);

  const get = (): CommandRegistUtil.FuncProps[] => {
    const defaultProps = CommandRegistUtil.createDefaultProps("modulate");
    const getCurrDispValue = (data: OutlineDataModulate) =>
      `[${data.method}${data.val ? " " + data.val : ""}]`;

    const outputModLog = (prev: string, next: string) => {
      logger.outputInfo(
        `Modulate method has been changed. [${prev} 竊・${next}]`,
      );
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

          // 謨ｰ蛟､縺ｮ螟画鋤繝√ぉ繝・け
          if (!OUTLINE_DOMM_VALUES.includes(Number(value) as (typeof OUTLINE_DOMM_VALUES)[number])) {
            logger.outputError(`The specified value[${value}] is invalid.`);
          }
          data.method = "domm";
          data.val = Number(value);
          reducerCache.calculate();
          const next = `domm ${value}`;

          outputModLog(prev, next);
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

          // 謨ｰ蛟､縺ｮ螟画鋤繝√ぉ繝・け
          if (!OUTLINE_DOMM_VALUES.includes(Number(value) as (typeof OUTLINE_DOMM_VALUES)[number])) {
            logger.outputError(`The specified value[${value}] is invalid.`);
          }
          data.method = "key";
          data.val = Number(value);
          reducerCache.calculate();
          const next = `key ${value}`;

          outputModLog(prev, next);
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
          const next = `parallel`;

          outputModLog(prev, next);
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
          const next = `relative`;

          outputModLog(prev, next);
        },
      },
    ];
  };
  return {
    get,
  };
};
export default useBuilderModulate;

