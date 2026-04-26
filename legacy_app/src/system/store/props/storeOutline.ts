import Layout from "../../const/layout";
import type MusicTheory from "../../util/musicTheory";
import type StoreArrange from "./arrange/storeArrange";

namespace StoreOutline {

    export type Props = {
        focus: number;
        focusLock: number;
        trackIndex: number;
        arrange: null | StoreArrange.EditorProps;
    }

    export const INITIAL: Props = {
        focus: 1,
        focusLock: -1,
        trackIndex: -1,
        arrange: null
    };

    export type ElementType = 'init' | 'section' | 'chord' | 'change' | 'modulate' | 'tempo' | 'ts';

    export type DataInit = {
        ts: MusicTheory.TimeSignature;
        tempo: number;
        tonality: MusicTheory.Tonality;
    };

    export type DataSection = {
        name: string;
    };

    export interface DataChord {
        beat: number;
        eat: number;
        degree?: MusicTheory.DegreeChord;
    };
    export interface KeyChord {
        beat: number;
        eat: number;
        chord?: MusicTheory.KeyChordProps;
        structs?: MusicTheory.StructProps[];
    };
    export type DataModulate = {
        method: ModulateMedhod;
        val?: number;
    };

    export const ModulateMedhods = ['domm', 'parallel', 'relative', 'key'] as const;
    export type ModulateMedhod = typeof ModulateMedhods[number];

    export const DommVals = ['-3', -'2', '-1', '0', '1', '2', '3'];

    export type TempoRelation = 'diff' | 'rate' | 'abs';
    export type DataTempo = {
        method: TempoMedhod;
        val: number;
    };
    export const TempoMedhods = ['rate', 'addition'] as const;
    export type TempoMedhod = typeof TempoMedhods[number];

    export type DataTS = {
        newTS: MusicTheory.TimeSignature;
    };

    export type Element = {
        type: ElementType;
        data: any;
    }

    export const getInitialElements = () => {
        const list: Element[] = [];
        const initData: DataInit = {
            ts: { num: 4, den: 4 },
            tempo: 100,
            tonality: {
                key12: 0,
                scale: 'major'
            }
        };
        const firstSectionData: DataSection = {
            name: 'section0'
        }
        list.push({ type: 'init', data: initData });
        list.push({ type: 'section', data: firstSectionData });
        const dataChord = (): StoreOutline.DataChord => ({
            beat: 4,
            eat: 0
        });
        for (let i = 0; i < 2; i++) {
            list.push({ type: 'chord', data: dataChord() });
        }
        return list;
    }

    export const MARGIN_HEAD = 4;
}

export default StoreOutline;