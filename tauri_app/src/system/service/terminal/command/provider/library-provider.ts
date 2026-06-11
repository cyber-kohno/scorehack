import TerminalCommand from "../../terminal-command";
import createPresetCatalog from "../catalog/preset-catalog";

const createLibraryProvider = (ctx: TerminalCommand.Context) => {
  const commands = (): TerminalCommand.Props[] => {
    return [
      createPresetCatalog(ctx),
    ];
  };

  return {
    commands,
  };
};

export default createLibraryProvider;
