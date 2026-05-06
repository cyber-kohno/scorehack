import PianoBackingState from "../../../store/state/data/arrange/piano/piano-backing-state";
import createArrangeSelector from "../../arrange/arrange-selector";
import TerminalCommand from "../terminal-command";

const createPianoEditorCommands = (ctx: TerminalCommand.Context) => {
    const { control, data, logger } = ctx;
    const { getPianoEditor } = createArrangeSelector({ control, data });

    const list = (): TerminalCommand.Props[] => {

        const defaultProps = TerminalCommand.createDefaultProps('piano');
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
                    ctx.commit.data();
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
                    ctx.commit.data();
                    logger.outputInfo('The backing propery has been deleted.');
                }
            },
        ];
    };
    return {
        list
    };
}
export default createPianoEditorCommands;
