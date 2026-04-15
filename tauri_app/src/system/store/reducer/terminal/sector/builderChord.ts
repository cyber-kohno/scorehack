import {
  createTerminalCommandDefault,
  type TerminalCommand,
} from "../../../../../app/terminal/terminal-command-registry";
import MusicTheory from "../../../../../domain/theory/music-theory";
import type { StoreProps } from "../../../store";
import useReducerTermianl from "../../reducerTerminal";

const useBuilderChord = (lastStore: StoreProps) => {
    const reducer = useReducerTermianl(lastStore);
    const terminal = reducer.getTerminal();

    const get = (): TerminalCommand[] => {
        const defaultProps = createTerminalCommandDefault('chord');
        return [
            {
                ...defaultProps,
                funcKey: 'lsb',
                usage: 'Displays a list of available chord symbols.',
                args: [],
                callback: () => {
                    const symbols = MusicTheory.ChordSymols.map(symbol => ({ symbol, ...MusicTheory.getSymbolProps(symbol) }));

                    terminal.outputs.push({
                        type: 'table',
                        table: {
                            cols: [
                                { headerName: 'Symbol', width: 100, attr: 'def' },
                                { headerName: 'Structs', width: 400, attr: 'sentence' }
                            ],
                            table: symbols.map(item => [`[${item.symbol}]`, item.structs.join(', ')])
                        }
                    });
                }
            },
        ];
    };
    return {
        get
    };
}
export default useBuilderChord;
