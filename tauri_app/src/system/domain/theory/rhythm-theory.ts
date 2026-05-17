namespace RhythmTheory {

    export type TimeSignature = {
        unit: number;
        cnt: number;
    }

    export type SwingTarget = 8 | 16;

    export type RhythmFeel =
        | { type: 'straight' }
        | { type: 'swing'; target: SwingTarget };

    export type Rhythm = {
        ts: TimeSignature;
        feel: RhythmFeel;
    };

    export type SwingRatios = {
        eighthRatio: number;
        sixteenthRatio: number;
    };

    export const TS_DEFS: TimeSignature[] = [
        { cnt: 2, unit: 4 },
        { cnt: 3, unit: 4 },
        { cnt: 4, unit: 4 },
        { cnt: 6, unit: 8 },
        { cnt: 9, unit: 8 },
        { cnt: 12, unit: 8 },
    ];

    export const formatTS = (ts: TimeSignature) => `${ts.cnt}/${ts.unit}`;

    export const formatFeel = (feel: RhythmFeel) => {
        switch (feel.type) {
            case 'straight': return '';
            case 'swing': return `sw${feel.target}`;
        }
    };

    export const formatRhythm = (rhythm: Rhythm) => {
        const ts = formatTS(rhythm.ts);
        const feel = formatFeel(rhythm.feel);
        return feel === '' ? ts : `${ts} ${feel}`;
    };

    export const getAvailableFeels = (ts: TimeSignature): RhythmFeel[] => {
        switch (ts.unit) {
            case 4:
                return [
                    { type: 'straight' },
                    { type: 'swing', target: 8 },
                    { type: 'swing', target: 16 },
                ];
            case 8:
                return [
                    { type: 'straight' },
                    { type: 'swing', target: 16 },
                ];
        }
        throw new Error(`Unsupported time signature unit. [${ts.unit}]`);
    };

    export const isSameFeel = (left: RhythmFeel, right: RhythmFeel) => {
        if (left.type !== right.type) return false;
        if (left.type === 'straight') return true;
        return right.type === 'swing' && left.target === right.target;
    };

    const getSwingProps = (rhythm: Rhythm, swing: SwingRatios) => {
        if (rhythm.feel.type !== 'swing') return null;

        const ratio = rhythm.feel.target === 8
            ? swing.eighthRatio
            : swing.sixteenthRatio;
        if (ratio <= 0) return null;

        const period = rhythm.feel.target === 8 ? 1 : 0.5;
        const split = period / 2;
        const long = period * (ratio / (ratio + 1));
        const short = period * (1 / (ratio + 1));

        return { period, split, long, short };
    };

    export const applySwingToBeatNotePos = (
        rhythm: Rhythm,
        swing: SwingRatios,
        pos: number,
    ) => {
        const props = getSwingProps(rhythm, swing);
        if (props == null) return pos;

        const { period, split, long, short } = props;
        const periodIndex = Math.floor(pos / period);
        const periodStart = periodIndex * period;
        const phase = pos - periodStart;
        const local = phase <= split
            ? phase * (long / split)
            : long + (phase - split) * (short / split);

        return periodStart + local;
    };

    export const removeSwingFromBeatNotePos = (
        rhythm: Rhythm,
        swing: SwingRatios,
        pos: number,
    ) => {
        const props = getSwingProps(rhythm, swing);
        if (props == null) return pos;

        const { period, split, long, short } = props;
        const periodIndex = Math.floor(pos / period);
        const periodStart = periodIndex * period;
        const phase = pos - periodStart;
        const local = phase <= long
            ? phase * (split / long)
            : split + (phase - long) * (split / short);

        return periodStart + local;
    };

    export const getSwungBeatNoteDuration = (
        rhythm: Rhythm,
        swing: SwingRatios,
        start: number,
        len: number,
    ): number => {
        if (len < 0) return -getSwungBeatNoteDuration(rhythm, swing, start + len, -len);
        return applySwingToBeatNotePos(rhythm, swing, start + len)
            - applySwingToBeatNotePos(rhythm, swing, start);
    };

    export const getBeatNoteOffsetFromSwungDuration = (
        rhythm: Rhythm,
        swing: SwingRatios,
        start: number,
        duration: number,
    ): number => {
        if (duration < 0) return -getBeatNoteOffsetFromSwungDuration(rhythm, swing, start, -duration);

        const swungStart = applySwingToBeatNotePos(rhythm, swing, start);
        const swungEnd = swungStart + duration;
        return removeSwingFromBeatNotePos(rhythm, swing, swungEnd) - start;
    };

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

        throw new Error(`Unsupported beat division count. [${beatDiv16Cnt}]`);
    };

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
        throw new Error(`Unsupported time signature. [${val}]`);
    }

    export const getBeatDiv16Count = (ts: TimeSignature) => {
        switch (ts.unit) {
            case 4: return 4;
            case 8: return 6;
        }
        throw new Error(`Unsupported time signature unit. [${ts.unit}]`);
    }
}
export default RhythmTheory;
