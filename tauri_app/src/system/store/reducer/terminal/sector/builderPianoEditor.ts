import {
  createTerminalCommandDefault,
  type TerminalCommand,
} from "../../../../../app/terminal/terminal-command-registry";
import { getPianoArrangeEditor } from "../../../../../app/arrange/arrange-state";
import { createTerminalLogger } from "../../../../../app/terminal/terminal-logger";
import StorePianoBacking from "../../../../../domain/arrange/piano-backing-store";
import type { StoreProps } from "../../../store";
import useReducerTermianl from "../../reducerTerminal";

const useBuilderPianoEditor = (lastStore: StoreProps) => {
  const reducer = useReducerTermianl(lastStore);
  const terminal = reducer.getTerminal();
  const logger = createTerminalLogger(terminal);
  const get = (): TerminalCommand[] => {
    const defaultProps = createTerminalCommandDefault("piano");
    return [
      {
        ...defaultProps,
        funcKey: "ubk",
        usage: "Start using the backing.",
        args: [],
        callback: () => {
          const editor = getPianoArrangeEditor(lastStore);
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
          const editor = getPianoArrangeEditor(lastStore);
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

