import TonalityTheory from "./tonality-theory";

namespace ChordTheory {

    export const ChordSymols = [
        // 3和音（トライアド）
        '', 'm', 'sus4', 'sus2', 'dim', 'aug', 'm-5',
        // 4和音（テトラド）
        '7', 'm7', 'M7', 'mmaj7', '7sus4', 'dim7', 'aug7', '6', 'm6', 'add9', 'madd9',
        // 5和音（9th系）
        '9', 'm9', 'M9',
        // 6和音（11th系）
        '11', 'm11',
        // 7和音（13th系）
        '13', 'm13'
    ] as const;

    export type ChordSymol = typeof ChordSymols[number];

    export const SymbolTable: ChordSymol[][] = [
        // 3和音（トライアド）
        ['', 'm', 'sus4', 'sus2', 'dim', 'aug', 'm-5'],
        // 4和音（テトラド）
        ['7', 'M7', 'm7', 'mmaj7', '7sus4', 'dim7', 'aug7', '6', 'm6', 'add9', 'madd9'],
        // 5和音（9th系）
        ['9', 'm9', 'M9'],
        // 6和音（11th系）
        ['11', 'm11'],
        // 7和音（13th系）
        ['13', 'm13']
    ];

    export type Scale = TonalityTheory.Scale;
    export type Tonality = TonalityTheory.Tonality;
    export type Key12dProps = TonalityTheory.Key12dProps;

    export interface DegreeKey {
        index: number;
        semitone?: 1 | -1;
    }
    export interface DegreeChord extends DegreeKey {
        symbol: ChordSymol;
        on?: DegreeKey;
    }

    export interface KeyChordProps extends Key12dProps {
        symbol: ChordSymol;
        on?: Key12dProps;
    }

    export const getKeyChordFromDegree = (tonality: Tonality, degree: DegreeChord): KeyChordProps => {
        const key12 = (getDegree12Index(degree) + tonality.key12) % 12;
        const isFlat = degree.semitone === -1;
        let on: Key12dProps | undefined = undefined;
        if (degree.on != undefined) {
            on = {
                key12: (getDegree12Index(degree.on) + tonality.key12) % 12,
                isFlat: degree.on.semitone === -1
            }
        }
        return {
            key12, symbol: degree.symbol, isFlat, on
        }
    }

    export const getKeyChordName = (keyChord: KeyChordProps) => {
        let name = TonalityTheory.getKey12Name(keyChord) + keyChord.symbol;
        if (keyChord.on != undefined) {
            name += ` / ${TonalityTheory.getKey12Name(keyChord.on)}`;
        }
        return name;
    }

    export const getDegreeKeyName = (degree: DegreeKey) => {
        const list = DEGREE7_LIST;
        const getSemitone = () => {
            if (degree.semitone == undefined) return '';
            else if (degree.semitone === -1) return 'b';
            else if (degree.semitone === 1) return '#';
        }
        const name = list[degree.index] + getSemitone();
        return name;
    }

    // export const MAJOR_SCALE_DEGREE_CHORDS = [0, 2, 4, 5, 7, 9, 11];
    export const MAJOR_SCALE_DEGREE_CHORDS: DegreeChord[] = [
        { index: 0, symbol: '' },
        { index: 1, symbol: 'm' },
        { index: 2, symbol: 'm' },
        { index: 3, symbol: '' },
        { index: 4, symbol: '' },
        { index: 5, symbol: 'm' },
        { index: 6, symbol: 'm-5' },
    ];

    export const getDiatonicDegreeChord = (scale: Scale, scaleIndex: number): DegreeChord => {
        const list = scale === 'major' ? MAJOR_SCALE_DEGREE_CHORDS : [];
        return JSON.parse(JSON.stringify(list[scaleIndex]));
    }

    export type IntervalRelationName =
        'p1' | 'm2' | 'M2' | 'm3' | 'M3' | 'p4' |
        'd5' | 'p5' | 'a5' | 'm6' | 'M6' |
        'd7' | 'm7' | 'M7' | 'on'
        ;

    export const getIntervalArray = (): IntervalRelationName[] => {
        return [
            'p1',
            'm2',
            'M2',
            'm3',
            'M3',
            'p4',
            'd5',
            'p5',
            'a5',
            'm6',
            'M6',
            'd7',
            'm7',
            'M7',
        ];
    }

