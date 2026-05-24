import RhythmTheory from "../../../../domain/theory/rhythm-theory";
import TonalityTheory from "../../../../domain/theory/tonality-theory";
import TerminalCommand from "../../terminal-command";

const createInitProvider = (ctx: TerminalCommand.Context) => {
  const { logger, terminal } = ctx;
  const { getCurrentInitData } = ctx.selectors.outline;
  const feelTypes = ["straight", "swing"] as const;
  const swingTargets = ["8", "16"] as const;

  const commands = (): TerminalCommand.Props[] => {
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
          const prev = RhythmTheory.formatRhythm(initData.rhythm);
          const arg0 = logger.validateRequired(args[0], 1);
          if (arg0 == null) return;

          const nextTS = RhythmTheory.parseTS(arg0);
          if (nextTS == undefined) {
            logger.outputError(`The specified time signature[${arg0}] is invalid.`);
            return;
          }

          initData.rhythm.ts = nextTS;
          ctx.commit.dataAndRecalculate();
          logger.outputInfo(`Changed the time signature. [${prev} -> ${RhythmTheory.formatRhythm(initData.rhythm)}]`);
        },
      },
      {
        ...defaultProps,
        funcKey: "feel",
        args: [
          { name: "type", getCandidate: () => [...feelTypes] },
          {
            name: "target",
            getCandidate: (args) => args[0] === "swing" ? [...swingTargets] : [],
          },
        ],
        callback: (args) => {
          const initData = getCurrentInitData();
          const prev = RhythmTheory.formatRhythm(initData.rhythm);
          const arg0 = logger.validateRequired(args[0], 1);
          if (arg0 == null) return;

          if (!feelTypes.includes(arg0 as typeof feelTypes[number])) {
            logger.outputError(`The specified feel[${arg0}] is invalid.`);
            return;
          }

          if (arg0 === "straight") {
            initData.rhythm.feel = { type: "straight" };
          } else {
            const arg1 = logger.validateRequired(args[1], 2);
            if (arg1 == null) return;
            if (!swingTargets.includes(arg1 as typeof swingTargets[number])) {
              logger.outputError(`The specified swing target[${arg1}] is invalid.`);
              return;
            }

            initData.rhythm.feel = {
              type: "swing",
              target: Number(arg1) as RhythmTheory.SwingTarget,
            };
          }

          const availableFeels = RhythmTheory.getAvailableFeels(initData.rhythm.ts);
          if (!availableFeels.some(feel => RhythmTheory.isSameFeel(feel, initData.rhythm.feel))) {
            logger.outputError(`The specified feel is not available for ${RhythmTheory.formatTS(initData.rhythm.ts)}.`);
            return;
          }

          ctx.commit.dataAndRecalculate();
          logger.outputInfo(`Changed the rhythm feel. [${prev} -> ${RhythmTheory.formatRhythm(initData.rhythm)}]`);
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
          // スケールの存在チェチE��
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
    commands,
  };
};
export default createInitProvider;
