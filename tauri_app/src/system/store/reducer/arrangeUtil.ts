import type MusicTheory from "../../../domain/theory/music-theory";
import ArrangeLibrary from "../props/arrange/arrangeLibrary";
import StorePianoEditor from "../props/arrange/piano/storePianoEditor";
import type StoreArrange from "../props/arrange/storeArrange";
import type StoreCache from "../props/storeCache";
import type { StoreProps } from "../store";


namespace ArrangeUtil {

    export type FinderProps = {
        ts: MusicTheory.TimeSignature,
        chordCache: StoreCache.ChordCache,
        arrTrack: StoreArrange.Track
    };

    /**
     * 繝｡繧ｽ繝・ラ縺ｫ蠢懊§縺溘ヵ繧｡繧､繝ｳ繝繝ｼ繧堤函謌舌＠縺ｦ霑斐☆
     * @param props 
     * @returns 
     */
    export const createFinder = (props: FinderProps) => {
        switch (props.arrTrack.method) {
            case 'piano': return ArrangeUtil.createPianoFinder(props);
        }
    }

    /**
     * 繝斐い繝守畑縺ｮ繝輔ぃ繧､繝ｳ繝繝ｼ繧堤函謌舌＠縺ｦ霑斐☆縲・
     * @param props 
     * @returns 
     */
    export const createPianoFinder = (props: FinderProps) => {

        const { ts, chordCache: chord, arrTrack } = props;
        const compiledChord = chord.compiledChord;
        if (compiledChord == undefined) throw new Error();

        const req: ArrangeLibrary.SearchRequest = {
            beat: chord.beat.num,
            eatHead: chord.beat.eatHead,
            eatTail: chord.beat.eatTail,
            structCnt: compiledChord.structs.length,
            ts
        };

        const finder: ArrangeLibrary.PianoArrangeFinder = {
            cursor: { backing: -1, sounds: -1 },
            apply: { backing: -1, sounds: -1 },
            request: req,
            list: ArrangeLibrary.searchPianoPatterns({
                req, arrTrack, isFilterPatternOnly: false
            })
        }

        if (finder.list.length > 0) {

            // 繧ｳ繝ｼ繝蛾｣逡ｪ縺ｨ蜿ら・蜈医Λ繧､繝悶Λ繝ｪ縺ｮ邏蝉ｻ倥￠
            const relations = arrTrack.relations;
            const relation = relations.find(r => r.chordSeq === chord.chordSeq);
            if (relation != undefined) {

                const bkgPatt = finder.list.findIndex(f => f.bkgPatt === relation.bkgPatt);
                const sndPatt = finder.list[bkgPatt].voics.findIndex(v => v === relation.sndsPatt);

                if (bkgPatt === -1 || sndPatt === -1) throw new Error();
                finder.cursor.backing = finder.apply.backing = bkgPatt;
                finder.cursor.sounds = finder.apply.sounds = sndPatt;
            }
        }
        return finder;
    }

    /**
     * 繝ｪ繝・Η繝ｼ繧ｵ繧定ｿ斐☆縲・
     * @param lastStore 
     * @returns 
     */
    export const useReducer = (lastStore: StoreProps) => {

        const getArrange = () => {
            const arrange = lastStore.control.outline.arrange;
            if (arrange == null) throw new Error();
            return arrange;
        }
        const getPianoEditor = () => {
            const arrange = getArrange();
            if (arrange.method !== 'piano' || arrange.editor == undefined) throw new Error();
            return arrange.editor as StorePianoEditor.Props
        }
        const getPianoFinder = () => {
            const arrange = getArrange();
            if (arrange.method !== 'piano' || arrange.finder == undefined) throw new Error();
            return arrange.finder as ArrangeLibrary.PianoArrangeFinder;
        }
        const getCurTrack = () => {
            const track = lastStore.data.arrange.tracks[lastStore.control.outline.trackIndex];
            if (track == undefined) throw new Error();
            return track;
        }

        const getPianoLib = () => {
            const track = getCurTrack();
            if (track.method === 'piano' && track.pianoLib != undefined) {
                return track.pianoLib as StorePianoEditor.Lib;
            }
            throw new Error();
        }

        return {
            getArrange,
            getPianoEditor,
            getPianoFinder,
            getCurTrack,
            getPianoLib
        }
    }
}
export default ArrangeUtil;

