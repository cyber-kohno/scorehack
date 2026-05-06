namespace TonalityTheory {

    /** 属調とのキーの係数 */
    export const DOMMINANT_KEY_COEFFICENT = 7;

    export type Scale = 'major' | 'minor';

    export type Tonality = {
        key12: number;
        scale: Scale;
    }

    export type Accidental = "sharp" | "flat";

    export interface Key12dProps {
        key12: number;
        isFlat: boolean;
    }

    export const MAJOR_SCALE_INTERVALS = [0, 2, 4, 5, 7, 9, 11];
    export const MINOR_SCALE_INTERVALS = [0, 2, 3, 5, 7, 8, 10];

    export const KEY12_FLAT_LIST = [
        'C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'
    ];
    export const KEY12_SHARP_LIST = [
        'C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'
    ];

    export const KEY12_MAJOR_SCALE_LIST = [
        'C', 'Db', 'D', 'Eb', 'E', 'F', 'F#', 'G', 'Ab', 'A', 'Bb', 'B'
    ];

    export const KEY12_MINOR_SCALE_LIST = [
        'C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'Bb', 'B'
    ];

    export const VALID_SCALE_NAMES = KEY12_MAJOR_SCALE_LIST.map(
        (i) => i + "major",
    ).concat(KEY12_MINOR_SCALE_LIST.map((i) => i + "minor"));

    export const PITCH_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    export const OCTAVE_NAMES = ['lowlowlow', 'lowlow', 'low', 'mid1', 'mid2', 'hi', 'hihi'];

    export const isScale = (pitchIndex: number, tonality: Tonality) => {
        const list = tonality.scale === 'major' ? MAJOR_SCALE_INTERVALS : MINOR_SCALE_INTERVALS;
        return list.includes((pitchIndex - tonality.key12) % 12);
    }

    export const getScaleKeyIndexesFromTonality = (tonality: Tonality) => {
        const list = tonality.scale === 'major' ? MAJOR_SCALE_INTERVALS : MINOR_SCALE_INTERVALS;
        return list.map(v => (v + tonality.key12) % 12);
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

    export const isScaleStructPitch = (pitch: number, tonality: Tonality) => {
        const keyIndex = getKeyIndex(pitch, tonality.key12);
        const list = tonality.scale === 'major' ? MAJOR_SCALE_INTERVALS : MINOR_SCALE_INTERVALS;
        return list.includes(keyIndex);
    }

    export const getKeyIndex = (pitch: number, tonalityKey12: number) => {
        return (12 + pitch - tonalityKey12) % 12;
    }

    export const getScaleDegreeLabel = (index: number) => {
        const labels = [
            "i",
            "i#",
            "ii",
            "ii#",
            "iii",
            "iv",
            "iv#",
            "v",
            "v#",
            "vi",
            "vi#",
            "vii",
        ];
        return labels[(index + 12) % 12];
    }

    export const getKey12FullName = (pitchIndex: number) => {
        const octave = Math.floor(pitchIndex / 12);
        const keyIndex = Math.floor(pitchIndex % 12);
        return `${KEY12_SHARP_LIST[keyIndex]}${octave}`;
    }

    export const getKey12Name = (key12: Key12dProps) => {
        const list = key12.isFlat ? KEY12_FLAT_LIST : KEY12_SHARP_LIST;
        return list[key12.key12];
    }

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
export default TonalityTheory;
