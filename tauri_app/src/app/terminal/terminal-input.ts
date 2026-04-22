import { createTerminalActions } from "../../app/terminal/terminal-actions";
import { createTerminalHelper } from "../../app/terminal/terminal-helper";
import { adjustHelperScroll } from "../../app/terminal/terminal-scroll";
import type { CommitContext } from "../../state/root-store";

const useInputTerminal = (commitContext: CommitContext) => {
  const { lastStore: rootStoreToken, commit } = commitContext;

  const terminalActions = createTerminalActions(rootStoreToken);
  const { build: buildHelper } = createTerminalHelper(rootStoreToken);

  const commitTerminalChange = ({
    rebuildHelper = false,
    adjustHelper = false,
  }: {
    rebuildHelper?: boolean;
    adjustHelper?: boolean;
  } = {}) => {
    if (rebuildHelper) {
      buildHelper();
    }
    if (adjustHelper) {
      adjustHelperScroll(rootStoreToken);
    }
    commit();
  };

  const control = (eventKey: string) => {
    const terminal = terminalActions.getTerminal();

    if (terminal.wait) return;

    switch (eventKey) {
      case "Backspace": {
        terminalActions.removeCommand();
        commitTerminalChange({ rebuildHelper: true });
      } break;
      case "ArrowLeft": {
        terminalActions.moveFocus(-1);
        commitTerminalChange({ rebuildHelper: true });
      } break;
      case "ArrowRight": {
        terminalActions.moveFocus(1);
        commitTerminalChange({ rebuildHelper: true });
      } break;
    }
    if (eventKey.length === 1) {
      terminalActions.insertCommand(eventKey);
      commitTerminalChange({ rebuildHelper: true });
    }
    if (terminal.helper) {
      const helper = terminal.helper;

      const focusMove = (dir: -1 | 1) => {
        if (helper.list.length === 0) return;
        const lastIndex = helper.list.length - 1;
        let temp = helper.focus;
        temp += dir;
        if (temp < 0) temp = 0;
        if (temp > lastIndex) temp = lastIndex;
        helper.focus = temp;
        commitTerminalChange({ adjustHelper: true });
      };
      switch (eventKey) {
        case "Escape": {
          terminal.helper = null;
          commitTerminalChange();
        } break;
        case "Enter": {
          if (helper.focus === -1) break;
          const items = terminal.command.split(" ");
          items[items.length - 1] = helper.list[helper.focus];
          terminal.command = items.join(" ");
          terminal.focus = terminal.command.length;
          terminal.helper = null;
          commitTerminalChange();
        } break;
        case "ArrowUp": focusMove(-1); break;
        case "ArrowDown": focusMove(1); break;
      }
    } else {
      switch (eventKey) {
        case "Escape": {
          terminalActions.close();
          commitTerminalChange();
        } break;
        case "Enter": {
          terminalActions.registCommand();
          commitTerminalChange();
        } break;
      }
    }
  };

  return {
    control,
  };
};
export default useInputTerminal;



