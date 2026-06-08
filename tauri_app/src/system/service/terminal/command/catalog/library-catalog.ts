import {
  actionMenuStore,
  confirmDialogStore,
  floatingTextInputStore,
  libraryStore,
  terminalStore,
} from "../../../../store/global-store";
import LibraryState from "../../../../store/state/library-state";
import TerminalCommand from "../../terminal-command";

const createLibraryCatalog = (ctx: TerminalCommand.Context): TerminalCommand.Props => {
  const defaultProps = TerminalCommand.createDefaultProps("harmonize");

  return {
    ...defaultProps,
    funcKey: "library",
    usage: "Open the arrange library dialog.",
    args: [],
    callback: () => {
      actionMenuStore.set(null);
      confirmDialogStore.set(null);
      floatingTextInputStore.set(null);
      terminalStore.set(null);
      libraryStore.set(LibraryState.createInitial());
    },
  };
};

export default createLibraryCatalog;
