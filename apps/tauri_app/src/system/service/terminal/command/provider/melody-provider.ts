import TerminalCommand from "../../terminal-command";
import ArgumentRegulationFactory from "../../argument-regulation-factory";
import TerminalArgumentReader from "../../terminal-argument-reader";
import createInstCatalog from "../catalog/inst-catalog";
import createPronCatalog from "../catalog/pron-catalog";
import createTrackCatalog from "../catalog/track-catalog";

const createMelodyProvider = (ctx: TerminalCommand.Context) => {
  const { control, data, logger } = ctx;

  const commands = (): TerminalCommand.Props[] => {
    const defaultProps = TerminalCommand.createDefaultProps("melody");
    return [
      createInstCatalog(ctx, "melody"),
      createPronCatalog(ctx),
      createTrackCatalog(ctx, "melody"),
      {
        ...defaultProps,
        key: "volume",
        usage: "Adjust volume for the active track.",
        args: [{ name: "value", ...ArgumentRegulationFactory.createNumberReg(1, 10) }],
        callback: (args) => {
          const value = TerminalArgumentReader.readNumber(args, 0, logger, { min: 1, max: 10 });
          if (value == null) return;

          const track = data.scoreTracks[control.melody.trackIndex];
          if (track == undefined) throw new Error("Active melody track must exist.");

          const prev = track.volume;
          track.volume = value;
          logger.outputInfo(`Changed volume. [${prev} -> ${value}]`);
          ctx.commit.data();
        },
      },
    ];
  };

  return {
    commands,
  };
};

export default createMelodyProvider;
