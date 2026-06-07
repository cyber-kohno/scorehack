import { libraryStore, terminalStore } from "../../../../store/global-store";
import LibraryState from "../../../../store/state/library-state";
import TerminalCommand from "../../terminal-command";

const createLibraryCatalog = (ctx: TerminalCommand.Context): TerminalCommand.Props => {
  const defaultProps = TerminalCommand.createDefaultProps("system");

  return {
    ...defaultProps,
    funcKey: "library",
    usage: "Open the arrange library dialog.",
    args: [],
    callback: () => {
      terminalStore.set(null);
      libraryStore.set(LibraryState.createInitial());
    },
  };
};

export default createLibraryCatalog;
