import RhythmTheory from "../../../../domain/theory/rhythm-theory";
import type ArrangeState from "./arrange-state";
import type DrumEditorState from "./drum/drum-editor-state";
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
