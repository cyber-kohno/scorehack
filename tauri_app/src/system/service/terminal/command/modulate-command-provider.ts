import ElementState from "../../../store/state/data/element-state";
import TerminalCommand from "../terminal-command";

const createModulateCommands = (ctx: TerminalCommand.Context) => {
  const { logger } = ctx;
  const outlineSelector = ctx.selectors.outline;

  const list = (): TerminalCommand.Props[] => {
    const defaultProps = TerminalCommand.createDefaultProps("modulate");
    const getCurrDispValue = (data: ElementState.DataModulate) =>
      `[${data.method}${data.val ? " " + data.val : ""}]`;

    const outputModLog = (prev: string, next: string) => {
      logger.outputInfo(
        `Modulate method has been changed. [${prev} -> ${next}]`,
      );
    };

    return [
      {
        ...defaultProps,
        funcKey: "domm",
        args: [
          {
            name: "value",
            getCandidate: () => ElementState.DommVals.map((v) => v.toString()),
          },
        ],
        callback: (args) => {
          const data = outlineSelector.getCurrentModulateData();
          const prev = getCurrDispValue(data);
          const value = args[0];

          // 数値の変換チェック
          if (!ElementState.DommVals.includes(value)) {
            logger.outputError(`The specified value[${value}] is invalid.`);
          }
          data.method = "domm";
          data.val = Number(value);
          ctx.commit.dataAndRecalculate();
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
            getCandidate: () => ElementState.DommVals.map((v) => v.toString()),
          },
        ],
        callback: (args) => {
          const data = outlineSelector.getCurrentModulateData();
          const prev = getCurrDispValue(data);
          const value = args[0];

          // 数値の変換チェック
          if (!ElementState.DommVals.includes(value)) {
            logger.outputError(`The specified value[${value}] is invalid.`);
          }
          data.method = "key";
          data.val = Number(value);
          ctx.commit.dataAndRecalculate();
          const next = `key ${value}`;

          outputModLog(prev, next);
        },
      },
      {
        ...defaultProps,
        funcKey: "parallel",
        args: [],
        callback: () => {
          const data = outlineSelector.getCurrentModulateData();
          const prev = getCurrDispValue(data);

          data.method = "parallel";
          data.val = undefined;
          ctx.commit.dataAndRecalculate();
          const next = `parallel`;

          outputModLog(prev, next);
        },
      },
      {
        ...defaultProps,
        funcKey: "relative",
        args: [],
        callback: () => {
          const data = outlineSelector.getCurrentModulateData();
          const prev = getCurrDispValue(data);

          data.method = "relative";
          data.val = undefined;
          ctx.commit.dataAndRecalculate();
          const next = `relative`;

          outputModLog(prev, next);
        },
      },
    ];
  };
  return {
    list,
  };
};
export default createModulateCommands;
