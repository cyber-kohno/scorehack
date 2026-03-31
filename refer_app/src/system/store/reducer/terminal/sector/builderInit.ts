import MusicTheory from "../../../../util/musicTheory";
import StoreOutline from "../../../props/storeOutline";
import { type StoreProps } from "../../../store";
import useReducerCache from "../../reducerCache";
import useReducerOutline from "../../reducerOutline";
import useReducerTermianl from "../../reducerTerminal";
import CommandRegistUtil from "../commandRegistUtil";
import useTerminalLogger from "../terminalLogger";

const useBuilderInit = (lastStore: StoreProps) => {
  const reducer = useReducerTermianl(lastStore);
  const terminal = reducer.getTerminal();
  const logger = useTerminalLogger(terminal);

  const reducerCache = useReducerCache(lastStore);
  const reducerOutline = useReducerOutline(lastStore);

  const VALID_SCALES = MusicTheory.KEY12_MAJOR_SCALE_LIST.map(
    (i) => i + "major",
  ).concat(MusicTheory.KEY12_MINOR_SCALE_LIST.map((i) => i + "minor"));

  const get = (): CommandRegistUtil.FuncProps[] => {
    const defaultProps = CommandRegistUtil.createDefaultProps("init");
    return [
      {
        ...defaultProps,
        funcKey: "scales",
        args: [],
        callback: () => {
          terminal.outputs.push({
            type: "table",
            table: {
              cols: [{ headerName: "Scale", width: 200, attr: "def" }],
              table: (() => VALID_SCALES.map((item) => [item]))(),
            },
          });
        },
      },
      {
        ...defaultProps,
        funcKey: "tempo",
        args: [{ name: "value" }],
        callback: (args) => {
          const data = reducerOutline.getCurrentInitData();
          const prev = data.tempo;
          const arg0 = logger.validateRequired(args[0], 1);
          if (arg0 == null) return;
          const arg0Number = logger.validateNumber(arg0, 1);
          if (arg0Number == null) return;
          data.tempo = arg0Number;
          reducerCache.calculate();
          logger.outputInfo(`Changed the tempo. [${prev} → ${arg0Number}]`);
        },
      },
      {
        ...defaultProps,
        funcKey: "scale",
        args: [{ name: "scale", getCandidate: () => VALID_SCALES }],
        callback: (args) => {
          const tonality = reducerOutline.getCurrentInitData().tonality;
          const prev = MusicTheory.getScaleName(tonality);
          const arg0 = logger.validateRequired(args[0], 1);
          if (arg0 == null) return;
          const next = arg0;
          // スケールの存在チェック
          if (!VALID_SCALES.includes(args[0])) {
            logger.outputError(`The specified scale[${next}] is invalid.`);
          }
          const { keyIndex, scale } = MusicTheory.getKeyScaleFromName(next);
          tonality.key12 = keyIndex;
          tonality.scale = scale;
          reducerCache.calculate();
          logger.outputInfo(`Changed the scale. [${prev} → ${next}]`);
        },
      },
    ];
  };
  return {
    get,
  };
};
export default useBuilderInit;