    /** インターバルの関係性 */
    export const getIntervalFromRelation = (name: IntervalRelationName) => {
        switch (name) {
            case 'p1': return 0;
            case 'm2': return 1;
            case 'M2': return 2;
            case 'm3': return 3;
            case 'M3': return 4;
            case 'p4': return 5;
            case 'd5': return 6;
            case 'p5': return 7;
            case 'a5': return 8;
            case 'm6': return 8;
            case 'M6': return 9;
            case 'd7': return 9;
            case 'm7': return 10;
            case 'M7': return 11;
            case 'on': return -1;
        }
    }
    export const getRelationFromInterval = (interval: number) => {
        const arr = getIntervalArray();
        const relation = arr[interval];
        if (relation == undefined) throw new Error(`[${interval}]は、定義の中に存在しない。`);
        return relation;
    }

    // export type SymbolCategory = 'triad' | 'tetrad';
    export type SymbolProps = {
        structs: IntervalRelationName[];
        // category: SymbolCategory;
        lower?: ChordSymol;
        upper?: ChordSymol;
    }

    export type StructProps = {
        relation: IntervalRelationName,
        key12: number;
    }

    export const getSymbolProps = (symbol: ChordSymol): SymbolProps => {
        switch (symbol) {
            // 3和音（トライアド）
            case '': return {
                structs: ['p1', 'M3', 'p5'],
                upper: '7'
            };
            case 'm': return {
                structs: ['p1', 'm3', 'p5'],
                upper: 'm7'
            };
            case 'sus4': return {
                structs: ['p1', 'p4', 'p5'],
                upper: '7sus4'
            };
            case 'sus2': return {
                structs: ['p1', 'M2', 'p5']
            };
            case 'm-5': return {
                structs: ['p1', 'm3', 'd5']
            };
            case 'dim': return {
                structs: ['p1', 'm3', 'd5'],
                upper: 'dim7'
            };
            case 'aug': return {
                structs: ['p1', 'M3', 'a5'],
                upper: 'aug7'
            };

            // 4和音（テトラド）
            case '7': return {
                structs: ['p1', 'M3', 'p5', 'm7'],
                lower: '',
                upper: '9'
            };
            case 'M7': return {
                structs: ['p1', 'M3', 'p5', 'M7'],
                lower: '',
                upper: 'M9'
            };
            case 'm7': return {
                structs: ['p1', 'm3', 'p5', 'm7'],
                lower: 'm',
                upper: 'm9'
            };
            case 'mmaj7': return {
                structs: ['p1', 'm3', 'p5', 'M7'],
                lower: 'm'
            };
            case '7sus4': return {
                structs: ['p1', 'p4', 'p5', 'm7'],
                lower: 'sus4'
            };
            case 'dim7': return {
                structs: ['p1', 'm3', 'd5', 'd7'],
                lower: 'dim'
            };
            case 'aug7': return {
                structs: ['p1', 'M3', 'a5', 'm7'],
                lower: 'aug'
            };
            case '6': return {
                structs: ['p1', 'M3', 'p5', 'M6']
            };
            case 'm6': return {
                structs: ['p1', 'm3', 'p5', 'M6']
            };
            case 'add9': return {
                structs: ['p1', 'M3', 'p5', 'M2'],
                lower: ''
            };
            case 'madd9': return {
                structs: ['p1', 'm3', 'p5', 'M2'],
                lower: ''
            };

            // 5和音（9th系）
            case '9': return {
                structs: ['p1', 'M3', 'p5', 'm7', 'M2'],
                lower: '7',
                upper: '11'
            };
            case 'm9': return {
                structs: ['p1', 'm3', 'p5', 'm7', 'M2'],
                lower: 'm7',
                upper: 'm11'
            };
            case 'M9': return {
                structs: ['p1', 'M3', 'p5', 'M7', 'M2'],
                lower: 'M7'
            };

            // 6和音（11th系）
            case '11': return {
                structs: ['p1', 'M3', 'p5', 'm7', 'M2', 'p4'],
                lower: '9',
                upper: '13'
            };
            case 'm11': return {
                structs: ['p1', 'm3', 'p5', 'm7', 'M2', 'p4'],
                lower: 'm9',
                upper: 'm13'
            };

            // 7和音（13th系）
            case '13': return {
                structs: ['p1', 'M3', 'p5', 'm7', 'M2', 'p4', 'M6'],
                lower: '11'
            };
            case 'm13': return {
                structs: ['p1', 'm3', 'p5', 'm7', 'M2', 'p4', 'M6'],
                lower: 'm11'
            };
        }
    }

