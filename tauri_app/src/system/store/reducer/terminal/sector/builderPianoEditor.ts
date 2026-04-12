import StorePianoBacking from "../../../props/arrange/piano/storePianoBacking";
import StorePianoEditor from "../../../props/arrange/piano/storePianoEditor";
import { type StoreProps } from "../../../store";
import ArrangeUtil from "../../arrangeUtil";
import useReducerTermianl from "../../reducerTerminal";
import CommandRegistUtil from "../commandRegistUtil";
import useTerminalLogger from "../terminalLogger";

const useBuilderPianoEditor = (lastStore: StoreProps) => {
    const reducer = useReducerTermianl(lastStore);
    const terminal = reducer.getTerminal();
    const logger = useTerminalLogger(terminal);

    const { getPianoEditor } = ArrangeUtil.useReducer(lastStore);

    const get = (): CommandRegistUtil.FuncProps[] => {

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
                    editor.backing = StorePianoBacking.createInitialBackingProps();
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
        get
    };
}
export default useBuilderPianoEditor;