import type MusicTheory from "../../domain/theory/music-theory";
import ArrangeLibrary from "../../store/state/data/arrange/arrange-library";
import PianoEditorState from "../../store/state/data/arrange/piano/piano-editor-state";
import type ArrangeState from "../../store/state/data/arrange/arrange-state";
import type DerivedState from "../../store/state/derived-state";
import type { StoreProps } from "../../store/store";
import { get } from "svelte/store";
import { controlStore } from "../../store/global-store";
import type ControlState from "../../store/state/control-state";
import type DataState from "../../store/state/data/data-state";


namespace ArrangeUtil {

    export type FinderProps = {
        ts: MusicTheory.TimeSignature,
        chordCache: DerivedState.ChordCache,
        arrTrack: ArrangeState.Track
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
     * @param control 
     * @param data 
     * @returns 
     */
    export const useReducer = (control: ControlState.Value, data: DataState.Value) => {

        const getArrange = () => {
            const arrange = control.outline.arrange;
            if (arrange == null) throw new Error();
            return arrange;
        }
        const getPianoEditor = () => {
            const arrange = getArrange();
            if (arrange.method !== 'piano' || arrange.editor == undefined) throw new Error();
            return arrange.editor as PianoEditorState.Props
        }
        const getPianoFinder = () => {
            const arrange = getArrange();
            if (arrange.method !== 'piano' || arrange.finder == undefined) throw new Error();
            return arrange.finder as ArrangeLibrary.PianoArrangeFinder;
        }
        const getCurTrack = () => {
            const track = data.arrange.tracks[control.outline.trackIndex];
            if (track == undefined) throw new Error();
            return track;
        }

        const getPianoLib = () => {
            const track = getCurTrack();
            if (track.method === 'piano' && track.pianoLib != undefined) {
                return track.pianoLib as PianoEditorState.Lib;
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
