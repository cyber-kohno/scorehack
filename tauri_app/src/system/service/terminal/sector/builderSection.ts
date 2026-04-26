import { type StoreProps } from "../../../store/store";
import useReducerCache from "../../derived/reducerCache";
import useReducerOutline from "../../outline/reducerOutline";
import useReducerTerminal from "../reducerTerminal";
import CommandRegistUtil from "../commandRegistUtil";
import useTerminalLogger from "../terminalLogger";

const useBuilderSection = (lastStore: StoreProps) => {
    const reducer = useReducerTerminal(lastStore);
    const terminal = reducer.getTerminal();
    const logger = useTerminalLogger(terminal);

    const get = (): CommandRegistUtil.FuncProps[] => {

        const defaultProps = CommandRegistUtil.createDefaultProps('section');
        return [
            {
                ...defaultProps,
                funcKey: 'ren',
                usage: 'Change the section name.',
                args: [],
                callback: (args) => {
                    const { getCurrentSectionData, renameSectionData } = useReducerOutline();
                    const { calculate } = useReducerCache(lastStore);

                    const prev = getCurrentSectionData().name;
                    const next = args[0];
                    renameSectionData(next);
                    calculate();
                    
                    logger.outputInfo(`The section name has been changed. [${prev} to ${next}]`);
                }
            },
        ];
    };
    return {
        get
    };
}
export default useBuilderSection;