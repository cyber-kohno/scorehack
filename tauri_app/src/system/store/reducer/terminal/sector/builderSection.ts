import { type StoreProps } from "../../../store";
import useReducerCache from "../../reducerCache";
import useReducerOutline from "../../reducerOutline";
import useReducerTermianl from "../../reducerTerminal";
import CommandRegistUtil from "../commandRegistUtil";
import useTerminalLogger from "../terminalLogger";

const useBuilderSection = (lastStore: StoreProps) => {
    const reducer = useReducerTermianl(lastStore);
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
                    const { getCurrentSectionData, renameSectionData } = useReducerOutline(lastStore);
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