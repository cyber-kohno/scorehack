import type { StoreProps } from "../../state/root-store";
import { createMelodyActions } from "../melody/melody-actions";
import { createProjectDataActions } from "../project-data/project-data-actions";
import { createTerminalCommandRegistry } from "./terminal-command-registry";
import { createTerminalLogger } from "./terminal-logger";
import {
  clearTerminalState,
  getTerminalStateStore,
  setTerminalState,
} from "../../state/session-state/terminal-store";
import { getModeState } from "../../state/session-state/mode-store";
import { getOutlineFocusState } from "../../state/session-state/outline-focus-store";
import { getOutlineArrangeState } from "../../state/session-state/outline-arrange-store";

const useReducerTermianl = (lastStore: StoreProps) => {
  const isUse = () => getTerminalStateStore() != null;

  const { getCurrScoreTrack } = createMelodyActions(lastStore);
  const projectData = createProjectDataActions(lastStore);

  const updateTarget = () => {
    const terminal = getTerminal();
    const mode = getModeState();
    let ret = "unknown";
    const set = (v: string) => {
      ret = v;
    };
    const add = (v: string) => {
      ret += "\\" + v;
    };
    switch (mode) {
      case "harmonize": {
        const arrange = getOutlineArrangeState();
        const element = projectData.getOutlineElement(getOutlineFocusState().focus);
        if (element == undefined) throw new Error();
        set("harmonize");
        if (arrange == null) {
          add(element.type);
        } else {
          add("arrange");
          add(arrange.method);
        }
        break;
      }
      case "melody": {
        set("melody");
        add(getCurrScoreTrack().name);
        break;
      }
    }
    terminal.target = ret;
  };

  const open = () => {
    setTerminalState({
      outputs: [],
      target: "",
      command: "",
      wait: false,
      focus: 0,
      availableFuncs: [],
      helper: null,
    });
    updateTarget();
    createTerminalCommandRegistry(lastStore).buildAvailableFunctions();
  };

  const close = () => {
    clearTerminalState();
  };

  const getTerminal = () => {
    const terminal = getTerminalStateStore();
    if (terminal == null) throw new Error("Terminal is not available.");
    return terminal;
  };

  const setCommand = (callback: (prev: string) => string) => {
    const terminal = getTerminal();
    terminal.command = callback(terminal.command);
  };

  const splitCommand = () => {
    const terminal = getTerminal();
    return [
      terminal.command.slice(0, terminal.focus),
      terminal.command.slice(terminal.focus),
    ] as const;
  };

  const removeCommand = () => {
    const [left, right] = splitCommand();
    if (left.length === 0) return;
    setCommand(() => left.slice(0, left.length - 1) + right);
    getTerminal().focus--;
  };

  const insertCommand = (key: string) => {
    const [left, right] = splitCommand();
    const isLastStrSpace = left.slice(-1) === " ";
    const isEmpty = left.length === 0;
    if ((isLastStrSpace || isEmpty) && key === " ") return;

    setCommand(() => left + key + right);
    getTerminal().focus += key.length;
  };

  const moveFocus = (dir: -1 | 1) => {
    const terminal = getTerminal();
    const newFocus = terminal.focus + dir;
    const command = terminal.command;
    if (newFocus >= 0 && newFocus <= command.length) terminal.focus = newFocus;
  };

  const registCommand = () => {
    const terminal = getTerminal();
    const { backupCommand, undefinedFunction } = createTerminalLogger(terminal);

    backupCommand();

    if (terminal.command !== "") {
      const orderItems = terminal.command.split(" ");
      const funcKey = orderItems[0];
      const args = orderItems.slice(1);

      const func = terminal.availableFuncs.find((f) => f.funcKey === funcKey);
      if (func == undefined) {
        undefinedFunction(funcKey);
      } else {
        func.callback(args);
      }
    }
    terminal.focus = 0;
    terminal.command = "";
  };

  return {
    isUse,
    open,
    updateTarget,
    close,
    getTerminal,
    splitCommand,
    removeCommand,
    insertCommand,
    moveFocus,
    registCommand,
  };
};

export default useReducerTermianl;
