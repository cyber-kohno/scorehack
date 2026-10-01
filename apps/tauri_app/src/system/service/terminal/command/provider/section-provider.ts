import TerminalCommand from "../../terminal-command";

const createSectionProvider = (ctx: TerminalCommand.Context) => {
    const { logger } = ctx;
    const { getCurrentSectionData } = ctx.selectors.outline;

    const commands = (): TerminalCommand.Props[] => {

        const defaultProps = TerminalCommand.createDefaultProps('section');
        return [
            {
                ...defaultProps,
                key: 'ren',
                usage: 'Change the section name.',
                args: [],
                callback: (args) => {

                    const prev = getCurrentSectionData().name;
                    const next = args[0];
                    getCurrentSectionData().name = next;
                    ctx.commit.dataAndRecalculate();
                    logger.outputInfo(`The section name has been changed. [${prev} to ${next}]`);
                }
            },
        ];
    };
    return {
        commands
    };
}
export default createSectionProvider;
