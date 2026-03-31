import type MusicTheory from "../../util/musicTheory";
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
     * メソッドに応じたファインダーを生成して返す
     * @param props 
     * @returns 
     */
    export const createFinder = (props: FinderProps) => {
        switch (props.arrTrack.method) {
            case 'piano': return ArrangeUtil.createPianoFinder(props);
        }
    }

    /**
     * ピアノ用のファインダーを生成して返す。
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

            // コード連番と参照先ライブラリの紐付け
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
     * リデューサを返す。
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