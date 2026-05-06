import RhythmTheory from "../../../domain/theory/rhythm-theory";
import TonalityTheory from "../../../domain/theory/tonality-theory";
import TerminalCommand from "../terminal-command";

const createInitCommands = (ctx: TerminalCommand.Context) => {
  const { logger, terminal } = ctx;
  const { getCurrentInitData } = ctx.selectors.outline;

  const list = (): TerminalCommand.Props[] => {
    const defaultProps = TerminalCommand.createDefaultProps("init");
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
              table: (() => TonalityTheory.VALID_SCALE_NAMES.map((item) => [item]))(),
            },
          });
        },
      },
      {
        ...defaultProps,
        funcKey: "lsts",
        args: [],
        callback: () => {
          terminal.outputs.push({
            type: "table",
            table: {
              cols: [{ headerName: "Time Signature", width: 200, attr: "def" }],
              table: RhythmTheory.getTSNames().map(item => [item]),
            },
          });
        },
      },
      {
        ...defaultProps,
        funcKey: "tempo",
        args: [{ name: "value" }],
        callback: (args) => {
          const initData = getCurrentInitData();
          const prev = initData.tempo;
          const arg0 = logger.validateRequired(args[0], 1);
          if (arg0 == null) return;
          const arg0Number = logger.validateNumber(arg0, 1);
          if (arg0Number == null) return;
          initData.tempo = arg0Number;
          ctx.commit.dataAndRecalculate();
          logger.outputInfo(`Changed the tempo. [${prev} ↁE${arg0Number}]`);
        },
      },
      {
        ...defaultProps,
        funcKey: "chts",
        args: [{ name: "timeSignature", getCandidate: () => RhythmTheory.getTSNames() }],
        callback: (args) => {
          const initData = getCurrentInitData();
          const prev = RhythmTheory.formatTS(initData.ts);
          const arg0 = logger.validateRequired(args[0], 1);
          if (arg0 == null) return;

          const nextTS = RhythmTheory.parseTS(arg0);
          if (nextTS == undefined) {
            logger.outputError(`The specified time signature[${arg0}] is invalid.`);
            return;
          }

          initData.ts = nextTS;
          ctx.commit.dataAndRecalculate();
          logger.outputInfo(`Changed the time signature. [${prev} -> ${arg0}]`);
        },
      },
      {
        ...defaultProps,
        funcKey: "scale",
        args: [{ name: "scale", getCandidate: () => TonalityTheory.VALID_SCALE_NAMES }],
        callback: (args) => {
          const tonality = getCurrentInitData().tonality;
          const prev = TonalityTheory.getScaleName(tonality);
          const arg0 = logger.validateRequired(args[0], 1);
          if (arg0 == null) return;
          const next = arg0;
          // スケールの存在チェック
          if (!TonalityTheory.VALID_SCALE_NAMES.includes(args[0])) {
            logger.outputError(`The specified scale[${next}] is invalid.`);
            return;
          }
          const { keyIndex, scale } = TonalityTheory.getKeyScaleFromName(next);
          tonality.key12 = keyIndex;
          tonality.scale = scale;
          ctx.commit.dataAndRecalculate();
          logger.outputInfo(`Changed the scale. [${prev} ↁE${next}]`);
        },
      },
    ];
  };
  return {
    list,
  };
};
export default createInitCommands;
