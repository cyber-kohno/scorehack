import RhythmTheory from "../../../../domain/theory/rhythm-theory";
import type ArrangeState from "./arrange-state";
import type PianoEditorState from "./piano/piano-editor-state";

namespace ArrangeLibrary {

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

    export const getPianoBackingPatternFromNo = (no: number, lib: PianoEditorState.Lib) => {
        const patt = lib.backingPatterns.find(p => p.no === no);
        if (patt == undefined) throw new Error('pattがundefinedであってはならない。');
        return patt.backing;
    }
    export const getPianoVoicingPatternFromNo = (no: number, lib: PianoEditorState.Lib) => {
        const patt = lib.soundsPatterns.find(p => p.no === no);
        if (patt == undefined) throw new Error('pattがundefinedであってはならない。');
        return patt.sounds;
    }

    export const searchPianoPatterns = (args: {
        req: SearchRequest;
        arrTrack: ArrangeState.PianoTrack;
        isFilterPatternOnly: boolean;
    }) => {
        const { req, arrTrack: track, isFilterPatternOnly } = args;
        const lib = track.lib;
        const createSoundsNos = (backingNo: number) => {
            const soundsNos: number[] = [];

            const regular = lib.regulars.find(p => p.backingNo === backingNo);
            if (regular != undefined) {
                regular.soundsNos.forEach(vNo => {
                    const sndsPatt = lib.soundsPatterns.find(p => p.no === vNo);
                    if (sndsPatt == undefined) throw new Error('sndsPattがundefiendであってはならない。');
                    if (req.structCnt === sndsPatt.category.structCnt) {
                        soundsNos.push(vNo);
                    }
                });
            }

            track.relations.forEach(r => {
                if (r.bkgPatt !== backingNo || r.sndsPatt === -1) return;
                const sndsPatt = lib.soundsPatterns.find(p => p.no === r.sndsPatt);
                if (sndsPatt == undefined) throw new Error('sndsPattがundefiendであってはならない。');
                if (req.structCnt === sndsPatt.category.structCnt && !soundsNos.includes(sndsPatt.no)) {
                    soundsNos.push(r.sndsPatt);
                }
            });

            return soundsNos;
        };

        // console.log(req);
        // 条件に一致するパターンを抽出
        const bkgPatts = lib.backingPatterns.filter(patt => {
            const cond = patt.category;
            const condEatHead = cond.eatHead ?? 0;
            const condEatTail = cond.eatTail ?? 0;

            // console.log(cond);
            // console.log(req);
            return cond.tsGloup
                .map(ts => RhythmTheory.formatTS(ts))
                .includes(RhythmTheory.formatTS(req.ts)) &&
                cond.beat === req.beat &&
                condEatHead === req.eatHead &&
                condEatTail === req.eatTail
        });

        // console.log(bkgPatts);
        const list: PianoEditorState.Regular[] = bkgPatts.map(bkgPatt => {
            // // バッキングパターンのレコード数と一致するボイシングの管理連番を取得
            // const voics = lib.soundsPatterns.filter(sndsPatt => {
            //     return req.structCnt === sndsPatt.category.structCnt &&
            //         bkgPatt.backing.recordNum === sndsPatt.sounds.length;
            // }).map(p => p.no);
            return {
                backingNo: bkgPatt.no,
                sortNo: -1,
                soundsNos: createSoundsNos(bkgPatt.no),
            }
        });
        const noBackingSoundsNos = createSoundsNos(-1);
        if (noBackingSoundsNos.length > 0) {
            list.unshift({
                backingNo: -1,
                sortNo: -1,
                soundsNos: noBackingSoundsNos,
            });
        }
        return list
            // パターンのみのオプション時、ボイシング0のパターンを除外
            .filter(patt => !(isFilterPatternOnly && patt.soundsNos.length === 0));
    }
}

export default ArrangeLibrary;
