import type ChordTheory from "../../domain/theory/chord-theory";
import type RhythmTheory from "../../domain/theory/rhythm-theory";
import type FinderState from "./data/arrange/finder-state";

namespace LibraryState {

    export type Condition = 'ts' | 'beat' | 'eat-head' | 'eat-tail' |
        'root' | 'on' | 'symbol-tones' | 'symbol';

    export const Conditions: Condition[] = [
        'ts',
        'beat',
        'eat-head',
        'eat-tail',
        'root',
        'on',
        'symbol-tones',
        'symbol',
    ];

    export const DrumConditions: Condition[] = [
        'ts',
        'beat',
        'eat-head',
        'eat-tail',
    ];

    export type FinderCursor = FinderState.Cursor & {
        target?: FinderState.Guitar.Cursor["target"];
        voicing?: number;
    };

    export type Finder = {
        cursor: FinderCursor;
    };

    export type Value = {
        focus: {
            condition: Condition;
            finder: Finder | null;
        };
        condition: {
            ts: RhythmTheory.TimeSignature;
            beat: number;
            eatHead: number;
            eatTail: number;
            root: number;
            on: number;
            symbolTones: number;
            symbol: ChordTheory.ChordSymol;
        };
    };

    export const createInitial = (): Value => ({
        focus: {
            condition: 'ts',
            finder: null,
        },
        condition: {
            beat: 4,
            eatHead: 0,
            eatTail: 0,
            root: 0,
            on: -1,
            symbolTones: 3,
            symbol: '',
            ts: { cnt: 4, unit: 4 },
        },
    });
}

export default LibraryState;
