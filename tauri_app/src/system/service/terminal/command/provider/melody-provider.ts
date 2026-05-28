import TerminalCommand from "../../terminal-command";
import createInstCatalog from "../catalog/inst-catalog";
import createPronCatalog from "../catalog/pron-catalog";
import createTrackCatalog from "../catalog/track-catalog";

const createMelodyProvider = (ctx: TerminalCommand.Context) => {
  const commands = (): TerminalCommand.Props[] => {
    return [
      createInstCatalog(ctx, "melody"),
      createPronCatalog(ctx),
      createTrackCatalog(ctx, "melody"),
    ];
  };

  return {
    commands,
  };
};

export default createMelodyProvider;