    export const getSameLevelSymbol = (symbol: ChordSymol, dir: -1 | 1) => {
        const symbolProps = getSymbolProps(symbol);
        const sameLevelArr = SymbolTable[symbolProps.structs.length - 3];
        const curIndex = sameLevelArr.findIndex(s => s === symbol);
        return sameLevelArr[curIndex + dir];
    }
    export type ChordStruct = {
        key12: number;
        // name: string;
        relation: IntervalRelationName;
    }
    export const getStructsFromKeyChord = (keyChord: KeyChordProps): ChordStruct[] => {
        const structs = getSymbolProps(keyChord.symbol).structs.map(
            (s: IntervalRelationName) => {
                const interval = getIntervalFromRelation(s);
                const index = keyChord.key12 + interval;
                return {
                    key12: index,
                    name: TonalityTheory.KEY12_SHARP_LIST[index % 12],
                    relation: s,
                };
            },
        );
        const on = keyChord.on;
        if (on != undefined) {
            /** オンコードと同じ構成音 */
            const onSameItem = structs.find(s => s.key12 === on.key12);
            if (onSameItem == undefined) {
                const index = on.key12;
                const list = on.isFlat ? TonalityTheory.KEY12_FLAT_LIST : TonalityTheory.KEY12_SHARP_LIST;
                structs.push({
                    key12: index,
                    name: list[index],
                    relation: 'on'
                });
            } else {
                onSameItem.relation = 'on';
            }
        }
        structs.sort((a, b) => a.key12 - b.key12)
        return structs;
    };

    export const DEGREE7_LIST = [
        'I', 'II', 'III', 'IV', 'V', 'VI', 'VII'
    ];
    // export const DEGREE12_FLAT_LIST = [
    //     'Ⅰ', 'bⅡ', 'Ⅱ', 'bⅢ', 'Ⅲ', 'Ⅳ', 'bⅤ', 'Ⅴ', 'bⅥ', 'Ⅵ', 'bⅦ', 'Ⅶ'
    // ];
    // export const DEGREE12_SHARP_LIST = [
    //     'Ⅰ', '#Ⅰ', 'Ⅱ', '#Ⅱ', 'Ⅲ', 'Ⅳ', '#Ⅳ', 'Ⅴ', '#Ⅴ', 'Ⅵ', '#Ⅵ', 'Ⅶ'
    // ];

    export const DEGREE12_SHARP_LIST: DegreeKey[] = [
        { index: 0 },
        { index: 0, semitone: 1 },
        { index: 1 },
        { index: 1, semitone: 1 },
        { index: 2 },
        { index: 3 },
        { index: 3, semitone: 1 },
        { index: 4 },
        { index: 4, semitone: 1 },
        { index: 5 },
        { index: 5, semitone: 1 },
        { index: 6 },
    ];
    export const DEGREE12_FLAT_LIST: DegreeKey[] = [
        { index: 0 },
        { index: 1, semitone: -1 },
        { index: 1 },
        { index: 2, semitone: -1 },
        { index: 2 },
        { index: 3 },
        { index: 4, semitone: -1 },
        { index: 4 },
        { index: 5, semitone: -1 },
        { index: 5 },
        { index: 6, semitone: -1 },
        { index: 6 },
    ];

    export const getDegree12Props = (degree12Index: number, isFlat: boolean): DegreeKey => {
        const list = !isFlat ? DEGREE12_SHARP_LIST : DEGREE12_FLAT_LIST;
        return { ...list[degree12Index] };
    }
    export const getDegree12Index = (degree12: DegreeKey): number => {
        const isFlat = degree12.semitone != undefined && degree12.semitone === -1;
        const list = !isFlat ? DEGREE12_SHARP_LIST : DEGREE12_FLAT_LIST;
        return list.findIndex(d => d.index === degree12.index && d.semitone === degree12.semitone);
    }
}
export default ChordTheory;
