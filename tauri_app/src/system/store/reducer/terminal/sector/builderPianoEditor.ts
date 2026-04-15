import {
  createTerminalCommandDefault,
  type TerminalCommand,
} from "../../../../../app/terminal/terminal-command-registry";
import { createTerminalLogger } from "../../../../../app/terminal/terminal-logger";
import StorePianoBacking from "../../../props/arrange/piano/storePianoBacking";
import type { StoreProps } from "../../../store";
import ArrangeUtil from "../../arrangeUtil";
import useReducerTermianl from "../../reducerTerminal";

const useBuilderPianoEditor = (lastStore: StoreProps) => {
  const reducer = useReducerTermianl(lastStore);
  const terminal = reducer.getTerminal();
  const logger = createTerminalLogger(terminal);

  const { getPianoEditor } = ArrangeUtil.useReducer(lastStore);

  const get = (): TerminalCommand[] => {
    const defaultProps = createTerminalCommandDefault("piano");
    return [
      {
        ...defaultProps,
        funcKey: "ubk",
        usage: "Start using the backing.",
        args: [],
        callback: () => {
          const editor = getPianoEditor();
          if (editor.backing != null) {
            logger.outputInfo("The backing already exists.");
            return;
          }
          editor.backing = StorePianoBacking.createInitialBackingProps();
          logger.outputInfo("The backing property has been generated.");
        },
      },
      {
        ...defaultProps,
        funcKey: "dbk",
        usage: "Delete the backing.",
        args: [],
        callback: () => {
          const editor = getPianoEditor();
          if (editor.backing == null) {
            logger.outputInfo("The backing does not exist.");
            return;
          }
          editor.backing = null;
          editor.control = "voicing";
          logger.outputInfo("The backing propery has been deleted.");
        },
      },
    ];
  };
  return {
    get,
  };
};
export default useBuilderPianoEditor;
