import type StoreArrange from "../../props/arrange/storeArrange";
import type StoreOutline from "../../props/storeOutline";
import { createStoreUtil, type StoreProps } from "../../store";
import useReducerTermianl from "../reducerTerminal";
import useBuilderChord from "./sector/builderChord";
import useBuilderCommon from "./sector/builderCommon";
import useBuilderHarmonize from "./sector/builderHarmonize";
import useBuilderInit from "./sector/builderInit";
import useBuilderMelody from "./sector/builderMelody";
import useBuilderModulate from "./sector/builderModulate";
import useBuilderPianoEditor from "./sector/builderPianoEditor";
import useBuilderSection from "./sector/builderSection";

namespace CommandRegistUtil {

    export type FuncArg = {
        name: string;
        /** ヘルパー利用時の候補リスト */
        getCandidate?: () => string[]
    }

    export interface FuncPropsDefault {
        sector: string;
        usage: string;
        args: FuncArg[];
        callback: (args: string[]) => void
    }

    export interface FuncProps extends FuncPropsDefault {
        funcKey: string;
    }
    export const createDefaultProps = (sector: string): FuncPropsDefault => ({
        sector,
        usage: '',
        args: [],
        callback: () => [],
    });

    export const useCommandRegister = (lastStore: StoreProps) => {

        const reducer = useReducerTermianl(lastStore);
        const terminal = reducer.getTerminal();

        const builderCommon = useBuilderCommon(lastStore);
        const builderHarmonize = useBuilderHarmonize(lastStore);
        const builderInit = useBuilderInit(lastStore);
        const builderSection = useBuilderSection(lastStore);
        const builderChord = useBuilderChord(lastStore);
        const builderMelody = useBuilderMelody(lastStore);
        const builderModulate = useBuilderModulate(lastStore);
        const builderPianoEditor = useBuilderPianoEditor(lastStore);

        const buildAvailableFunctions = () => {
            const items: FuncProps[] = [];
            const add = (funcs: FuncProps[]) => {
                items.push(...funcs);
            }

            const sectors = terminal.target.split('\\');

            add(builderCommon.get({ items }));

            switch (sectors[0]) {
                case 'harmonize': {
                    const harmonizeSector = sectors[1] as StoreOutline.ElementType | 'arrange';
                    if (harmonizeSector !== 'arrange') {
                        add(builderHarmonize.get());
                        switch (harmonizeSector) {
                            case 'init': add(builderInit.get()); break;
                            case 'section': add(builderSection.get()); break;
                            case 'chord': add(builderChord.get()); break;
                            case 'modulate': add(builderModulate.get()); break;
                        }
                    } else {
                        const arrangeSector = sectors[2] as StoreArrange.ArrangeMedhod;
                        switch(arrangeSector) {
                            case 'piano': add(builderPianoEditor.get()); break;
                        }
                    }
                } break;
                case 'melody': add(builderMelody.get());
            }

            terminal.availableFuncs = items;
        }


        const execute = (target: string, funcKey: string, args: string[]) => {

        }
        return {
            buildAvailableFunctions,
            execute,
        }
    }
}
export default CommandRegistUtil;