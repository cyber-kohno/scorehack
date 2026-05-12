import type ArrangeState from "../../../store/state/data/arrange/arrange-state";
import GuitarEditorState from "../../../store/state/data/arrange/guitar/guitar-editor-state";

type Context = {
    arrange: ArrangeState.EditorProps;
    arrTrack: ArrangeState.Track;
};

const createGuitarArrangeUpdater = (ctx: Context) => {
    const { arrange, arrTrack } = ctx;

    const getGuitarEditor = () => {
        if (arrange.method !== "guitar" || arrange.editor == undefined) throw new Error();
        return arrange.editor as GuitarEditorState.Value;
    };

    const getGuitarLib = () => {
        if (arrTrack.method !== "guitar" || arrTrack.guitarLib == undefined) throw new Error();
        return arrTrack.guitarLib;
    };

    const isCurrentChordTone = () => {
        const editor = getGuitarEditor();
        const tuning = GuitarEditorState.STANDARD_TUNING[editor.cursorString];
        const pitchClass = (tuning.openMidi + editor.cursorFret) % 12;
        return arrange.target.compiledChord.structs
            .map(s => ((s.key12 % 12) + 12) % 12)
            .includes(pitchClass);
    };

    const moveCursor = (dir: { string?: -1 | 1; fret?: -1 | 1 }) => {
        const editor = getGuitarEditor();
        editor.cursorString += dir.string ?? 0;
        editor.cursorFret += dir.fret ?? 0;

        if (editor.cursorString < 0) editor.cursorString = 0;
        if (editor.cursorString > GuitarEditorState.STANDARD_TUNING.length - 1) {
            editor.cursorString = GuitarEditorState.STANDARD_TUNING.length - 1;
        }
        if (editor.cursorFret < 0) editor.cursorFret = 0;
        if (editor.cursorFret > GuitarEditorState.MAX_FRET) {
            editor.cursorFret = GuitarEditorState.MAX_FRET;
        }
    };

    const toggleFret = () => {
        if (!isCurrentChordTone()) return false;

        const editor = getGuitarEditor();
        const current = editor.frets[editor.cursorString];
        editor.frets[editor.cursorString] =
            current === editor.cursorFret ? null : editor.cursorFret;
    };

    const muteString = () => {
        const editor = getGuitarEditor();
        editor.frets[editor.cursorString] = null;
    };

    const applyArrange = () => {
        const editor = getGuitarEditor();
        const chordSeq = arrange.target.chordSeq;
        const guitarLib = getGuitarLib();
        const voicingPattNo = GuitarEditorState.registPattern(editor.frets, guitarLib);

        const relations = arrTrack.relations;
        const relation = relations.find(r => r.chordSeq === chordSeq);
        if (relation == undefined) {
            relations.push({
                chordSeq,
                bkgPatt: -1,
                sndsPatt: voicingPattNo,
            });
        } else {
            relation.bkgPatt = -1;
            relation.sndsPatt = voicingPattNo;
            GuitarEditorState.deleteUnreferUnit(arrTrack);
        }
    };

    return {
        applyArrange,
        moveCursor,
        muteString,
        toggleFret,
    };
};

export default createGuitarArrangeUpdater;
