import RhythmTheory from "../../../../domain/theory/rhythm-theory";
import type ChordTheory from "../../../../domain/theory/chord-theory";
import type ArrangeState from "./arrange-state";
import type DrumEditorState from "./drum/drum-editor-state";
import type GuitarEditorState from "./guitar/guitar-editor-state";
import type PianoEditorState from "./piano/piano-editor-state";

namespace FinderState {

    export interface BackingCategory {
        tsGloup: RhythmTheory.TimeSignature[];
        beat: number;
        eatHead?: number;
        eatTail?: number;
    }
    export interface SoundsCategory {
        structCnt: number;
    }
    export interface SearchCategory extends BackingCategory, SoundsCategory { }

    export type SearchRequest = {
        ts: RhythmTheory.TimeSignature;
        beat: number;
        eatHead: number;
        eatTail: number;
        structCnt: number;
    }

    export type Maintenance = {

    }

    export type Cursor = {
        backing: number, sounds: number;
    }
    export type PianoArrangeFinder = {
        request: SearchRequest;
        list: PianoEditorState.Regular[];

        /** 選択カーソル */
        cursor: Cursor;
        /** 適用されているパターン */
        apply: Cursor;
    }

    export type Pattern = {
        backingNo: number;
        soundsNos: number[];
    }

    export namespace Drum {
        export const ColumnCount = 3;

        export type PatternItem = {
            patternNo: number;
        };

        export type Finder = {
            request: SearchRequest;
            list: PatternItem[];
            cursor: number;
            apply: number;
        };

        export const searchPatterns = (args: {
            req: SearchRequest;
            arrTrack: ArrangeState.DrumTrack;
        }) => {
            const { req, arrTrack: track } = args;

            return track.bank.patterns
                .filter((pattern) => {
                    const cond = pattern.category;
                    const condEatHead = cond.eatHead ?? 0;
                    const condEatTail = cond.eatTail ?? 0;

                    return cond.tsGroup
                        .map(ts => RhythmTheory.formatTS(ts))
                        .includes(RhythmTheory.formatTS(req.ts)) &&
                        cond.beat === req.beat &&
                        condEatHead === req.eatHead &&
                        condEatTail === req.eatTail;
                })
                .map((pattern): PatternItem => ({
                    patternNo: pattern.no,
                }));
        };

        export const getPatternFromNo = (
            no: number,
            bank: DrumEditorState.Bank,
        ) => {
            const pattern = bank.patterns.find(item => item.no === no);
            if (pattern == undefined) throw new Error("Drum pattern must exist.");
            return pattern;
        };
    }

    export namespace Guitar {
        export const ColumnCount = 3;
        export const MaxVoicingItemCount = 6;

        export type VoicingKey = {
            root: number;
            symbol: ChordTheory.ChordSymol;
            on: number | null;
        };

        export type VoicingItem = {
            voicingNo: number;
        };

        export type BackingItem = {
            backingNo: number;
        };

        export type Cursor = {
            target: "voicing" | "backing";
            voicing: number;
            backing: number;
        };

        export type Finder = {
            request: SearchRequest;
            key: VoicingKey;
            voicings: VoicingItem[];
            backings: BackingItem[];
            cursor: Cursor;
            apply: {
                voicing: number;
                backing: number;
            };
        };

        export const createVoicingKey = (
            chord: ChordTheory.KeyChordProps,
        ): VoicingKey => ({
            root: chord.key12,
            symbol: chord.symbol,
            on: chord.on?.key12 ?? null,
        });

        export const equalsVoicingKey = (
            a: VoicingKey,
            b: VoicingKey | undefined,
        ) => {
            if (b == undefined) return false;
            return a.root === b.root && a.symbol === b.symbol && a.on === b.on;
        };

        export const searchVoicings = (args: {
            key: VoicingKey;
            arrTrack: ArrangeState.GuitarTrack;
        }): VoicingItem[] => {
            const { key, arrTrack } = args;
            return [
                { voicingNo: -1 },
                ...arrTrack.bank.voicingPatterns
                    .filter(pattern => equalsVoicingKey(key, pattern.key))
                    .slice(0, MaxVoicingItemCount - 1)
                    .map(pattern => ({ voicingNo: pattern.no })),
            ];
        };

