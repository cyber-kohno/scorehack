import TerminalCommand from "../terminal-command";

const createSectionCommands = (ctx: TerminalCommand.Context) => {
    const { logger } = ctx;
    const { getCurrentSectionData } = ctx.selectors.outline;

    const list = (): TerminalCommand.Props[] => {

        const defaultProps = TerminalCommand.createDefaultProps('section');
        return [
            {
                ...defaultProps,
                funcKey: 'ren',
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
        list
    };
}
export default createSectionCommands;
