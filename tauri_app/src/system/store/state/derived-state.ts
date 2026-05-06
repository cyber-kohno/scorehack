import type ChordTheory from "../../domain/theory/chord-theory";
import type RhythmTheory from "../../domain/theory/rhythm-theory";
import type TonalityTheory from "../../domain/theory/tonality-theory";
import type ElementState from "./data/element-state";

namespace DerivedState {

    export type Value = {
        baseCaches: BaseCache[];

        chordCaches: ChordCache[];
        elementCaches: ElementCache[];

        outlineTailPos: number;
    }

    export const INITIAL: Value = {
        baseCaches: [],
        chordCaches: [],
        elementCaches: [],
        outlineTailPos: 0
    };

    export interface BeatRange {
        startTime: number;
        sustainTime: number;
        startBeat: number;
        lengthBeat: number;
        startBeatNote: number;
        lengthBeatNote: number;

        viewPosLeft: number;
        viewPosWidth: number;
    }
    export interface BaseCache extends BeatRange {
        scoreBase: ElementState.DataInit;
        startBar: number;
        baseSeq: number;
    }

    export interface ChordCache extends BeatRange {
        chordSeq: number;
        elementSeq: number;
        baseSeq: number;

        beat: BeatCache;
        compiledChord?: CompiledChord;

        sectionStart?: string;
        modulate?: ModulateCache;
        tempo?: TempoCache;
        ts?: TSCache;
        arrs: string[];

        error?: {
            straddle: boolean;
        }
    }

    export interface ModulateCache {
        prev: TonalityTheory.Tonality;
        next: TonalityTheory.Tonality;
    }
    export interface TempoCache {
        prev: number;
        next: number;
    }
    export interface TSCache {
        prev: RhythmTheory.TimeSignature;
        next: RhythmTheory.TimeSignature;
    }

    export interface BeatCache {
        num: number;
        eatHead: number;
        eatTail: number;
    }

    export const getBeatInfo = ((beatCache: BeatCache) => {
        let ret = beatCache.num.toString();
        if (beatCache.eatHead !== 0 || beatCache.eatTail !== 0) {
            ret += ` (${beatCache.eatHead}, ${beatCache.eatTail})`;
        }
        return ret;
    })

    export type CompiledChord = {
        chord: ChordTheory.KeyChordProps;
        structs: ChordTheory.ChordStruct[];
    };

    export interface ElementCache extends ElementState.Element {
        elementSeq: number;
        chordSeq: number;
        baseSeq: number;
        lastChordSeq: number;

        viewHeight: number;
        outlineTop: number;
        curSection: string;

        modulate?: ModulateCache;
        tempo?: TempoCache;
        ts?: TSCache;
    }
}
export default DerivedState;
