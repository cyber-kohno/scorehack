import ChordTheory from "../../../domain/theory/chord-theory";
import TerminalCommand from "../terminal-command";

const createChordCommands = (ctx: TerminalCommand.Context) => {
    const { terminal } = ctx;

    const list = (): TerminalCommand.Props[] => {

        const defaultProps = TerminalCommand.createDefaultProps('chord');
        return [
            {
                ...defaultProps,
                funcKey: 'lsb',
                usage: 'Displays a list of available chord symbols.',
                args: [],
                callback: () => {
                    const symbols = ChordTheory.ChordSymols.map(symbol => ({ symbol, ...ChordTheory.getSymbolProps(symbol) }));

                    terminal.outputs.push({
                        type: 'table',
                        table: {
                            cols: [
                                { headerName: 'Symbol', width: 100, attr: 'def' },
                                { headerName: 'Structs', width: 400, attr: 'sentence' }
                            ],
                            table: (() => symbols.map(item => {
                                return [`[${item.symbol}]`, item.structs.join(', ')]
                            }))()
                        }
                    });
                }
            },
        ];
    };
    return {
        list
    };
}
export default createChordCommands;
