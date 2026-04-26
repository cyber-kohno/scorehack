import { get } from "svelte/store";
import MelodyState from "../../store/state/data/melody-state";
import { controlStore, dataStore, derivedStore } from "../../store/global-store";
import useReducerOutline from "../outline/reducerOutline";
import useReducerRef from "../common/reducerRef";
import useMelodySelector from "./melody-selector";

const useMelodyUpdater = () => {
    const control = get(controlStore);
    const data = get(dataStore);
    const getDerived = () => get(derivedStore);

    const { syncChordSeqFromNote } = useReducerOutline();
    const { getCurrScoreTrack, judgeOverlap } = useMelodySelector(control, data);
    const { adjustGridScrollXFromNote, adjustGridScrollYFromCursor } = useReducerRef();

    const syncCursorFromElementSeq = () => {
        const focus = control.outline.focus;
        const cache = getDerived();
        const { lastChordSeq, chordSeq } = cache.elementCaches[focus];
        let pos = 0;
        // 先頭以降�E要素
        if (lastChordSeq !== -1) {
            const chordCache = cache.chordCaches[lastChordSeq];

            pos = chordCache.startBeatNote;
            // コード要素
            if (chordSeq === -1) pos += chordCache.lengthBeatNote;
        }

        const melody = control.melody;
        const cursor = melody.cursor;
        cursor.norm.div = 1;
        cursor.norm.tuplets = undefined;
        cursor.pos = pos;
        cursor.len = 1;
        melody.focus = -1;
    }

    const addNote = (note: MelodyState.Note) => {
        const melody = control.melody;
        const layer = data.scoreTracks[melody.trackIndex];
        const notes = (layer as MelodyState.ScoreTrack).notes;
        notes.push(note);
        notes.sort((n1, n2) => {
            const [n1Pos, n2Pos] = [n1, n2].map(n => MelodyState.calcBeat(n.norm, n.pos));
            return n1Pos - n2Pos;
        });
    }

    const addNoteFromCursor = () => {
        addNote(JSON.parse(JSON.stringify(control.melody.cursor)));
    }

    const focusInNearNote = (dir: -1 | 1) => {
        const melody = control.melody;
        const cursor = melody.cursor;
        const layer = getCurrScoreTrack();
        const notes = (layer as MelodyState.ScoreTrack).notes;

        const cursorPos = MelodyState.calcBeat(cursor.norm, cursor.pos);
        const matchIndex = (dir === -1 ? notes.slice().reverse() : notes).findIndex(n => {
            const side = MelodyState.calcBeatSide(n);
            const [left, right] = [side.pos, side.pos + side.len];
            return dir === -1 ? cursorPos > left : cursorPos < right;
        });
        // console.log(matchIndex);
        if (matchIndex !== -1) {
            melody.focus = (dir === -1 ? notes.length - 1 - matchIndex : matchIndex);
            const note = notes[melody.focus];
            syncChordSeqFromNote(note);
            adjustGridScrollXFromNote(note);
            adjustGridScrollYFromCursor(note);
        }
    }

    const focusOutNoteSide = (note: MelodyState.Note, dir: -1 | 1) => {
        const melody = control.melody;
        melody.cursor = JSON.parse(JSON.stringify(note));
        const cursor = melody.cursor;
        // cursor.norm.div = note.norm.div;
        // cursor.pos = note.pos;
        cursor.len = 1;
        if (dir === 1) {
            cursor.pos += note.len;
        }
        melody.focus = -1;
        MelodyState.normalize(note);
        judgeOverlap();
        syncChordSeqFromNote(cursor);
        adjustGridScrollXFromNote(cursor);
    }

    const changeScoreTrack = (nextIndex: number) => {
        const melody = control.melody;
        const tracks = data.scoreTracks;
        if (tracks[nextIndex] == undefined) throw new Error();
        // const prevIndex = melody.trackIndex;
        // const prevTrack = tracks[prevIndex];

        syncCursorFromElementSeq();

        melody.trackIndex = nextIndex;
    }
    // const loadSFPlayer = (sfName: SoundFont.InstrumentName) => {
    //     const items = lastStore.preview.sfItems;

    //     const isLoadAlready = items.find(c => c.instrumentName === sfName) != undefined;
    //     if (!isLoadAlready) {
    //         items.push({ instrumentName: sfName });

    //         // lastStore.info = `Loading soundfont[${sfName}].`;
    //         SoundFont.instrument(new AudioContext(), sfName).then(player => {
    //             const item = items.find(sf => sf.instrumentName === sfName);
    //             if (item == undefined) throw new Error();
    //             item.player = player;
    //             // lastStore.info = '';
    //         });
    //     }
    // }


    return {
        syncCursorFromElementSeq,
        addNote,
        addNoteFromCursor,
        focusInNearNote,
        focusOutNoteSide,
        changeScoreTrack,
        // loadSFPlayer,
    };
};
export default useMelodyUpdater;