        export const searchBackings = (args: {
            req: SearchRequest;
            arrTrack: ArrangeState.GuitarTrack;
        }): BackingItem[] => {
            const { req, arrTrack } = args;
            return [
                { backingNo: -1 },
                ...arrTrack.bank.backingPatterns
                    .filter((pattern) => {
                        const cond = pattern.category;
                        if (cond == undefined) return false;
                        const condEatHead = cond.eatHead ?? 0;
                        const condEatTail = cond.eatTail ?? 0;

                        return cond.tsGloup
                            .map(ts => RhythmTheory.formatTS(ts))
                            .includes(RhythmTheory.formatTS(req.ts)) &&
                            cond.beat === req.beat &&
                            condEatHead === req.eatHead &&
                            condEatTail === req.eatTail;
                    })
                    .map(pattern => ({ backingNo: pattern.no })),
            ];
        };

        export const getVoicingFromNo = (
            no: number,
            bank: GuitarEditorState.Bank,
        ) => {
            const pattern = bank.voicingPatterns.find(item => item.no === no);
            if (pattern == undefined) throw new Error("Guitar voicing pattern must exist.");
            return pattern;
        };

        export const getBackingFromNo = (
            no: number,
            bank: GuitarEditorState.Bank,
        ) => {
            const pattern = bank.backingPatterns.find(item => item.no === no);
            if (pattern == undefined) throw new Error("Guitar backing pattern must exist.");
            return pattern;
        };
    }

    export const getPianoBackingPatternFromNo = (no: number, bank: PianoEditorState.Bank) => {
        const patt = bank.backingPatterns.find(p => p.no === no);
        if (patt == undefined) throw new Error("patt must exist.");
        return patt.backing;
    }
    export const getPianoVoicingPatternFromNo = (no: number, bank: PianoEditorState.Bank) => {
        const patt = bank.soundsPatterns.find(p => p.no === no);
        if (patt == undefined) throw new Error("patt must exist.");
        return patt.sounds;
    }

    export const searchPianoPatterns = (args: {
        req: SearchRequest;
        arrTrack: ArrangeState.PianoTrack;
        isFilterPatternOnly: boolean;
    }) => {
        const { req, arrTrack: track, isFilterPatternOnly } = args;
        const bank = track.bank;
        const createSoundsNos = (backingNo: number) => {
            const soundsNos: number[] = [];

            const regular = bank.regulars.find(p => p.backingNo === backingNo);
            if (regular != undefined) {
                regular.soundsNos.forEach(vNo => {
                    const sndsPatt = bank.soundsPatterns.find(p => p.no === vNo);
                    if (sndsPatt == undefined) throw new Error("sndsPatt must exist.");
                    if (req.structCnt === sndsPatt.category.structCnt) {
                        soundsNos.push(vNo);
                    }
                });
            }

            track.relations.forEach(r => {
                if (r.bkgPatt !== backingNo || r.sndsPatt === -1) return;
                const sndsPatt = bank.soundsPatterns.find(p => p.no === r.sndsPatt);
                if (sndsPatt == undefined) throw new Error("sndsPatt must exist.");
                if (req.structCnt === sndsPatt.category.structCnt && !soundsNos.includes(sndsPatt.no)) {
                    soundsNos.push(r.sndsPatt);
                }
            });

            return soundsNos;
        };

        // 条件に一致するパターンを抽出
        const bkgPatts = bank.backingPatterns.filter(patt => {
            const cond = patt.category;
            const condEatHead = cond.eatHead ?? 0;
            const condEatTail = cond.eatTail ?? 0;

            return cond.tsGloup
                .map(ts => RhythmTheory.formatTS(ts))
                .includes(RhythmTheory.formatTS(req.ts)) &&
                cond.beat === req.beat &&
                condEatHead === req.eatHead &&
                condEatTail === req.eatTail
        });

        const list: PianoEditorState.Regular[] = bkgPatts.map(bkgPatt => {
            return {
                backingNo: bkgPatt.no,
                sortNo: -1,
                soundsNos: createSoundsNos(bkgPatt.no),
            }
        });
        const noBackingSoundsNos = createSoundsNos(-1);
        list.unshift({
            backingNo: -1,
            sortNo: -1,
            soundsNos: noBackingSoundsNos,
        });
        return list
            // パターンのみのオプション時、ボイシング0のパターンを除外
            .filter(patt => !(isFilterPatternOnly && patt.soundsNos.length === 0));
    }
}

export default FinderState;
