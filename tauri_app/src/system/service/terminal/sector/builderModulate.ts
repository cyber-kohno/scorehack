import OutlineState from "../../../store/state/data/outline-state";
import { type StoreProps } from "../../../store/store";
import useReducerCache from "../../derived/reducerCache";
import useReducerOutline from "../../outline/reducerOutline";
import useReducerTerminal from "../reducerTerminal";
import CommandRegistUtil from "../commandRegistUtil";
import useTerminalLogger from "../terminalLogger";

const useBuilderModulate = (lastStore: StoreProps) => {
  const reducer = useReducerTerminal(lastStore);
  const terminal = reducer.getTerminal();
  const logger = useTerminalLogger(terminal);

  const reducerCache = useReducerCache(lastStore);
  const reducerOutline = useReducerOutline();

  const get = (): CommandRegistUtil.FuncProps[] => {
    const defaultProps = CommandRegistUtil.createDefaultProps("modulate");
    const getCurrDispValue = (data: OutlineState.DataModulate) =>
      `[${data.method}${data.val ? " " + data.val : ""}]`;

    const outputModLog = (prev: string, next: string) => {
      logger.outputInfo(
        `Modulate method has been changed. [${prev} ↁE${next}]`,
      );
    };

    return [
      {
        ...defaultProps,
        funcKey: "domm",
        args: [
          {
            name: "value",
            getCandidate: () => OutlineState.DommVals.map((v) => v.toString()),
          },
        ],
        callback: (args) => {
          const data = reducerOutline.getCurrentModulateData();
          const prev = getCurrDispValue(data);
          const value = args[0];

          // 数値の変換チェチE��
          if (!OutlineState.DommVals.includes(value)) {
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
            getCandidate: () => OutlineState.DommVals.map((v) => v.toString()),
          },
        ],
        callback: (args) => {
          const data = reducerOutline.getCurrentModulateData();
          const prev = getCurrDispValue(data);
          const value = args[0];

          // 数値の変換チェチE��
          if (!OutlineState.DommVals.includes(value)) {
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
