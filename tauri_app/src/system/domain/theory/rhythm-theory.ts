namespace RhythmTheory {

    export type TimeSignature = {
        /** 分母 */
        unit: number;
        /** 分子 */
        cnt: number;
    }

    export const TS_DEFS: TimeSignature[] = [
        {cnt: 2, unit: 4},
        {cnt: 3, unit: 4},
        {cnt: 4, unit: 4},
        {cnt: 6, unit: 8},
        {cnt: 9, unit: 8},
        {cnt: 12, unit: 8},
    ];

    export const formatTS = (ts: TimeSignature) => `${ts.cnt}/${ts.unit}`;

    export const getTSNames = () => TS_DEFS.map(formatTS);

    export const parseTS = (name: string): TimeSignature | undefined => {
        const ts = TS_DEFS.find(ts => formatTS(ts) === name);
        if (ts == undefined) return undefined;
        return { ...ts };
    };

    export type MelodyInputRate = {
        div: number;
        len: number;
    };

    export const getMelodyInputRates = (ts: TimeSignature): MelodyInputRate[] => {
        const beatDiv16Cnt = getBeatDiv16Count(ts);

        switch (beatDiv16Cnt) {
            case 4:
                return [
                    { div: 4, len: 1 },
                    { div: 2, len: 1 },
                    { div: 1, len: 1 },
                ];
            case 6:
                return [
                    { div: 4, len: 1 },
                    { div: 2, len: 1 },
                    { div: 2, len: 3 },
                ];
        }

        throw new Error(`1拍の16分音符数[${beatDiv16Cnt}]は想定していない値。`);
    };

    /**
     * 1小節に何拍入るかを返す。
     * @param ts タイムシグネチャ
     * @returns 拍数
     */
    export const getBarDivBeatCount = (ts: TimeSignature) => {
        const val = formatTS(ts);
        switch (val) {
            case '2/4': return 2;
            case '3/4': return 3;
            case '4/4': return 4;
            case '6/8': return 2;
            case '9/8': return 3;
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
        switch (ts.unit) {
            case 4: return 4;
            case 8: return 6;
        }
        throw new Error(`分子[${ts.unit}]は不適切な値。`);
    }
}
export default RhythmTheory;
