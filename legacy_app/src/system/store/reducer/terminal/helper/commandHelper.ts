import StoreTerminal from "../../../props/storeTerminal";
import type { StoreProps } from "../../../store";
import useReducerTermianl from "../../reducerTerminal";

const useCommandHelper = (lastStore: StoreProps) => {

    const terminal = useReducerTermianl(lastStore).getTerminal();

    const build = () => {
        terminal.helper = null;

        const orderItems = terminal.command.split(' ');
        const funcKey = orderItems[0];
        const args = orderItems.slice(1);
        // if (args.length === 0) return;

        let list: string[] = [];

        const isInputFunc = orderItems.length === 1;
        const argIndex = args.length - 1;

        // カーソルが終端のアイテムをフォーカスしていない場合表示しない
        if (terminal.focus <= terminal.command.lastIndexOf(' ')) return;
        if (isInputFunc) {
            list = terminal.availableFuncs.map(f => f.funcKey);
        } else {
            const func = terminal.availableFuncs.find(f => f.funcKey === funcKey);
            if (func == undefined) return;
            const arg = func.args[argIndex];
            if (arg == undefined) return;

            list = (arg.getCandidate ?? (() => []))();
        }

        const keyword = orderItems[orderItems.length - 1];
        list = list.filter((item) => item.indexOf(keyword) !== -1);
        if (list.length > 0) {
            // 候補と完全一致した場合表示しない
            if (list[0] === keyword) return;
            terminal.helper = StoreTerminal.createHelperInitial();
            const helper = terminal.helper;
            helper.list = list;
            helper.keyword = keyword
        }
    }

    return { build };
}
export default useCommandHelper;