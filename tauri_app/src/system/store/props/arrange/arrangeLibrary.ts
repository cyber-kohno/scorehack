import MusicTheory from "../../../../domain/theory/music-theory";
import type StoreArrange from "./storeArrange";
import type StorePianoEditor from "./piano/storePianoEditor";
import type StoreCache from "../storeCache";


namespace ArrangeLibrary {

    export interface BackingCategory {
        tsGloup: MusicTheory.TimeSignature[];
        beat: number;
        eatHead?: number;
        eatTail?: number;
    }
    export interface SoundsCategory {
        structCnt: number;
    }
    export interface SearchCategory extends BackingCategory, SoundsCategory { }

    export type SearchRequest = {
        ts: MusicTheory.TimeSignature;
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
        list: StorePianoEditor.Preset[];

        /** 驕ｸ謚槭き繝ｼ繧ｽ繝ｫ */
        cursor: Cursor;
        /** 驕ｩ逕ｨ縺輔ｌ縺ｦ縺・ｋ繝代ち繝ｼ繝ｳ */
        apply: Cursor;
    }

    export type Pattern = {
        backingNo: number;
        soundsNos: number[];
    }

    export const getPianoBackingPatternFromNo = (no: number, lib: StorePianoEditor.Lib) => {
        const patt = lib.backingPatterns.find(p => p.no === no);
        if (patt == undefined) throw new Error('Backing pattern was not found.');
        return patt.backing;
    }
    export const getPianoVoicingPatternFromNo = (no: number, lib: StorePianoEditor.Lib) => {
        const patt = lib.soundsPatterns.find(p => p.no === no);
        if (patt == undefined) throw new Error('Voicing pattern was not found.');
        return patt.sounds;
    }

    export const searchPianoPatterns = (args: {
        req: SearchRequest;
        arrTrack: StoreArrange.Track;
        isFilterPatternOnly: boolean;
    }) => {
        const { req, arrTrack: track, isFilterPatternOnly } = args;
        const lib = track.pianoLib as StorePianoEditor.Lib;

        // console.log(req);
        // 譚｡莉ｶ縺ｫ荳閾ｴ縺吶ｋ繝代ち繝ｼ繝ｳ繧呈歓蜃ｺ
        const bkgPatts = lib.backingPatterns.filter(patt => {
            const cond = patt.category;
            const condEatHead = cond.eatHead ?? 0;
            const condEatTail = cond.eatTail ?? 0;

            // console.log(cond);
            // console.log(req);
            return cond.tsGloup
                .map(ts => MusicTheory.getTSName(ts))
                .includes(MusicTheory.getTSName(req.ts)) &&
                cond.beat === req.beat &&
                condEatHead === req.eatHead &&
                condEatTail === req.eatTail
        });

        // console.log(bkgPatts);
        const list: StorePianoEditor.Preset[] = bkgPatts.map(bkgPatt => {
            const voics: number[] = [];

            // 繝励Μ繧ｻ繝・ヨ縺九ｉ謗｢縺・            
            const presetBkgPatt = lib.presets.find(p => p.bkgPatt === bkgPatt.no);
            if (presetBkgPatt != undefined) {
                presetBkgPatt.voics.forEach(vNo => {
                    const sndsPatt = lib.soundsPatterns.find(p => p.no === vNo);
                    if (sndsPatt == undefined) throw new Error('Voicing pattern was not found.');
                    if (req.structCnt === sndsPatt.category.structCnt) {
                        voics.push(vNo);
                    }
                });
            }

            // 繝ｪ繝ｬ繝ｼ繧ｷ繝ｧ繝ｳ縺九ｉ謗｢縺・
            track.relations.forEach(r => {
                const sndsPatt = lib.soundsPatterns.find(p => p.no === r.sndsPatt);
                if (sndsPatt == undefined) throw new Error('Voicing pattern was not found.');
                if (req.structCnt === sndsPatt.category.structCnt &&
                    r.bkgPatt === bkgPatt.no && !voics.includes(sndsPatt.no)) {
                    voics.push(r.sndsPatt);
                }
            });

            // // 繝舌ャ繧ｭ繝ｳ繧ｰ繝代ち繝ｼ繝ｳ縺ｮ繝ｬ繧ｳ繝ｼ繝画焚縺ｨ荳閾ｴ縺吶ｋ繝懊う繧ｷ繝ｳ繧ｰ縺ｮ邂｡逅・｣逡ｪ繧貞叙蠕・
            // const voics = lib.soundsPatterns.filter(sndsPatt => {
            //     return req.structCnt === sndsPatt.category.structCnt &&
            //         bkgPatt.backing.recordNum === sndsPatt.sounds.length;
            // }).map(p => p.no);
            return {
                bkgPatt: bkgPatt.no,
                sortNo: -1,
                voics
            }
        });
        return list
            // 繝代ち繝ｼ繝ｳ縺ｮ縺ｿ縺ｮ繧ｪ繝励す繝ｧ繝ｳ譎ゅ√・繧､繧ｷ繝ｳ繧ｰ0縺ｮ繝代ち繝ｼ繝ｳ繧帝勁螟・
            .filter(patt => !(isFilterPatternOnly && patt.voics.length === 0));
    }
}

export default ArrangeLibrary;

