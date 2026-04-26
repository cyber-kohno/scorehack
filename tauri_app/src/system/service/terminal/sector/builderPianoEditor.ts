import PianoBackingState from "../../../store/state/data/arrange/piano/piano-backing-state";
import PianoEditorState from "../../../store/state/data/arrange/piano/piano-editor-state";
import { type StoreProps } from "../../../store/store";
import ArrangeUtil from "../../arrange/arrangeUtil";
import useReducerTerminal from "../reducerTerminal";
import CommandRegistUtil from "../commandRegistUtil";
import useTerminalLogger from "../terminalLogger";
import { controlStore, dataStore } from "../../../store/global-store";
import { get } from "svelte/store";

const useBuilderPianoEditor = (lastStore: StoreProps) => {
    const reducer = useReducerTerminal(lastStore);
    const terminal = reducer.getTerminal();
    const logger = useTerminalLogger(terminal);

    const { getPianoEditor } = ArrangeUtil.useReducer(get(controlStore), get(dataStore));

    const getCommands = (): CommandRegistUtil.FuncProps[] => {

        const defaultProps = CommandRegistUtil.createDefaultProps('piano');
        return [
            {
                ...defaultProps,
                funcKey: 'ubk',
                usage: 'Start using the backing.',
                args: [],
                callback: () => {
                    const editor = getPianoEditor();
                    if (editor.backing != null) {
                        logger.outputInfo('The backing already exists.');
                        return;
                    }
                    editor.backing = PianoBackingState.createInitialBackingProps();
                    logger.outputInfo('The backing property has been generated.');
                }
            },
            {
                ...defaultProps,
                funcKey: 'dbk',
                usage: 'Delete the backing.',
                args: [],
                callback: () => {
                    const editor = getPianoEditor();
                    if (editor.backing == null) {
                        logger.outputInfo('The backing does not exist.');
                        return;
                    }
                    editor.backing = null;
                    editor.control = 'voicing';
                    logger.outputInfo('The backing propery has been deleted.');
                }
            },
        ];
    };
    return {
        get: getCommands
    };
}
export default useBuilderPianoEditor;