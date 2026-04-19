import { get, writable } from "svelte/store";
import type { TerminalCommand } from "../../app/terminal/terminal-command-registry";

export type TerminalState = {
  outputs: TerminalOutputBlock[];
  command: string;
  target: string;
  focus: number;
  wait: boolean;
  availableFuncs: TerminalCommand[];
  helper: TerminalHelperProps | null;
};

export type TerminalHelperProps = {
  list: string[];
  keyword: string;
  focus: number;
};

export const createTerminalHelperInitial = (): TerminalHelperProps => {
  return {
    list: [],
    keyword: "",
    focus: 0,
  };
};

export type TerminalBlockType = "record" | "table";
export type TerminalRecordAttr = "info" | "backup" | "error";
export type TerminalHighlightType = "func" | "item" | "word";

export type TerminalTextItem = {
  str: string;
  highlight?: TerminalHighlightType;
};

export type TerminalRecordProps = {
  attr: TerminalRecordAttr;
  texts: TerminalTextItem[];
};

export type TerminalColAttr = "item" | "sentence" | "def" | "category" | "resource";

export type TerminalColInfo = {
  headerName: string;
  width: number;
  attr: TerminalColAttr;
  isNumber?: boolean;
};

export type TerminalTableProps = {
  cols: TerminalColInfo[];
  table: string[][];
};

export type TerminalOutputBlock = {
  type: TerminalBlockType;
  record?: TerminalRecordProps;
  table?: TerminalTableProps;
};

export const terminalStore = writable<TerminalState | null>(null);

export const getTerminalStateStore = () => get(terminalStore);

export const setTerminalState = (terminal: TerminalState) => {
  terminalStore.set(terminal);
};

export const clearTerminalState = () => {
  terminalStore.set(null);
};

export const touchTerminalState = () => {
  terminalStore.set(getTerminalStateStore());
};
