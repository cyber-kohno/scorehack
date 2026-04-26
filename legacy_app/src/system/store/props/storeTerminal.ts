import type CommandRegistUtil from "../reducer/terminal/commandRegistUtil";

namespace StoreTerminal {

    export type Props = {
        outputs: OutputBlock[];
        command: string;
        target: string;
        focus: number;
        wait: boolean;
        availableFuncs: CommandRegistUtil.FuncProps[];
        helper: HelperProps | null;
    }
    export type HelperProps = {
        list: string[];
        keyword: string;
        focus: number;
    }
    export const createHelperInitial = (): HelperProps => {
        return {
            list: [],
            keyword: '',
            focus: 0
        }
    };

    export type BlockType = 'record' | 'table';

    export type RecordAttr = 'info' | 'backup' | 'error';
    export type HighlightType = 'func' | 'item' | 'word';

    export type RecordProps = {
        attr: RecordAttr;
        texts: TextItem[];
    }
    export type TextItem = {
        str: string;
        highlight?: HighlightType;
    }
    export type OutputBlock = {
        type: BlockType;

        record?: RecordProps;
        table?: TableProps;
    }


    export type ColAttr = 'item' | 'sentence' | 'def' | 'category' | 'resource';
    export type ColInfo = {
        headerName: string;
        width: number;
        attr: ColAttr;
        isNumber?: boolean;
    }
    export type TableProps = {
        cols: ColInfo[];
        table: string[][];
    }
}

export default StoreTerminal;