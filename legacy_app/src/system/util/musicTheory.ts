namespace MusicTheory {

    /**
     * 1小節に何拍入るかを返す。
     * @param ts タイムシグネチャ 
     * @returns 拍数
     */
    export const getBarDivBeatCount = (ts: TimeSignature) => {
        const val = `${ts.den}/${ts.num}`;
        switch (val) {
            case '4/4': return 4;
            case '2/4': return 2;
            case '3/4': return 3;
            case '6/8': return 2;
            case '12/8': return 4;
        }
        throw new Error(`拍子[${val}]は不適切な値。`);
    }

    /**
     * 1拍に入る16分音符の数を返す。
     * @param ts タイムシグネチャ
     * @returns 16分音符の数
     */
    export const getBeatDiv16Count = (ts: TimeSignature) => {
        switch (ts.num) {
            case 4: return 4;
            case 8: return 6;
        }
        throw new Error(`分子[${ts.num}]は不適切な値。`);
    }

    // export const getNoteRateArr = (ts: GlobalStore.TimeSignature) => {
    //     const beatDiv = getBeatDiv16Count(ts);
    //     if (beatDiv === 4) {
    //         return [
    //             [16, 1], [8, 1], [4, 1]
    //         ];
    //     } else if (beatDiv === 6) {
    //         return [
    //             [16, 1], [8, 1], [8, 3]
    //         ];
    //     }
    //     throw new Error(`beatDiv:[${beatDiv}]は想定していない値。`);
    // }



    /** 属調とのキーの係数 */
    export const DOMMINANT_KEY_COEFFICENT = 7;

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

    export type ChordSymol = typeof ChordSymols[number];

    export type Scale = 'major' | 'minor';

    export type TimeSignature = {
        /** 分母 */
        num: number;
        /** 分子 */
        den: number;
    }
    export type Tonality = {
        key12: number;
        scale: Scale;
    }
    export const isScale = (pitchIndex: number, tonality: Tonality) => {
        const list = tonality.scale === 'major' ? MAJOR_SCALE_INTERVALS : MINOR_SCALE_INTERVALS;
        return list.includes((pitchIndex - tonality.key12) % 12);
    }

    export interface DegreeKey {
        index: number;
        semitone?: 1 | -1;
    }
    export interface DegreeChord extends DegreeKey {
        symbol: ChordSymol;
        on?: DegreeKey;
    }

    export interface Key12dProps {
        key12: number;
        isFlat: boolean;
    }
    export interface KeyChordProps extends Key12dProps {
        symbol: ChordSymol;
        on?: Key12dProps;
    }

    export const MAJOR_SCALE_INTERVALS = [0, 2, 4, 5, 7, 9, 11];
    export const MINOR_SCALE_INTERVALS = [0, 2, 3, 5, 7, 8, 10];

    export const getScaleKeyIndexesFromTonality = (tonality: Tonality) => {
        const list = tonality.scale === 'major' ? MAJOR_SCALE_INTERVALS : MINOR_SCALE_INTERVALS;
        return list.map(v => v + tonality.key12);
    }

    export const getScaleName = (tonality: Tonality) => {
        const list = tonality.scale === 'major' ? KEY12_MAJOR_SCALE_LIST : KEY12_MINOR_SCALE_LIST;
        const keyName = list[tonality.key12];
        return `${keyName}${tonality.scale}`
    }
    export const getKeyScaleFromName = (name: string) => {
        const [list, scale, keyName]: [string[], Scale, string] = (() => {
            if (name.indexOf('major') !== -1) {
                const keyName = name.substring(0, name.indexOf('major'));
                return [KEY12_MAJOR_SCALE_LIST, 'major', keyName];
            }
            else if (name.indexOf('minor') !== -1) {
                const keyName = name.substring(0, name.indexOf('minor'));
                return [KEY12_MINOR_SCALE_LIST, 'minor', keyName];
            }
            throw new Error();
        })();
        const keyIndex = list.findIndex(k => k === keyName);
        if (keyIndex === -1) throw new Error();
        return { keyIndex, scale }
    }

    export const getTSName = (ts: TimeSignature) => `${ts.den}/${ts.num}`;

    export const isScaleStructPitch = (pitch: number, tonality: Tonality) => {
        const keyIndex = getKeyIndex(pitch, tonality.key12);
        const list = tonality.scale === 'major' ? MAJOR_SCALE_INTERVALS : MINOR_SCALE_INTERVALS;
        return list.includes(keyIndex);
    }

    export const getKeyIndex = (pitch: number, tonalityKey12: number) => {
        return (12 + pitch - tonalityKey12) % 12;
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

    export const KEY12_FLAT_LIST = [
        'C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'
    ];
    export const KEY12_SHARP_LIST = [
        'C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'
    ];

    export const getKey12FullName = (pitchIndex: number) => {
        const octave = Math.floor(pitchIndex / 12);
        const keyIndex = Math.floor(pitchIndex % 12);
        return `${KEY12_SHARP_LIST[keyIndex]}${octave}`;
    }

    export const getKey12Name = (key12: Key12dProps) => {
        const list = key12.isFlat ? KEY12_FLAT_LIST : KEY12_SHARP_LIST;
        return list[key12.key12];
    }
    export const getKeyChordName = (keyChord: KeyChordProps) => {
        let name = getKey12Name(keyChord) + keyChord.symbol;
        if (keyChord.on != undefined) {
            name += ` / ${getKey12Name(keyChord.on)}`;
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
        // const arr = getIntervalArray();
        // const index = arr.findIndex(i => i === name);
        // if (index === -1) throw new Error(`[${name}]は、定義の中に存在しない。`);
        // return index;
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
                    name: KEY12_SHARP_LIST[index % 12],
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
                const list = on.isFlat ? KEY12_FLAT_LIST : KEY12_SHARP_LIST;
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
        'Ⅰ', 'Ⅱ', 'Ⅲ', 'Ⅳ', 'Ⅴ', 'Ⅵ', 'Ⅶ'
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


    export const KEY12_MAJOR_SCALE_LIST = [
        'C', 'Db', 'D', 'Eb', 'E', 'F', 'F#', 'G', 'Ab', 'A', 'Bb', 'B'
    ];

    export const KEY12_MINOR_SCALE_LIST = [
        'C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'Bb', 'B'
    ];

    export const PITCH_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    export const OCTAVE_NAMES = ['lowlowlow', 'lowlow', 'low', 'mid1', 'mid2', 'hi', 'hihi'];

    export const getPitchName = (totalPitchIndex: number): [octaveName: string, pitchName: string] => {
        const octaveIndex = Math.floor(totalPitchIndex / 12);
        const pitchIndex = totalPitchIndex % 12;

        return [
            OCTAVE_NAMES[octaveIndex],
            PITCH_NAMES[pitchIndex]
        ];
    }
    export const getPitchKey = (totalPitchIndex: number): [octaveIndex: number, soundName: string] => {
        const octaveIndex = Math.floor(totalPitchIndex / 12);
        const soundIndex = totalPitchIndex % 12;

        return [
            octaveIndex,
            PITCH_NAMES[soundIndex]
        ];
    }
}
export default MusicTheory;
