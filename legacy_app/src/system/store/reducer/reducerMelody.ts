import SoundFont, { type InstrumentName } from "soundfont-player";
import StoreMelody from "../props/storeMelody";
import useReducerOutline from "./reducerOutline";
import type { StoreProps, StoreUtil } from "../store";
import useReducerRef from "./reducerRef";
import PreviewUtil from "../../util/preview/previewUtil";

const useReducerMelody = (lastStore: StoreProps) => {

    const { syncChordSeqFromNote } = useReducerOutline(lastStore);
    const { adjustGridScrollXFromNote, adjustGridScrollYFromCursor } = useReducerRef(lastStore);

    const syncCursorFromElementSeq = () => {
        const focus = lastStore.control.outline.focus;
        const cache = lastStore.cache;
        const { lastChordSeq, chordSeq } = cache.elementCaches[focus];
        let pos = 0;
        // 先頭以降の要素
        if (lastChordSeq !== -1) {
            const chordCache = cache.chordCaches[lastChordSeq];

            pos = chordCache.startBeatNote;
            // コード要素
            if (chordSeq === -1) pos += chordCache.lengthBeatNote;
        }

        const melody = lastStore.control.melody;
        const cursor = melody.cursor;
        cursor.norm.div = 1;
        cursor.norm.tuplets = undefined;
        cursor.pos = pos;
        cursor.len = 1;
        melody.focus = -1;
    }
    const addNote = (note: StoreMelody.Note) => {
        const melody = lastStore.control.melody;
        const layer = lastStore.data.scoreTracks[melody.trackIndex];
        const notes = (layer as StoreMelody.ScoreTrack).notes;
        notes.push(note);
        notes.sort((n1, n2) => {
            const [n1Pos, n2Pos] = [n1, n2].map(n => StoreMelody.calcBeat(n.norm, n.pos));
            return n1Pos - n2Pos;
        });
    }

    const addNoteFromCursor = () => {
        addNote(JSON.parse(JSON.stringify(lastStore.control.melody.cursor)));
    }

    const judgeOverlap = () => {
        const melody = lastStore.control.melody;
        const track = getCurrScoreTrack();
        const overlapNote = track.notes.find(n => {
            return StoreMelody.judgeOverlapNotes(n, melody.cursor);
        });
        melody.isOverlap = overlapNote != undefined;
    }

    const getCurrScoreTrack = () => {
        const melody = lastStore.control.melody;
        return lastStore.data.scoreTracks[melody.trackIndex];
    }

    const focusInNearNote = (dir: -1 | 1) => {
        const melody = lastStore.control.melody;
        const cursor = melody.cursor;
        const layer = getCurrScoreTrack();
        const notes = (layer as StoreMelody.ScoreTrack).notes;

        const cursorPos = StoreMelody.calcBeat(cursor.norm, cursor.pos);
        const matchIndex = (dir === -1 ? notes.slice().reverse() : notes).findIndex(n => {
            const side = StoreMelody.calcBeatSide(n);
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

    const focusOutNoteSide = (note: StoreMelody.Note, dir: -1 | 1) => {
        const melody = lastStore.control.melody;
        melody.cursor = JSON.parse(JSON.stringify(note));
        const cursor = melody.cursor;
        // cursor.norm.div = note.norm.div;
        // cursor.pos = note.pos;
        cursor.len = 1;
        if (dir === 1) {
            cursor.pos += note.len;
        }
        melody.focus = -1;
        StoreMelody.normalize(note);
        judgeOverlap();
        syncChordSeqFromNote(cursor);
        adjustGridScrollXFromNote(cursor);
    }

    const changeScoreTrack = (nextIndex: number) => {
        const melody = lastStore.control.melody;
        const tracks = lastStore.data.scoreTracks;
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

    const getFocusRange = () => {
        const melody = lastStore.control.melody;
        if (melody.focusLock === -1) return [melody.focus, melody.focus];
        return melody.focus < melody.focusLock
            ? [melody.focus, melody.focusLock]
            : [melody.focusLock, melody.focus];
    };

    return {
        syncCursorFromElementSeq,
        addNote,
        addNoteFromCursor,
        judgeOverlap,
        focusInNearNote,
        focusOutNoteSide,
        getCurrScoreTrack,
        changeScoreTrack,
        // loadSFPlayer,
        getFocusRange
    };
};
export default useReducerMelody;